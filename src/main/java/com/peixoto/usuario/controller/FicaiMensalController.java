package com.peixoto.usuario.controller;

import com.peixoto.usuario.business.FicaiMensalService;
import com.peixoto.usuario.business.dto.FicaiMensalDTO;
import com.peixoto.usuario.infrastructure.entity.FicaiMensal;
import com.peixoto.usuario.infrastructure.entity.Usuario;
import com.peixoto.usuario.infrastructure.security.AuthUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ficai-mensal")
@RequiredArgsConstructor
public class FicaiMensalController {

    private final FicaiMensalService ficaiMensalService;
    private final AuthUtils authUtils;

    @PostMapping
    public ResponseEntity<FicaiMensal> registrarSemFicai(@Valid @RequestBody FicaiMensalDTO dto) {
        if (authUtils.isSemed()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Usuario usuario = authUtils.getUsuarioLogado();

        FicaiMensal registro = ficaiMensalService.registrarSemFicai(
                usuario.getEscolaNome(), usuario.getNome(), dto);

        return ResponseEntity.ok(registro);
    }

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
