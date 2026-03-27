package com.peixoto.usuario.infrastructure.entity;

import com.peixoto.usuario.infrastructure.entity.Bairro;
import com.peixoto.usuario.infrastructure.entity.Escola;
import com.peixoto.usuario.infrastructure.repository.BairroRepository;
import com.peixoto.usuario.infrastructure.repository.EscolaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class EscolaSeeder implements CommandLineRunner {

    private final EscolaRepository escolaRepository;
    private final BairroRepository bairroRepository;

    @Override
    public void run(String... args) {
        if (escolaRepository.count() == 0) {

            Map<String, String> escolasMap = new HashMap<>();

            // ---------------------------------------------------------
            // MAPEAMENTO COMPLETO DE TODAS AS 116 UNIDADES
            // ---------------------------------------------------------
            escolasMap.put("CEMEAES - BARRA", "Barra de Macaé");
            escolasMap.put("CM AROEIRA", "Aroeira");
            escolasMap.put("CAP", "Novo Cavaleiros");
            escolasMap.put("CEM ANA MARIA BACELLAR LEITE E SANTOS", "Novo Cavaleiros");
            escolasMap.put("CEM CAROLINA CURVELLO BENJAMIN", "Trapiche");
            escolasMap.put("CEM COQUINHO", "Nova Esperança");
            escolasMap.put("CEM RAUL VEIGA", "Glicério");
            escolasMap.put("CEMEAES - AEROPORTO", "Parque Aeroporto");
            escolasMap.put("CEMEAES - CENTRO", "Centro");
            escolasMap.put("CEMEAES - SERRA", "Córrego do Ouro");
            escolasMap.put("CIEP 058 M OSCAR CORDEIRO", "Parque Aeroporto");
            escolasMap.put("CIEP 455 M MARINGA", "Campo D'Oeste");
            escolasMap.put("CIEP M PROF DARCY RIBEIRO", "Nova Holanda");
            escolasMap.put("C.M. ANCYRA GONCALVES PIMENTEL", "Miramar");
            escolasMap.put("CM BOTAFOGO", "Botafogo");
            escolasMap.put("CM DO SANA", "Sana");
            escolasMap.put("CM DR CLAUDIO MOACYR DE AZEVEDO", "Parque Aeroporto");
            escolasMap.put("CM ENGENHO DA PRAIA", "Engenho da Praia");
            escolasMap.put("CM ERALDO MUSSI", "Malvinas");
            escolasMap.put("CM GENERINO TEOTONIO DE LUNA", "Virgem Santa");
            escolasMap.put("CM IVETE SANTANA DRUMOND DE AGUIAR", "Frade");
            escolasMap.put("C.M. JOSÉ CALIL FILHO", "São José do Barreto");
            escolasMap.put("CM NEUSA GOULART BRIZOLA", "Barra de Macaé");
            escolasMap.put("CM PEDRO ADAMI", "Córrego do Ouro");
            escolasMap.put("CM PROF ELZA IBRAHIM", "Ajuda de Baixo");
            escolasMap.put("CM PROF MARIA ISABEL DAMASCENO SIMAO", "Centro");
            escolasMap.put("CM PROF MARIA LETICIA SANTOS CARVALHO", "Visconde de Araújo");
            escolasMap.put("CM PROF SAMUEL BRUST", "Fronteira");
            escolasMap.put("CM RENATO MARTINS", "Ajuda de Baixo");
            escolasMap.put("CM WOLFANGO FERREIRA", "Barra de Macaé");
            escolasMap.put("CM ZELITA ROCHA DE AZEVEDO", "Parque Aeroporto");
            escolasMap.put("E.E.M. CAETANO DIAS", "Trapiche");
            escolasMap.put("EEM CARLOS GASPAR", "Cachoeiros de Macaé");
            escolasMap.put("EEM CORREGO DO OURO", "Córrego do Ouro");
            escolasMap.put("EEM FANTINA DE MELLO", "Frade");
            escolasMap.put("EEM JACYRA TAVARES DUVAL", "Novo Cavaleiros");
            escolasMap.put("EEM LEONEL DE MOURA BRIZOLA", "Barra de Macaé");
            escolasMap.put("EEM NOSSO SENHOR DOS PASSOS", "Botafogo");
            escolasMap.put("E.E.M. POLIVALENTE ANISIO TEIXEIRA", "Costa do Sol");
            escolasMap.put("EEMEI ANNA BENEDICTA DA SILVA SANTOS", "Centro");
            escolasMap.put("EEMEI PROF MARIA MAGDALA AGOSTINHO CIPRIANI", "Centro");
            escolasMap.put("EM ALMIR FRANCISCO LAPA", "Parque Atlântico");
            escolasMap.put("EM AMIL TANOS", "Aroeira");
            escolasMap.put("EM ATERRADO DO IMBURO", "Ajuda de Cima");
            escolasMap.put("EM DOLORES GARCIA RODRIGUEZ", "Mirante da Lagoa");
            escolasMap.put("EM INTERAGIR", "Centro");
            escolasMap.put("EM JOFFRE FROSSARD", "Centro");
            escolasMap.put("EM LIONS", "Bairro da Glória");
            escolasMap.put("EM MARIA AUGUSTA DE AGUIAR FRANCO", "Centro");
            escolasMap.put("EM MARIA CRISTINA CASTELLO BRANCO DA CRUZ", "Centro");
            escolasMap.put("ESCOLA MUNICIPAL OLGA BENARIO PRESTES", "São José do Barreto");
            escolasMap.put("E.M. ONILDA MARIA DA COSTA", "Lagomar");
            escolasMap.put("EM PAULO FREIRE", "Lagomar");
            escolasMap.put("EM PROF ANTONIO ALVAREZ PARADA", "Imbetiba");
            escolasMap.put("EM PROF EDA MOREIRA DAFLON", "Centro");
            escolasMap.put("EM PROF ELISABETE DE AZEVEDO D BRANDÃO", "Lagomar");
            escolasMap.put("EM PROF JOAQUIM LUIZ FREIRE PINHEIRO", "Alto dos Cajueiros");
            escolasMap.put("EM PROF LETICIA PECANHA DE AGUIAR", "Centro");
            escolasMap.put("EM PROF NEUZA MARIA DE ALMEIDA", "Centro");
            escolasMap.put("EM PROF SANDRA M DE O ARAUJO FRANCO", "Sol Y Mar");
            escolasMap.put("E.M. SÔNIA REGINA DE SOUZA LAPA", "Aroeira");
            escolasMap.put("E.M. ZÉLIA DE SOUZA AGUIAR", "Malvinas");
            escolasMap.put("EMEI ALCINA MUZZY DE JESUS", "Centro");
            escolasMap.put("EMEI AMCORIN", "Centro");
            escolasMap.put("EMEI ANDRE VINICIUS DE SOUZA GONCALVES", "Centro");
            escolasMap.put("EMEI ATTILA DE AGUIAR MALTEZ JUNIOR", "Cajueiros");
            escolasMap.put("EMEI CHRISTOS JEAN KOUSOULAS", "Nova Holanda");
            escolasMap.put("EMEI CLEIDE CANELA DE SOUZA", "Centro");
            escolasMap.put("EMEI ELEA TATAGIBA DE AZEVEDO", "Centro");
            escolasMap.put("EMEI LUIZ CARLOS MARTINS", "Visconde de Araújo");
            escolasMap.put("EMEI MAI CARMEN DE JESUS FRANÇA", "Centro");
            escolasMap.put("EMEI MAI MARIA CECILIA TOURINHO FURTADO", "Centro");
            escolasMap.put("EMEI MAI PREF ALCIDES RAMOS", "Botafogo");
            escolasMap.put("EMEI MAI PROF MARIA DAS DORES SOUZA TAVARES", "Centro");
            escolasMap.put("EMEI MARLENE DINIZ CALDAS", "Centro");
            escolasMap.put("EMEI NOSSA SENHORA DA CONCEIÇÃO", "Centro");
            escolasMap.put("EMEI OLIMPIA RIBEIRO DOS SANTOS MACHADO", "Centro");
            escolasMap.put("EMEI PROF AFONSO CORREA SABINO", "Parque Aeroporto");
            escolasMap.put("EMEI PROF ANA CRISTINA F AZARANY ALMEIDA", "Centro");
            escolasMap.put("EMEI PROF ANGELA MARIA FELIX PEREIRA", "Centro");
            escolasMap.put("EMEI PROFESSORA ARLÉA CARVALHO JOSÉ", "Aroeira");
            escolasMap.put("EMEI PROFª ARLETE RIBEIRO JOSÉ", "Miramar");
            escolasMap.put("EMEI PROF CANDIDA MARIA DA SILVA VIEIRA", "Centro");
            escolasMap.put("EMEI PROF CELITA REID FERNANDES", "Centro");
            escolasMap.put("EMEI PROF EDDA EVELYN D SIMÃO ALMEIDA", "Centro");
            escolasMap.put("EMEI PROF ELISA Mª. SILVA DE A. PORTUGAL", "Centro");
            escolasMap.put("EMEI PROF EMILSON DE JESUS MACHADO", "Centro");
            escolasMap.put("EMEI PROF ESMERIA PEREIRA REID DOS SANTOS", "Centro");
            escolasMap.put("E.M.E.I. PROFª. GÉSIA DE OLIVEIRA", "Centro");
            escolasMap.put("EMEI PROF HILDA RAMOS MACHADO", "Centro");
            escolasMap.put("EMEI PROF IRACY PINHEIRO MARQUES", "Barra de Macaé");
            escolasMap.put("EMEI PROF JOSE AUGUSTO ABREU AGUIAR", "Centro");
            escolasMap.put("EMEI PROF JOSE BRUNO DE AZEVEDO", "Centro");
            escolasMap.put("EMEI PROF LAURA SUELI DE CAMPOS BACELAR", "Centro");
            escolasMap.put("EMEI PROF LEDA MARIA LEDO ESTEVES", "Centro");
            escolasMap.put("EMEI PROF LIA KOPP FRANCO", "Centro");
            escolasMap.put("EMEI PROF MARIA ANGELICA DE OLIVEIRA DAS DORES", "Centro");
            escolasMap.put("EMEI PROF MARIA DA CONCEICAO CARVALHO", "Centro");
            escolasMap.put("EMEI PROF MARIA DE MARIS SARMENTO TORRES", "Centro");
            escolasMap.put("EMEI PROF MARIA JOSE FERREIRA BARROS", "Centro");
            escolasMap.put("EMEI PROF MARIA LIRA BERALDINI CAMPOS", "Centro");
            escolasMap.put("EMEI PROF MARLI VASCONCELOS LEMOS", "Centro");
            escolasMap.put("EMEI PROF NEIVA MARIANO DOS SANTOS", "Centro");
            escolasMap.put("EMEI PROF NORMA SHIRLEY DA S FERNANDES", "Centro");
            escolasMap.put("EMEI PROF THEREZINHA CARVALHO MOREIRA", "Centro");
            escolasMap.put("EMEI THEREZINHA LOURENCO DA SILVA", "Centro");
            escolasMap.put("EMEI WANDERLEY QUINTINO TEIXEIRA", "Centro");
            escolasMap.put("EPM PROF MARIA ANGELICA RIBEIRO BENJAMIN", "Aroeira");
            escolasMap.put("ETM NATALIO SALVADOR ANTUNES", "Córrego do Ouro");
            escolasMap.put("CENTRAL DE VAGAS", "Centro");
            escolasMap.put("EMEI DR JUVENTINO DA SILVA PACHECO", "Centro");
            escolasMap.put("CM TARCISIO PAES DE FIGUEIREDO", "Cachoeiros de Macaé");
            escolasMap.put("EEM FAZENDA SANTA MARIA", "Centro");
            escolasMap.put("ESCOLA MUNICIPAL DE EDUCAÇÃO INFANTIL ANA CRISTINA NUNES SILVA", "Centro");

            int count = 0;
            for (Map.Entry<String, String> entry : escolasMap.entrySet()) {

                // Se o bairro não for encontrado, ele cria o bairro para garantir que a escola seja salva
                Bairro bairroBanco = bairroRepository.findByNomeIgnoreCase(entry.getValue())
                        .orElseGet(() -> {
                            Bairro b = new Bairro();
                            b.setNome(entry.getValue());
                            return bairroRepository.save(b);
                        });

                Escola escola = Escola.builder()
                        .nome(entry.getKey())
                        .bairro(bairroBanco)
                        .build();

                escolaRepository.save(escola);
                count++;
            }

            System.out.println("✅ " + count + " escolas semeadas com sucesso, vinculadas aos seus bairros!");
        }
    }
}