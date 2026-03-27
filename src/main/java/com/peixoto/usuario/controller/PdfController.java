package com.peixoto.usuario.controller; // Ajuste para o seu pacote correto

import com.peixoto.usuario.business.FicaiPdfService;
import com.peixoto.usuario.infrastructure.entity.Aluno;
import com.peixoto.usuario.infrastructure.entity.OcorrenciaEvasao;
import com.peixoto.usuario.infrastructure.repository.AlunoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/relatorios")
@RequiredArgsConstructor
// Lembre-se de verificar se o seu CORS está configurado para permitir essa rota
public class PdfController {

    private final FicaiPdfService ficaiPdfService;
    private final AlunoRepository alunoRepository;

    @GetMapping("/ficai/{alunoId}/{evasaoId}")
    public ResponseEntity<byte[]> baixarFicai(@PathVariable Long alunoId, @PathVariable Long evasaoId) {

        // 1. Busca o aluno
        Aluno aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado com ID: " + alunoId));

        // 2. Encontra a evasão específica dentro da lista de evasões do aluno
        OcorrenciaEvasao evasao = aluno.getHistoricoEvasao().stream()
                .filter(e -> e.getId().equals(evasaoId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Evasão não encontrada com ID: " + evasaoId));

        // 3. Chama o serviço para carimbar o PDF
        byte[] relatorioPdf = ficaiPdfService.gerarFicaiPdf(aluno, evasao);

        // 4. Configura os Headers para forçar o navegador a fazer o Download do arquivo binário
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);

        // Formata o nome do arquivo para não ter espaços (ex: FICAI_Pedro_Peixoto.pdf)
        String nomeArquivo = "FICAI_" + aluno.getNomeCompleto().replaceAll("\\s+", "_") + ".pdf";
        headers.setContentDispositionFormData("attachment", nomeArquivo);

        // 5. Retorna o arquivo com Status 200 OK
        return new ResponseEntity<>(relatorioPdf, headers, HttpStatus.OK);
    }
}