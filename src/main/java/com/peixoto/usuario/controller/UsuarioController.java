package com.peixoto.usuario.controller;

import com.peixoto.usuario.business.UsuarioService;
import com.peixoto.usuario.business.dto.LoginEtapa1DTO;
import com.peixoto.usuario.business.dto.LoginEtapa2DTO;
import com.peixoto.usuario.business.dto.UsuarioDTO;
import com.peixoto.usuario.infrastructure.exceptions.UnauthorizedException;
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

    @Value("${app.security.cookie-secure:true}")
    private boolean cookieSecure;

    // ==========================================
    // CADASTRO — SOMENTE ADMIN PODE CRIAR USUÁRIOS
    // ==========================================
    @PostMapping
    public ResponseEntity<UsuarioDTO> salvaUsuario(@Valid @RequestBody UsuarioDTO usuarioDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Se não estiver autenticado ou não for ADMIN/SEMED → bloqueia
        if (auth == null || auth.getAuthorities().stream().noneMatch(r ->
                r.getAuthority().equals("ROLE_ADMIN") || r.getAuthority().equals("ROLE_SEMED"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(usuarioService.salvaUsuario(usuarioDTO));
    }

    // ==========================================
    // LOGIN EM 2 ETAPAS (com Rate Limiting separado)
    // ==========================================
    @PostMapping("/login/etapa1")
    public ResponseEntity<Map<String, String>> loginEtapa1(@Valid @RequestBody LoginEtapa1DTO dto,
                                                            HttpServletRequest request) {
        String ip = getClientIp(request);
        String key = "etapa1:" + ip;

        if (rateLimitService.isBlocked(key)) {
            throw new UnauthorizedException("Muitas tentativas de login. Aguarde 15 minutos.");
        }

        try {
            String nomeEscola = usuarioService.validarEscola(dto);
            rateLimitService.resetAttempts(key);
            return ResponseEntity.ok(Map.of("escolaNome", nomeEscola));
        } catch (Exception e) {
            rateLimitService.recordAttempt(key);
            throw e;
        }
    }

    @PostMapping("/login/etapa2")
    public ResponseEntity<Map<String, String>> loginEtapa2(@Valid @RequestBody LoginEtapa2DTO dto,
                                                            HttpServletRequest request,
                                                            HttpServletResponse response) {
        String ip = getClientIp(request);
        String key = "etapa2:" + ip + ":" + dto.email();

        if (rateLimitService.isBlocked(key)) {
            throw new UnauthorizedException("Muitas tentativas. Aguarde 15 minutos.");
        }

        try {
            String tokenComBearer = usuarioService.validarsenhaIndividual(dto);
            String tokenPuro = tokenComBearer.replace("Bearer ", "");

            ResponseCookie cookie = ResponseCookie.from("pnp_token", tokenPuro)
                    .httpOnly(true)
                    .secure(cookieSecure)
                    .path("/")
                    .maxAge(2 * 60 * 60)
                    .sameSite(cookieSecure ? "None" : "Lax")
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            rateLimitService.resetAttempts(key);
            return ResponseEntity.ok(Map.of("status", "authenticated", "token", tokenComBearer));
        } catch (Exception e) {
            rateLimitService.recordAttempt(key);
            throw e;
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioDTO> getUsuarioLogado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(usuarioService.buscarUsuarioPorEmail(auth.getName()));
    }

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
        return ResponseEntity.ok().build();
    }

    @GetMapping("/email")
    public ResponseEntity<UsuarioDTO> buscaUsuarioPorEmail(@RequestParam("email") String email) {
        return ResponseEntity.ok(usuarioService.buscarUsuarioPorEmail(email));
    }

    @DeleteMapping("/email")
    public ResponseEntity<Void> deletaUsuarioPorEmail(@RequestParam("email") String email) {
        usuarioService.deletaUsuarioPorEmail(email);
        return ResponseEntity.ok().build();
    }

    @PutMapping
    public ResponseEntity<UsuarioDTO> atualizDadoUsuario(@Valid @RequestBody UsuarioDTO dto,
                                                         @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(usuarioService.atualizaDadosUsuario(token, dto));
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        return (xff != null && !xff.isEmpty()) ? xff.split(",")[0].trim() : request.getRemoteAddr();
    }
}
