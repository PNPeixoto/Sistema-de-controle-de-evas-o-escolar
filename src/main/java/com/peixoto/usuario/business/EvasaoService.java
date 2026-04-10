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

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvasaoService {

    private final AlunoRepository alunoRepository;

    @CacheEvict(value = "alunos_escola", key = "#result.aluno.escola")
    @Transactional
    public OcorrenciaEvasao registrarEvasao(Long alunoId, OcorrenciaEvasaoDTO dto) {
        Aluno aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado com o ID: " + alunoId));

        OcorrenciaEvasao ocorrencia = new OcorrenciaEvasao();
        ocorrencia.setMesFaltas(dto.getMesFaltas());
        ocorrencia.setQuantidadeFaltas(dto.getQuantidadeFaltas());
        ocorrencia.setMotivoAfastamento(dto.getMotivoAfastamento());
        ocorrencia.setEncaminhamentosLaudos(dto.getEncaminhamentosLaudos());
        ocorrencia.setConclusao(dto.getConclusao());
        ocorrencia.setReincidente(dto.getReincidente());
        ocorrencia.setProvidenciasAdotadas(dto.getProvidenciasAdotadas());
        ocorrencia.setOutrasProvidencias(dto.getOutrasProvidencias());
        ocorrencia.setStatus("ABERTA"); // NOVO: status padrão
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
        alunoRepository.save(aluno);
        return ocorrencia;
    }

    // NOVO: Resolver evasão (persistido no banco, não mais sessionStorage)
    @CacheEvict(value = "alunos_escola", allEntries = true)
    @Transactional
    public void resolverEvasao(Long evasaoId) {
        // Busca todos os alunos e encontra a evasão
        // Em produção com muitos dados, criar um OcorrenciaEvasaoRepository
        List<Aluno> todosAlunos = alunoRepository.findAll();
        for (Aluno aluno : todosAlunos) {
            if (aluno.getHistoricoEvasao() != null) {
                for (OcorrenciaEvasao evasao : aluno.getHistoricoEvasao()) {
                    if (evasao.getId().equals(evasaoId)) {
                        evasao.setStatus("RESOLVIDA");
                        evasao.setDataResolucao(LocalDateTime.now());
                        alunoRepository.save(aluno);
                        return;
                    }
                }
            }
        }
        throw new RuntimeException("Evasão não encontrada com ID: " + evasaoId);
    }
}
