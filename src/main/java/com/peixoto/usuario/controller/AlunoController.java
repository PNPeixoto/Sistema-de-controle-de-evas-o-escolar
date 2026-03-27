package com.peixoto.usuario.controller;

import com.peixoto.usuario.business.AlunoService;
import com.peixoto.usuario.business.dto.AlunoDTO;
import com.peixoto.usuario.infrastructure.entity.Aluno;
import com.peixoto.usuario.infrastructure.entity.Usuario;
import com.peixoto.usuario.infrastructure.repository.AlunoRepository;
import com.peixoto.usuario.infrastructure.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/aluno")
@RequiredArgsConstructor
public class AlunoController {

    private final AlunoService alunoService;
    private final UsuarioRepository usuarioRepository;
    private final AlunoRepository alunoRepository; // Necessário para validar exclusão

    private boolean isSemed(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(role -> role.getAuthority().toUpperCase().contains("SEMED") ||
                        role.getAuthority().toUpperCase().contains("ADMIN"));
    }

    private Usuario getUsuarioLogado(Authentication auth) {
        return usuarioRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado no sistema"));
    }

    @PostMapping
    public ResponseEntity<Aluno> salvaAluno(@RequestBody AlunoDTO alunoDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // 1. SEMED não pode cadastrar aluno
        if (isSemed(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Usuario usuarioLogado = getUsuarioLogado(auth);

        // 2. Trava Anti-IDOR: Ignora a escola que veio no JSON e força a escola do usuário logado
        alunoDTO.setEscola(usuarioLogado.getEscolaNome());

        return ResponseEntity.ok(alunoService.salvaAluno(alunoDTO));
    }

    @GetMapping("/escola/{nomeEscola}")
    public ResponseEntity<List<Aluno>> buscarPorEscola(@PathVariable String nomeEscola) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (!isSemed(auth)) {
            Usuario usuarioLogado = getUsuarioLogado(auth);
            if (!usuarioLogado.getEscolaNome().equalsIgnoreCase(nomeEscola)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        // Se for SEMED, passa direto e consulta a escola solicitada.
        return ResponseEntity.ok(alunoService.buscarTodosPorEscola(nomeEscola));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarAluno(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // 1. SEMED não deleta aluno
        if (isSemed(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Usuario usuarioLogado = getUsuarioLogado(auth);

        // 2. Busca o aluno no banco para checar a quem ele pertence
        Aluno alunoBanco = alunoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

        // 3. Trava Anti-IDOR: Escola só deleta o próprio aluno
        if (!alunoBanco.getEscola().equalsIgnoreCase(usuarioLogado.getEscolaNome())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        alunoService.deletarAluno(id);
        return ResponseEntity.noContent().build();
    }
}