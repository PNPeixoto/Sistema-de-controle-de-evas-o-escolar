package com.peixoto.usuario.infrastructure.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Configuração de cache com Caffeine.
 * TTL de 5 minutos — dados expiram automaticamente.
 * Máximo de 500 entradas por cache.
 *
 * @CacheEvict continua funcionando para invalidação imediata.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(
                "alunos_escola",
                "usuario_email"
        );

        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(5, TimeUnit.MINUTES)  // TTL de 5 minutos
                .maximumSize(500)                        // Máximo 500 entradas
                .recordStats()                           // Métricas de cache
        );

        return cacheManager;
    }
}
