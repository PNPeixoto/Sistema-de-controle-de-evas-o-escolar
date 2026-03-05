package com.peixoto.usuario.business.converter;

import com.peixoto.usuario.business.dto.UsuarioDTO;
import com.peixoto.usuario.infrastructure.entity.Usuario;
import org.springframework.stereotype.Component;

@Component
public class UsuarioConverter {

    public Usuario paraUsuario(UsuarioDTO usuarioDTO) {
        return Usuario.builder()
                .nome(usuarioDTO.getNome())
                .email(usuarioDTO.getEmail())
                .senhaEscola(usuarioDTO.getSenhaEscola())
                .senhaIndividual(usuarioDTO.getSenhaIndividual())
                .cargo(usuarioDTO.getCargo())
                .escolaNome(usuarioDTO.getEscolaNome())
                .ativo(true)
                .build();
    }

    public UsuarioDTO paraUsuarioDTO(Usuario usuario) {
        return UsuarioDTO.builder()
                .id(usuario.getId())
                .nome(usuario.getNome())
                .email(usuario.getEmail())
                .cargo(usuario.getCargo())
                .escolaNome(usuario.getEscolaNome())
                .build();
    }

    public Usuario updateUsuario(UsuarioDTO dto, Usuario entity) {
        return Usuario.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .nome(dto.getNome() != null ? dto.getNome() : entity.getNome())
                .senhaEscola(dto.getSenhaEscola() != null ? dto.getSenhaEscola() : entity.getSenhaEscola())
                .senhaIndividual(dto.getSenhaIndividual() != null ? dto.getSenhaIndividual() : entity.getSenhaIndividual())
                .cargo(dto.getCargo() != null ? dto.getCargo() : entity.getCargo())
                .escolaNome(dto.getEscolaNome() != null ? dto.getEscolaNome() : entity.getEscolaNome())
                .ativo(entity.getAtivo())
                .build();
    }
}