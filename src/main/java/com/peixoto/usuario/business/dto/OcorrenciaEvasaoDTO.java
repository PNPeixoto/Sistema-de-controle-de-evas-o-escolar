package com.peixoto.usuario.business.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OcorrenciaEvasaoDTO {

    @NotBlank(message = "O mês das faltas é obrigatório")
    private String mesFaltas;

    @NotNull(message = "A quantidade de faltas é obrigatória")
    @Min(value = 1, message = "A quantidade de faltas deve ser pelo menos 1")
    @Max(value = 365, message = "A quantidade de faltas não pode exceder 365")
    private Integer quantidadeFaltas;

    private Boolean reincidente;

    private List<String> providenciasAdotadas;
    private String outrasProvidencias;
    private String encaminhamentosLaudos;
    private List<AcaoDetalheDTO> acoes;

    @NotBlank(message = "O motivo do afastamento é obrigatório")
    private String motivoAfastamento;

    private String conclusao;

    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate dataAssinaturaDiretor;
    private String assinaturaDiretor;
}
