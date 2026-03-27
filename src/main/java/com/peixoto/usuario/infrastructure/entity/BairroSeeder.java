package com.peixoto.usuario.infrastructure.config;

import com.peixoto.usuario.infrastructure.entity.Bairro;
import com.peixoto.usuario.infrastructure.repository.BairroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class BairroSeeder {

    @Bean
    CommandLineRunner iniciarBairrosDeMacae(BairroRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                List<String> nomesBairros = Arrays.asList(
                        "Centro", "Imbetiba", "Cavaleiros", "Praia do Pecado",
                        "Parque Aeroporto", "Lagomar", "Aroeira", "Cajueiros",
                        "Miramar", "Visconde de Araújo", "Barra de Macaé",
                        "Novo Cavaleiros", "Riviera Fluminense", "Malvinas",
                        "Botafogo", "Fronteira", "Nova Holanda", "Ajuda de Baixo",
                        "Ajuda de Cima", "Bairro da Glória", "Cabiúnas", "Campo D'Oeste",
                        "Cancela Preta", "Costa do Sol", "Engenho da Praia",
                        "Granja dos Cavaleiros", "Horto", "Imboassica",
                        "Jardim Santo Antonio", "Jardim Vitória", "Lagoa",
                        "Mirante da Lagoa", "Nova Esperança", "Novo Horizonte",
                        "Parque Atlântico", "Parque União", "Praia Campista",
                        "Sol Y Mar", "São José do Barreto", "São Marcos",
                        "Vale Encantado", "Virgem Santa", "Alto dos Cajueiros",
                        // Distritos Serranos
                        "Córrego do Ouro", "Sana", "Trapiche", "Glicério",
                        "Frade", "Cachoeiros de Macaé"
                );

                for (String nome : nomesBairros) {
                    Bairro bairro = new Bairro();
                    bairro.setNome(nome);
                    repository.save(bairro);
                }
                System.out.println("✅ " + nomesBairros.size() + " Bairros de Macaé inseridos no banco com sucesso!");
            }
        };
    }
}