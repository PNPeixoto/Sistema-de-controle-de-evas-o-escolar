package com.peixoto.usuario.business.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FicaiMensalDTO {

    /** Formato: "2026-04" */
    @NotBlank(message = "O mês de referência é obrigatório")
    private String mesReferencia;

    /** O usuário precisa aceitar o termo de consentimento */
    @NotNull(message = "O termo de consentimento precisa ser aceito")
    private Boolean termoAceito;
}
