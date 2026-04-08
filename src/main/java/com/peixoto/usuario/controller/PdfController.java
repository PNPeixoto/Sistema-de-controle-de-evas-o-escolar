package com.peixoto.usuario.controller;

import com.peixoto.usuario.business.FicaiPdfService;
import com.peixoto.usuario.infrastructure.entity.Aluno;
import com.peixoto.usuario.infrastructure.entity.OcorrenciaEvasao;
import com.peixoto.usuario.infrastructure.entity.Usuario;
import com.peixoto.usuario.infrastructure.repository.AlunoRepository;
import com.peixoto.usuario.infrastructure.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/relatorios")
@RequiredArgsConstructor
public class PdfController {

    private final FicaiPdfService ficaiPdfService;
    private final AlunoRepository alunoRepository;
    private final UsuarioRepository usuarioRepository;

    @GetMapping("/ficai/{alunoId}/{evasaoId}")
    public ResponseEntity<byte[]> baixarFicai(@PathVariable Long alunoId, @PathVariable Long evasaoId) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // NOVO: Anti-IDOR — escola só baixa PDF dos próprios alunos
        boolean isSemed = auth.getAuthorities().stream().anyMatch(r ->
                r.getAuthority().toUpperCase().contains("SEMED") ||
                r.getAuthority().toUpperCase().contains("ADMIN"));

        Aluno aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado com ID: " + alunoId));

        if (!isSemed) {
            Usuario usuario = usuarioRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            if (!aluno.getEscola().equalsIgnoreCase(usuario.getEscolaNome())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        OcorrenciaEvasao evasao = aluno.getHistoricoEvasao().stream()
                .filter(e -> e.getId().equals(evasaoId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Evasão não encontrada com ID: " + evasaoId));

        byte[] relatorioPdf = ficaiPdfService.gerarFicaiPdf(aluno, evasao);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        String nomeArquivo = "FICAI_" + aluno.getNomeCompleto().replaceAll("\\s+", "_") + ".pdf";
        headers.setContentDispositionFormData("attachment", nomeArquivo);

        return new ResponseEntity<>(relatorioPdf, headers, HttpStatus.OK);
    }
}
