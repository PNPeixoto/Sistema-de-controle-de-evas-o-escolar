# Frontend Login

## Origem

O design veio do arquivo `FICAI.zip`, contendo uma tela HTML e assets visuais. A implementacao foi integrada ao frontend real em React TS com TailwindCSS.

## Arquivos principais

- `frontend/src/pages/Login/index.tsx`
- `frontend/src/App.tsx`
- `frontend/src/index.css`
- `frontend/public/login-logo-prefeitura.png`
- `frontend/public/login-logo-ceduc.png`

## Fluxo preservado

A tela nova manteve o fluxo de autenticacao existente:

1. Usuario informa email e senha da escola.
2. Backend valida a primeira etapa.
3. Usuario informa senha individual.
4. Backend conclui login.
5. Frontend chama o contexto de autenticacao e redireciona para dashboard.

## Rotas

- `/` abre a tela de login.
- `/login` tambem abre a tela de login.

## Cuidados de producao

- `VITE_API_URL` precisa apontar para dominio HTTPS valido.
- `withCredentials: true` deve ser preservado para cookie HTTP-only.
- CORS do backend precisa permitir o dominio real do frontend.

## Validacoes realizadas

- Lint do frontend passou.
- Build do frontend passou.
- Servidor Vite local respondeu em `/` e `/login`.

