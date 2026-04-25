package com.peixoto.usuario.controller;

import com.peixoto.usuario.business.UsuarioService;
import com.peixoto.usuario.infrastructure.security.JwtRequestFilter;
import com.peixoto.usuario.infrastructure.security.JwtUtil;
import com.peixoto.usuario.infrastructure.security.TokenBlacklistService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UsuarioController.class)
@Import({JwtUtil.class, JwtRequestFilter.class})
class UsuarioControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private UsuarioService usuarioService;
    @MockBean private TokenBlacklistService tokenBlacklistService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void buscaUsuarioPorEmail_adminAutenticado_retorna200() throws Exception {
        mockMvc.perform(get("/usuario/email?email=teste@escola.com"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ESCOLA")
    void buscaUsuarioPorEmail_escolaAutenticada_retorna403() throws Exception {
        mockMvc.perform(get("/usuario/email?email=teste@escola.com"))
                .andExpect(status().isForbidden());
    }
}