package com.peixoto.usuario.business;

import com.peixoto.usuario.infrastructure.entity.Aluno;
import com.peixoto.usuario.infrastructure.entity.OcorrenciaEvasao;
import com.peixoto.usuario.infrastructure.entity.AcaoTomada;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.interactive.form.PDAcroForm;
import org.apache.pdfbox.pdmodel.interactive.form.PDField;
import org.apache.pdfbox.pdmodel.interactive.form.PDCheckBox;
import org.apache.pdfbox.pdmodel.interactive.form.PDButton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.format.DateTimeFormatter;
import java.util.Set;

@Service
public class FicaiPdfService {

    private static final Logger log = LoggerFactory.getLogger(FicaiPdfService.class);
    private static final int MAX_CHARS_PER_LINE = 85;
    private static final String TEMPLATE_PATH = "ficai_template.pdf";

    public byte[] gerarFicaiPdf(Aluno aluno, OcorrenciaEvasao evasao) {
        try (InputStream templateStream = new ClassPathResource(TEMPLATE_PATH).getInputStream();
             PDDocument pdfDocument = PDDocument.load(templateStream);
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            PDAcroForm acroForm = pdfDocument.getDocumentCatalog().getAcroForm();
            if (acroForm != null) {
                preencherDadosPessoais(acroForm, aluno);
                preencherDadosEvasao(acroForm, evasao);
                preencherAcoesTomadas(acroForm, evasao);
                acroForm.refreshAppearances();
                acroForm.flatten();
            }

            pdfDocument.save(outputStream);
            return outputStream.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF: " + e.getMessage(), e);
        }
    }

    private void preencherDadosPessoais(PDAcroForm form, Aluno aluno) {
        preencherCampo(form, aluno.getNomeCompleto(), "nome_aluno", "NOME", "a) NOME:");
        preencherCampo(form, aluno.getEscola(), "escola", "unidade_escolar", "UNIDADE ESCOLAR:");
        preencherCampo(form, aluno.getEscolaridade(), "escolaridade", "ano_serie", "ANO/SÉRIE ESCOLAR:");
        preencherDataNascimento(form, aluno);
        preencherSexo(form, aluno);
        preencherFiliacao(form, aluno);
        preencherEndereco(form, aluno);
        preencherCheckboxesPessoais(form, aluno);
    }

    private void preencherDataNascimento(PDAcroForm form, Aluno aluno) {
        if (aluno.getDataNascimento() == null) return;
        var data = aluno.getDataNascimento();
        preencherCampo(form, String.format("%02d", data.getDayOfMonth()), "data_nascimento_dia", "nasc_dia");
        preencherCampo(form, String.format("%02d", data.getMonthValue()), "data_nascimento_mes", "nasc_mes");
        preencherCampo(form, String.valueOf(data.getYear()), "data_nascimento_ano", "nasc_ano");
    }

    private void preencherSexo(PDAcroForm form, Aluno aluno) {
        if (aluno.getSexo() == null) return;
        String sexo = aluno.getSexo().toUpperCase().trim();
        if (sexo.startsWith("M")) marcarCheckbox(form, "chk_sexo_m", "SEXO_M");
        else if (sexo.startsWith("F")) marcarCheckbox(form, "chk_sexo_f", "SEXO_F");
    }

    private void preencherFiliacao(PDAcroForm form, Aluno aluno) {
        if (aluno.getFiliacao() == null || aluno.getFiliacao().isEmpty()) return;
        var filiacao = aluno.getFiliacao().get(0);
        preencherCampo(form, filiacao.getMae(), "nome_mae", "mae", "MÃE:");
        preencherCampo(form, filiacao.getPai(), "nome_pai", "pai", "PAI:");
        preencherCampo(form, filiacao.getResponsavel(), "nome_responsavel", "responsavel", "RESPONSÁVEL:");
        preencherCampo(form, filiacao.getTelefoneResponsavel(), "telefone_principal", "telefone", "TELEFONE DE CONTATO:");
    }

