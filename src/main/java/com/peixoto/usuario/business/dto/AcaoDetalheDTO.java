package com.peixoto.usuario.business.dto;


import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AcaoDetalheDTO {

    @NotNull(message = "A data da ação é obrigatória")
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate dataAcao;

    @NotBlank(message = "A ação é obrigatória")
    private String acaoTomada;

}
