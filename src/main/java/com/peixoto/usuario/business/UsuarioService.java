package com.peixoto.usuario.business;

import com.peixoto.usuario.business.converter.UsuarioConverter;
import com.peixoto.usuario.business.dto.UsuarioDTO;
import com.peixoto.usuario.infrastructure.entity.Usuario;
import com.peixoto.usuario.infrastructure.exceptions.ConflictException;
import com.peixoto.usuario.infrastructure.exceptions.ResourceNotFoundException;
import com.peixoto.usuario.infrastructure.exceptions.UnauthorizedException;
import com.peixoto.usuario.infrastructure.repository.UsuarioRepository;
import com.peixoto.usuario.infrastructure.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsuarioService {


    private final UsuarioRepository usuarioRepository;
    private final UsuarioConverter usuarioConverter;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;


    public UsuarioDTO salvaUsuario(UsuarioDTO usuarioDTO) {
        emailExiste(usuarioDTO.getEmail());

        // Criptografa as senhas antes de salvar

        usuarioDTO.setSenhaEscola(passwordEncoder.encode(usuarioDTO.getSenhaEscola()));
        usuarioDTO.setSenhaIndividual(passwordEncoder.encode(usuarioDTO.getSenhaIndividual()));

        Usuario usuario = usuarioConverter.paraUsuario(usuarioDTO);
        return usuarioConverter.paraUsuarioDTO(usuarioRepository.save(usuario));
    }


    // Autenticação em Dois Níveis

    public String autenticarUsuario(UsuarioDTO usuarioDTO) {
        // Validação Nível 1: Email e Senha da Escola
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(usuarioDTO.getEmail(), usuarioDTO.getSenhaEscola())
        );

        // Validação Nível 2: Senha Individual (PIN) manual:

        Usuario usuario = (Usuario) authentication.getPrincipal();
        if (!passwordEncoder.matches(usuarioDTO.getSenhaIndividual(), usuario.getSenhaIndividual())) {
            throw new UnauthorizedException("PIN individual incorreto.");
        }

        return "Bearer " + jwtUtil.generateToken(usuario.getEmail());
    }

    public void emailExiste(String email) {
        if (usuarioRepository.existsByEmail(email)) {
            throw new ConflictException("Email já cadastrado: " + email);
        }
    }

    public UsuarioDTO buscarUsuarioPorEmail(String email) {
        return usuarioConverter.paraUsuarioDTO(
                usuarioRepository.findByEmail(email)
                        .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + email))
        );
    }

    public void deletaUsuarioPorEmail(String email) {
        usuarioRepository.deleteByEmail(email);
    }

    public UsuarioDTO atualizaDadosUsuario(String token, UsuarioDTO dto) {
        String emailToken = jwtUtil.extractEmailToken(token.substring(7));



        Usuario usuarioEntity = usuarioRepository.findByEmail(emailToken)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não localizado"));

        // Se houver nova senha escolar, criptografa

        if (dto.getSenhaEscola() != null) {
            dto.setSenhaEscola(passwordEncoder.encode(dto.getSenhaEscola()));
        }
        // Se houver novo PIN, criptografa

        if (dto.getSenhaIndividual() != null) {
            dto.setSenhaIndividual(passwordEncoder.encode(dto.getSenhaIndividual()));
        }

        Usuario usuario = usuarioConverter.updateUsuario(dto, usuarioEntity);
        return usuarioConverter.paraUsuarioDTO(usuarioRepository.save(usuario));
    }
}