    private void preencherEndereco(PDAcroForm form, Aluno aluno) {
        if (aluno.getEnderecos() == null || aluno.getEnderecos().isEmpty()) return;
        var end = aluno.getEnderecos().get(0);
        String rua = (end.getRua() != null) ? end.getRua().trim() : "";
        String num = (end.getNumero() != null) ? String.valueOf(end.getNumero()) : "S/N";
        String bairro = (end.getBairro() != null && !"null".equals(end.getBairro())) ? end.getBairro().trim() : "";
        String cidade = (end.getCidade() != null && !"null".equals(end.getCidade())) ? end.getCidade().trim() : "";

        String enderecoJunto = rua.isEmpty() ? "" : (rua + ", Nº " + num);
        preencherCampo(form, enderecoJunto, "endereco", "ENDERECO", "endereco_completo");
        preencherCampo(form, bairro, "bairro", "BAIRRO");
        preencherCampo(form, cidade, "cidade", "CIDADE");
    }

    private void preencherCheckboxesPessoais(PDAcroForm form, Aluno aluno) {
        if (Boolean.TRUE.equals(aluno.getAee())) marcarCheckbox(form, "chk_aee_sim", "chk_aee");
        else marcarCheckbox(form, "chk_aee_nao");

        if (Boolean.TRUE.equals(aluno.getDefasagem())) marcarCheckbox(form, "chk_defasagem_sim", "chk_defasagem");
        else marcarCheckbox(form, "chk_defasagem_nao");

        preencherTurno(form, aluno);
        preencherCor(form, aluno);
        preencherBeneficios(form, aluno);
    }

    private void preencherTurno(PDAcroForm form, Aluno aluno) {
        if (aluno.getTurno() == null) return;
        String turno = aluno.getTurno().toUpperCase().replaceAll("[^A-Z]", "");
        if (turno.contains("MANH") || turno.contains("MATUTINO")) marcarCheckbox(form, "chk_turno_manha", "turno_manha");
        else if (turno.contains("TARD") || turno.contains("VESPERTINO")) marcarCheckbox(form, "chk_turno_tarde", "turno_tarde");
        else if (turno.contains("NOIT") || turno.contains("NOTURNO")) marcarCheckbox(form, "chk_turno_noite", "turno_noite");
        else if (turno.contains("INTEGRAL")) marcarCheckbox(form, "chk_turno_integral", "turno_integral");
    }

    private void preencherCor(PDAcroForm form, Aluno aluno) {
        if (aluno.getCor() == null) return;
        String cor = aluno.getCor().toUpperCase().replaceAll("[^A-Z]", "");
        if (cor.contains("BRANCA")) marcarCheckbox(form, "chk_cor_branca");
        else if (cor.contains("PRETA")) marcarCheckbox(form, "chk_cor_preta");
        else if (cor.contains("PARDA")) marcarCheckbox(form, "chk_cor_parda");
        else if (cor.contains("AMARELA")) marcarCheckbox(form, "chk_cor_amarela");
        else if (cor.contains("INDIGENA")) marcarCheckbox(form, "chk_cor_indigena");
    }

    private void preencherBeneficios(PDAcroForm form, Aluno aluno) {
        if (aluno.getBeneficios() == null) return;
        String ben = aluno.getBeneficios().toUpperCase();
        if (ben.contains("NENHUM") || ben.isEmpty()) {
            marcarCheckbox(form, "chk_ben_nenhum");
            return;
        }
        if (ben.contains("BPC")) marcarCheckbox(form, "chk_ben_bpc");
        if (ben.contains("JOVEM")) marcarCheckbox(form, "chk_ben_jovem");
        if (ben.contains("NOVA VIDA")) marcarCheckbox(form, "chk_ben_nova_vida");
        if (ben.contains("BOLSA") || ben.contains("FAM")) {
            marcarCheckbox(form, "chk_ben_bolsa");
            if (ben.contains("JUSTIFICATIVA:")) {
                String codigo = ben.substring(ben.indexOf("JUSTIFICATIVA:") + 14).replaceAll("[^0-9]", "");
                preencherCampo(form, codigo, "txt_codigo_bolsa", "codigo_bolsa");
            }
        }
    }

