# Documento de Requisitos del Software (SRS) — SentinelText

**SIS120 · Lenguajes Formales y Autómatas**

## 1. Propósito y Alcance
SentinelText es un sistema de análisis léxico orientado a detectar señales de riesgo en mensajes de texto mediante expresiones regulares, evaluando su contenido de forma heurística y determinista.

## 2. Requisitos Funcionales (RF)
| ID | Descripción | Prioridad |
|---|---|---|
| RF-01 | Permitir introducir un mensaje de texto y solicitar el análisis. | P0 |
| RF-02 | Rechazar entradas vacías o formadas solo por espacios. | P0 |
| RF-03 | Limitar la longitud del mensaje a 10.000 caracteres. | P0 |
| RF-04 | Ejecutar todas las reglas habilitadas del catálogo. | P0 |
| RF-05 | Registrar coincidencias, categorías y posiciones (índices `start` y `end`). | P0 |
| RF-06 | Calcular puntuación heurística determinista entre 0 y 100. | P0 |
| RF-07 | Asignar nivel de riesgo (`low`, `medium`, `high`) según umbrales. | P0 |
| RF-08 | Explicar las señales detectadas con un descargo de responsabilidad. | P0 |
| RF-09 | Exponer endpoints REST en FastAPI (`/health`, `/analyze`, `/analyze/batch`). | P0 |
| RF-10 | Interfaz web interactiva en React + TypeScript con resaltado de coincidencias y exportación CSV. | P1 |

## 3. Requisitos No Funcionales (RNF)
| ID | Criterio Verificable |
|---|---|
| RNF-01 | **Rendimiento**: Procesamiento inferior a 500 ms por mensaje de hasta 10.000 caracteres. |
| RNF-02 | **Privacidad**: Cero persistencia en bases de datos y no transmisión a terceros. |
| RNF-03 | **Seguridad**: Tratamiento del texto exclusivamente como datos; no ejecución ni apertura automática de URL. |
| RNF-04 | **Mantenibilidad**: Desacoplamiento estricto entre API REST, motor de análisis léxico y catálogo de reglas. |
