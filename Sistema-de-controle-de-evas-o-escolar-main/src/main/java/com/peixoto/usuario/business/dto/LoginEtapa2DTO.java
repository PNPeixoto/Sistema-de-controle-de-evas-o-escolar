package com.peixoto.usuario.business.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginEtapa2DTO(
        @NotBlank(message = "O email é obrigatório")
        @Email(message = "Email inválido")
        String email,

        @NotBlank(message = "O código de acesso é obrigatório")
        @JsonProperty("senhaIndividual")
        String senhaIndividual
) {}
