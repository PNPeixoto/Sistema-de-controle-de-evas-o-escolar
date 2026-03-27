package com.peixoto.usuario.business;

import com.peixoto.usuario.business.dto.OcorrenciaEvasaoDTO;
import com.peixoto.usuario.infrastructure.entity.AcaoTomada;
import com.peixoto.usuario.infrastructure.entity.Aluno;
import com.peixoto.usuario.infrastructure.entity.OcorrenciaEvasao;
import com.peixoto.usuario.infrastructure.repository.AlunoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvasaoService {

    private final AlunoRepository alunoRepository;

    @Transactional
    public OcorrenciaEvasao registrarEvasao(Long alunoId, OcorrenciaEvasaoDTO dto) {
        // 1. Busca o aluno
        Aluno aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado com o ID: " + alunoId));

        // 2. Mapeia TODOS os dados do DTO para a Entidade
        OcorrenciaEvasao ocorrencia = new OcorrenciaEvasao();
        ocorrencia.setMesFaltas(dto.getMesFaltas());
        ocorrencia.setQuantidadeFaltas(dto.getQuantidadeFaltas());
        ocorrencia.setMotivoAfastamento(dto.getMotivoAfastamento());
        ocorrencia.setEncaminhamentosLaudos(dto.getEncaminhamentosLaudos());
        ocorrencia.setConclusao(dto.getConclusao());

        // ---> AS NOSSAS TRÊS NOVIDADES AQUI <---
        ocorrencia.setReincidente(dto.getReincidente());
        ocorrencia.setProvidenciasAdotadas(dto.getProvidenciasAdotadas());
        ocorrencia.setOutrasProvidencias(dto.getOutrasProvidencias());

        // Amarra a ocorrência ao aluno
        ocorrencia.setAluno(aluno);

        // 3. Mapeia a Lista de Ações (A mágica da tabela acao_tomada)
        if (dto.getAcoes() != null && !dto.getAcoes().isEmpty()) {
            List<AcaoTomada> listaDeAcoes = dto.getAcoes().stream().map(acaoDto -> {
                AcaoTomada acao = new AcaoTomada();

                // Pega a data já formatada certinha
                acao.setDataAcao(acaoDto.getDataAcao());

                // Pega o texto da variável acaoTomada e salva na Entidade
                acao.setDescricao(acaoDto.getAcaoTomada());

                acao.setOcorrencia(ocorrencia); // Amarra a ação à ocorrência!
                return acao;
            }).collect(Collectors.toList());

            ocorrencia.setAcoes(listaDeAcoes);
        }

        // 4. Salva no banco (O Cascade vai salvar a Evasão, as Providências e as Ações juntas)
        aluno.getHistoricoEvasao().add(ocorrencia);
        alunoRepository.save(aluno);

        return ocorrencia;
    }
}