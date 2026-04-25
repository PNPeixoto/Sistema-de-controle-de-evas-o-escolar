package com.peixoto.usuario.infrastructure.repository;

import com.peixoto.usuario.infrastructure.entity.OcorrenciaEvasao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OcorrenciaEvasaoRepository extends JpaRepository<OcorrenciaEvasao, Long> {
}