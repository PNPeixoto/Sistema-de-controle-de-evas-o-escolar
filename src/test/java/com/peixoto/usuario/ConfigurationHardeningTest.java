package com.peixoto.usuario;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class ConfigurationHardeningTest {

    @Test
    void ddlAutoNaoFicaUpdateNaConfiguracaoUniversalEProdValidaSchema() throws Exception {
        String application = readResource("application.properties");
        String prod = readResource("application-prod.properties");

        assertThat(application).doesNotContain("spring.jpa.hibernate.ddl-auto=update");
        assertThat(prod).contains("spring.jpa.hibernate.ddl-auto=validate");
    }

    @Test
    void forwardedHeadersNaoSaoConfiadosPorPadrao() throws Exception {
        String application = readResource("application.properties");

        assertThat(application).contains("app.security.trust-forwarded-headers=false");
    }

    private String readResource(String path) throws Exception {
        ClassPathResource resource = new ClassPathResource(path);
        return new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
    }
}
