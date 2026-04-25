package com.peixoto.usuario.infrastructure.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor
@Entity @Table(name = "alunos") @Builder
public class Aluno {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false) private String nomeCompleto;
    @Column(nullable = false) private String escola;

    @Column(name = "data_nascimento") private LocalDateTime dataNascimento;
    @Column(name = "sexo", length = 1) private String sexo;

    private String cor, escolaridade, turno, beneficios;
    private Boolean aee, defasagem;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id") private List<Endereco> enderecos;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id") private List<Filiacao> filiacao;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id") private List<OcorrenciaEvasao> historicoEvasao;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id") private List<Telefone> telefones;
}