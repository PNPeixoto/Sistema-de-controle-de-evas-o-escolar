package com.peixoto.usuario.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import java.io.IOException;

public class JwtRequestFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final RedisTokenBlacklistService redisTokenBlacklistService;

    public JwtRequestFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService,
                            RedisTokenBlacklistService redisTokenBlacklistService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.redisTokenBlacklistService = redisTokenBlacklistService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String token = extractTokenFromCookie(request);

        // Fallback: se não achou no cookie, tenta o header (retrocompatibilidade)
        if (token == null) {
            token = extractTokenFromHeader(request);
        }

        if (token != null) {
            // NOVA VERIFICAÇÃO: Token está na blacklist? (logout)
            if (redisTokenBlacklistService.isBlacklisted(token)) {
                chain.doFilter(request, response);
                return;
            }

            try {
                final String username = jwtUtil.extractEmailToken(token);

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    if (jwtUtil.validateToken(token, username)) {
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            } catch (Exception e) {
                // Token inválido ou expirado — segue sem autenticar
            }
        }

        chain.doFilter(request, response);
    }

    // NOVO: Extrai token do cookie HttpOnly
    private String extractTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if ("pnp_token".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    // Mantém retrocompatibilidade com header Authorization
    private String extractTokenFromHeader(HttpServletRequest request) {
        final String authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7).trim().replace("Bearer ", "");
        }
        return null;
    }
}
