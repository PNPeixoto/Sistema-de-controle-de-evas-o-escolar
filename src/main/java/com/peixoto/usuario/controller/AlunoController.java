package com.peixoto.usuario.controller;

import com.peixoto.usuario.business.AlunoService;
import com.peixoto.usuario.business.dto.AlunoDTO;
import com.peixoto.usuario.infrastructure.entity.Aluno;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/aluno")
@RequiredArgsConstructor
public class AlunoController {

    private final AlunoService alunoService;

    @PostMapping
    public ResponseEntity<Aluno> salvaAluno(@RequestBody AlunoDTO alunoDTO) {
        return ResponseEntity.ok(alunoService.salvaAluno(alunoDTO));
    }

    @GetMapping("/escola/{nomeEscola}")
    public ResponseEntity<List<Aluno>> buscarPorEscola(@PathVariable String nomeEscola) {
        return ResponseEntity.ok(alunoService.buscarTodosPorEscola(nomeEscola));
    }
}