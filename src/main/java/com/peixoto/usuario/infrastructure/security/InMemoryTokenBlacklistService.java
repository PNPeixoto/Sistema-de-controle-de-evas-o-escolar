package com.peixoto.usuario.infrastructure.security;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
@ConditionalOnProperty(name = "app.security.state-store", havingValue = "in-memory", matchIfMissing = true)
public class InMemoryTokenBlacklistService implements TokenBlacklistService {

    private static final long TOKEN_TTL_MILLIS = 2 * 60 * 60 * 1000L;

    private final ConcurrentMap<String, Long> blacklist = new ConcurrentHashMap<>();

    @Override
    public void blacklist(String token) {
        if (token == null || token.isBlank()) {
            return;
        }
        blacklist.put(token, Instant.now().toEpochMilli() + TOKEN_TTL_MILLIS);
    }

    @Override
    public boolean isBlacklisted(String token) {
        Long expiresAtMillis = blacklist.get(token);
        if (expiresAtMillis == null) {
            return false;
        }
        if (Instant.now().toEpochMilli() >= expiresAtMillis) {
            blacklist.remove(token, expiresAtMillis);
            return false;
        }
        return true;
    }
}
