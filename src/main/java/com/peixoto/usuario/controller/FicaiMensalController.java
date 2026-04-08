package com.peixoto.usuario.controller;

import com.peixoto.usuario.business.FicaiMensalService;
import com.peixoto.usuario.business.dto.FicaiMensalDTO;
import com.peixoto.usuario.infrastructure.entity.FicaiMensal;
import com.peixoto.usuario.infrastructure.entity.Usuario;
import com.peixoto.usuario.infrastructure.repository.UsuarioRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ficai-mensal")
@RequiredArgsConstructor
public class FicaiMensalController {

    private final FicaiMensalService ficaiMensalService;
    private final UsuarioRepository usuarioRepository;

    /**
     * POST /ficai-mensal
     * Botão "Não possui FICAI este mês"
     * Cria a declaração com termo de consentimento
     */
    @PostMapping
    public ResponseEntity<FicaiMensal> registrarSemFicai(@Valid @RequestBody FicaiMensalDTO dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // SEMED não pode declarar por uma escola
        if (isSemed(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Usuario usuario = usuarioRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        FicaiMensal registro = ficaiMensalService.registrarSemFicai(
                usuario.getEscolaNome(), usuario.getNome(), dto);

        return ResponseEntity.ok(registro);
    }

    /**
     * GET /ficai-mensal?mes=2026-04
     * Consulta se a escola já tem registro naquele mês
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> consultarMes(@RequestParam("mes") String mesReferencia) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Usuario usuario = usuarioRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        FicaiMensal registro = ficaiMensalService.consultarMes(usuario.getEscolaNome(), mesReferencia);

        if (registro == null) {
            return ResponseEntity.ok(Map.of(
                    "registrado", false,
                    "mesReferencia", mesReferencia
            ));
        }

        return ResponseEntity.ok(Map.of(
                "registrado", true,
                "semFicai", registro.getSemFicai(),
                "dataAssinatura", registro.getDataAssinatura().toString(),
                "assinadoPor", registro.getAssinadoPor(),
                "mesReferencia", mesReferencia
        ));
    }

    private boolean isSemed(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(role -> role.getAuthority().toUpperCase().contains("SEMED") ||
                        role.getAuthority().toUpperCase().contains("ADMIN"));
    }
}
