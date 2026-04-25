# Proximos Passos

## Prioridade alta

- Planejar CSRF considerando cookie HTTP-only.
- Migrar rate limit sensivel para Redis em patch separado.
- Formalizar dominios permitidos de CORS por ambiente.
- Garantir `VITE_API_URL` obrigatorio em producao.
- Revisar secrets e variaveis de ambiente de deploy.

## Banco de dados

- Manter `ddl-auto=validate` em producao.
- Introduzir Flyway ou Liquibase em uma etapa futura.
- Documentar processo de migracao antes de alterar schema produtivo.

## Frontend

- Criar teste E2E para login em duas etapas.
- Revisar divisao de chunks do build se o bundle crescer.
- Padronizar estados de loading, erro e sucesso entre telas.
- Continuar removendo `any` apenas quando tocar nos arquivos.

## Observabilidade

- Adicionar correlation id.
- Criar logs de auditoria para acoes administrativas.
- Monitorar bloqueios de rate limit e falhas de login.

## Engenharia

- Manter mudancas pequenas e rastreaveis.
- Documentar decisoes de seguranca no Obsidian.
- Separar patches de seguranca, UX e arquitetura.
- Rodar testes automatizados antes de cada entrega relevante.

