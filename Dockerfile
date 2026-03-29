# Estágio 1: Prepara o ambiente e faz o Build usando o Gradle
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app
COPY . .
RUN chmod +x gradlew
# A mágica acontece aqui: --no-daemon economiza a RAM do Render!
RUN ./gradlew build -x test --no-daemon

# Estágio 2: Cria uma imagem mais leve apenas para rodar o app
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/build/libs/*SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]