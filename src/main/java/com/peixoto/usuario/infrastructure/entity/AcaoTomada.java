package com.peixoto.usuario.infrastructure.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "acao_tomada") // <-- ISSO QUE CRIA A TABELA NO BANCO!
public class AcaoTomada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate dataAcao;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "ocorrencia_id")
    private OcorrenciaEvasao ocorrencia;
}