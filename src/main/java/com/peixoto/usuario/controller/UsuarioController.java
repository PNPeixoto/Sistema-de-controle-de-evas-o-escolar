package com.peixoto.usuario.controller;

import com.peixoto.usuario.business.UsuarioService;
import com.peixoto.usuario.business.dto.LoginEtapa1DTO;
import com.peixoto.usuario.business.dto.LoginEtapa2DTO;
import com.peixoto.usuario.business.dto.UsuarioDTO;
import com.peixoto.usuario.infrastructure.entity.Cargo;
import com.peixoto.usuario.infrastructure.exceptions.UnauthorizedException;
import com.peixoto.usuario.infrastructure.security.LoginStepChallengeService;
import com.peixoto.usuario.infrastructure.security.RateLimitService;
import com.peixoto.usuario.infrastructure.security.TokenBlacklistService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/usuario")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final RateLimitService rateLimitService;
    private final TokenBlacklistService tokenBlacklistService;
    private final LoginStepChallengeService loginStepChallengeService;

    @Value("${app.security.cookie-secure:true}")
    private boolean cookieSecure;

    @Value("${app.security.trust-forwarded-headers:false}")
    private boolean trustForwardedHeaders;

    @PreAuthorize("hasAnyRole('ADMIN','SEMED')")
    @PostMapping
    public ResponseEntity<UsuarioDTO> salvaUsuario(@Valid @RequestBody UsuarioDTO usuarioDTO,
                                                   Authentication authentication) {
        if (isAdministrativeCargo(usuarioDTO.getCargo()) && !hasRole(authentication, "ROLE_ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(usuarioService.salvaUsuario(usuarioDTO));
    }

    @PostMapping("/login/etapa1")
    public ResponseEntity<Map<String, String>> loginEtapa1(@Valid @RequestBody LoginEtapa1DTO dto,
                                                           HttpServletRequest request, HttpServletResponse response) {
        String ip = getClientIp(request);
        String key = "etapa1:" + ip;

        if (rateLimitService.isBlocked(key)) {
            throw new UnauthorizedException("Muitas tentativas de login. Aguarde 15 minutos.");
        }

        try {
            String nomeEscola = usuarioService.validarEscola(dto);
            String challengeToken = loginStepChallengeService.issueChallenge(dto.email(), ip);

            ResponseCookie stageOneCookie = ResponseCookie.from("pnp_login_stage1", challengeToken)
                    .httpOnly(true).secure(cookieSecure).path("/").maxAge(5 * 60)
                    .sameSite(cookieSecure ? "None" : "Lax").build();

            rateLimitService.resetAttempts(key);
            response.addHeader(HttpHeaders.SET_COOKIE, stageOneCookie.toString());
            return ResponseEntity.ok(Map.of("escolaNome", nomeEscola));
        } catch (Exception e) {
            rateLimitService.recordAttempt(key);
            throw e;
        }
    }

    @PostMapping("/login/etapa2")
    public ResponseEntity<Map<String, String>> loginEtapa2(@Valid @RequestBody LoginEtapa2DTO dto,
                                                           HttpServletRequest request, HttpServletResponse response) {
        String ip = getClientIp(request);
        String key = "etapa2:" + ip + ":" + dto.email();
        String stageOneToken = getCookieValue(request, "pnp_login_stage1");

        if (rateLimitService.isBlocked(key)) {
            throw new UnauthorizedException("Muitas tentativas. Aguarde 15 minutos.");
        }

        if (!loginStepChallengeService.isValid(stageOneToken, dto.email(), ip)) {
            rateLimitService.recordAttempt(key);
            throw new UnauthorizedException("Etapa 1 do login expirou ou não foi concluída.");
        }

        try {
            String tokenComBearer = usuarioService.validarsenhaIndividual(dto);
            String tokenPuro = tokenComBearer.replace("Bearer ", "");

            ResponseCookie cookie = ResponseCookie.from("pnp_token", tokenPuro)
                    .httpOnly(true).secure(cookieSecure).path("/").maxAge(2 * 60 * 60)
                    .sameSite(cookieSecure ? "None" : "Lax").build();

            loginStepChallengeService.consume(stageOneToken);
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
            response.addHeader(HttpHeaders.SET_COOKIE, expireCookie("pnp_login_stage1"));

            rateLimitService.resetAttempts(key);
            return ResponseEntity.ok(Map.of("status", "authenticated"));
        } catch (Exception e) {
            rateLimitService.recordAttempt(key);
            throw e;
        }
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<UsuarioDTO> getUsuarioLogado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(usuarioService.buscarUsuarioPorEmail(auth.getName()));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("pnp_token".equals(cookie.getName())) {
                    tokenBlacklistService.blacklist(cookie.getValue());
                    break;
                }
            }
        }
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            tokenBlacklistService.blacklist(authHeader.substring(7).trim());
        }

        ResponseCookie deleteCookie = ResponseCookie.from("pnp_token", "")
                .httpOnly(true).secure(cookieSecure).path("/").maxAge(0)
                .sameSite(cookieSecure ? "None" : "Lax").build();
        response.addHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, expireCookie("pnp_login_stage1"));
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN','SEMED')")
    @GetMapping("/email")
    public ResponseEntity<UsuarioDTO> buscaUsuarioPorEmail(@RequestParam("email") String email) {
        return ResponseEntity.ok(usuarioService.buscarUsuarioPorEmail(email));
    }

    @PreAuthorize("hasAnyRole('ADMIN','SEMED')")
    @DeleteMapping("/email")
    public ResponseEntity<Void> deletaUsuarioPorEmail(@RequestParam("email") String email) {
        usuarioService.deletaUsuarioPorEmail(email);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping
    public ResponseEntity<UsuarioDTO> atualizDadoUsuario(@Valid @RequestBody UsuarioDTO dto) {
        return ResponseEntity.ok(usuarioService.atualizaDadosUsuario(dto));
    }

    private String getClientIp(HttpServletRequest request) {
        if (trustForwardedHeaders) {
            String xff = request.getHeader("X-Forwarded-For");
            if (xff != null && !xff.isEmpty()) {
                return xff.split(",")[0].trim();
            }
        }
        return request.getRemoteAddr();
    }

    private boolean isAdministrativeCargo(Cargo cargo) {
        return cargo == Cargo.ADMIN || cargo == Cargo.SEMED;
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> role.equals(authority.getAuthority()));
    }

    private String getCookieValue(HttpServletRequest request, String cookieName) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if (cookieName.equals(cookie.getName())) return cookie.getValue();
        }
        return null;
    }

    private String expireCookie(String cookieName) {
        return ResponseCookie.from(cookieName, "")
                .httpOnly(true).secure(cookieSecure).path("/").maxAge(0)
                .sameSite(cookieSecure ? "None" : "Lax").build().toString();
    }
}
