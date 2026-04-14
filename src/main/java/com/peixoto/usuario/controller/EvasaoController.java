package com.peixoto.usuario.controller;

import com.peixoto.usuario.business.EvasaoService;
import com.peixoto.usuario.business.dto.OcorrenciaEvasaoDTO;
import com.peixoto.usuario.infrastructure.entity.OcorrenciaEvasao;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/evasao")
@RequiredArgsConstructor
public class EvasaoController {

    private final EvasaoService evasaoService;

    @PostMapping("/{alunoId}")
    public ResponseEntity<OcorrenciaEvasao> registrarAlerta(
            @PathVariable Long alunoId,
            @RequestBody OcorrenciaEvasaoDTO dto) {

        // Chama a service que nós criamos para salvar no banco
        OcorrenciaEvasao novaEvasao = evasaoService.registrarEvasao(alunoId, dto);

        // Devolve 200 OK com os dados salvos para o React
        return ResponseEntity.ok(novaEvasao);
    }
}