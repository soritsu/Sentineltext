# Catálogo de Reglas y Expresiones Regulares — SentinelText

**SIS120 · Lenguajes Formales y Autómatas**

## 1. Convenciones y Motor
- **Motor**: Módulo estándar `re` de Python.
- **Formato**: Raw strings (`r"..."`).
- **Sensibilidad**: `re.IGNORECASE` para reglas no case-sensitive.

## 2. Detalle de Reglas

### URL-001 — Detección de Enlaces HTTP/HTTPS
- **Patrón**: `(?i)\bhttps?://[^\s<>"']+\b`
- **Peso**: 15 puntos.
- **Descripción**: Identifica URL explícitas que comienzan con esquemas web.

### URG-001 — Lenguaje de Urgencia
- **Patrón**: `(?i)\b(?:urgente|urgencia|inmediatamente|ahora mismo|última oportunidad|ultima oportunidad|último aviso|ultimo aviso|plazo inmediato)\b`
- **Peso**: 15 puntos.
- **Descripción**: Reconoce términos explícitos que sugieren presión temporal.

### CRED-001 — Solicitud de Credenciales
- **Patrón**: `(?i)\b(?:ingresa|introduce|envía|envia|confirma|verifica|actualiza)\b.{0,40}\b(?:contraseña|contrasena|clave|password|código de verificación|codigo de verificacion|código OTP|codigo OTP|datos de acceso)\b`
- **Peso**: 25 puntos.
- **Descripción**: Detecta solicitudes de credenciales en proximidad espacial (hasta 40 caracteres).

### PRIZE-001 — Promesa de Premio
- **Patrón**: `(?is)\b(?:premio|ganador|ganaste|has ganado|regalo|recompensa)\b.{0,80}\b(?:reclama|reclamar|cobra|cobrar|participa|haz clic|hacer clic)\b`
- **Peso**: 15 puntos.
- **Descripción**: Detecta combinación de premio con llamada a la acción en proximidad espacial (hasta 80 caracteres).

### MONEY-001 — Referencias Monetarias
- **Patrón**: `(?i)\b(?:Bs\.?|BOB|USD|\$)\s?\d+(?:[.,]\d{1,2})?\b`
- **Peso**: 0 puntos (Informativa).
- **Descripción**: Extrae montos monetarios como evidencia complementaria.

### STYLE-001 — Exceso de Exclamación
- **Patrón**: `!{3,}`
- **Peso**: 5 puntos.
- **Descripción**: Detecta tres o más signos de exclamación consecutivos.

### STYLE-002 — Proporción Elevada de Mayúsculas (Análisis Mixto)
- **Extracción**: `[^\W\d_]` con `re.UNICODE`.
- **Umbral**: Proporción $R = \frac{M}{L} \geq 0.70$ con un mínimo de $L \ge 20$ letras.
- **Peso**: 5 puntos.

### ACC-001 — Cuenta o Servicio Bloqueado
- **Patrón**: `(?is)\b(?:cuenta|usuario|perfil|banco|tarjeta|servicio)\b.{0,60}\b(?:bloqueada|bloqueado|suspendida|suspendido|cerrada|cerrado|desactivada|desactivado|inactiva|inactivo|requiere|necesita|debe|verifica|revisa|actualiza)\b`
- **Peso**: 20 puntos.
- **Descripción**: Detecta avisos de cuenta o servicio bloqueado, suspendido o que requiere revisión.

### OFFER-001 — Oferta con Presión Temporal
- **Patrón**: `(?is)\b(?:oferta|descuento|rebaja|promoción|promocion|bono|beneficio|regalo|premio especial|oferta especial)\b.{0,80}\b(?:hoy|por tiempo limitado|limitado|solo hoy|última oportunidad|ultima oportunidad|ahora mismo|urgente)\b`
- **Peso**: 15 puntos.
- **Descripción**: Detecta combinaciones de oferta y urgencia típicas de campañas agresivas.

### CTA-001 — Llamada a la Acción Directa
- **Patrón**: `(?is)\b(?:haz clic|haga clic|hacer clic|da clic|abre|abre el enlace|presiona|entra|ingresa|responde|contesta|revisa)\b.{0,60}\b(?:aquí|aca|enlace|link|sitio|pagina|página|web|mensaje)\b`
- **Peso**: 10 puntos.
- **Descripción**: Reconoce instrucciones de acción inmediatas vinculadas a enlaces o sitios web.
