package com.peixoto.usuario.business.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;
import java.time.LocalDateTime;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AlunoDTO {

    //@NotBlank ->

    @NotBlank(message = "Escola é obrigatŕia")
    private String escola;

    @NotBlank(message = "Nome é obrigatório")
    private String nome;

    @NotNull(message = "A data de nascimento é obrigatória")
    @JsonFormat(pattern = "dd/MM/yyyy") //
    private LocalDateTime dataNascimento;

    private String cor;

    private List<FiliacaoDTO> filiacao;
    private List<EnderecoDTO> enderecos;
    private List<TelefoneDTO> telefones;

    private String escolaridade;
    private Boolean aee;
    private String turno;
    private Boolean defasagem;
    private String beneficios;

    private List<OcorrenciaEvasaoDTO> historicoEvasao;

}
