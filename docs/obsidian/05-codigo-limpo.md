# Codigo Limpo

## Padroes que guiaram as mudancas

- Diff pequeno quando o objetivo for corrigir risco de seguranca.
- Sem refatorar arquitetura durante patch P0.
- Preferir APIs reais da aplicacao, como `PasswordEncoder`, em vez de atalhos.
- Manter comportamento existente quando a mudanca for de hardening.
- Criar testes focados no comportamento corrigido.

## Frontend

Melhorias ja feitas:

- Contexto de autenticacao separado do hook.
- `useAuth` exposto por arquivo proprio.
- Cliente Axios centralizado em `services/api.ts`.
- Tratamento de erros HTTP com tipos mais explicitos.
- Login convertido para React TS com TailwindCSS.
- Lint estabilizado sem refatoracao visual desnecessaria.

## Backend

Melhorias ja feitas:

- Seed de dados condicionado por profile/property.
- Logs via logger em vez de `System.out`.
- Handler global para acesso negado.
- Sanitizacao de input testada.
- Politica de criacao de usuarios administrativos validada por teste.

## Cuidados futuros

- Evitar crescer controllers com regra de negocio.
- Centralizar politicas de autorizacao quando elas se repetirem.
- Evitar `any` no frontend.
- Evitar constantes de ambiente hardcoded.
- Documentar decisoes que alterem seguranca ou deploy.

