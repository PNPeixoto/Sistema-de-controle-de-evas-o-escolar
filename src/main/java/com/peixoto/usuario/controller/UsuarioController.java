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

    @PostMapping
    public ResponseEntity<UsuarioDTO> salvaUsuario(@Valid @RequestBody UsuarioDTO usuarioDTO) {
        return ResponseEntity.ok(usuarioService.salvaUsuario(usuarioDTO));
    }

    // ==========================================
    // LOGIN EM 2 ETAPAS
    // ==========================================

    @PostMapping("/login/etapa1")
    public ResponseEntity<Map<String, String>> loginEtapa1(@RequestBody LoginEtapa1DTO dto,
                                                            HttpServletRequest request) {
        String ip = getClientIp(request);

        if (rateLimitService.isBlocked(ip)) {
            throw new UnauthorizedException("Muitas tentativas de login. Aguarde 15 minutos.");
        }

        try {
            String nomeEscola = usuarioService.validarEscola(dto);
            rateLimitService.resetAttempts(ip);
            return ResponseEntity.ok(Map.of("escolaNome", nomeEscola));
        } catch (Exception e) {
            rateLimitService.recordAttempt(ip);
            throw e;
        }
    }

    @PostMapping("/login/etapa2")
    public ResponseEntity<Map<String, String>> loginEtapa2(@RequestBody LoginEtapa2DTO dto,
                                                            HttpServletRequest request,
                                                            HttpServletResponse response) {
        String ip = getClientIp(request);

        if (rateLimitService.isBlocked(ip)) {
            throw new UnauthorizedException("Muitas tentativas de login. Aguarde 15 minutos.");
        }

        try {
            String tokenComBearer = usuarioService.validarsenhaIndividual(dto);
            String tokenPuro = tokenComBearer.replace("Bearer ", "");

            // Tenta setar cookie (funciona com domínio + SSL válido)
            ResponseCookie cookie = ResponseCookie.from("pnp_token", tokenPuro)
                    .httpOnly(true)
                    .secure(cookieSecure)
                    .path("/")
                    .maxAge(2 * 60 * 60)
                    .sameSite(cookieSecure ? "None" : "Lax")
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            rateLimitService.resetAttempts(ip);

            // RETORNA O TOKEN NO BODY TAMBÉM
            // O frontend salva em memória (não localStorage) como fallback
            return ResponseEntity.ok(Map.of(
                "status", "authenticated",
                "token", tokenComBearer
            ));
        } catch (Exception e) {
            rateLimitService.recordAttempt(ip);
            throw e;
        }
    }

    // ==========================================
    // /me — Dados do usuário logado
    // ==========================================
    @GetMapping("/me")
    public ResponseEntity<UsuarioDTO> getUsuarioLogado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(usuarioService.buscarUsuarioPorEmail(auth.getName()));
    }

    // ==========================================
    // /logout — Invalida o token
    // ==========================================
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        // Tenta blacklist do cookie
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("pnp_token".equals(cookie.getName())) {
                    tokenBlacklistService.blacklist(cookie.getValue());
                    break;
                }
            }
        }

        // Tenta blacklist do header
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            tokenBlacklistService.blacklist(authHeader.substring(7).trim());
        }

        // Apaga cookie
        ResponseCookie deleteCookie = ResponseCookie.from("pnp_token", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(0)
                .sameSite(cookieSecure ? "None" : "Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());

        return ResponseEntity.ok().build();
    }

    // ==========================================
    // ROTAS PROTEGIDAS
    // ==========================================

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
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
