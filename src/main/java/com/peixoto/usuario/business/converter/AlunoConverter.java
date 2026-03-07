package com.peixoto.usuario.business.converter;

import com.peixoto.usuario.business.dto.*;
import com.peixoto.usuario.infrastructure.entity.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;

@Component
@Setter
@Getter
public class AlunoConverter {

    public Aluno paraEntity(AlunoDTO dto) {
        return Aluno.builder()
                .nomeCompleto(dto.getNome())
                .escola(dto.getEscola())
                .dataNascimento(dto.getDataNascimento())
                .cor(dto.getCor())
                .escolaridade(dto.getEscolaridade())
                .aee(dto.getAee())
                .turno(dto.getTurno())
                .defasagem(dto.getDefasagem())
                .beneficios(dto.getBeneficios())

                // Converte as listas simples

                .enderecos(dto.getEnderecos().stream().map(this::paraEndereco).collect(Collectors.toList()))
                .telefones(dto.getTelefones().stream().map(this::paraTelefone).collect(Collectors.toList()))
                .filiacao(dto.getFiliacao().stream().map(this::paraFiliacao).collect(Collectors.toList()))

                // Converte a hierarquia de Evasão (Ocorrência -> Ações)

                .historicoEvasao(dto.getHistoricoEvasao().stream().map(this::paraOcorrencia).collect(Collectors.toList()))
                .build();
    }

    private OcorrenciaEvasao paraOcorrencia(OcorrenciaEvasaoDTO dto) {
        OcorrenciaEvasao ocorrencia = new OcorrenciaEvasao();
        ocorrencia.setMesFaltas(dto.getMesFaltas());
        ocorrencia.setQuantidadeFaltas(dto.getQuantidadeFaltas());

        // Mapeia as ações e vincula cada ação

        if (dto.getAcoes() != null) {
            ocorrencia.setAcoes(dto.getAcoes().stream().map(acaoDto -> {
                AcaoTomada acao = new AcaoTomada();
                acao.setDataAcao(acaoDto.getDataAcao());
                acao.setDescricao(acaoDto.getAcaoTomada());
                acao.setOcorrencia(ocorrencia);
                return acao;
            }).collect(Collectors.toList()));
        }
        return ocorrencia;
    }

    // Métodos auxiliares

    private Endereco paraEndereco(EnderecoDTO d) { return Endereco.builder().rua(d.getRua()).numero(d.getNumero()).cidade(d.getCidade()).build(); }
    private Telefone paraTelefone(TelefoneDTO d) { return Telefone.builder().numero(d.getNumero()).ddd(d.getDdd()).build(); }


    private Filiacao paraFiliacao(FiliacaoDTO d) {
        return Filiacao.builder()
                .mae(d.getMae())
                .pai(d.getPai())
                .responsavel(d.getResponsavel())
                .build();
    }
}