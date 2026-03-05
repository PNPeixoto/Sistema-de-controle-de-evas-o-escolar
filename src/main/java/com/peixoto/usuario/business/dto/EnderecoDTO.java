package com.peixoto.usuario.business.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EnderecoDTO {


    private String rua;
    private Long numero;
    private String bairro;
    private String cidade;

}