    private void preencherDadosEvasao(PDAcroForm form, OcorrenciaEvasao evasao) {
        preencherCampo(form, evasao.getMesFaltas(), "mes_faltas", "MÊS DAS FALTAS:");
        preencherCampo(form, String.valueOf(evasao.getQuantidadeFaltas()), "qtd_faltas", "numero_faltas");

        if (Boolean.TRUE.equals(evasao.getReincidente())) marcarCheckbox(form, "chk_reincidente_sim", "chk_reincidente");
        else marcarCheckbox(form, "chk_reincidente_nao");

        preencherProvidencias(form, evasao);
        preencherMotivoAfastamento(form, evasao);
        preencherCampoMultilinha(form, evasao.getEncaminhamentosLaudos(), "encaminhamento1", "encaminhamento2", "encaminhamento3");
        preencherCampoMultilinha(form, evasao.getConclusao(), "conclusao1", "conclusao2", "conclusao3", "conclusao4");
    }

    private void preencherProvidencias(PDAcroForm form, OcorrenciaEvasao evasao) {
        if (evasao.getProvidenciasAdotadas() == null) return;
        for (String providencia : evasao.getProvidenciasAdotadas()) {
            String p = providencia.toUpperCase();
            if (p.contains("TELEF")) marcarCheckbox(form, "chk_prov_telefone");
            else if (p.contains("VISITA")) marcarCheckbox(form, "chk_prov_visita");
            else if (p.contains("MENSAGEM")) marcarCheckbox(form, "chk_prov_mensagem");
            else if (p.contains("RESPONS")) marcarCheckbox(form, "chk_prov_conversa");
            else if (p.contains("OUTRAS")) {
                marcarCheckbox(form, "chk_prov_outras");
                preencherCampoMultilinha(form, evasao.getOutrasProvidencias(), "txt_prov_outras_1", "txt_prov_outras_2");
            }
        }
    }

    private void preencherMotivoAfastamento(PDAcroForm form, OcorrenciaEvasao evasao) {
        if (evasao.getMotivoAfastamento() == null) return;
        String motivo = evasao.getMotivoAfastamento().toUpperCase();
        if (motivo.contains("SAÚDE") || motivo.contains("SAUDE")) marcarCheckbox(form, "chk_motivo_saude");
        else if (motivo.contains("GRAVIDEZ")) marcarCheckbox(form, "chk_motivo_gravidez");
        else if (motivo.contains("CONFLITO")) marcarCheckbox(form, "chk_motivo_conflitos");
        else if (motivo.contains("TRABALHO")) marcarCheckbox(form, "chk_motivo_trabalho");
        else if (motivo.contains("NEGLIGÊNCIA") || motivo.contains("NEGLIGENCIA")) marcarCheckbox(form, "chk_motivo_negligencia");
        else {
            marcarCheckbox(form, "chk_motivo_outros");
            String textoLimpo = evasao.getMotivoAfastamento().replaceFirst("(?i)Outros:\\s*", "");
            preencherCampoMultilinha(form, textoLimpo, "txt_motivo_outros_1", "txt_motivo_outros_2");
        }
    }

    private void preencherAcoesTomadas(PDAcroForm form, OcorrenciaEvasao evasao) {
        if (evasao.getAcoes() == null) return;
        int i = 1;
        for (AcaoTomada acao : evasao.getAcoes()) {
            if (i > 3) break;
            preencherAcaoIndividual(form, acao, i);
            i++;
        }
    }

