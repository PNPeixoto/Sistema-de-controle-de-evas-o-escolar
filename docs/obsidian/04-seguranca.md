# Seguranca

## Correcoes ja aplicadas

- Producao nao cria usuario default automaticamente.
- Seed controlado usa o `PasswordEncoder` real da aplicacao.
- Configuracao universal `ddl-auto=update` foi removida.
- Producao usa `ddl-auto=validate`.
- Frontend nao usa mais IP hardcoded como base URL.
- SEMED nao pode criar ADMIN/SEMED.
- `X-Forwarded-For` nao e confiado por padrao.
- Spoof simples de `X-Forwarded-For` nao deve burlar rate limit.
- `AccessDeniedException` passa a retornar 403 de forma explicita.
- Sanitizacao de input foi fortalecida contra payloads HTML codificados.

## Politica atual de proxy

`X-Forwarded-For` so deve ser usado quando existir configuracao explicita de confianca em proxy. Sem isso, a aplicacao deve usar `request.getRemoteAddr()`.

Essa decisao evita que um cliente externo escolha livremente o IP usado pelo rate limit.

## Riscos residuais

- CSRF ainda precisa de uma decisao propria, especialmente por haver cookie HTTP-only.
- Rate limit em memoria nao protege bem ambiente com multiplas instancias.
- Redis existe no projeto, mas a migracao do rate limit para Redis foi adiada.
- Falta uma estrategia formal de migracao de banco como Flyway ou Liquibase.
- CORS e dominios de producao devem ser revisados antes do deploy definitivo.
- `VITE_API_URL` em producao precisa apontar para dominio HTTPS valido, nao IP cru.

## Principio para proximas mudancas

Mudancas de seguranca devem ser pequenas, testadas e com risco residual documentado. Alteracoes estruturais como CSRF, Redis distribuido e migracao de schema merecem PRs proprios.

