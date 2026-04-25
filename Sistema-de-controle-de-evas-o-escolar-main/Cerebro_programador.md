# 🧠 Cérebro de Programador — PNPeixoto

&gt; Janela de contexto persistente sobre padrões, erros cometidos, preferências e decisões técnicas ao longo do tempo.
&gt; Última atualização: 2026-04-22

---

## 1. Perfil Técnico

- **Stack principal:** Java 21 + Spring Boot 3 + React 19 + PostgreSQL
- **Arquitetura preferida:** Camadas (Controller → Service → Repository) com DTOs e Converters
- **Segurança:** JWT em cookie HttpOnly, Argon2, 2FA quando possível, anti-IDOR rigoroso
- **Frontend:** Vite + React Router + Axios + Tailwind CSS
- **Deploy:** Docker + VPS (Hostinger) / Render / Vercel (frontend)

---

## 2. Erros que JÁ COMETI (e nunca mais)

### ❌ `findAll()` em produção
**Quando:** Sistema de evasão escolar, 2026
**Impacto:** Carregava todos os alunos na memória. OOM em produção.
**Lição:** SEMPRE usar paginação (`Pageable`) ou queries direcionadas. Nunca confiar que "são poucos registros".

### ❌ `FetchType.EAGER` em múltiplas coleções
**Quando:** Entidade `Aluno` com 4 coleções EAGER
**Impacto:** Cartesian product, queries lentas, consumo de memória
**Lição:** Padrão é LAZY. Usar `JOIN FETCH` apenas quando necessário.

### ❌ Serviços em memória (ConcurrentHashMap)
**Quando:** Blacklist de JWT, Rate Limiting, Login Challenge
**Impacto:** Não escala horizontalmente. Memória cresce indefinidamente.
**Lição:** Estado em memória = dívida técnica. Redis desde o início para qualquer coisa distribuída.

### ❌ `ddl-auto=update` em produção
**Quando:** Deploy inicial na Hostinger
**Impacto:** Medo de alterar entidades e dropar dados
**Lição:** `validate` + Flyway/Liquibase desde o primeiro deploy.

### ❌ CORS com `allowedHeaders("*")`
**Quando:** Configuração de segurança inicial
**Impacto:** Exposição desnecessária, risco se origem for comprometida
**Lição:** Headers explícitos: `Authorization`, `Content-Type`, `X-Requested-With`.

---

## 3. Padrões que FUNCIONAM (manter)

### ✅ Autenticação em 2 etapas
- Etapa 1: valida escola → emite challenge token
- Etapa 2: valida senha individual → emite JWT
- Challenge token em cookie HttpOnly de curta duração (5min)

### ✅ Anti-IDOR em todos os endpoints
- `authUtils.pertenceAMinhaEscola()` em toda operação de escrita/leitura
- Nunca confiar no `escola` vindo do frontend

### ✅ Sanitização de input
- `InputSanitizer` com regex para XSS
- Sanitização CSV contra injection de fórmulas

### ✅ Global Exception Handler
- Nunca vazar stack trace para o cliente
- Logar erro completo no servidor
- Retornar mensagens genéricas para 500

---

## 4. Decisões de Arquitetura

| Decisão | Contexto | Alternativa rejeitada |
|---------|----------|----------------------|
| Monolito | Time de 1 dev, escopo fechado | Microserviços (overhead) |
| PostgreSQL | Dados relacionais, relatórios | MongoDB (sem necessidade) |
| Caffeine Cache | Cache local rápido, 1 instância | Redis (adicionado depois para estado) |
| PDFBox | Preenchimento de formulários PDF | Geração from scratch (mais complexo) |
| Vercel (frontend) | Deploy automático de SPA | Servir do Spring (menos eficiente) |

---

## 5. Checklist Pré-Deploy (obrigatório)

```markdown
- [ ] SAST passou (SonarQube/Semgrep)
- [ ] Testes unitários &gt; 70% cobertura
- [ ] `ddl-auto=validate`
- [ ] Secrets em variáveis de ambiente
- [ ] Headers de segurança configurados
- [ ] Rate limiting ativo
- [ ] CORS restrito
- [ ] Paginação em todas as listagens
- [ ] Logs não expõem PII
- [ ] Rollback testado