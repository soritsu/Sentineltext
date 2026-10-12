# SentinelText — Detector Léxico de Riesgos en Mensajes

**SIS120 · Lenguajes Formales y Autómatas**  
Proyecto individual de 14 días (Sprint MVP exprés).

## Arquitectura y Tecnologías
- **Backend**: Python 3.14 + FastAPI + Pydantic (Motor de expresiones regulares `re`).
- **Frontend**: React + Vite + TypeScript.
- **Pruebas**: `pytest` y `TestClient` de FastAPI.

---

## Instrucciones de Instalación y Ejecución

### 1. Iniciar el Backend (FastAPI)
Abre una terminal y dirígete a la carpeta `backend`:
```bash
cd backend
```

Activa el entorno virtual (`.venv`):
```bash
# En Windows PowerShell
.venv\Scripts\Activate
```

Ejecuta el servidor con Uvicorn:
```bash
uvicorn app.main:app --reload --port 8000
```
La API estará disponible en `http://localhost:8000` (Documentación Swagger en `http://localhost:8000/docs`).

Para ejecutar las pruebas automatizadas del backend:
```bash
pytest
```

---

### 2. Iniciar el Frontend (React + TypeScript)
Abre una **segunda terminal** y dirígete a la carpeta `frontend`:
```bash
cd frontend
```

Instala las dependencias:
```bash
npm install
```

Inicia el servidor de desarrollo:
```bash
npm run dev
```
La interfaz web estará disponible en `http://localhost:5173`.

---

## Catálogo de Reglas Implementadas
1. **URL-001** (Enlaces HTTP/HTTPS): Detecta URLs explícitas.
2. **URG-001** (Urgencia): Reconoce presión temporal (*urgente, inmediatamente, etc.*).
3. **CRED-001** (Credenciales): Detecta peticiones de claves y datos de acceso en proximidad.
4. **PRIZE-001** (Premios): Identifica promesas de premios combinadas con llamadas a la acción.
5. **MONEY-001** (Dinero - Informativa): Reconoce montos monetarios (Bs, USD, $).
6. **STYLE-001** (Exclamación excesiva): Detecta 3 o más signos de exclamación consecutivos (`!{3,}`).
7. **STYLE-002** (Mayúsculas excesivas): Análisis mixto para detectar proporción $\geq 70\%$ de mayúsculas (mín. 20 letras).

---

## Repositorio y Acceso desde Otro Dispositivo (Git & GitHub)

Para subir este proyecto a un repositorio remoto (como GitHub) y poder clonarlo en otro dispositivo:

1. **Inicializar y subir al repositorio remoto**:
   ```bash
   git init
   git add .
   git commit -m "feat: SentinelText MVP completo con backend FastAPI y frontend React + TS (P0 y P1)"
   git branch -M main
   git remote add origin <URL_DE_TU_REPOSITORIO_GITHUB>
   git push -u origin main
   ```

2. **Clonar y ejecutar en otro dispositivo**:
   ```bash
   git clone <URL_DE_TU_REPOSITORIO_GITHUB>
   cd sentineltext
   ```
   - Sigue las instrucciones de la sección anterior para levantar el backend (`cd backend && uvicorn app.main:app --reload`) y el frontend (`cd frontend && npm install && npm run dev`).

