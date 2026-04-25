package com.peixoto.usuario.infrastructure.security;

public interface TokenBlacklistService {
    void blacklist(String token);

    boolean isBlacklisted(String token);
}
