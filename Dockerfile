# Estágio 1: Prepara o ambiente e faz o Build usando o Gradle
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app
COPY . .
RUN chmod +x gradlew

# A ULTIMA CARTADA: Trava a memória do Gradle em 256MB e desativa o daemon
RUN ./gradlew build -x test --no-daemon -Dorg.gradle.jvmargs="-Xmx256m"

# Estágio 2: Cria uma imagem mais leve apenas para rodar o app
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/build/libs/*SNAPSHOT.jar app.jar

# Libera a porta 8080 (padrão do Spring Boot)
EXPOSE 8080

# Comando para iniciar o servidor
ENTRYPOINT ["java", "-jar", "app.jar"]