    private void preencherAcaoIndividual(PDAcroForm form, AcaoTomada acao, int index) {
        if (acao.getDataAcao() != null) {
            preencherCampo(form, acao.getDataAcao().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), "acao_data_" + index);
        }
        String desc = acao.getDescricao().toUpperCase();
        if (desc.contains("TELEFONE")) marcarCheckbox(form, "chk_acao_" + index + "_telefone");
        else if (desc.contains("VISITA")) marcarCheckbox(form, "chk_acao_" + index + "_visita");
        else if (desc.contains("MENSAGEM")) marcarCheckbox(form, "chk_acao_" + index + "_mensagem");
        else if (desc.contains("ATENDIMENTO") || desc.contains("RESPONS")) marcarCheckbox(form, "chk_acao_" + index + "_atendimento");

        String obsFinal = desc.contains(" - ") ? acao.getDescricao().substring(acao.getDescricao().indexOf(" - ") + 3) : acao.getDescricao();
        preencherCampo(form, obsFinal, "acao_obs_" + index);
    }

    private void preencherCampoMultilinha(PDAcroForm form, String texto, String... nomesDasLinhas) {
        if (texto == null || texto.trim().isEmpty() || "null".equals(texto)) return;

        String[] palavras = texto.split(" ");
        StringBuilder linhaAtual = new StringBuilder();
        int linhaIndex = 0;

        for (String palavra : palavras) {
            while (palavra.length() > MAX_CHARS_PER_LINE) {
                if (linhaAtual.length() > 0) {
                    preencherCampo(form, linhaAtual.toString().trim(), nomesDasLinhas[linhaIndex]);
                    linhaIndex++;
                    linhaAtual = new StringBuilder();
                    if (linhaIndex >= nomesDasLinhas.length) return;
                }
                String pedaco = palavra.substring(0, MAX_CHARS_PER_LINE);
                preencherCampo(form, pedaco, nomesDasLinhas[linhaIndex]);
                linhaIndex++;
                if (linhaIndex >= nomesDasLinhas.length) return;
                palavra = palavra.substring(MAX_CHARS_PER_LINE);
            }

            if (linhaAtual.length() + palavra.length() + 1 > MAX_CHARS_PER_LINE) {
                if (linhaIndex < nomesDasLinhas.length) {
                    preencherCampo(form, linhaAtual.toString().trim(), nomesDasLinhas[linhaIndex]);
                    linhaIndex++;
                    if (linhaIndex >= nomesDasLinhas.length) return;
                }
                linhaAtual = new StringBuilder(palavra + " ");
            } else {
                linhaAtual.append(palavra).append(" ");
            }
        }

        if (linhaAtual.length() > 0 && linhaIndex < nomesDasLinhas.length) {
            preencherCampo(form, linhaAtual.toString().trim(), nomesDasLinhas[linhaIndex]);
        }
    }

    private void preencherCampo(PDAcroForm form, String valor, String... nomesPossiveis) {
        if (valor == null || valor.trim().isEmpty() || "null".equals(valor)) return;
        for (String nome : nomesPossiveis) {
            try {
                PDField field = form.getField(nome);
                if (field != null) {
                    field.setValue(valor);
                    return;
                }
            } catch (Exception e) {
                log.warn("Erro ao preencher campo '{}': {}", nome, e.getMessage());
            }
        }
        log.debug("Campo PDF não encontrado: {}", String.join(", ", nomesPossiveis));
    }

    private void marcarCheckbox(PDAcroForm form, String... nomesPossiveis) {
        for (String nome : nomesPossiveis) {
            try {
                PDField field = form.getField(nome);
                if (field != null) {
                    if (field instanceof PDCheckBox) {
                        ((PDCheckBox) field).check();
                    } else if (field instanceof PDButton) {
                        PDButton button = (PDButton) field;
                        Set<String> onValues = button.getOnValues();
                        if (onValues != null && !onValues.isEmpty()) {
                            button.setValue(onValues.iterator().next());
                        } else {
                            button.setValue("Yes");
                        }
                    } else {
                        field.setValue("Yes");
                    }
                    return;
                }
            } catch (Exception e) {
                log.warn("Erro ao marcar checkbox '{}': {}", nome, e.getMessage());
            }
        }
        log.debug("Campo PDF não encontrado: {}", String.join(", ", nomesPossiveis));
    }
}