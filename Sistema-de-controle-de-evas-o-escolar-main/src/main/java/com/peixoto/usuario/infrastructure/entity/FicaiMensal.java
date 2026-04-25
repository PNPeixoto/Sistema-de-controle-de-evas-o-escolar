package com.peixoto.usuario.infrastructure.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

/**
 * Registra a declaração mensal de "Não possui FICAI neste mês".
 * Se a escola não registrar nenhuma evasão até o final do mês,
 * o diretor precisa assinar esta declaração.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "ficai_mensal", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"escola_nome", "mes_referencia"})
})
@Builder
public class FicaiMensal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "escola_nome", nullable = false)
    private String escolaNome;

    /** Formato: "2026-04" (ano-mês) */
    @Column(name = "mes_referencia", nullable = false)
    private String mesReferencia;

    /** true = escola declarou que não possui FICAI neste mês */
    @Column(name = "sem_ficai", nullable = false)
    @Builder.Default
    private Boolean semFicai = false;

    /** Data em que o diretor assinou a declaração */
    @Column(name = "data_assinatura")
    private LocalDate dataAssinatura;

    /** Nome do diretor que assinou */
    @Column(name = "assinado_por")
    private String assinadoPor;

    /** true = o termo de consentimento foi aceito */
    @Column(name = "termo_aceito", nullable = false)
    @Builder.Default
    private Boolean termoAceito = false;
}
