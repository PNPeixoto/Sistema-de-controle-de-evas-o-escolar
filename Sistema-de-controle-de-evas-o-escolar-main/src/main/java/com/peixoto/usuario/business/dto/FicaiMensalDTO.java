package com.peixoto.usuario.business.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FicaiMensalDTO {

    /** Formato: "2026-04" */
    @NotBlank(message = "O mês de referência é obrigatório")
    @Pattern(regexp = "\\d{4}-\\d{2}", message = "O mês de referência deve estar no formato yyyy-MM")
    private String mesReferencia;

    /** O usuário precisa aceitar o termo de consentimento */
    @NotNull(message = "O termo de consentimento precisa ser aceito")
    private Boolean termoAceito;
}
