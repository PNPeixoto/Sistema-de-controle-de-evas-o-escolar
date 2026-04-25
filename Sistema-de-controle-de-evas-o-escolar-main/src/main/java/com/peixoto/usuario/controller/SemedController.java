package com.peixoto.usuario.controller;

import com.peixoto.usuario.infrastructure.entity.Aluno;
import com.peixoto.usuario.infrastructure.repository.AlunoRepository;
import com.peixoto.usuario.infrastructure.security.AuthUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
@PreAuthorize("hasAnyRole('SEMED','ADMIN')")
public class SemedController {

    private final AlunoRepository alunoRepository;
    private final AuthUtils authUtils;

    private int calcularIdade(Aluno aluno) {
        if (aluno.getDataNascimento() == null) return 0;
        return Period.between(aluno.getDataNascimento().toLocalDate(), LocalDate.now()).getYears();
    }

    @GetMapping("/alunos/todos")
    public ResponseEntity<Page<Aluno>> buscarTodosAlunosSemed(Pageable pageable) {
        return ResponseEntity.ok(alunoRepository.findAll(pageable));
    }

    @GetMapping("/estatisticas")
    public ResponseEntity<Map<String, Object>> getEstatisticasSemed() {
        // Para estatísticas, usamos projeção ou contagem agregada no banco
        // Aqui mantemos stream mas com cuidado — ideal seria query nativa
        List<Aluno> alunosComEvasao = alunoRepository.findAllOrdered().stream()
                .filter(a -> a.getHistoricoEvasao() != null && !a.getHistoricoEvasao().isEmpty())
                .toList();

        Map<String, Object> estatisticas = new HashMap<>();
        estatisticas.put("totalEvasoes", alunosComEvasao.size());
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
        List<Aluno> todosAlunos = alunoRepository.findAllOrdered();
        todosAlunos.sort(Comparator.comparing(Aluno::getEscola).thenComparing(Aluno::getNomeCompleto));

        StringBuilder csv = new StringBuilder();
        csv.append("Escola,Nome do Aluno,Idade,Cor/Raca,Escolaridade,Bairro,Tem Evasao,Beneficios\n");

        for (Aluno aluno : todosAlunos) {
            boolean temEvasao = aluno.getHistoricoEvasao() != null && !aluno.getHistoricoEvasao().isEmpty();
            String bairro = (aluno.getEnderecos() != null && !aluno.getEnderecos().isEmpty())
                    ? aluno.getEnderecos().get(0).getBairro() : "Não Informado";
            int idade = calcularIdade(aluno);

            csv.append(String.format("\"%s\",\"%s\",%d,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                    sanitizeCsvCell(aluno.getEscola()),
                    sanitizeCsvCell(aluno.getNomeCompleto()),
                    idade,
                    sanitizeCsvCell(aluno.getCor() != null ? aluno.getCor() : "Não Declarada"),
                    sanitizeCsvCell(aluno.getEscolaridade() != null ? aluno.getEscolaridade() : "Não Informada"),
                    sanitizeCsvCell(bairro),
                    temEvasao ? "SIM" : "NAO",
                    sanitizeCsvCell(aluno.getBeneficios() != null ? aluno.getBeneficios() : "Nenhum")
            ));
        }

        byte[] excelBytes = ("\ufeff" + csv.toString()).getBytes();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "Relatorio_SEMED_OrdemAlfabetica.csv");

        return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
    }

    private String sanitizeCsvCell(String value) {
        if (value == null) return "";
        String sanitized = value;
        if (!sanitized.isEmpty() && "=+-@".indexOf(sanitized.charAt(0)) >= 0) {
            sanitized = "'" + sanitized;
        }
        return sanitized.replace("\"", "\"\"");
    }
}