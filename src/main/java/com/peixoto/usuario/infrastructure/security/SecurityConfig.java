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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${app.security.pepper}")
    private String pepper;

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final TokenBlacklistService tokenBlacklistService;

    @Autowired
    public SecurityConfig(JwtUtil jwtUtil, @Lazy UserDetailsService userDetailsService,
                          TokenBlacklistService tokenBlacklistService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        JwtRequestFilter jwtRequestFilter = new JwtRequestFilter(jwtUtil, userDetailsService, tokenBlacklistService);

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Público: somente login
                        .requestMatchers("/usuario/login/**").permitAll()
                        .requestMatchers("/error").permitAll()

                        // CORREÇÃO: POST /usuario agora exige autenticação (só ADMIN/SEMED cria usuários)
                        // Removido: .requestMatchers(HttpMethod.POST, "/usuario").permitAll()

                        // Autenticado
                        .requestMatchers(HttpMethod.GET, "/usuario/email").hasAnyRole("ADMIN", "SEMED")
                        .requestMatchers(HttpMethod.DELETE, "/usuario/email").hasAnyRole("ADMIN", "SEMED")
                        .requestMatchers(HttpMethod.GET, "/usuario/me").authenticated()
                        .requestMatchers(HttpMethod.POST, "/usuario/logout").authenticated()
                        .requestMatchers("/ficai-mensal/**").authenticated()
                        .requestMatchers("/evasao/**").authenticated()
                        .requestMatchers("/aluno/**").authenticated()
                        .requestMatchers("/semed/**").authenticated()
                        .requestMatchers("/relatorios/**").authenticated()
                        .requestMatchers("/bairros/**").authenticated()
                        .requestMatchers("/escolas/**").authenticated()
                        .requestMatchers("/usuario/**").authenticated()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "https://sistema-de-controle-de-evas-o-escol-gamma.vercel.app",
                "https://sistema-de-controle-de-evas-o-escol.vercel.app",
                "https://sistema-de-controle-de-evas-o-escolar-4paa7gab9.vercel.app",
                "https://sistema-de-controle-git-05dc2b-pedro-peixotos-projects-1536bf9a.vercel.app"
        ));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setExposedHeaders(List.of("Set-Cookie"));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
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
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
