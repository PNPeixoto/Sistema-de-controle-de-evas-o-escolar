package com.peixoto.usuario.controller;

import com.peixoto.usuario.business.UsuarioService;
import com.peixoto.usuario.business.dto.LoginEtapa1DTO;
import com.peixoto.usuario.business.dto.LoginEtapa2DTO;
import com.peixoto.usuario.business.dto.UsuarioDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/usuario")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping
    public ResponseEntity<UsuarioDTO> salvaUsuario(@RequestBody UsuarioDTO usuarioDTO) {
        return ResponseEntity.ok(usuarioService.salvaUsuario(usuarioDTO));
    }

    // ==========================================
    // NOVAS ROTAS DE LOGIN EM 2 ETAPAS
    // ==========================================

    @PostMapping("/login/etapa1")
    public ResponseEntity<Map<String, String>> loginEtapa1(@RequestBody LoginEtapa1DTO dto) {
        String nomeEscola = usuarioService.validarEscola(dto);
        // Retorna um JSON simples: {"escolaNome": "C.M. Machado de Assis"}
        return ResponseEntity.ok(Map.of("escolaNome", nomeEscola));
    }

    @PostMapping("/login/etapa2")
    public ResponseEntity<String> loginEtapa2(@RequestBody LoginEtapa2DTO dto) {
        System.out.println("E-mail recebido: " + dto.email());
        System.out.println("Senha recebida: " + dto.senhaIndividual()); // SE ISSO IMPRIMIR NULL, O REACT MANDOU ERRADO!
        // Retorna o Token JWT Final (Bearer ...)
        return ResponseEntity.ok(usuarioService.validarsenhaIndividual(dto));
    }

    // ==========================================
    // ROTAS PROTEGIDAS
    // ==========================================

    @GetMapping("/email")
    public ResponseEntity<UsuarioDTO> buscaUsuarioPorEmail(@RequestParam("email") String email) {
        return ResponseEntity.ok(usuarioService.buscarUsuarioPorEmail(email));
    }

    @DeleteMapping("/email")
    public ResponseEntity<Void> deletaUsuarioPorEmail(@RequestParam("email") String email) {
        usuarioService.deletaUsuarioPorEmail(email);
        return ResponseEntity.ok().build();
    }

    @PutMapping
    public ResponseEntity<UsuarioDTO> atualizDadoUsuario(@RequestBody UsuarioDTO dto,
                                                         @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(usuarioService.atualizaDadosUsuario(token, dto));
    }
}