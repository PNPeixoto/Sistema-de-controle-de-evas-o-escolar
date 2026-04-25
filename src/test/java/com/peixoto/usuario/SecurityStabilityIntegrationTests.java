package com.peixoto.usuario;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.peixoto.usuario.infrastructure.entity.Aluno;
import com.peixoto.usuario.infrastructure.entity.Cargo;
import com.peixoto.usuario.infrastructure.entity.Usuario;
import com.peixoto.usuario.infrastructure.repository.AlunoRepository;
import com.peixoto.usuario.infrastructure.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityStabilityIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private AlunoRepository alunoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        alunoRepository.deleteAll();
        usuarioRepository.deleteAll();
    }

    @Test
    void loginEtapa2WithoutEtapa1MustFail() throws Exception {
        criarUsuario("servidor@prefeitura.rj.gov.br", Cargo.ASSISTENTE, "EM TESTE");

        mockMvc.perform(post("/usuario/login/etapa2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "servidor@prefeitura.rj.gov.br",
                                "senhaIndividual", "codigo-seguro"
                        ))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Etapa 1 do login expirou")));
    }

    @Test
    void loginEtapa2AfterEtapa1MustSucceed() throws Exception {
        criarUsuario("servidor@prefeitura.rj.gov.br", Cargo.ASSISTENTE, "EM TESTE");

        MvcResult etapa1 = mockMvc.perform(post("/usuario/login/etapa1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "servidor@prefeitura.rj.gov.br",
                                "senhaEscola", "senha-escola"
                        ))))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("pnp_login_stage1"))
                .andReturn();

        jakarta.servlet.http.Cookie stageCookie = etapa1.getResponse().getCookie("pnp_login_stage1");
        assertThat(stageCookie).isNotNull();

        mockMvc.perform(post("/usuario/login/etapa2")
                        .cookie(stageCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "servidor@prefeitura.rj.gov.br",
                                "senhaIndividual", "codigo-seguro"
                        ))))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("pnp_token"))
                .andExpect(jsonPath("$.status").value("authenticated"))
                .andExpect(jsonPath("$.token").doesNotExist());
    }

    @Test
    void usuarioAutenticadoPorCookiePodeConsultarMe() throws Exception {
        criarUsuario("servidor@prefeitura.rj.gov.br", Cargo.ASSISTENTE, "EM TESTE");

        jakarta.servlet.http.Cookie authCookie = autenticarViaLoginReal();

        mockMvc.perform(get("/usuario/me")
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("XSRF-TOKEN"))
                .andExpect(jsonPath("$.email").value("servidor@prefeitura.rj.gov.br"))
                .andExpect(jsonPath("$.escolaNome").value("EM TESTE"));
    }

    @Test
    void logoutInvalidaSessaoPorCookie() throws Exception {
        criarUsuario("servidor@prefeitura.rj.gov.br", Cargo.ASSISTENTE, "EM TESTE");

        jakarta.servlet.http.Cookie authCookie = autenticarViaLoginReal();

        mockMvc.perform(post("/usuario/logout")
                        .cookie(authCookie))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/usuario/logout")
                        .with(csrf())
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("pnp_token", 0));

        mockMvc.perform(get("/usuario/me")
                        .cookie(authCookie))
                .andExpect(status().isForbidden());
    }

    @Test
    void usuarioComumNaoPodeEscalarPrivilegioNoUpdate() throws Exception {
        Usuario usuario = criarUsuario("assistente@prefeitura.rj.gov.br", Cargo.ASSISTENTE, "EM TESTE");

        mockMvc.perform(put("/usuario")
                        .with(user("assistente@prefeitura.rj.gov.br").roles("ASSISTENTE"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Nome Atualizado",
                                "email", "invasor@prefeitura.rj.gov.br",
                                "senhaEscola", "nova-senha-escola",
                                "senhaIndividual", "novo-codigo",
                                "cargo", "ADMIN",
                                "escolaNome", "OUTRA ESCOLA"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cargo").value("ASSISTENTE"))
                .andExpect(jsonPath("$.escolaNome").value("EM TESTE"));

        Usuario atualizado = usuarioRepository.findById(usuario.getId()).orElseThrow();
        assertThat(atualizado.getCargo()).isEqualTo(Cargo.ASSISTENTE);
        assertThat(atualizado.getEscolaNome()).isEqualTo("EM TESTE");
        assertThat(atualizado.getEmail()).isEqualTo("assistente@prefeitura.rj.gov.br");
        assertThat(atualizado.getNome()).isEqualTo("Nome Atualizado");
    }

    @Test
    void usuarioComumRecebeForbiddenEmConsultaPorEmail() throws Exception {
        criarUsuario("alvo@prefeitura.rj.gov.br", Cargo.ASSISTENTE, "EM TESTE");

        mockMvc.perform(get("/usuario/email")
                        .with(user("assistente@prefeitura.rj.gov.br").roles("ASSISTENTE"))
                        .param("email", "alvo@prefeitura.rj.gov.br"))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/usuario/email")
                        .with(user("assistente@prefeitura.rj.gov.br").roles("ASSISTENTE"))
                        .with(csrf())
                        .param("email", "alvo@prefeitura.rj.gov.br"))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminPodeConsultarEDeletarUsuarioPorEmail() throws Exception {
        criarUsuario("alvo@prefeitura.rj.gov.br", Cargo.ASSISTENTE, "EM TESTE");

        mockMvc.perform(get("/usuario/email")
                        .with(user("admin@prefeitura.rj.gov.br").roles("ADMIN"))
                        .param("email", "alvo@prefeitura.rj.gov.br"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("alvo@prefeitura.rj.gov.br"));

        mockMvc.perform(delete("/usuario/email")
                        .with(user("admin@prefeitura.rj.gov.br").roles("ADMIN"))
                        .with(csrf())
                        .param("email", "alvo@prefeitura.rj.gov.br"))
                .andExpect(status().isOk());

        assertThat(usuarioRepository.findByEmail("alvo@prefeitura.rj.gov.br")).isEmpty();
    }

    @Test
    void semedNaoPodeCriarUsuarioAdmin() throws Exception {
        mockMvc.perform(post("/usuario")
                        .with(user("semed@prefeitura.rj.gov.br").roles("SEMED"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Admin Indevido",
                                "email", "admin-indevido@prefeitura.rj.gov.br",
                                "senhaEscola", "senha-escola",
                                "senhaIndividual", "codigo-seguro",
                                "cargo", "ADMIN",
                                "escolaNome", "SEMED"
                        ))))
                .andExpect(status().isForbidden());

        assertThat(usuarioRepository.findByEmail("admin-indevido@prefeitura.rj.gov.br")).isEmpty();
    }

    @Test
    void semedNaoPodeCriarUsuarioSemed() throws Exception {
        mockMvc.perform(post("/usuario")
                        .with(user("semed@prefeitura.rj.gov.br").roles("SEMED"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Semed Indevido",
                                "email", "semed-indevido@prefeitura.rj.gov.br",
                                "senhaEscola", "senha-escola",
                                "senhaIndividual", "codigo-seguro",
                                "cargo", "SEMED",
                                "escolaNome", "SEMED"
                        ))))
                .andExpect(status().isForbidden());

        assertThat(usuarioRepository.findByEmail("semed-indevido@prefeitura.rj.gov.br")).isEmpty();
    }

    @Test
    void adminPodeCriarUsuarioSemed() throws Exception {
        mockMvc.perform(post("/usuario")
                        .with(user("admin@prefeitura.rj.gov.br").roles("ADMIN"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Semed Autorizado",
                                "email", "semed-autorizado@prefeitura.rj.gov.br",
                                "senhaEscola", "senha-escola",
                                "senhaIndividual", "codigo-seguro",
                                "cargo", "SEMED",
                                "escolaNome", "SEMED"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cargo").value("SEMED"));

        assertThat(usuarioRepository.findByEmail("semed-autorizado@prefeitura.rj.gov.br"))
                .isPresent()
                .get()
                .extracting(Usuario::getCargo)
                .isEqualTo(Cargo.SEMED);
    }

    @Test
    void xForwardedForNaoBurlaRateLimitSemProxyConfiavel() throws Exception {
        criarUsuario("rate-limit@prefeitura.rj.gov.br", Cargo.ASSISTENTE, "EM TESTE");
        String body = objectMapper.writeValueAsString(Map.of(
                "email", "rate-limit@prefeitura.rj.gov.br",
                "senhaEscola", "senha-incorreta"
        ));

        for (int i = 0; i < 5; i++) {
            final int attempt = i;
            mockMvc.perform(post("/usuario/login/etapa1")
                            .with(request -> {
                                request.setRemoteAddr("198.51.100.10");
                                return request;
                            })
                            .header("X-Forwarded-For", "203.0.113." + attempt)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.message").value("Credenciais da escola incorretas."));
        }

        mockMvc.perform(post("/usuario/login/etapa1")
                        .with(request -> {
                            request.setRemoteAddr("198.51.100.10");
                            return request;
                        })
                        .header("X-Forwarded-For", "203.0.113.250")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Muitas tentativas de login. Aguarde 15 minutos."));
    }

    @Test
    void validacaoAninhadaDoAlunoDeveFalhar() throws Exception {
        criarUsuario("escola@prefeitura.rj.gov.br", Cargo.ASSISTENTE, "EM TESTE");

        mockMvc.perform(post("/aluno")
                        .with(user("escola@prefeitura.rj.gov.br").roles("ASSISTENTE"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nomeCompleto": "Aluno Teste",
                                  "escola": "EM TESTE",
                                  "dataNascimento": "2015-01-10T00:00:00",
                                  "sexo": "M",
                                  "cor": "Parda",
                                  "escolaridade": "5º Ano",
                                  "aee": false,
                                  "turno": "Manhã",
                                  "defasagem": false,
                                  "beneficios": "Nenhum",
                                  "enderecos": [
                                    {
                                      "rua": "",
                                      "numero": 10,
                                      "bairro": "Centro",
                                      "cidade": "Macaé"
                                    }
                                  ],
                                  "telefones": [],
                                  "filiacao": [
                                    {
                                      "mae": "Mãe",
                                      "pai": "Pai",
                                      "responsavel": "",
                                      "telefoneResponsavel": "22999999999"
                                    }
                                  ],
                                  "historicoEvasao": []
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("rua")))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("responsavel")));
    }

    @Test
    void mesReferenciaInvalidoDaFicaiMensalDeveFalhar() throws Exception {
        criarUsuario("escola@prefeitura.rj.gov.br", Cargo.ASSISTENTE, "EM TESTE");

        mockMvc.perform(post("/ficai-mensal")
                        .with(user("escola@prefeitura.rj.gov.br").roles("ASSISTENTE"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "mesReferencia": "abril/2026",
                                  "termoAceito": true
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("yyyy-MM")));
    }

    @Test
    void exportacaoCsvDeveNeutralizarFormulaMaliciosa() throws Exception {
        alunoRepository.save(Aluno.builder()
                .nomeCompleto("=2+2")
                .escola("EM TESTE")
                .dataNascimento(LocalDateTime.of(2015, 1, 10, 0, 0))
                .cor("Parda")
                .escolaridade("5º Ano")
                .beneficios("Nenhum")
                .build());

        MvcResult result = mockMvc.perform(get("/semed/exportar")
                        .with(user("semed@prefeitura.rj.gov.br").roles("SEMED")))
                .andExpect(status().isOk())
                .andReturn();

        String csv = new String(result.getResponse().getContentAsByteArray(), StandardCharsets.UTF_8);
        assertThat(csv).contains("\"'=2+2\"");
    }

    @Test
    void endpointMutavelAutenticadoSemCsrfRetornaForbidden() throws Exception {
        mockMvc.perform(post("/aluno")
                        .with(user("escola@prefeitura.rj.gov.br").roles("ASSISTENTE"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(alunoValidoJson()))
                .andExpect(status().isForbidden());
    }

    @Test
    void corsPermiteOriginConfigurada() throws Exception {
        mockMvc.perform(options("/usuario/login/etapa1")
                        .header("Origin", "https://allowed.example.test")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type,x-xsrf-token"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://allowed.example.test"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    void corsBloqueiaOriginNaoConfigurada() throws Exception {
        mockMvc.perform(options("/usuario/login/etapa1")
                        .header("Origin", "https://evil.example.test")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type,x-xsrf-token"))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }

    @Test
    void preflightParaEndpointAutenticadoFunciona() throws Exception {
        mockMvc.perform(options("/usuario/logout")
                        .header("Origin", "https://allowed.example.test")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type,x-xsrf-token"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://allowed.example.test"));
    }

    private Usuario criarUsuario(String email, Cargo cargo, String escolaNome) {
        Usuario usuario = Usuario.builder()
                .nome("Usuário Teste")
                .email(email)
                .senhaEscola(passwordEncoder.encode("senha-escola"))
                .senhaIndividual(passwordEncoder.encode("codigo-seguro"))
                .cargo(cargo)
                .escolaNome(escolaNome)
                .ativo(true)
                .build();

        return usuarioRepository.save(usuario);
    }

    @Test
    void diretorPodeConsultarAlunosDaPropriaEscola() throws Exception {
        assertCargoEscolarPodeConsultarAlunos(Cargo.DIRETOR, "diretor@macae.gov.br");
    }

    @Test
    void assistentePodeConsultarAlunosDaPropriaEscola() throws Exception {
        assertCargoEscolarPodeConsultarAlunos(Cargo.ASSISTENTE, "assistente@macae.gov.br");
    }

    @Test
    void secretariaPodeConsultarAlunosDaPropriaEscola() throws Exception {
        assertCargoEscolarPodeConsultarAlunos(Cargo.SECRETARIA, "secretaria@macae.gov.br");
    }

    @Test
    void semedNaoPodeUsarRotaEscolarDeCadastro() throws Exception {
        mockMvc.perform(post("/aluno")
                        .with(user("semed@macae.gov.br").roles("SEMED"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nomeCompleto": "Aluno Teste",
                                  "escola": "EM TESTE",
                                  "dataNascimento": "2015-01-10T00:00:00",
                                  "sexo": "M",
                                  "cor": "Parda",
                                  "escolaridade": "5º Ano",
                                  "aee": false,
                                  "turno": "Manhã",
                                  "defasagem": false,
                                  "beneficios": "Nenhum",
                                  "enderecos": [
                                    {
                                      "rua": "Rua Teste",
                                      "numero": 10,
                                      "bairro": "Centro",
                                      "cidade": "Macaé"
                                    }
                                  ],
                                  "telefones": [],
                                  "filiacao": [
                                    {
                                      "mae": "Mãe",
                                      "pai": "Pai",
                                      "responsavel": "Responsável",
                                      "telefoneResponsavel": "22999999999"
                                    }
                                  ],
                                  "historicoEvasao": []
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    void escolaANaoPodeLerAlunosDeEscolaB() throws Exception {
        criarUsuario("diretor-a@macae.gov.br", Cargo.DIRETOR, "ESCOLA A");

        Aluno alunoB = new Aluno();
        alunoB.setNomeCompleto("Joao da Escola B");
        alunoB.setEscola("ESCOLA B");
        alunoB.setDataNascimento(LocalDateTime.of(2010, 1, 1, 0, 0));
        alunoRepository.save(alunoB);

        mockMvc.perform(get("/aluno/escola/ESCOLA B")
                        .with(user("diretor-a@macae.gov.br").roles("DIRETOR")))
                .andExpect(status().isForbidden());
    }

    @Test
    void aposCincoFalhasEtapa1EhBloqueado() throws Exception {
        criarUsuario("servidor@prefeitura.rj.gov.br", Cargo.ASSISTENTE, "EM TESTE");

        String payload = objectMapper.writeValueAsString(Map.of(
                "email", "servidor@prefeitura.rj.gov.br",
                "senhaEscola", "senhaErrada"
        ));

        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/usuario/login/etapa1")
                    .with(request -> {
                        request.setRemoteAddr("198.51.100.20");
                        return request;
                    })
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload))
                    .andExpect(status().isUnauthorized());
        }

        mockMvc.perform(post("/usuario/login/etapa1")
                .with(request -> {
                    request.setRemoteAddr("198.51.100.20");
                    return request;
                })
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message")
                        .value(org.hamcrest.Matchers.containsString("Muitas tentativas")));
    }

    private jakarta.servlet.http.Cookie autenticarViaLoginReal() throws Exception {
        MvcResult etapa1 = mockMvc.perform(post("/usuario/login/etapa1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "servidor@prefeitura.rj.gov.br",
                                "senhaEscola", "senha-escola"
                        ))))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("pnp_login_stage1"))
                .andReturn();

        jakarta.servlet.http.Cookie stageCookie = etapa1.getResponse().getCookie("pnp_login_stage1");
        assertThat(stageCookie).isNotNull();

        MvcResult etapa2 = mockMvc.perform(post("/usuario/login/etapa2")
                        .cookie(stageCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "servidor@prefeitura.rj.gov.br",
                                "senhaIndividual", "codigo-seguro"
                        ))))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("pnp_token"))
                .andExpect(jsonPath("$.token").doesNotExist())
                .andReturn();

        jakarta.servlet.http.Cookie authCookie = etapa2.getResponse().getCookie("pnp_token");
        assertThat(authCookie).isNotNull();
        return authCookie;
    }

    private void assertCargoEscolarPodeConsultarAlunos(Cargo cargo, String email) throws Exception {
        criarUsuario(email, cargo, "EM TESTE");

        mockMvc.perform(get("/aluno/escola/EM TESTE")
                        .with(user(email).roles(cargo.name())))
                .andExpect(status().isOk());
    }

    private String alunoValidoJson() {
        return """
                {
                  "nomeCompleto": "Aluno Teste",
                  "escola": "EM TESTE",
                  "dataNascimento": "2015-01-10T00:00:00",
                  "sexo": "M",
                  "cor": "Parda",
                  "escolaridade": "5º Ano",
                  "aee": false,
                  "turno": "Manhã",
                  "defasagem": false,
                  "beneficios": "Nenhum",
                  "enderecos": [
                    {
                      "rua": "Rua Teste",
                      "numero": 10,
                      "bairro": "Centro",
                      "cidade": "Macaé"
                    }
                  ],
                  "telefones": [],
                  "filiacao": [
                    {
                      "mae": "Mãe",
                      "pai": "Pai",
                      "responsavel": "Responsável",
                      "telefoneResponsavel": "22999999999"
                    }
                  ],
                  "historicoEvasao": []
                }
                """;
    }
}
