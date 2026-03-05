package com.peixoto.usuario.business.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class FiliacaoDTO {

    private String mae;
    private String pai;

    @NotBlank(message = "Nome do responsável é obrigatório")
    private String responsavel;

}
