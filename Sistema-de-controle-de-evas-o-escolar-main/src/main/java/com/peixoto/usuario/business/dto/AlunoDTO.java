package com.peixoto.usuario.business.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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
    private String nomeCompleto;

    @NotNull(message = "A data de nascimento é obrigatória")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") //
    private LocalDateTime dataNascimento;

    private String cor;

    @Pattern(regexp = "M|F", message = "Sexo deve ser 'M' ou 'F'")
    private String sexo;

    @Valid
    private List<FiliacaoDTO> filiacao;

    @Valid
    private List<EnderecoDTO> enderecos;

    @Valid
    private List<TelefoneDTO> telefones;

    private String escolaridade;
    private Boolean aee;
    private String turno;
    private Boolean defasagem;
    private String beneficios;

    @Valid
    private List<OcorrenciaEvasaoDTO> historicoEvasao;

}
