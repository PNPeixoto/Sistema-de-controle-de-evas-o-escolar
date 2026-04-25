package com.peixoto.usuario.infrastructure.security;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class InputSanitizerTest {

    private final InputSanitizer sanitizer = new InputSanitizer();

    @Test
    void cleanRemoveScriptMesmoQuandoHtmlEstaCodificado() {
        String result = sanitizer.clean("&lt;script&gt;alert(1)&lt;/script&gt;Aluno");

        assertThat(result).isEqualTo("Aluno");
        assertThat(result).doesNotContain("<", ">", "script", "alert");
    }

    @Test
    void cleanRemoveJavascriptProtocolEEventHandlersComMaiusculas() {
        String result = sanitizer.clean("<img SRC=x OnError=alert(1)>javascript:Aluno");

        assertThat(result).isEqualTo("Aluno");
        assertThat(result).doesNotContain("javascript:", "OnError", "<img");
    }

    @Test
    void cleanStrictMantemTextoEscolarBasicoERemoveMarkup() {
        String result = sanitizer.cleanStrict("EM Centro <b onclick=alert(1)>Nº 10</b> @@@");

        assertThat(result).isEqualTo("EM Centro Nº 10");
    }
}
