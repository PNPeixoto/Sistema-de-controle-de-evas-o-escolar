package com.peixoto.usuario.controller;

import com.peixoto.usuario.business.EvasaoService;
import com.peixoto.usuario.business.dto.OcorrenciaEvasaoDTO;
import com.peixoto.usuario.infrastructure.entity.Aluno;
import com.peixoto.usuario.infrastructure.entity.OcorrenciaEvasao;
import com.peixoto.usuario.infrastructure.entity.Usuario;
import com.peixoto.usuario.infrastructure.repository.AlunoRepository;
import com.peixoto.usuario.infrastructure.repository.UsuarioRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/evasao")
@RequiredArgsConstructor
public class EvasaoController {

    private final EvasaoService evasaoService;
    private final UsuarioRepository usuarioRepository;
    private final AlunoRepository alunoRepository;

    @PostMapping("/{alunoId}")
    public ResponseEntity<OcorrenciaEvasao> registrarAlerta(
            @PathVariable Long alunoId,
            @Valid @RequestBody OcorrenciaEvasaoDTO dto) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // SEMED não registra evasão
        if (auth.getAuthorities().stream().anyMatch(r ->
                r.getAuthority().toUpperCase().contains("SEMED") ||
                r.getAuthority().toUpperCase().contains("ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // NOVO: Anti-IDOR — verifica se o aluno pertence à escola do usuário logado
        Usuario usuario = usuarioRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Aluno aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

        if (!aluno.getEscola().equalsIgnoreCase(usuario.getEscolaNome())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        OcorrenciaEvasao novaEvasao = evasaoService.registrarEvasao(alunoId, dto);
        return ResponseEntity.ok(novaEvasao);
    }
}
