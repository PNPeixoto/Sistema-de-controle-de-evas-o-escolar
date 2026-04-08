package com.peixoto.usuario.business;

import com.peixoto.usuario.business.dto.FicaiMensalDTO;
import com.peixoto.usuario.infrastructure.entity.Aluno;
import com.peixoto.usuario.infrastructure.entity.FicaiMensal;
import com.peixoto.usuario.infrastructure.entity.OcorrenciaEvasao;
import com.peixoto.usuario.infrastructure.exceptions.ConflictException;
import com.peixoto.usuario.infrastructure.exceptions.ResourceNotFoundException;
import com.peixoto.usuario.infrastructure.repository.AlunoRepository;
import com.peixoto.usuario.infrastructure.repository.FicaiMensalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FicaiMensalService {

    private final FicaiMensalRepository ficaiMensalRepository;
    private final AlunoRepository alunoRepository;

    /**
     * Registra que a escola NÃO possui FICAI neste mês.
     * Regras:
     * 1. Se já existem registros de evasão naquele mês → BLOQUEIA (não pode marcar)
     * 2. O termo de consentimento precisa ser aceito
     * 3. Só pode ser registrado uma vez por escola/mês
     */
    @Transactional
    public FicaiMensal registrarSemFicai(String escolaNome, String nomeUsuario, FicaiMensalDTO dto) {

        // 1. Validação: termo de consentimento aceito
        if (dto.getTermoAceito() == null || !dto.getTermoAceito()) {
            throw new com.peixoto.usuario.infrastructure.exceptions.IllegalArgumentException(
                    "O termo de consentimento e responsabilidade deve ser aceito.");
        }

        // 2. Validação: já existe registro para este mês?
        if (ficaiMensalRepository.existsByEscolaNomeIgnoreCaseAndMesReferencia(
                escolaNome, dto.getMesReferencia())) {
            throw new ConflictException("Já existe um registro FICAI mensal para " +
                    escolaNome + " no mês " + dto.getMesReferencia());
        }

        // 3. Validação: existem evasões registradas neste mês?
        if (existemEvasoesNoMes(escolaNome, dto.getMesReferencia())) {
            throw new ConflictException(
                    "Não é possível declarar ausência de FICAI. " +
                    "Existem registros de evasão para " + escolaNome +
                    " no mês " + dto.getMesReferencia());
        }

        // 4. Registra a declaração
        FicaiMensal registro = FicaiMensal.builder()
                .escolaNome(escolaNome)
                .mesReferencia(dto.getMesReferencia())
                .semFicai(true)
                .dataAssinatura(LocalDate.now())
                .assinadoPor(nomeUsuario)
                .termoAceito(true)
                .build();

        return ficaiMensalRepository.save(registro);
    }

    /**
     * Consulta o status FICAI mensal de uma escola.
     */
    public FicaiMensal consultarMes(String escolaNome, String mesReferencia) {
        return ficaiMensalRepository
                .findByEscolaNomeIgnoreCaseAndMesReferencia(escolaNome, mesReferencia)
                .orElse(null);
    }

    /**
     * Verifica se existem evasões registradas para a escola no mês informado.
     * Compara o campo mesFaltas das ocorrências com o mês de referência.
     */
    private boolean existemEvasoesNoMes(String escolaNome, String mesReferencia) {
        List<Aluno> alunos = alunoRepository.findByEscolaIgnoreCase(escolaNome);

        for (Aluno aluno : alunos) {
            if (aluno.getHistoricoEvasao() != null) {
                for (OcorrenciaEvasao evasao : aluno.getHistoricoEvasao()) {
                    if (evasao.getMesFaltas() != null &&
                        evasao.getMesFaltas().toLowerCase().contains(
                            mesReferenciaParaNomeMes(mesReferencia).toLowerCase())) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Converte "2026-04" → "Abril" para comparar com o campo mesFaltas
     */
    private String mesReferenciaParaNomeMes(String mesRef) {
        try {
            YearMonth ym = YearMonth.parse(mesRef);
            return ym.getMonth().getDisplayName(java.time.format.TextStyle.FULL,
                    new java.util.Locale("pt", "BR"));
        } catch (Exception e) {
            return mesRef;
        }
    }
}
