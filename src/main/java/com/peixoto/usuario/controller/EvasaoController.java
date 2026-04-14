package com.peixoto.usuario.controller;

import com.peixoto.usuario.business.EvasaoService;
import com.peixoto.usuario.business.dto.OcorrenciaEvasaoDTO;
import com.peixoto.usuario.infrastructure.entity.Aluno;
import com.peixoto.usuario.infrastructure.entity.OcorrenciaEvasao;
import com.peixoto.usuario.infrastructure.repository.AlunoRepository;
import com.peixoto.usuario.infrastructure.security.AuthUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/evasao")
@RequiredArgsConstructor
public class EvasaoController {

    private final EvasaoService evasaoService;
    private final AlunoRepository alunoRepository;
    private final AuthUtils authUtils;

    @PostMapping("/{alunoId}")
    public ResponseEntity<OcorrenciaEvasao> registrarAlerta(
            @PathVariable Long alunoId,
            @Valid @RequestBody OcorrenciaEvasaoDTO dto) {

        if (authUtils.isSemed()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Aluno aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

        if (!authUtils.pertenceAMinhaEscola(aluno.getEscola())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        OcorrenciaEvasao novaEvasao = evasaoService.registrarEvasao(alunoId, dto);
        return ResponseEntity.ok(novaEvasao);
    }

    @PutMapping("/{evasaoId}/resolver")
    public ResponseEntity<Map<String, String>> resolverEvasao(@PathVariable Long evasaoId) {
        OcorrenciaEvasao evasao = evasaoService.buscarEvasao(evasaoId);
        if (evasao == null || evasao.getAluno() == null) {
            return ResponseEntity.notFound().build();
        }

        if (!authUtils.pertenceAMinhaEscola(evasao.getAluno().getEscola())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        evasaoService.resolverEvasao(evasaoId);
        return ResponseEntity.ok(Map.of("status", "RESOLVIDA"));
    }
}
