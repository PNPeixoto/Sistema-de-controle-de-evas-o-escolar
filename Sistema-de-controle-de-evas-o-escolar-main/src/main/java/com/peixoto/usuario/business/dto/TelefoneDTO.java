package com.peixoto.usuario.business.dto;

import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TelefoneDTO {

    @Pattern(regexp = "\\d{8,10}", message = "Número de telefone inválido")
    private String numero;

    @Pattern(regexp = "\\d{2,3}", message = "DDD inválido")
    private String ddd;
}
