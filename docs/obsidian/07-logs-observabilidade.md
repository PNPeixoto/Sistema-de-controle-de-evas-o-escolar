# Logs e Observabilidade

## Estado atual

Ja houve substituicao de saidas diretas por logger no fluxo de inicializacao. O handler global tambem ajuda a padronizar respostas para erros inesperados e acesso negado.

## O que deve ser logado

Eventos relevantes:

- Falhas repetidas de login.
- Bloqueios de rate limit.
- Tentativa de criar cargo administrativo sem permissao.
- Ativacao de seed controlado.
- Erros inesperados em endpoints publicos.
- Logout e blacklist de token quando aplicavel.

## O que nao deve ser logado

- Senhas.
- Tokens JWT completos.
- Cookies.
- Dados pessoais em excesso.
- Payloads completos de formularios sensiveis.

## Melhorias recomendadas

- Adicionar correlation id por request.
- Padronizar nivel de log: `info`, `warn`, `error`.
- Criar logs de auditoria para acoes administrativas.
- Separar erro tecnico de mensagem exibida ao usuario.
- Produzir metricas para rate limit, login e erros 5xx.

## Objetivo

Logs devem ajudar a diagnosticar problemas e investigar incidentes sem expor dados sensiveis.

