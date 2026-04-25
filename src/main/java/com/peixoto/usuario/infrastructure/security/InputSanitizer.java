package com.peixoto.usuario.infrastructure.security;

import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

/**
 * Sanitizador de inputs contra XSS.
 * Remove tags HTML e caracteres perigosos de strings recebidas do frontend.
 */
@Component
public class InputSanitizer {

    private static final Pattern SCRIPT_TAG = Pattern.compile("<script[^>]*>.*?</script>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final Pattern HTML_TAG = Pattern.compile("<[^>]+>", Pattern.CASE_INSENSITIVE);
    private static final Pattern JAVASCRIPT_PROTOCOL = Pattern.compile("javascript\\s*:", Pattern.CASE_INSENSITIVE);
    private static final Pattern EVENT_HANDLER = Pattern.compile("on\\w+\\s*=", Pattern.CASE_INSENSITIVE);
    private static final Pattern STRICT_ALLOWED = Pattern.compile("[^\\p{L}\\p{N}\\s.,\\-/()°ºª]");

    public String clean(String input) {
        if (input == null) return null;

        String sanitized = decodeCommonHtmlEntities(input);
        sanitized = SCRIPT_TAG.matcher(sanitized).replaceAll("");
        sanitized = JAVASCRIPT_PROTOCOL.matcher(sanitized).replaceAll("");
        sanitized = EVENT_HANDLER.matcher(sanitized).replaceAll("");
        sanitized = HTML_TAG.matcher(sanitized).replaceAll("");
        return sanitized.trim();
    }

    public String cleanStrict(String input) {
        if (input == null) return null;
        return STRICT_ALLOWED.matcher(clean(input)).replaceAll("").trim();
    }

    private String decodeCommonHtmlEntities(String input) {
        String decoded = input;
        for (int i = 0; i < 2; i++) {
            String next = decoded
                    .replace("&lt;", "<")
                    .replace("&LT;", "<")
                    .replace("&gt;", ">")
                    .replace("&GT;", ">")
                    .replace("&quot;", "\"")
                    .replace("&#34;", "\"")
                    .replace("&#x22;", "\"")
                    .replace("&#39;", "'")
                    .replace("&#x27;", "'")
                    .replace("&amp;", "&")
                    .replace("&AMP;", "&");
            if (next.equals(decoded)) {
                break;
            }
            decoded = next;
        }
        return decoded;
    }
}
