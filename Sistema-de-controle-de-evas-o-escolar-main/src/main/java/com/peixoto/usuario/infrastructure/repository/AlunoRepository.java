package com.peixoto.usuario.infrastructure.repository;

import com.peixoto.usuario.infrastructure.entity.Aluno;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AlunoRepository extends JpaRepository<Aluno, Long> {
    List<Aluno> findByEscolaIgnoreCase(String escola);

    @Query("SELECT a FROM Aluno a LEFT JOIN FETCH a.enderecos WHERE a.id = :id")
    Optional<Aluno> findByIdWithEnderecos(@Param("id") Long id);

    @Query("SELECT a FROM Aluno a LEFT JOIN FETCH a.historicoEvasao WHERE a.id = :id")
    Optional<Aluno> findByIdWithEvasoes(@Param("id") Long id);

    @Query("SELECT a FROM Aluno a LEFT JOIN FETCH a.filiacao WHERE a.id = :id")
    Optional<Aluno> findByIdWithFiliacao(@Param("id") Long id);

    @Query("SELECT a FROM Aluno a LEFT JOIN FETCH a.telefones WHERE a.id = :id")
    Optional<Aluno> findByIdWithTelefones(@Param("id") Long id);

    @Query("SELECT a FROM Aluno a LEFT JOIN FETCH a.enderecos " +
            "LEFT JOIN FETCH a.filiacao LEFT JOIN FETCH a.telefones " +
            "LEFT JOIN FETCH a.historicoEvasao WHERE a.id = :id")
    Optional<Aluno> findByIdWithAll(@Param("id") Long id);

    @Query("SELECT a FROM Aluno a ORDER BY a.escola, a.nomeCompleto")
    List<Aluno> findAllOrdered();

    Page<Aluno> findAll(Pageable pageable);
}