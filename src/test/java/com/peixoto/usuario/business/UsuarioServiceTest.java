package com.peixoto.usuario.business;

import com.peixoto.usuario.business.converter.UsuarioConverter;
import com.peixoto.usuario.business.dto.UsuarioDTO;
import com.peixoto.usuario.infrastructure.entity.Usuario;
import com.peixoto.usuario.infrastructure.exceptions.ConflictException;
import com.peixoto.usuario.infrastructure.repository.UsuarioRepository;
import com.peixoto.usuario.infrastructure.security.JwtUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock private UsuarioRepository usuarioRepository;
    @Mock private UsuarioConverter usuarioConverter;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @Mock private AuthenticationManager authenticationManager;

    @InjectMocks
    private UsuarioService usuarioService;

    @Test
    @DisplayName("Deve lançar ConflictException quando email já existe")
    void salvaUsuario_emailExistente_lancaExcecao() {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setEmail("teste@escola.com");
        when(usuarioRepository.existsByEmail("teste@escola.com")).thenReturn(true);

        assertThrows(ConflictException.class, () -> usuarioService.salvaUsuario(dto));
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve salvar usuário com senha criptografada")
    void salvaUsuario_novoUsuario_salvaComSucesso() {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setEmail("novo@escola.com");
        dto.setSenhaEscola("senha123");
        dto.setSenhaIndividual("codigo456");

        when(usuarioRepository.existsByEmail("novo@escola.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hash");
        when(usuarioConverter.paraUsuario(any())).thenReturn(new Usuario());
        when(usuarioRepository.save(any())).thenReturn(new Usuario());
        when(usuarioConverter.paraUsuarioDTO(any())).thenReturn(new UsuarioDTO());

        UsuarioDTO result = usuarioService.salvaUsuario(dto);

        assertNotNull(result);
        verify(passwordEncoder, times(2)).encode(anyString());
    }
}