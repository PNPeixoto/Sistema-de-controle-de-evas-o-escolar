package com.peixoto.usuario.infrastructure.security;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.security.state-store", havingValue = "redis")
public class RedisLoginStepChallengeService implements LoginStepChallengeService {

    private static final long TTL_MINUTES = 5;
    private static final String PREFIX = "login_stage1:";

    private final StringRedisTemplate redisTemplate;
    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    public String issueChallenge(String email, String ip) {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        String value = email.toLowerCase() + "|" + ip;
        redisTemplate.opsForValue().set(PREFIX + token, value, TTL_MINUTES, TimeUnit.MINUTES);
        return token;
    }

    @Override
    public boolean isValid(String token, String email, String ip) {
        if (token == null || token.isBlank()) return false;
        String stored = redisTemplate.opsForValue().get(PREFIX + token);
        if (stored == null) return false;
        return (email.toLowerCase() + "|" + ip).equals(stored);
    }

    @Override
    public void consume(String token) {
        if (token != null && !token.isBlank()) {
            redisTemplate.delete(PREFIX + token);
        }
    }
}
