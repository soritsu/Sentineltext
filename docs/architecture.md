# Arquitectura del Sistema — SentinelText

**SIS120 · Lenguajes Formales y Autómatas**

## 1. Arquitectura General
SentinelText adopta una arquitectura de cliente-servidor desacoplada:
- **Backend**: Desarrollado en **Python + FastAPI**. Encapsula la validación de esquemas (Pydantic), el motor de expresiones regulares y el cálculo heurístico de puntuaciones.
- **Frontend**: Desarrollado en **React + TypeScript + Vite**. Consume la API REST mediante JSON, proporcionando una interfaz moderna, interactiva y con resaltado de evidencias.

## 2. Flujo de Datos
1. El usuario introduce un mensaje en el formulario web del Frontend.
2. El Frontend envía una petición HTTP POST a `/api/v1/analyze` con la estructura `{ "text": "..." }`.
3. FastAPI valida la entrada mediante Pydantic (controlando cadenas vacías y límite de 10.000 caracteres).
4. El servicio de análisis recorre el catálogo de reglas `RULES` aplicando `finditer` sobre el texto original.
5. Se calcula la puntuación determinista $S = \min\left(100, \sum w_r\right)$ y se asigna el nivel de riesgo (`low`, `medium`, `high`).
6. El backend responde con el contrato JSON estructurado, el cual es renderizado en la interfaz con tarjetas de evidencias y resaltado visual.
