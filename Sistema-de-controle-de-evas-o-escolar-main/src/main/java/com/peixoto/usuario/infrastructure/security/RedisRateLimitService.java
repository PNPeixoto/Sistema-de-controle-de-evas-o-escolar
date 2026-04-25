package com.peixoto.usuario.infrastructure.security;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RedisRateLimitService {

    private final StringRedisTemplate redisTemplate;
    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_SECONDS = 15 * 60;

    public boolean isBlocked(String key) {
        String redisKey = "ratelimit:" + key;
        String count = redisTemplate.opsForValue().get(redisKey);
        return count != null && Integer.parseInt(count) >= MAX_ATTEMPTS;
    }

    public void recordAttempt(String key) {
        String redisKey = "ratelimit:" + key;
        Long current = redisTemplate.opsForValue().increment(redisKey);
        if (current != null && current == 1) {
            redisTemplate.expire(redisKey, WINDOW_SECONDS, TimeUnit.SECONDS);
        }
    }

    public void resetAttempts(String key) {
        redisTemplate.delete("ratelimit:" + key);
    }
}