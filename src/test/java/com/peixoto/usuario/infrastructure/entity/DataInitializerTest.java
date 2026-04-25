package com.peixoto.usuario.infrastructure.entity;

import com.peixoto.usuario.infrastructure.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

class DataInitializerTest {

    @Test
    void profileProdNaoRegistraSeedDeUsuariosDefault() {
        UsuarioRepository usuarioRepository = mock(UsuarioRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);

        new ApplicationContextRunner()
                .withInitializer(context -> context.getEnvironment().setActiveProfiles("prod"))
                .withBean(UsuarioRepository.class, () -> usuarioRepository)
                .withBean(PasswordEncoder.class, () -> passwordEncoder)
                .withUserConfiguration(DataInitializer.class)
                .run(context -> {
                    assertThat(context).doesNotHaveBean(CommandLineRunner.class);
                    verifyNoInteractions(usuarioRepository, passwordEncoder);
                });
    }
}
