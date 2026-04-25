package com.peixoto.usuario.infrastructure.security;

public interface RateLimitService {
    boolean isBlocked(String key);

    void recordAttempt(String key);

    void resetAttempts(String key);
}
