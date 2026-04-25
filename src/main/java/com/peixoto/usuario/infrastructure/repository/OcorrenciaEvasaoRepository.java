package com.peixoto.usuario.infrastructure.repository;

import com.peixoto.usuario.infrastructure.entity.OcorrenciaEvasao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OcorrenciaEvasaoRepository extends JpaRepository<OcorrenciaEvasao, Long> {

    @Query("""
        SELECT COUNT(e) > 0 FROM OcorrenciaEvasao e
        WHERE LOWER(e.aluno.escola) = LOWER(:escola)
        AND LOWER(e.mesFaltas) LIKE LOWER(CONCAT('%', :nomeMes, '%'))
    """)
    boolean existeEvasaoNoMes(@Param("escola") String escola, @Param("nomeMes") String nomeMes);
}
