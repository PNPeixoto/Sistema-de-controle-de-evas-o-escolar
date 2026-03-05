package com.peixoto.usuario.infrastructure.repository;

import com.peixoto.usuario.infrastructure.entity.Aluno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlunoRepository extends JpaRepository<Aluno, Long> {
    List<Aluno> findByEscolaIgnoreCase(String escola);
}