package com.peixoto.usuario.business.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EnderecoDTO {

    @NotBlank(message = "Rua é obrigatória")
    private String rua;

    @NotNull(message = "Número é obrigatório")
    @Positive(message = "Número deve ser positivo")
    private Long numero;

    @NotBlank(message = "Bairro é obrigatório")
    private String bairro;

    @NotBlank(message = "Cidade é obrigatória")
    private String cidade;

}
