# Plan de Pruebas y Matriz de Aceptación — SentinelText

**SIS120 · Lenguajes Formales y Autómatas**

## 1. Estrategia de Pruebas
El proyecto implementa un enfoque de verificación multinivel:
- **Pruebas Unitarias del Motor (`pytest`)**: Verifican el comportamiento aislado de cada regla (casos positivos, negativos y límites).
- **Pruebas de Integración de API (`TestClient`)**: Validan los códigos de estado HTTP, validaciones de Pydantic y contratos de respuesta.
- **Evaluación de Corpus Sintético (`evaluate.py`)**: Evalúa un conjunto de 12+ casos complejos para medir la exactitud del sistema.

## 2. Matriz de Aceptación
| ID Prueba | Entrada / Condición | Resultado Esperado | Estado |
|---|---|---|---|
| REG-001 | `https://example.com` | URL-001 detecta enlace y extrae índices correctos | Aprobado |
| REG-002 | `example.com` sin esquema | URL-001 no detecta coincidencia | Aprobado |
| REG-003 | `¡URGENTE!` | URG-001 detecta palabra clave | Aprobado |
| REG-005 | `Ingresa tu contraseña` | CRED-001 detecta secuencia y suma 25 pts | Aprobado |
| REG-006 | `Nunca compartas tu contraseña` | CRED-001 no activa la regla de solicitud | Aprobado |
| E2E-01 | Envío de mensaje vacío | Rechazo controlado por validación Pydantic | Aprobado |
