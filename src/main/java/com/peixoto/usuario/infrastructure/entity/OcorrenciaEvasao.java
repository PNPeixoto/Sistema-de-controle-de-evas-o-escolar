package com.peixoto.usuario.infrastructure.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ocorrencias_evasao")
public class OcorrenciaEvasao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String mesFaltas;

    private Integer quantidadeFaltas;


    private String motivoAfastamento;


    @Column(columnDefinition = "TEXT")
    private String encaminhamentosLaudos;

    @Column(columnDefinition = "TEXT")
    private String conclusao;

    private LocalDate dataAssinaturaDiretor;

    private String assinaturaDiretor;

    // ------------------------------------

    @OneToMany(mappedBy = "ocorrencia", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AcaoTomada> acoes = new ArrayList<>();

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "aluno_id")
    private Aluno aluno;

}