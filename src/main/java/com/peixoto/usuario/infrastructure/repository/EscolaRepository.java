package com.peixoto.usuario.infrastructure.repository;

import com.peixoto.usuario.infrastructure.entity.Escola;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EscolaRepository extends JpaRepository<Escola, Long> {
}