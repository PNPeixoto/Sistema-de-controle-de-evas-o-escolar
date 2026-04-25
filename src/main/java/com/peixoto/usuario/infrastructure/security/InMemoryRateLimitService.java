package com.peixoto.usuario.infrastructure.security;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
@ConditionalOnProperty(name = "app.security.state-store", havingValue = "in-memory", matchIfMissing = true)
public class InMemoryRateLimitService implements RateLimitService {

    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_MILLIS = 15 * 60 * 1000L;

    private final ConcurrentMap<String, AttemptWindow> attempts = new ConcurrentHashMap<>();

    @Override
    public boolean isBlocked(String key) {
        AttemptWindow window = attempts.get(key);
        if (window == null) {
            return false;
        }
        if (window.isExpired()) {
            attempts.remove(key, window);
            return false;
        }
        return window.count() >= MAX_ATTEMPTS;
    }

    @Override
    public void recordAttempt(String key) {
        attempts.compute(key, (ignored, current) -> {
            if (current == null || current.isExpired()) {
                return new AttemptWindow(1, expiresAt());
            }
            return new AttemptWindow(current.count() + 1, current.expiresAtMillis());
        });
    }

    @Override
    public void resetAttempts(String key) {
        attempts.remove(key);
    }

    private long expiresAt() {
        return Instant.now().toEpochMilli() + WINDOW_MILLIS;
    }

    private record AttemptWindow(int count, long expiresAtMillis) {
        boolean isExpired() {
            return Instant.now().toEpochMilli() >= expiresAtMillis;
        }
    }
}
