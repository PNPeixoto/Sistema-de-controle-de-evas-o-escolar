package com.peixoto.usuario.controller;

import com.peixoto.usuario.business.FicaiPdfService;
import com.peixoto.usuario.infrastructure.entity.Aluno;
import com.peixoto.usuario.infrastructure.entity.OcorrenciaEvasao;
import com.peixoto.usuario.infrastructure.repository.AlunoRepository;
import com.peixoto.usuario.infrastructure.security.AuthUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/relatorios")
@RequiredArgsConstructor
public class PdfController {

    private final FicaiPdfService ficaiPdfService;
    private final AlunoRepository alunoRepository;
    private final AuthUtils authUtils;

    @GetMapping("/ficai/{alunoId}/{evasaoId}")
    public ResponseEntity<byte[]> baixarFicai(@PathVariable Long alunoId, @PathVariable Long evasaoId) {

        Aluno aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado com ID: " + alunoId));

        // Anti-IDOR via AuthUtils
        if (!authUtils.pertenceAMinhaEscola(aluno.getEscola())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        OcorrenciaEvasao evasao = aluno.getHistoricoEvasao().stream()
                .filter(e -> e.getId().equals(evasaoId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Evasão não encontrada com ID: " + evasaoId));

        byte[] relatorioPdf = ficaiPdfService.gerarFicaiPdf(aluno, evasao);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment",
                "FICAI_" + aluno.getNomeCompleto().replaceAll("\\s+", "_") + ".pdf");

        return new ResponseEntity<>(relatorioPdf, headers, HttpStatus.OK);
    }
}
