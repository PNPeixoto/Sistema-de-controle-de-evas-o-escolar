package com.peixoto.usuario.infrastructure.entity;

import com.peixoto.usuario.infrastructure.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    @Profile({"dev", "test"})
    public CommandLineRunner initData(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (usuarioRepository.count() == 0) {
                Usuario admin = new Usuario();
                admin.setNome("Administrador");
                admin.setEmail("admin@admin.com");
                admin.setSenhaEscola(passwordEncoder.encode("1234"));
                admin.setSenhaIndividual(passwordEncoder.encode("1234"));
                admin.setCargo(Cargo.DIRETOR);

                Usuario usuario = new Usuario();
                usuario.setNome("Usuario Comum");
                usuario.setEmail("usuario@email.com");
                usuario.setSenhaEscola(passwordEncoder.encode("usuario123$"));
                usuario.setSenhaIndividual(passwordEncoder.encode("4321"));
                usuario.setCargo(Cargo.ASSISTENTE);

                usuarioRepository.save(admin);
                usuarioRepository.save(usuario);

                log.info("Usuarios de seed criados para profile local.");
            }
        };
    }
}
