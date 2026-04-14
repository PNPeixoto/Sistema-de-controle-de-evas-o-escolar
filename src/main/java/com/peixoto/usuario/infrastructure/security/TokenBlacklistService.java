package com.peixoto.usuario.infrastructure.security;

import org.springframework.stereotype.Service;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Serviço de blacklist de tokens JWT.
 * Quando o usuário faz logout, o token é adicionado à blacklist
 * e rejeitado pelo JwtRequestFilter nas próximas requisições.
 *
 * NOTA: Em produção com múltiplas instâncias, substituir por Redis.
 */
@Service
public class TokenBlacklistService {

    private final Set<String> blacklist = ConcurrentHashMap.newKeySet();

    public void blacklist(String token) {
        blacklist.add(token);
    }

    public boolean isBlacklisted(String token) {
        return blacklist.contains(token);
    }
}
