package com.peixoto.usuario.business;

import com.peixoto.usuario.business.converter.AlunoConverter;
import com.peixoto.usuario.business.dto.AlunoDTO;
import com.peixoto.usuario.infrastructure.entity.Aluno;
import com.peixoto.usuario.infrastructure.repository.AlunoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlunoService {

    private final AlunoRepository alunoRepository;
    private final AlunoConverter alunoConverter;

    @Transactional
    public Aluno salvaAluno(AlunoDTO dto) {
        Aluno aluno = alunoConverter.paraEntity(dto);

        if (aluno.getEnderecos() != null) {
            aluno.getEnderecos().forEach(endereco -> endereco.setAluno(aluno));
        }

        if (aluno.getTelefones() != null) {
            aluno.getTelefones().forEach(telefone -> telefone.setAluno(aluno));
        }

        if (aluno.getFiliacao() != null) {
            aluno.getFiliacao().forEach(filiacao -> filiacao.setAluno(aluno));
        }

        if (aluno.getHistoricoEvasao() != null) {
            aluno.getHistoricoEvasao().forEach(evasao -> evasao.setAluno(aluno));
        }
        // Salva tudo em cascata (Aluno -> Endereços -> Ocorrências -> Ações)

            return alunoRepository.save(aluno);
    }

    public List<Aluno> buscarTodosPorEscola(String escola) {
        return alunoRepository.findByEscolaIgnoreCase(escola);
    }
}