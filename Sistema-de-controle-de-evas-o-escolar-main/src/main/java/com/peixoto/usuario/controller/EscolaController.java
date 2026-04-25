package com.peixoto.usuario.controller;

import com.peixoto.usuario.infrastructure.entity.Escola;
import com.peixoto.usuario.infrastructure.repository.EscolaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import com.peixoto.usuario.infrastructure.exceptions.ResourceNotFoundException;

@RestController
@RequestMapping("/escolas")
@RequiredArgsConstructor
public class EscolaController {

    private final EscolaRepository escolaRepository;

    @GetMapping
    public ResponseEntity<List<Escola>> listarTodas() {
        return ResponseEntity.ok(escolaRepository.findAll());
    }
}