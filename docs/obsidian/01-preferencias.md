# Preferencias

## Forma de trabalhar

- Preferir patches pequenos, conservadores e de alta confianca.
- Preservar o funcionamento atual quando o objetivo for hardening de seguranca.
- Evitar refatoracao de arquitetura sem necessidade clara.
- Corrigir primeiro riscos P0 menos invasivos.
- Fazer testes automatizados quando a mudanca altera comportamento ou politica de seguranca.
- Rodar validacoes relevantes: testes Gradle, build frontend e lint quando o frontend for alterado.

## Escopo que deve ser tratado com cuidado

- CSRF ainda nao deve ser mexido sem planejamento.
- Redis/rate limit distribuido ainda nao deve ser migrado em patch pequeno.
- Paginacao e fluxos SEMED pesados devem ficar para etapa propria.
- Rotas publicas nao devem ser alteradas sem necessidade.
- Mudancas de seguranca devem documentar risco residual.

## Preferencias de frontend

- React com TypeScript.
- Vite como build tool.
- TailwindCSS para estilo.
- Integrar designs existentes sem perder o fluxo real da aplicacao.
- Evitar landing page quando o pedido for uma tela funcional.

## Preferencias de documentacao

- Arquivos Markdown pequenos, linkaveis no Obsidian.
- Contexto historico junto com decisoes tecnicas.
- Separar notas por tema: seguranca, arquitetura, cache, logs, codigo limpo, testes e proximos passos.

