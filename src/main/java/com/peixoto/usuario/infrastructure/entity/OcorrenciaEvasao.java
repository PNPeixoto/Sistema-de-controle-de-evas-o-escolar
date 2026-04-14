package com.peixoto.usuario.infrastructure.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
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

    @Column(name = "reincidente")
    private Boolean reincidente;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "evasao_providencias", joinColumns = @JoinColumn(name = "ocorrencia_evasao_id"))
    @Column(name = "providencia")
    private List<String> providenciasAdotadas;

    @Column(name = "outras_providencias")
    private String outrasProvidencias;


    private LocalDate dataAssinaturaDiretor;

    private String assinaturaDiretor;

    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "ABERTA";

    @Column(name = "data_resolucao")
    private LocalDateTime dataResolucao;

    @Column(name = "criado_em", updatable = false)
    @Builder.Default
    private LocalDateTime criadoEm = LocalDateTime.now();

    // ------------------------------------

    @OneToMany(mappedBy = "ocorrencia", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AcaoTomada> acoes = new ArrayList<>();

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "aluno_id")
    private Aluno aluno;

}