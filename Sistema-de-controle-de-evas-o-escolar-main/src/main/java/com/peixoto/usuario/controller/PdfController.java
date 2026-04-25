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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.peixoto.usuario.infrastructure.exceptions.ResourceNotFoundException;

@RestController
@RequestMapping("/relatorios")
@RequiredArgsConstructor
public class PdfController {

    private final FicaiPdfService ficaiPdfService;
    private final AlunoRepository alunoRepository;
    private final AuthUtils authUtils;

    @PreAuthorize("hasAnyRole('ESCOLA','SEMED','ADMIN')")
    @GetMapping("/ficai/{alunoId}/{evasaoId}")
    public ResponseEntity<byte[]> baixarFicai(@PathVariable Long alunoId, @PathVariable Long evasaoId) {
        Aluno aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno não encontrado: " + alunoId));

        if (!authUtils.pertenceAMinhaEscola(aluno.getEscola())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        OcorrenciaEvasao evasao = aluno.getHistoricoEvasao().stream()
                .filter(e -> e.getId().equals(evasaoId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Evasão não encontrada: " + evasaoId));

        byte[] relatorioPdf = ficaiPdfService.gerarFicaiPdf(aluno, evasao);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        String nomeArquivo = "FICAI_" + aluno.getNomeCompleto().replaceAll("\\s+", "_") + ".pdf";
        headers.setContentDispositionFormData("attachment", nomeArquivo);

        return new ResponseEntity<>(relatorioPdf, headers, HttpStatus.OK);
    }
}