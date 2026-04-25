# Linha do Tempo

## Inicio do projeto

O projeto e um sistema de controle de evasao escolar, com backend Spring Boot e frontend React. O dominio principal gira em torno de usuarios, escolas, registros FICAI, encaminhamentos, notificacoes, dashboards e perfis institucionais como ESCOLA, SEMED e ADMIN.

## Auditoria inicial

A auditoria priorizou riscos P0 que podiam afetar producao sem exigir reescrita:

- Criacao automatica de usuarios padrao em ambiente produtivo.
- Credenciais previsiveis em seed.
- `ddl-auto=update` aplicado como configuracao universal.
- Base URL hardcoded no frontend apontando para IP.
- SEMED podendo criar cargo administrativo alto.
- Rate limit confiando cegamente em `X-Forwarded-For`.

## Patch conservador de seguranca

Foram aplicadas correcoes pontuais:

- Seed padrao ficou restrito a `dev/test` ou property explicita.
- Seed passou a usar o `PasswordEncoder` real.
- Producao passou a usar `spring.jpa.hibernate.ddl-auto=validate`.
- Frontend passou a usar `VITE_API_URL`, com fallback apenas local em desenvolvimento.
- SEMED ficou impedido de criar ADMIN/SEMED.
- `X-Forwarded-For` so e usado quando a aplicacao esta configurada para confiar em proxy.

## Sanitizacao e qualidade

Depois do patch P0, houve uma limpeza mais ampla:

- Sanitizacao de input foi corrigida para decodificar entidades HTML antes de remover tags, protocolos e handlers.
- Auth do frontend foi separado em provider, contexto e hook.
- Tipos `any` foram reduzidos em paginas e servicos.
- Lint do frontend foi estabilizado.
- Testes de seguranca e configuracao foram adicionados.

## Integracao do design de login

O design recebido em `FICAI.zip` foi convertido para React TS com TailwindCSS. A tela preservou o fluxo real de autenticacao em duas etapas:

1. Email e senha da escola.
2. Senha individual.

As rotas `/` e `/login` apontam para a nova experiencia.

