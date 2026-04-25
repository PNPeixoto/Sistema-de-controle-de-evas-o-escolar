package com.peixoto.usuario.business.dto;

import com.peixoto.usuario.infrastructure.entity.Cargo;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UsuarioDTO {

    private Long id;

    @NotBlank(message = "O nome é obrigatório")
    private String nome;

    @Email(message = "Email inválido")
    @NotBlank(message = "O email da escola é obrigatório")
    private String email;

    @NotBlank(message = "A senha da escola é obrigatória")
    private String senhaEscola;

    @NotBlank(message = "A senha individual é obrigatória")
    private String senhaIndividual;

    @Enumerated(EnumType.STRING)
    private Cargo cargo;

    private String escolaNome;
}

