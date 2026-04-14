package com.peixoto.usuario.controller;

import com.peixoto.usuario.business.AlunoService;
import com.peixoto.usuario.business.dto.AlunoDTO;
import com.peixoto.usuario.infrastructure.entity.Aluno;
import com.peixoto.usuario.infrastructure.entity.Usuario;
import com.peixoto.usuario.infrastructure.repository.AlunoRepository;
import com.peixoto.usuario.infrastructure.security.AuthUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/aluno")
@RequiredArgsConstructor
public class AlunoController {

    private final AlunoService alunoService;
    private final AlunoRepository alunoRepository;
    private final AuthUtils authUtils;

    @PostMapping
    public ResponseEntity<Aluno> salvaAluno(@Valid @RequestBody AlunoDTO alunoDTO) {
        if (authUtils.isSemed()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Usuario usuarioLogado = authUtils.getUsuarioLogado();

        // Anti-IDOR: Força a escola do usuário logado
        alunoDTO.setEscola(usuarioLogado.getEscolaNome());

        return ResponseEntity.ok(alunoService.salvaAluno(alunoDTO));
    }

    @GetMapping("/escola/{nomeEscola}")
    public ResponseEntity<List<Aluno>> buscarPorEscola(@PathVariable String nomeEscola) {
        if (!authUtils.pertenceAMinhaEscola(nomeEscola)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(alunoService.buscarTodosPorEscola(nomeEscola));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Aluno> atualizarAluno(@PathVariable Long id, @Valid @RequestBody AlunoDTO alunoDTO) {
        if (authUtils.isSemed()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Aluno alunoBanco = alunoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

        // Anti-IDOR
        if (!authUtils.pertenceAMinhaEscola(alunoBanco.getEscola())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Usuario usuarioLogado = authUtils.getUsuarioLogado();
        alunoDTO.setEscola(usuarioLogado.getEscolaNome());

        return ResponseEntity.ok(alunoService.atualizarAluno(id, alunoDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarAluno(@PathVariable Long id) {
        if (authUtils.isSemed()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Aluno alunoBanco = alunoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

        if (!authUtils.pertenceAMinhaEscola(alunoBanco.getEscola())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        alunoService.deletarAluno(id);
        return ResponseEntity.noContent().build();
    }
}
