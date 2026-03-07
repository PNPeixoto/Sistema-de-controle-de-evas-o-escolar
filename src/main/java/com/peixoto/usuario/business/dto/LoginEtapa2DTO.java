package com.peixoto.usuario.business.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record LoginEtapa2DTO(
        String email,
        @JsonProperty("senhaIndividual") String senhaIndividual
) {}