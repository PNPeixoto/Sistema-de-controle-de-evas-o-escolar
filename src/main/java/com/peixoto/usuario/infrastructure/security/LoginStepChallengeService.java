package com.peixoto.usuario.infrastructure.security;

public interface LoginStepChallengeService {
    String issueChallenge(String email, String ip);

    boolean isValid(String token, String email, String ip);

    void consume(String token);
}
