package com.peixoto.usuario.business.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OcorrenciaEvasaoDTO {

    // ==========================================
    // SEÇÃO I - DADOS DA INFREQUÊNCIA
    // ==========================================
    private String mesFaltas;
    private Integer quantidadeFaltas;
    private Boolean reincidente; // <-- Nosso novo campo adicionado

    // ==========================================
    // SEÇÃO II - PROVIDÊNCIAS ADOTADAS (Separado do item IV)
    // ==========================================
    // Vai receber uma lista do Front-end. Ex: ["Contato Telefônico", "Visita Domiciliar"]
    private List<String> providenciasAdotadas;

    // Se a secretária marcar "Outras", o texto vem para cá
    private String outrasProvidencias;

    // ==========================================
    // SEÇÃO III - ENCAMINHAMENTOS
    // ==========================================
    private String encaminhamentosLaudos;

    // ==========================================
    // SEÇÃO IV - REGISTRO DE ACOMPANHAMENTO (A Tabela)
    // ==========================================
    // Continua sendo responsável apenas por preencher as 3 linhas da tabela no PDF
    private List<AcaoDetalheDTO> acoes;

    // ==========================================
    // SEÇÃO V e VI - MOTIVOS E CONCLUSÃO
    // ==========================================
    private String motivoAfastamento;
    private String conclusao;

    // ==========================================
    // ASSINATURAS E DATAS
    // ==========================================
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate dataAssinaturaDiretor;
    private String assinaturaDiretor;
}