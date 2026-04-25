package com.peixoto.usuario.infrastructure.security;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Vínculo temporário entre a etapa 1 e a etapa 2 do login.
 * Mantido em memória por poucos minutos para evitar redesenho amplo do fluxo.
 */
@Service
public class LoginStepChallengeService {

    private static final long TTL_SECONDS = 5 * 60;

    private final SecureRandom secureRandom = new SecureRandom();
    private final Map<String, ChallengeRecord> challenges = new ConcurrentHashMap<>();

    public String issueChallenge(String email, String ip) {
        cleanupExpired();

        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        challenges.put(token, new ChallengeRecord(email, ip, Instant.now().getEpochSecond() + TTL_SECONDS));
        return token;
    }

    public boolean isValid(String token, String email, String ip) {
        cleanupExpired();

        if (token == null || token.isBlank()) {
            return false;
        }

        ChallengeRecord record = challenges.get(token);
        if (record == null) {
            return false;
        }

        long now = Instant.now().getEpochSecond();
        return record.expiresAt >= now
                && record.email.equalsIgnoreCase(email)
                && record.ip.equals(ip);
    }

    public void consume(String token) {
        if (token != null) {
            challenges.remove(token);
        }
    }

    private void cleanupExpired() {
        long now = Instant.now().getEpochSecond();
        challenges.entrySet().removeIf(entry -> entry.getValue().expiresAt < now);
    }

    private record ChallengeRecord(String email, String ip, long expiresAt) {
    }
}
