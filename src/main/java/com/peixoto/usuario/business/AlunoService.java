package com.peixoto.usuario.business;

import com.peixoto.usuario.business.converter.AlunoConverter;
import com.peixoto.usuario.business.dto.AlunoDTO;
import com.peixoto.usuario.infrastructure.entity.Aluno;
import com.peixoto.usuario.infrastructure.repository.AlunoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlunoService {

    private final AlunoRepository alunoRepository;
    private final AlunoConverter alunoConverter;

    // Destrói o cache da escola específica quando um aluno novo é salvo
    @CacheEvict(value = "alunos_escola", key = "#result.escola")
    @Transactional
    public Aluno salvaAluno(AlunoDTO dto) {
        Aluno aluno = alunoConverter.paraEntity(dto);

        if (aluno.getEnderecos() != null) {
            aluno.getEnderecos().forEach(endereco -> endereco.setAluno(aluno));
        }

        if (aluno.getFiliacao() != null) {
            aluno.getFiliacao().forEach(filiacao -> filiacao.setAluno(aluno));
        }

        if (aluno.getHistoricoEvasao() != null) {
            aluno.getHistoricoEvasao().forEach(evasao -> evasao.setAluno(aluno));
        }

        return alunoRepository.save(aluno);
    }

    // Destrói o cache geral de alunos ao deletar um registro
    @CacheEvict(value = "alunos_escola", allEntries = true)
    @Transactional
    public void deletarAluno(Long id) {
        alunoRepository.deleteById(id);
    }

    @CacheEvict(value = "alunos_escola", allEntries = true)
    @Transactional
    public Aluno atualizarAluno(Long id, AlunoDTO dto) {
        Aluno existente = alunoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado: " + id));

        existente.setNomeCompleto(dto.getNomeCompleto());
        existente.setEscola(dto.getEscola());
        existente.setDataNascimento(dto.getDataNascimento());
        existente.setSexo(dto.getSexo());
        existente.setCor(dto.getCor());
        existente.setEscolaridade(dto.getEscolaridade());
        existente.setAee(dto.getAee());
        existente.setTurno(dto.getTurno());
        existente.setDefasagem(dto.getDefasagem());
        existente.setBeneficios(dto.getBeneficios());

        return alunoRepository.save(existente);
    }

    // A MÁGICA ACONTECE AQUI: Guarda o retorno na memória RAM do servidor
    @Cacheable(value = "alunos_escola", key = "#escola")
    public List<Aluno> buscarTodosPorEscola(String escola) {
        return alunoRepository.findByEscolaIgnoreCase(escola);
    }
}