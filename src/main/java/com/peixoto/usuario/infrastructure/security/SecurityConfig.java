package com.peixoto.usuario.infrastructure.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.List;


@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${app.security.pepper}")
    private String pepper;

    // Instâncias de JwtUtil e UserDetailsService injetadas pelo Spring

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    // Construtor para injeção de dependências de JwtUtil e UserDetailsService

    @Autowired
    public SecurityConfig(JwtUtil jwtUtil, @Lazy UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    // Configuração do filtro de segurança

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        JwtRequestFilter jwtRequestFilter = new JwtRequestFilter(jwtUtil, userDetailsService);

        http
                // 1. ATIVAMOS O CORS AQUI! Ele vai ler a configuração do método abaixo
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(authorize -> authorize

                // 2. Libera a requisição "invisível" (OPTIONS) que o navegador faz por segurança


                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // 3. Atualizado para liberar TUDO que vier depois de /login (etapa1 e etapa2)

                .requestMatchers("/usuario/login/**").permitAll()

                // Rotas mantidas

                .requestMatchers(HttpMethod.GET, "/auth").permitAll()
                .requestMatchers(HttpMethod.POST, "/usuario").permitAll()

                // Libera a rota de erro interno do Spring (Evita falsos 403)
                .requestMatchers("/error").permitAll()

                // Mapeando as rotas principais do seu sistema

                .requestMatchers("/evasao/**").authenticated()
                .requestMatchers("/aluno/**").authenticated()

                .requestMatchers("/usuario/**").authenticated()
                .anyRequest().authenticated()
        )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // =========================================================
    // CONFIGURAÇÃO DO CORS (Quem pode acessar o back-end)
    // =========================================================
    @Bean

    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();

        // Libera a porta do seu React no Vite
        configuration.setAllowedOrigins(java.util.List.of("http://localhost:5173"));

        // Libera os métodos
        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Libera qualquer cabeçalho (Headers)
        configuration.setAllowedHeaders(java.util.List.of("*"));
        configuration.setAllowCredentials(true);

        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        // Aplica essa regra para todas as URLs do sistema
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // Argon2 com Pepper

    @Bean
    public PasswordEncoder passwordEncoder() {

        // Argon2 com 64MB de RAM, 3 iterações e 1 thread de paralelismo

        Argon2PasswordEncoder argon2 = new Argon2PasswordEncoder(16, 32, 1, 65536, 3);

        return new PasswordEncoder() {
            @Override
            public String encode(CharSequence rawPassword) {

                return argon2.encode(rawPassword.toString() + pepper);
            }

            @Override
            public boolean matches(CharSequence rawPassword, String encodedPassword) {

                return argon2.matches(rawPassword.toString() + pepper, encodedPassword);
            }
        };
    }


    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
