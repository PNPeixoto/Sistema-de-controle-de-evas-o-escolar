package com.peixoto.usuario.business.dto;

public record LoginResponseDTO(
        String nomeEscola,
        boolean aguardandoCodigo,
        String tokenProvisorio // Um token curto para manter a sessão entre os passos
) {}