package com.peixoto.usuario.infrastructure.repository;

import com.peixoto.usuario.infrastructure.entity.Bairro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BairroRepository extends JpaRepository<Bairro, Long> {

    List<Bairro> findAllByOrderByNomeAsc();
    Optional<Bairro> findByNomeIgnoreCase(String nome);
}