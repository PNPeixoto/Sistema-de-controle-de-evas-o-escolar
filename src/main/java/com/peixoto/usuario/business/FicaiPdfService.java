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

import java.time.format.DateTimeFormatter;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Set;

@Service
public class FicaiPdfService {

    private static final Logger log = LoggerFactory.getLogger(FicaiPdfService.class);

    public byte[] gerarFicaiPdf(Aluno aluno, OcorrenciaEvasao evasao) {
        try (InputStream templateStream = new ClassPathResource("ficai_template.pdf").getInputStream();
             PDDocument pdfDocument = PDDocument.load(templateStream);
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            PDAcroForm acroForm = pdfDocument.getDocumentCatalog().getAcroForm();

            if (acroForm != null) {
                // ==========================================
                // 1. DADOS PESSOAIS
                // ==========================================
                preencherCampo(acroForm, aluno.getNomeCompleto(), "nome_aluno", "NOME", "a) NOME:");
                preencherCampo(acroForm, aluno.getEscola(), "escola", "unidade_escolar", "UNIDADE ESCOLAR:");
                preencherCampo(acroForm, aluno.getEscolaridade(), "escolaridade", "ano_serie", "ANO/SÉRIE ESCOLAR:");

                if (aluno.getDataNascimento() != null) {
                    var data = aluno.getDataNascimento();
                    preencherCampo(acroForm, String.format("%02d", data.getDayOfMonth()), "data_nascimento_dia", "nasc_dia");
                    preencherCampo(acroForm, String.format("%02d", data.getMonthValue()), "data_nascimento_mes", "nasc_mes");
                    preencherCampo(acroForm, String.valueOf(data.getYear()), "data_nascimento_ano", "nasc_ano");
                }

                if (aluno.getSexo() != null) {
                    String sexo = aluno.getSexo().toUpperCase().trim();
                    if (sexo.startsWith("M")) marcarCheckbox(acroForm, "chk_sexo_m", "SEXO_M");
                    else if (sexo.startsWith("F")) marcarCheckbox(acroForm, "chk_sexo_f", "SEXO_F");
                }

                // FIliação

                if (aluno.getFiliacao() != null && !aluno.getFiliacao().isEmpty()) {
                    var filiacao = aluno.getFiliacao().get(0);
                    preencherCampo(acroForm, filiacao.getMae(), "nome_mae", "mae", "MÃE:");
                    preencherCampo(acroForm, filiacao.getPai(), "nome_pai", "pai", "PAI:");
                    preencherCampo(acroForm, filiacao.getResponsavel(), "nome_responsavel", "responsavel", "RESPONSÁVEL:");

                    //Telefone
                    preencherCampo(acroForm, filiacao.getTelefoneResponsavel(), "telefone_principal", "telefone", "TELEFONE DE CONTATO:");
                }

                if (aluno.getEnderecos() != null && !aluno.getEnderecos().isEmpty()) {
                    var end = aluno.getEnderecos().get(0);
                    String rua = (end.getRua() != null) ? end.getRua().trim() : "";
                    String num = (end.getNumero() != null) ? String.valueOf(end.getNumero()) : "S/N";
                    String bairro = (end.getBairro() != null && !end.getBairro().equals("null")) ? end.getBairro().trim() : "";
                    String cidade = (end.getCidade() != null && !end.getCidade().equals("null")) ? end.getCidade().trim() : "";

                    String enderecoJunto = rua.isEmpty() ? "" : (rua + ", Nº " + num);
                    preencherCampo(acroForm, enderecoJunto, "endereco", "ENDEREÇO:", "ENDERECO", "endereco_completo");
                    preencherCampo(acroForm, bairro, "bairro", "BAIRRO:", "BAIRRO");
                    preencherCampo(acroForm, cidade, "cidade", "CIDADE:", "CIDADE");
                }


                // 2. CHECKBOXES (AEE, Turno, Benefícios)

                if (aluno.getAee() != null && aluno.getAee()) marcarCheckbox(acroForm, "chk_aee_sim", "chk_aee");
                else marcarCheckbox(acroForm, "chk_aee_nao");

                if (aluno.getDefasagem() != null && aluno.getDefasagem()) marcarCheckbox(acroForm, "chk_defasagem_sim", "chk_defasagem");
                else marcarCheckbox(acroForm, "chk_defasagem_nao");

                if (aluno.getTurno() != null) {
                    String turno = aluno.getTurno().toUpperCase().replaceAll("[^A-Z]", "");
                    if (turno.contains("MANH") || turno.contains("MATUTINO")) marcarCheckbox(acroForm, "chk_turno_manha", "turno_manha");
                    else if (turno.contains("TARD") || turno.contains("VESPERTINO")) marcarCheckbox(acroForm, "chk_turno_tarde", "turno_tarde");
                    else if (turno.contains("NOIT") || turno.contains("NOTURNO")) marcarCheckbox(acroForm, "chk_turno_noite", "turno_noite");
                    else if (turno.contains("INTEGRAL")) marcarCheckbox(acroForm, "chk_turno_integral", "turno_integral");
                }

                if (aluno.getCor() != null) {
                    String cor = aluno.getCor().toUpperCase().replaceAll("[^A-Z]", "");
                    if (cor.contains("BRANCA")) marcarCheckbox(acroForm, "chk_cor_branca");
                    else if (cor.contains("PRETA")) marcarCheckbox(acroForm, "chk_cor_preta");
                    else if (cor.contains("PARDA")) marcarCheckbox(acroForm, "chk_cor_parda");
                    else if (cor.contains("AMARELA")) marcarCheckbox(acroForm, "chk_cor_amarela");
                    else if (cor.contains("INDIGENA")) marcarCheckbox(acroForm, "chk_cor_indigena");
                }

                if (aluno.getBeneficios() != null) {
                    String ben = aluno.getBeneficios().toUpperCase();
                    if (ben.contains("NENHUM") || ben.isEmpty()) {
                        marcarCheckbox(acroForm, "chk_ben_nenhum");
                    } else {
                        if (ben.contains("BPC")) marcarCheckbox(acroForm, "chk_ben_bpc");
                        if (ben.contains("JOVEM")) marcarCheckbox(acroForm, "chk_ben_jovem");
                        if (ben.contains("NOVA VIDA")) marcarCheckbox(acroForm, "chk_ben_nova_vida");
                        if (ben.contains("BOLSA") || ben.contains("FAM")) {
                            marcarCheckbox(acroForm, "chk_ben_bolsa");

                            // EXTRAÇÃO À PROVA DE FALHAS DO CÓDIGO NIS
                            if (ben.contains("JUSTIFICATIVA:")) {
                                String codigo = ben.substring(ben.indexOf("JUSTIFICATIVA:") + 14).replaceAll("[^0-9]", "");
                                preencherCampo(acroForm, codigo, "txt_codigo_bolsa", "codigo_bolsa");
                            }
                        }
                    }
                }

                // ==========================================
                // 3. SEÇÕES DA FICAI (MÚLTIPLAS LINHAS)
                // ==========================================
                preencherCampo(acroForm, evasao.getMesFaltas(), "mes_faltas", "MÊS DAS FALTAS:");
                preencherCampo(acroForm, String.valueOf(evasao.getQuantidadeFaltas()), "qtd_faltas", "numero_faltas");

                if (evasao.getReincidente() != null && evasao.getReincidente()) marcarCheckbox(acroForm, "chk_reincidente_sim", "chk_reincidente");
                else marcarCheckbox(acroForm, "chk_reincidente_nao");

                if (evasao.getProvidenciasAdotadas() != null) {
                    for (String providencia : evasao.getProvidenciasAdotadas()) {
                        String p = providencia.toUpperCase();
                        if (p.contains("TELEF")) marcarCheckbox(acroForm, "chk_prov_telefone");
                        else if (p.contains("VISITA")) marcarCheckbox(acroForm, "chk_prov_visita");
                        else if (p.contains("MENSAGEM")) marcarCheckbox(acroForm, "chk_prov_mensagem");
                        else if (p.contains("RESPONS")) marcarCheckbox(acroForm, "chk_prov_conversa");
                        else if (p.contains("OUTRAS")) {
                            marcarCheckbox(acroForm, "chk_prov_outras");

                            // Outras providências (Dividido em até 2 linhas caso o texto seja grande)
                            preencherCampoMultilinha(acroForm, evasao.getOutrasProvidencias(), "txt_prov_outras_1", "txt_prov_outras_2");
                        }
                    }
                }

                if (evasao.getMotivoAfastamento() != null) {
                    String motivo = evasao.getMotivoAfastamento().toUpperCase();
                    if (motivo.contains("SAÚDE") || motivo.contains("SAUDE")) marcarCheckbox(acroForm, "chk_motivo_saude");
                    else if (motivo.contains("GRAVIDEZ")) marcarCheckbox(acroForm, "chk_motivo_gravidez");
                    else if (motivo.contains("CONFLITO")) marcarCheckbox(acroForm, "chk_motivo_conflitos");
                    else if (motivo.contains("TRABALHO")) marcarCheckbox(acroForm, "chk_motivo_trabalho");
                    else if (motivo.contains("NEGLIGÊNCIA") || motivo.contains("NEGLIGENCIA")) marcarCheckbox(acroForm, "chk_motivo_negligencia");
                    else if (motivo.contains("OUTRO") || !motivo.trim().isEmpty()) {
                        marcarCheckbox(acroForm, "chk_motivo_outros");
                        String textoLimpo = evasao.getMotivoAfastamento().replaceFirst("(?i)Outros:\\s*", "");

                        // Outros Motivos (Dividido em até 2 linhas)
                        preencherCampoMultilinha(acroForm, textoLimpo, "txt_motivo_outros_1", "txt_motivo_outros_2");
                    }
                }

                // ENCAMINHAMENTOS (Múltiplas Linhas: 1, 2 e 3)
                preencherCampoMultilinha(acroForm, evasao.getEncaminhamentosLaudos(), "encaminhamento1", "encaminhamento2", "encaminhamento3");

                // CONCLUSÃO (Múltiplas Linhas: 1, 2, 3 e 4)
                preencherCampoMultilinha(acroForm, evasao.getConclusao(), "conclusao1", "conclusao2", "conclusao3", "conclusao4");



                // SEÇÃO IV - TABELA DE AÇÕES
                // ==========================================
                if (evasao.getAcoes() != null) {
                    int i = 1;
                    for (AcaoTomada acao : evasao.getAcoes()) {
                        if (i > 3) break;

                        if (acao.getDataAcao() != null) {
                            preencherCampo(acroForm, acao.getDataAcao().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), "acao_data_" + i);
                        }

                        String desc = acao.getDescricao().toUpperCase();
                        if (desc.contains("TELEFONE")) marcarCheckbox(acroForm, "chk_acao_" + i + "_telefone");
                        else if (desc.contains("VISITA")) marcarCheckbox(acroForm, "chk_acao_" + i + "_visita");
                        else if (desc.contains("MENSAGEM")) marcarCheckbox(acroForm, "chk_acao_" + i + "_mensagem");
                        else if (desc.contains("ATENDIMENTO") || desc.contains("RESPONS")) marcarCheckbox(acroForm, "chk_acao_" + i + "_atendimento");


                        String obsFinal = desc.contains(" - ") ? acao.getDescricao().substring(acao.getDescricao().indexOf(" - ") + 3) : acao.getDescricao();

                        preencherCampo(acroForm, obsFinal, "acao_obs_" + i);

                        i++;
                    }
                }

                acroForm.refreshAppearances();
                acroForm.flatten();
            }

            pdfDocument.save(outputStream);
            return outputStream.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF: " + e.getMessage(), e);
        }
    }


    // FUNÇÕES MÁGICAS DE PREENCHIMENTO E DIVISÃO DE LINHAS



    private void preencherCampoMultilinha(PDAcroForm form, String texto, String... nomesDasLinhas) {
        if (texto == null || texto.trim().isEmpty() || texto.equals("null")) return;

        int maxCharsPorLinha = 85; // Limite de letras por linha do PDF
        String[] palavras = texto.split(" ");
        StringBuilder linhaAtual = new StringBuilder();
        int linhaIndex = 0;

        for (String palavra : palavras) {

            // 1. A TESOURA: Se a palavra for uma "Tripa" gigante sem espaços (Teste do aaaa)
            while (palavra.length() > maxCharsPorLinha) {
                if (linhaAtual.length() > 0) {
                    preencherCampo(form, linhaAtual.toString().trim(), nomesDasLinhas[linhaIndex]);
                    linhaIndex++;
                    linhaAtual = new StringBuilder();
                    if (linhaIndex >= nomesDasLinhas.length) return; // Acabou o espaço
                }
                // Corta um pedaço exato do limite da linha
                String pedaco = palavra.substring(0, maxCharsPorLinha);
                preencherCampo(form, pedaco, nomesDasLinhas[linhaIndex]);
                linhaIndex++;
                if (linhaIndex >= nomesDasLinhas.length) return; // Acabou o espaço

                // O resto da palavra continua no loop
                palavra = palavra.substring(maxCharsPorLinha);
            }

            // 2. TEXTO NORMAL: Pula a linha se não couber
            if (linhaAtual.length() + palavra.length() + 1 > maxCharsPorLinha) {
                if (linhaIndex < nomesDasLinhas.length) {
                    preencherCampo(form, linhaAtual.toString().trim(), nomesDasLinhas[linhaIndex]);
                    linhaIndex++;
                    if (linhaIndex >= nomesDasLinhas.length) return; // Acabou o espaço
                }
                linhaAtual = new StringBuilder(palavra + " ");
            } else {
                linhaAtual.append(palavra).append(" ");
            }
        }

        // Imprime o restinho que sobrou na última linha possível
        if (linhaAtual.length() > 0 && linhaIndex < nomesDasLinhas.length) {
            preencherCampo(form, linhaAtual.toString().trim(), nomesDasLinhas[linhaIndex]);
        }
    }

    private void preencherCampo(PDAcroForm form, String valor, String... nomesPossiveis) {
        if (valor == null || valor.trim().isEmpty() || valor.equals("null")) return;
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