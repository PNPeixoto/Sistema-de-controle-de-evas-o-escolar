# Cache, Redis e Rate Limit

## Cache atual

O projeto usa cache para consultas frequentes, especialmente no servico de usuarios. Um caso importante e cache por email de usuario, reduzindo leituras repetidas.

## Redis atual

Redis aparece no projeto para responsabilidades como blacklist de tokens e infraestrutura de estado compartilhado. Ele e uma boa base para evoluir controles distribuidos, mas a migracao nao foi feita no patch conservador.

## Rate limit atual

O rate limit corrigido evita confiar cegamente em `X-Forwarded-For`. Por padrao, a chave de rate limit deve vir de `request.getRemoteAddr()`.

Quando a aplicacao estiver atras de proxy confiavel, pode usar `X-Forwarded-For` apenas com configuracao explicita.

## Limite da abordagem em memoria

Rate limit em memoria funciona para uma instancia unica, mas nao e suficiente para ambiente horizontal:

- Cada instancia teria seu proprio contador.
- Um atacante poderia alternar entre instancias.
- Reinicios limpam contadores.

## Proximo passo recomendado

Criar um patch proprio para rate limit distribuido em Redis:

- Chaves com TTL atomico.
- Separacao por rota sensivel.
- Politica clara para login, recuperacao de senha e APIs administrativas.
- Metricas/logs para bloqueios.
- Testes unitarios e integracao com Redis em ambiente controlado.

