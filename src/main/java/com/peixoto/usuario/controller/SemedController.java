package com.peixoto.usuario.controller;

import com.peixoto.usuario.infrastructure.entity.Aluno;
import com.peixoto.usuario.infrastructure.repository.AlunoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.Period;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/semed")
@RequiredArgsConstructor
public class SemedController {

    private final AlunoRepository alunoRepository;

    private boolean temPermissaoSemed() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getAuthorities() == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(role -> role.getAuthority().toUpperCase().contains("SEMED") ||
                        role.getAuthority().toUpperCase().contains("ADMIN"));
    }

    // Função interna para converter a Data de Nascimento em Idade
    private int calcularIdade(Aluno aluno) {
        if (aluno.getDataNascimento() == null) return 0;
        return Period.between(aluno.getDataNascimento().toLocalDate(), LocalDate.now()).getYears();
    }

    // ==========================================
    // 1. ENDPOINT PARA CONSULTA GERAL DE ALUNOS (SÓ SEMED)
    // ==========================================
    @GetMapping("/alunos/todos")
    public ResponseEntity<List<Aluno>> buscarTodosAlunosSemed() {
        if (!temPermissaoSemed()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(alunoRepository.findAll());
    }

    // ==========================================
    // 2. ENDPOINT DE ESTATÍSTICAS E FILTROS
    // ==========================================
    @GetMapping("/estatisticas")
    public ResponseEntity<Map<String, Object>> getEstatisticasSemed() {
        if (!temPermissaoSemed()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        List<Aluno> todosAlunos = alunoRepository.findAll();
        // Filtramos apenas os alunos que têm FICAI (Evasão) para as estatísticas
        List<Aluno> alunosComEvasao = todosAlunos.stream()
                .filter(a -> a.getHistoricoEvasao() != null && !a.getHistoricoEvasao().isEmpty())
                .toList();

        Map<String, Object> estatisticas = new HashMap<>();
        estatisticas.put("totalEvasoes", alunosComEvasao.size());

        // 1. Filtro por Escola
        estatisticas.put("rankingEscolas", alunosComEvasao.stream()
                .collect(Collectors.groupingBy(Aluno::getEscola, Collectors.counting())));

        // 2. Filtro por Bairro
        estatisticas.put("rankingBairros", alunosComEvasao.stream()
                .filter(a -> a.getEnderecos() != null && !a.getEnderecos().isEmpty())
                .collect(Collectors.groupingBy(a -> a.getEnderecos().get(0).getBairro(), Collectors.counting())));

        // 3. Filtro por Idade
        estatisticas.put("rankingIdades", alunosComEvasao.stream()
                .collect(Collectors.groupingBy(this::calcularIdade, Collectors.counting())));

        // 4. Filtro por Cor
        estatisticas.put("rankingCor", alunosComEvasao.stream()
                .collect(Collectors.groupingBy(a -> a.getCor() != null ? a.getCor() : "Não Informada", Collectors.counting())));

        // 5. Filtro por Escolaridade
        estatisticas.put("rankingEscolaridade", alunosComEvasao.stream()
                .collect(Collectors.groupingBy(a -> a.getEscolaridade() != null ? a.getEscolaridade() : "Não Informada", Collectors.counting())));

        return ResponseEntity.ok(estatisticas);
    }

    // ==========================================
    // 3. EXPORTAR PLANILHA EXCEL COM ORDENAÇÃO E IDADE
    // ==========================================
    @GetMapping("/exportar")
    public ResponseEntity<byte[]> exportarPlanilha() {
        if (!temPermissaoSemed()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        List<Aluno> todosAlunos = alunoRepository.findAll();

        // ORDENAÇÃO MÁGICA: Primeiro agrupa por Escola, e dentro da Escola, em Ordem Alfabética!
        todosAlunos.sort(Comparator.comparing(Aluno::getEscola).thenComparing(Aluno::getNomeCompleto));

        StringBuilder csv = new StringBuilder();
        // Cabeçalho da Planilha
        csv.append("Escola,Nome do Aluno,Idade,Cor/Raca,Escolaridade,Bairro,Tem Evasao,Beneficios\n");

        for (Aluno aluno : todosAlunos) {
            boolean temEvasao = aluno.getHistoricoEvasao() != null && !aluno.getHistoricoEvasao().isEmpty();
            String bairro = (aluno.getEnderecos() != null && !aluno.getEnderecos().isEmpty())
                    ? aluno.getEnderecos().get(0).getBairro() : "Não Informado";

            // Calculamos a idade em anos no momento da exportação
            int idade = calcularIdade(aluno);

            // O uso de \"%s\" (aspas duplas) garante que se alguém digitou uma vírgula no nome, o Excel não vai quebrar a coluna!
            csv.append(String.format("\"%s\",\"%s\",%d,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                    aluno.getEscola(),
                    aluno.getNomeCompleto(),
                    idade,
                    aluno.getCor() != null ? aluno.getCor() : "Não Declarada",
                    aluno.getEscolaridade() != null ? aluno.getEscolaridade() : "Não Informada",
                    bairro,
                    temEvasao ? "SIM" : "NAO",
                    aluno.getBeneficios() != null ? aluno.getBeneficios() : "Nenhum"
            ));
        }

        byte[] excelBytes = ("\ufeff" + csv.toString()).getBytes(); // BOM para acentos no Excel

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "Relatorio_SEMED_OrdemAlfabetica.csv");

        return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
    }
}