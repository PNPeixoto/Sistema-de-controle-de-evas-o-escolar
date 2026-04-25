# Auditoria de seguranca e engenharia

Data: 2026-04-24

## Escopo executado

- Revisao local de codigo backend Spring Boot e frontend React/Vite.
- Testes automatizados de hardening integrados a suite Gradle.
- Limpeza de lint/type-check do frontend sem alterar fluxo visual.
- Pentest estatico dos controles ja presentes: seed, ddl-auto, rate limit, X-Forwarded-For, cargos administrativos, sanitizacao XSS e configuracao de API.

## Correcoes aplicadas

- Seed de usuarios default restrito a `dev/test` e usando `PasswordEncoder` real.
- `ddl-auto=update` removido da configuracao universal; producao usa `validate`.
- Frontend usa `VITE_API_URL`, sem IP hardcoded, mantendo `withCredentials`.
- SEMED nao pode criar `ADMIN` nem `SEMED`; ADMIN pode criar cargo administrativo.
- `X-Forwarded-For` so e usado quando `app.security.trust-forwarded-headers=true`.
- Sanitizador XSS decodifica entidades HTML antes de remover tags, scripts, `javascript:` e event handlers.
- Lint frontend zerado com tipagem explicita e separacao de `AuthProvider`, contexto e hook.
- `System.out` de seed substituido por logger.

## Testes adicionados

- Profile `prod` nao registra seed de usuarios default.
- Configuracao universal nao contem `ddl-auto=update` e `prod` contem `validate`.
- `trust-forwarded-headers` e falso por padrao.
- SEMED nao cria `ADMIN`/`SEMED`; ADMIN cria `SEMED`.
- Spoof simples de `X-Forwarded-For` nao burla rate limit por padrao.
- Sanitizacao remove script codificado, protocolo `javascript:` e event handlers.

## Riscos residuais

- CSRF ainda esta desabilitado; cookies HttpOnly com `withCredentials` exigem protecao CSRF antes de producao sensivel.
- Rate limit e challenge de login continuam em memoria; em ambiente com multiplas instancias precisam de armazenamento compartilhado.
- Redis e obrigatorio para blacklist real de logout em runtime; testes usam mock.
- CORS segue com lista fixa de origens; ideal externalizar por profile/env.
- Nao ha migracoes versionadas de schema; `validate` evita mutacao em prod, mas exige processo de migracao fora da aplicacao.
- Auditoria foi estatica/local. Nao houve teste contra infraestrutura real, WAF, TLS, headers do proxy, dominio ou banco de producao.
