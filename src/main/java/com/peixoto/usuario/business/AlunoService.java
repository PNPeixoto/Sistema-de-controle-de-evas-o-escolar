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

    @CacheEvict(value = "alunos_escola", key = "#result.escola")
    @Transactional
    public Aluno salvaAluno(AlunoDTO dto) {
        Aluno aluno = alunoConverter.paraEntity(dto);
        vincularRelacionamentos(aluno);
        return alunoRepository.save(aluno);
    }

    // NOVO: Atualizar aluno existente
    @CacheEvict(value = "alunos_escola", allEntries = true)
    @Transactional
    public Aluno atualizarAluno(Long id, AlunoDTO dto) {
        Aluno existente = alunoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado com ID: " + id));

        // Atualiza campos
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

    @CacheEvict(value = "alunos_escola", allEntries = true)
    @Transactional
    public void deletarAluno(Long id) {
        alunoRepository.deleteById(id);
    }

    @Cacheable(value = "alunos_escola", key = "#escola")
    public List<Aluno> buscarTodosPorEscola(String escola) {
        return alunoRepository.findByEscolaIgnoreCase(escola);
    }

    private void vincularRelacionamentos(Aluno aluno) {
        if (aluno.getEnderecos() != null)
            aluno.getEnderecos().forEach(e -> e.setAluno(aluno));
        if (aluno.getFiliacao() != null)
            aluno.getFiliacao().forEach(f -> f.setAluno(aluno));
        if (aluno.getHistoricoEvasao() != null)
            aluno.getHistoricoEvasao().forEach(h -> h.setAluno(aluno));
    }
}
