# Estágio 1: Prepara o ambiente e faz o Build usando o Gradle (Agora com Java 21!)
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
RUN chmod +x gradlew

# Compila o projeto travando a memória para não estourar o limite do Render
RUN ./gradlew build -x test --no-daemon -Dorg.gradle.jvmargs="-Xmx256m"

# Estágio 2: Cria uma imagem mais leve apenas para rodar o app (Java 21)
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/*SNAPSHOT.jar app.jar

# Libera a porta 8080 (padrão do Spring Boot)
EXPOSE 8080

# Comando para iniciar o servidor
ENTRYPOINT ["java", "-jar", "app.jar"]