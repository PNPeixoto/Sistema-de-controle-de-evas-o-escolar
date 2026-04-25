package com.peixoto.usuario.business;

import com.peixoto.usuario.business.dto.OcorrenciaEvasaoDTO;
import com.peixoto.usuario.infrastructure.entity.AcaoTomada;
import com.peixoto.usuario.infrastructure.entity.Aluno;
import com.peixoto.usuario.infrastructure.entity.OcorrenciaEvasao;
import com.peixoto.usuario.infrastructure.exceptions.ResourceNotFoundException;
import com.peixoto.usuario.infrastructure.repository.AlunoRepository;
import com.peixoto.usuario.infrastructure.repository.OcorrenciaEvasaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvasaoService {

    private final AlunoRepository alunoRepository;
    private final OcorrenciaEvasaoRepository ocorrenciaEvasaoRepository;

    @CacheEvict(value = "alunos_escola", key = "#result.aluno.escola")
    @Transactional
    public OcorrenciaEvasao registrarEvasao(Long alunoId, OcorrenciaEvasaoDTO dto) {
        Aluno aluno = alunoRepository.findByIdWithEvasoes(alunoId)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno não encontrado: " + alunoId));

        OcorrenciaEvasao ocorrencia = new OcorrenciaEvasao();
        ocorrencia.setMesFaltas(dto.getMesFaltas());
        ocorrencia.setQuantidadeFaltas(dto.getQuantidadeFaltas());
        ocorrencia.setMotivoAfastamento(dto.getMotivoAfastamento());
        ocorrencia.setEncaminhamentosLaudos(dto.getEncaminhamentosLaudos());
        ocorrencia.setConclusao(dto.getConclusao());
        ocorrencia.setReincidente(dto.getReincidente());
        ocorrencia.setProvidenciasAdotadas(dto.getProvidenciasAdotadas());
        ocorrencia.setOutrasProvidencias(dto.getOutrasProvidencias());
        ocorrencia.setStatus("ABERTA");
        ocorrencia.setCriadoEm(LocalDateTime.now());
        ocorrencia.setAluno(aluno);

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
        return ocorrenciaEvasaoRepository.save(ocorrencia);
    }

    public OcorrenciaEvasao buscarEvasao(Long evasaoId) {
        return ocorrenciaEvasaoRepository.findById(evasaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Evasão não encontrada: " + evasaoId));
    }

    @CacheEvict(value = "alunos_escola", allEntries = true)
    @Transactional
    public void resolverEvasao(Long evasaoId) {
        OcorrenciaEvasao alvo = ocorrenciaEvasaoRepository.findById(evasaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Evasão não encontrada: " + evasaoId));
        alvo.setStatus("RESOLVIDA");
        alvo.setDataResolucao(LocalDateTime.now());
    }
}