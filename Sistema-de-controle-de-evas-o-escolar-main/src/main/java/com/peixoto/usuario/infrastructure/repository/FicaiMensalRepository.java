package com.peixoto.usuario.infrastructure.repository;

import com.peixoto.usuario.infrastructure.entity.FicaiMensal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FicaiMensalRepository extends JpaRepository<FicaiMensal, Long> {

    Optional<FicaiMensal> findByEscolaNomeIgnoreCaseAndMesReferencia(String escolaNome, String mesReferencia);

    boolean existsByEscolaNomeIgnoreCaseAndMesReferencia(String escolaNome, String mesReferencia);
}
