package com.peixoto.usuario.controller;

import com.peixoto.usuario.infrastructure.entity.Aluno;
import com.peixoto.usuario.infrastructure.repository.AlunoRepository;
import com.peixoto.usuario.infrastructure.security.AuthUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.Period;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/semed")
@RequiredArgsConstructor
public class SemedController {

    private final AlunoRepository alunoRepository;
    private final AuthUtils authUtils;

    private int calcularIdade(Aluno aluno) {
        if (aluno.getDataNascimento() == null) return 0;
        return Period.between(aluno.getDataNascimento().toLocalDate(), LocalDate.now()).getYears();
    }

    @GetMapping("/alunos/todos")
    public ResponseEntity<List<Aluno>> buscarTodosAlunosSemed() {
        if (!authUtils.isSemed()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(alunoRepository.findAll());
    }

    @GetMapping("/estatisticas")
    public ResponseEntity<Map<String, Object>> getEstatisticasSemed() {
        if (!authUtils.isSemed()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        List<Aluno> todosAlunos = alunoRepository.findAll();
        List<Aluno> alunosComEvasao = todosAlunos.stream()
                .filter(a -> a.getHistoricoEvasao() != null && !a.getHistoricoEvasao().isEmpty())
                .toList();

        Map<String, Object> estatisticas = new HashMap<>();
        estatisticas.put("totalEvasoes", alunosComEvasao.size());
        estatisticas.put("totalAlunos", todosAlunos.size());

        estatisticas.put("rankingEscolas", alunosComEvasao.stream()
                .collect(Collectors.groupingBy(Aluno::getEscola, Collectors.counting())));

        estatisticas.put("rankingBairros", alunosComEvasao.stream()
                .filter(a -> a.getEnderecos() != null && !a.getEnderecos().isEmpty())
                .collect(Collectors.groupingBy(a -> a.getEnderecos().get(0).getBairro(), Collectors.counting())));

        estatisticas.put("rankingIdades", alunosComEvasao.stream()
                .collect(Collectors.groupingBy(this::calcularIdade, Collectors.counting())));

        estatisticas.put("rankingCor", alunosComEvasao.stream()
                .collect(Collectors.groupingBy(a -> a.getCor() != null ? a.getCor() : "Não Informada", Collectors.counting())));

        estatisticas.put("rankingEscolaridade", alunosComEvasao.stream()
                .collect(Collectors.groupingBy(a -> a.getEscolaridade() != null ? a.getEscolaridade() : "Não Informada", Collectors.counting())));

        return ResponseEntity.ok(estatisticas);
    }

    @GetMapping("/exportar")
    public ResponseEntity<byte[]> exportarPlanilha() {
        if (!authUtils.isSemed()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        List<Aluno> todosAlunos = alunoRepository.findAll();
        todosAlunos.sort(Comparator.comparing(Aluno::getEscola).thenComparing(Aluno::getNomeCompleto));

        StringBuilder csv = new StringBuilder();
        csv.append("Escola,Nome do Aluno,Idade,Cor/Raca,Escolaridade,Bairro,Tem Evasao,Beneficios\n");

        for (Aluno aluno : todosAlunos) {
            boolean temEvasao = aluno.getHistoricoEvasao() != null && !aluno.getHistoricoEvasao().isEmpty();
            String bairro = (aluno.getEnderecos() != null && !aluno.getEnderecos().isEmpty())
                    ? aluno.getEnderecos().get(0).getBairro() : "Não Informado";

            csv.append(String.format("\"%s\",\"%s\",%d,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                    aluno.getEscola(), aluno.getNomeCompleto(), calcularIdade(aluno),
                    aluno.getCor() != null ? aluno.getCor() : "Não Declarada",
                    aluno.getEscolaridade() != null ? aluno.getEscolaridade() : "Não Informada",
                    bairro, temEvasao ? "SIM" : "NAO",
                    aluno.getBeneficios() != null ? aluno.getBeneficios() : "Nenhum"));
        }

        byte[] excelBytes = ("\ufeff" + csv).getBytes();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "Relatorio_SEMED.csv");

        return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
    }
}
