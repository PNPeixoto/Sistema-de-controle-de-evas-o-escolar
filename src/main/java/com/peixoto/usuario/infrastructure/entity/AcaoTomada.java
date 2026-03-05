package com.peixoto.usuario.infrastructure.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "acoes_tomadas")
public class AcaoTomada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate dataAcao;
    private String descricao;

    @ManyToOne
    @JoinColumn(name = "ocorrencia_id")
    private OcorrenciaEvasao ocorrencia;
}