package com.peixoto.usuario.business.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OcorrenciaEvasaoDTO {

    private String mesFaltas;
    private Integer quantidadeFaltas;
    private String motivoAfastamento;
    private String encaminhamentosLaudos;
    private String conclusao;

    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate dataAssinaturaDiretor;

    private String assinaturaDiretor;

    private List<AcaoDetalheDTO> acoes;
}