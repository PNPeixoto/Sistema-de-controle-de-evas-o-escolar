package com.peixoto.usuario.business;

import com.peixoto.usuario.business.dto.OcorrenciaEvasaoDTO;
import com.peixoto.usuario.infrastructure.entity.AcaoTomada;
import com.peixoto.usuario.infrastructure.entity.Aluno;
import com.peixoto.usuario.infrastructure.entity.OcorrenciaEvasao;
import com.peixoto.usuario.infrastructure.repository.AlunoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvasaoService {

    private final AlunoRepository alunoRepository;

    // Destrói o cache de alunos daquela escola sempre que uma evasão for registrada
    @CacheEvict(value = "alunos_escola", key = "#result.aluno.escola")
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
        ocorrencia.setReincidente(dto.getReincidente());
        ocorrencia.setProvidenciasAdotadas(dto.getProvidenciasAdotadas());
        ocorrencia.setOutrasProvidencias(dto.getOutrasProvidencias());

        ocorrencia.setAluno(aluno);

        // 3. Mapeia a Lista de Ações
        if (dto.getAcoes() != null && !dto.getAcoes().isEmpty()) {
            List<AcaoTomada> listaDeAcoes = dto.getAcoes().stream().map(acaoDto -> {
                AcaoTomada acao = new AcaoTomada();
                acao.setDataAcao(acaoDto.getDataAcao());
                acao.setDescricao(acaoDto.getAcaoTomada());
                acao.setOcorrencia(ocorrencia);
                return acao;
            }).collect(Collectors.toList());

            ocorrencia.setAcoes(listaDeAcoes);
        }

        aluno.getHistoricoEvasao().add(ocorrencia);
        alunoRepository.save(aluno);

        return ocorrencia;
    }
}