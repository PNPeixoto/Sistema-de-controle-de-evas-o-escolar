package com.peixoto.usuario.infrastructure.security;

import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class RateLimitService {

    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_SECONDS = 15 * 60;

    private final Map<String, AttemptRecord> attempts = new ConcurrentHashMap<>();

    public boolean isBlocked(String key) {
        AttemptRecord record = attempts.get(key);
        if (record == null) return false;
        if (Instant.now().getEpochSecond() - record.windowStart > WINDOW_SECONDS) {
            attempts.remove(key);
            return false;
        }
        return record.count.get() >= MAX_ATTEMPTS;
    }

    public void recordAttempt(String key) {
        attempts.compute(key, (k, existing) -> {
            long now = Instant.now().getEpochSecond();
            if (existing == null || (now - existing.windowStart) > WINDOW_SECONDS) {
                return new AttemptRecord(now, new AtomicInteger(1));
            }
            existing.count.incrementAndGet();
            return existing;
        });
    }

    public void resetAttempts(String key) {
        attempts.remove(key);
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