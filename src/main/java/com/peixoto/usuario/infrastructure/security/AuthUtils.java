package com.peixoto.usuario.infrastructure.security;

import com.peixoto.usuario.infrastructure.entity.Usuario;
import com.peixoto.usuario.infrastructure.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Utilitário de autenticação compartilhado entre controllers.
 * Evita duplicação da lógica isSemed/getUsuarioLogado.
 * Usa comparação EXATA de roles (não contains).
 */
@Component
@RequiredArgsConstructor
public class AuthUtils {

    private final UsuarioRepository usuarioRepository;

    public Authentication getAuth() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    /**
     * Verifica se o usuário logado tem cargo SEMED ou ADMIN.
     * Usa igualdade exata para evitar bypass com cargos customizados.
     */
    public boolean isSemed() {
        Authentication auth = getAuth();
        if (auth == null || auth.getAuthorities() == null) return false;

        return auth.getAuthorities().stream().anyMatch(role -> {
            String authority = role.getAuthority();
            return "ROLE_SEMED".equals(authority) || "ROLE_ADMIN".equals(authority);
        });
    }

    /**
     * Retorna a entidade Usuario do usuário logado.
     */
    public Usuario getUsuarioLogado() {
        Authentication auth = getAuth();
        return usuarioRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado no sistema"));
    }

    /**
     * Verifica se o aluno pertence à escola do usuário logado.
     */
    public boolean pertenceAMinhaEscola(String escolaDoAluno) {
        if (isSemed()) return true; // SEMED vê tudo
        Usuario usuario = getUsuarioLogado();
        return usuario.getEscolaNome().equalsIgnoreCase(escolaDoAluno);
    }
}
