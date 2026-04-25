# Arquitetura

## Visao geral

O sistema tem duas partes principais:

- Backend Spring Boot, responsavel por autenticacao, regras de negocio, persistencia e APIs.
- Frontend React/Vite/TailwindCSS, responsavel pela experiencia web e consumo da API.

## Backend

Camadas observadas:

- Controllers para expor endpoints HTTP.
- Services para regra de negocio.
- Repositories Spring Data para acesso ao banco.
- Entities/JPA para modelo persistido.
- Security para JWT, filtros, autorizacao e logout.
- Configuracoes por profile para separar dev, test e prod.

## Frontend

Estrutura principal:

- `pages` para telas.
- `components` para componentes compartilhados.
- `services/api.ts` para cliente HTTP.
- `hooks` e contexto para autenticacao.
- TailwindCSS para layout e estilos.

## Autenticacao

O login atual usa duas etapas:

- Etapa 1: email + senha da escola.
- Etapa 2: senha individual.

O backend retorna/usa cookie HTTP-only de autenticacao, e o frontend mantem `withCredentials: true` no Axios.

## Perfis e autorizacao

Perfis importantes:

- ADMIN: permissao administrativa alta.
- SEMED: perfil institucional com poder elevado, mas nao equivalente a ADMIN.
- ESCOLA e outros perfis operacionais.

Politica aplicada: apenas ADMIN deve poder criar usuarios ADMIN ou SEMED.

## Ambientes

Configuracao segura por profile:

- `dev`: pode usar `ddl-auto=update` para produtividade local.
- `test`: pode usar `create-drop` para isolamento de testes.
- `prod`: deve usar `validate`, evitando alteracao automatica de schema em producao.

