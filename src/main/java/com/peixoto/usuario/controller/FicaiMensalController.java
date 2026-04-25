package com.peixoto.usuario.controller;

import com.peixoto.usuario.business.FicaiMensalService;
import com.peixoto.usuario.business.dto.FicaiMensalDTO;
import com.peixoto.usuario.infrastructure.entity.FicaiMensal;
import com.peixoto.usuario.infrastructure.entity.Usuario;
import com.peixoto.usuario.infrastructure.security.AuthUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ficai-mensal")
@RequiredArgsConstructor
public class FicaiMensalController {

    private final FicaiMensalService ficaiMensalService;
    private final AuthUtils authUtils;

    @PreAuthorize("hasAnyRole('DIRETOR','ASSISTENTE','SECRETARIA')")
    @PostMapping
    public ResponseEntity<FicaiMensal> registrarSemFicai(@Valid @RequestBody FicaiMensalDTO dto) {
        Usuario usuario = authUtils.getUsuarioLogado();
        FicaiMensal registro = ficaiMensalService.registrarSemFicai(
                usuario.getEscolaNome(), usuario.getNome(), dto);
        return ResponseEntity.ok(registro);
    }

    @PreAuthorize("hasAnyRole('DIRETOR','ASSISTENTE','SECRETARIA','SEMED','ADMIN')")
    @GetMapping
    public ResponseEntity<Map<String, Object>> consultarMes(@RequestParam("mes") String mesReferencia) {
        Usuario usuario = authUtils.getUsuarioLogado();
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
}
