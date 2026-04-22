package com.peixoto.usuario.business;

import com.peixoto.usuario.business.converter.UsuarioConverter;
import com.peixoto.usuario.business.dto.LoginEtapa1DTO;
import com.peixoto.usuario.business.dto.LoginEtapa2DTO;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioConverter usuarioConverter;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @CacheEvict(value = "usuario_email", key = "#usuarioDTO.email")
    public UsuarioDTO salvaUsuario(UsuarioDTO usuarioDTO) {
        emailExiste(usuarioDTO.getEmail());
        usuarioDTO.setSenhaEscola(passwordEncoder.encode(usuarioDTO.getSenhaEscola()));
        usuarioDTO.setSenhaIndividual(passwordEncoder.encode(usuarioDTO.getSenhaIndividual()));

        Usuario usuario = usuarioConverter.paraUsuario(usuarioDTO);
        return usuarioConverter.paraUsuarioDTO(usuarioRepository.save(usuario));
    }

    // =========================================================
    // AUTENTICAÇÃO EM DOIS NÍVEIS (SEPARADOS)
    // =========================================================

    // ETAPA 1: Retorna apenas o nome da escola para o Front-end
    public String validarEscola(LoginEtapa1DTO dto) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.email(), dto.senhaEscola())
            );
            Usuario usuario = (Usuario) authentication.getPrincipal();
            return usuario.getEscolaNome();
        } catch (Exception e) {
            throw new UnauthorizedException("Credenciais da escola incorretas.");
        }
    }

    // ETAPA 2: Valida o código do servidor e gera o JWT Final
    public String validarsenhaIndividual(LoginEtapa2DTO dto) {
        Usuario usuario = usuarioRepository.findByEmail(dto.email())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + dto.email()));

        // Compara o código de 32 caracteres digitado com o Hash do banco

        if (!passwordEncoder.matches(dto.senhaIndividual(), usuario.getSenhaIndividual())) {
            throw new UnauthorizedException("Código de acesso do servidor inválido.");
        }

        return "Bearer " + jwtUtil.generateToken(usuario.getEmail());
    }

    // =========================================================
    // MÉTODOS AUXILIARES E CRUD
    // =========================================================

    public void emailExiste(String email) {
        if (usuarioRepository.existsByEmail(email)) {
            throw new ConflictException("Email já cadastrado: " + email);
        }
    }

    @Cacheable(value = "usuario_email", key = "#email")
    public UsuarioDTO buscarUsuarioPorEmail(String email) {
        return usuarioConverter.paraUsuarioDTO(
                usuarioRepository.findByEmail(email)
                        .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + email))
        );
    }

    @CacheEvict(value = "usuario_email", key = "#email")
    public void deletaUsuarioPorEmail(String email) {
        usuarioRepository.deleteByEmail(email);
    }

    @CacheEvict(value = "usuario_email", key = "#result.email")
    public UsuarioDTO atualizaDadosUsuario(UsuarioDTO dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new UnauthorizedException("Usuário não autenticado.");
        }

        Usuario usuarioEntity = usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não localizado"));

        if (dto.getNome() != null && !dto.getNome().isBlank()) {
            usuarioEntity.setNome(dto.getNome());
        }

        if (dto.getSenhaEscola() != null) {
            usuarioEntity.setSenhaEscola(passwordEncoder.encode(dto.getSenhaEscola()));
        }

        if (dto.getSenhaIndividual() != null) {
            usuarioEntity.setSenhaIndividual(passwordEncoder.encode(dto.getSenhaIndividual()));
        }

        return usuarioConverter.paraUsuarioDTO(usuarioRepository.save(usuarioEntity));
    }
}
