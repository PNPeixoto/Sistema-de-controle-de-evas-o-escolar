package com.peixoto.usuario.infrastructure.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class Filiacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String mae;
    private String pai;
    private String responsavel;

    @ManyToOne
    @JoinColumn(name = "aluno_id")
    private Aluno aluno;
}