package com.peixoto.usuario.infrastructure.security;

import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate limiter para tentativas de login.
 * Máximo de 5 tentativas por IP a cada 15 minutos.
 */
@Service
public class RateLimitService {

    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_SECONDS = 15 * 60; // 15 minutos

    private final Map<String, AttemptRecord> attempts = new ConcurrentHashMap<>();

    public boolean isBlocked(String ip) {
        AttemptRecord record = attempts.get(ip);
        if (record == null) return false;

        // Janela expirou? Reseta
        if (Instant.now().getEpochSecond() - record.windowStart > WINDOW_SECONDS) {
            attempts.remove(ip);
            return false;
        }

        return record.count.get() >= MAX_ATTEMPTS;
    }

    public void recordAttempt(String ip) {
        attempts.compute(ip, (key, existing) -> {
            long now = Instant.now().getEpochSecond();
            if (existing == null || (now - existing.windowStart) > WINDOW_SECONDS) {
                return new AttemptRecord(now, new AtomicInteger(1));
            }
            existing.count.incrementAndGet();
            return existing;
        });
    }

    public void resetAttempts(String ip) {
        attempts.remove(ip);
    }

    private static class AttemptRecord {
        final long windowStart;
        final AtomicInteger count;

        AttemptRecord(long windowStart, AtomicInteger count) {
            this.windowStart = windowStart;
            this.count = count;
        }
    }
}
