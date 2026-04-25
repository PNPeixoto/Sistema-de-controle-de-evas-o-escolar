package com.peixoto.usuario.infrastructure.security;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
@ConditionalOnProperty(name = "app.security.state-store", havingValue = "in-memory", matchIfMissing = true)
public class InMemoryLoginStepChallengeService implements LoginStepChallengeService {

    private static final long TTL_MILLIS = 5 * 60 * 1000L;

    private final ConcurrentMap<String, Challenge> challenges = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    public String issueChallenge(String email, String ip) {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        challenges.put(token, new Challenge(value(email, ip), expiresAt()));
        return token;
    }

    @Override
    public boolean isValid(String token, String email, String ip) {
        if (token == null || token.isBlank()) return false;
        Challenge challenge = challenges.get(token);
        if (challenge == null) return false;
        if (challenge.isExpired()) {
            challenges.remove(token, challenge);
            return false;
        }
        return value(email, ip).equals(challenge.value());
    }

    @Override
    public void consume(String token) {
        if (token != null && !token.isBlank()) {
            challenges.remove(token);
        }
    }

    private String value(String email, String ip) {
        return email.toLowerCase() + "|" + ip;
    }

    private long expiresAt() {
        return Instant.now().toEpochMilli() + TTL_MILLIS;
    }

    private record Challenge(String value, long expiresAtMillis) {
        boolean isExpired() {
            return Instant.now().toEpochMilli() >= expiresAtMillis;
        }
    }
}
