# Testing Strategy

## Niveles de testing

1. Unit tests (`tests/unit`):
- Validan componentes y funciones puras en aislamiento.
- Cubren validaciones, estados de error, edge cases y seguridad de input.

2. Integration tests (`tests/integration`):
- Verifican integración entre capa de dominio y servicios externos.
- Mocking controlado de APIs/autenticación/tokens sin usar secretos reales.

3. E2E tests (`tests/e2e`):
- Validan flujos críticos reales desde la UI con navegador.
- Comprueban que el usuario pueda navegar y ejecutar acciones clave.

## Principios de calidad

- TypeScript estricto, sin `any`.
- Aislamiento por capa (UI, dominio, servicios).
- Cobertura mínima 80% global y 90% en módulos críticos de auth.
- Casos inválidos incluidos: XSS, SQL injection-like payloads, formato incorrecto.
