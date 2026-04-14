package com.peixoto.usuario.infrastructure.security;

import org.springframework.stereotype.Component;

/**
 * Sanitizador de inputs contra XSS.
 * Remove tags HTML e caracteres perigosos de strings recebidas do frontend.
 */
@Component
public class InputSanitizer {

    /**
     * Remove tags HTML e scripts de uma string.
     * Uso: sanitizer.clean(dto.getNomeCompleto())
     */
    public String clean(String input) {
        if (input == null) return null;

        return input
                .replaceAll("<script[^>]*>.*?</script>", "")  // Remove <script>...</script>
                .replaceAll("<[^>]+>", "")                      // Remove todas as tags HTML
                .replaceAll("javascript:", "")                  // Remove javascript:
                .replaceAll("on\\w+\\s*=", "")                  // Remove event handlers (onclick=, etc.)
                .replaceAll("&lt;", "<")                        // Decodifica entidades perigosas
                .replaceAll("&gt;", ">")
                .trim();
    }

    /**
     * Sanitiza mantendo apenas alfanuméricos, espaços e caracteres comuns.
     * Mais restritivo — para campos como nome, escola, bairro.
     */
    public String cleanStrict(String input) {
        if (input == null) return null;
        // Permite letras (com acentos), números, espaços, pontos, hífens, vírgulas
        return input.replaceAll("[^\\p{L}\\p{N}\\s.,\\-/()°ºª]", "").trim();
    }
}
