package com.peixoto.usuario.business;

import com.peixoto.usuario.business.dto.OcorrenciaEvasaoDTO;
import com.peixoto.usuario.infrastructure.entity.Aluno;
import com.peixoto.usuario.infrastructure.entity.OcorrenciaEvasao;
import com.peixoto.usuario.infrastructure.repository.AlunoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EvasaoService {

    private final AlunoRepository alunoRepository;

    @Transactional
    public OcorrenciaEvasao registrarEvasao(Long alunoId, OcorrenciaEvasaoDTO dto) {

        // 1. Busca o aluno dono daquele ID

        Aluno aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado com o ID: " + alunoId));

        // 2. Mapeia o seu DTO para a Entidade
        OcorrenciaEvasao ocorrencia = new OcorrenciaEvasao();
        ocorrencia.setMotivoAfastamento(dto.getMotivoAfastamento());
        ocorrencia.setConclusao(dto.getConclusao());

        // Se quiser mapear outros campos do DTO depois, é só adicionar aqui!

        // 3. Amarra a Ocorrência ao Aluno
        ocorrencia.setAluno(aluno);

        // 4. Adiciona na lista do Aluno e salva (o CascadeType.ALL faz a mágica)
        aluno.getHistoricoEvasao().add(ocorrencia);
        alunoRepository.save(aluno);

        return ocorrencia;
    }
}