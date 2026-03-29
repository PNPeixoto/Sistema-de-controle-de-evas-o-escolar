package com.peixoto.usuario.infrastructure.config; // Mantenha o seu pacote

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                // AQUI ESTÁ A SEGURANÇA: Lista VIP de quem pode acessar a API
                .allowedOrigins(
                        "https://sistema-de-controle-de-evas-o-escol-gamma.vercel.app", // Seu Front na Vercel
                        "http://localhost:5173" // O seu PC para testes locais
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}