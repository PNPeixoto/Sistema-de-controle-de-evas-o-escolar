package com.peixoto.usuario.controller;

import com.peixoto.usuario.infrastructure.entity.Bairro;
import com.peixoto.usuario.infrastructure.repository.BairroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/bairros")
@RequiredArgsConstructor
public class BairroController {

    private final BairroRepository bairroRepository;

    @GetMapping
    public ResponseEntity<List<Bairro>> listarBairros() {
        // Retorna a lista já ordenada em ordem alfabética direto do banco!
        List<Bairro> listaBairros = bairroRepository.findAllByOrderByNomeAsc();
        return ResponseEntity.ok(listaBairros);
    }
}