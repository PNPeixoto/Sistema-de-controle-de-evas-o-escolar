package com.peixoto.usuario.infrastructure.security;

import com.peixoto.usuario.infrastructure.entity.Usuario;
import com.peixoto.usuario.infrastructure.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthUtils {

    private final UsuarioRepository usuarioRepository;

    public boolean isSemed() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getAuthorities() == null) return false;
        for (GrantedAuthority a : auth.getAuthorities()) {
            String role = a.getAuthority();
            if ("ROLE_SEMED".equals(role) || "ROLE_ADMIN".equals(role)) return true;
        }
        return false;
    }

    public Usuario getUsuarioLogado() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado no sistema"));
    }

    public boolean pertenceAMinhaEscola(String escolaDoAluno) {
        if (isSemed()) return true;
        Usuario logado = getUsuarioLogado();
        return logado.getEscolaNome() != null && logado.getEscolaNome().equalsIgnoreCase(escolaDoAluno);
    }
}
