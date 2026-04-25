# Testes e Validacao

## Backend

Testes automatizados adicionados ou ajustados cobrem:

- Profile `prod` nao cria usuario default.
- Configuracao de `ddl-auto` segura por profile.
- SEMED tentando criar ADMIN retorna erro.
- Spoof simples de `X-Forwarded-For` nao burla rate limit por padrao.
- Sanitizacao de input remove payloads perigosos mesmo codificados.
- Handler de acesso negado retorna 403.

Comando usado:

```powershell
$env:GRADLE_USER_HOME='/tmp/gradle-home'; ./gradlew test
```

Resultado observado anteriormente: testes Gradle passaram.

## Frontend

Comandos usados:

```powershell
npm --prefix frontend run lint
npm --prefix frontend run build
```

Resultado observado anteriormente:

- Lint passou.
- Build passou.
- Vite emitiu apenas aviso de chunk grande, sem falhar build.

## Estrategia

Para mudancas de seguranca, preferir testes pequenos que comprovem a politica:

- Um teste para o comportamento proibido.
- Um teste para o comportamento permitido quando necessario.
- Evitar testes fragilmente acoplados a detalhes visuais ou internos.

## Lacunas

- Ainda falta teste E2E real do login em duas etapas.
- Falta teste de CORS/producao com dominio real.
- Falta validacao distribuida de rate limit com Redis.
- Falta pipeline CI documentado nesta base.

