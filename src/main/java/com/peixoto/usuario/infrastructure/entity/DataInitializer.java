package com.peixoto.usuario.infrastructure.entity;

import com.peixoto.usuario.infrastructure.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UsuarioRepository usuarioRepository) {
        return args -> {
            if (usuarioRepository.count() == 0) { // Verifica se já existem usuários
                BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

                Usuario admin = new Usuario();
                admin.setNome("Administrador");
                admin.setEmail("admin@admin.com");
                admin.setSenhaEscola(passwordEncoder.encode("1234"));
                admin.setSenhaIndividual(passwordEncoder.encode("1234")); // O PIN do admin
                admin.setCargo(Cargo.DIRETOR);

                Usuario usuario = new Usuario();
                usuario.setNome("Usuário Comum");
                usuario.setEmail("usuario@email.com");
                usuario.setSenhaEscola(passwordEncoder.encode("usuario123$"));
                usuario.setSenhaIndividual(passwordEncoder.encode("4321")); // O PIN do usuário
                usuario.setCargo(Cargo.ASSISTENTE);

                usuarioRepository.save(admin);
                usuarioRepository.save(usuario);

                System.out.println("Usuários criados com sucesso!");
            }
        };
    }
}
