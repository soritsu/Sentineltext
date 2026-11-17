import re
from dataclasses import dataclass

@dataclass(frozen=True)
class Rule:
    id: str
    category: str
    pattern: re.Pattern
    weight: int
    description: str

RULES = [
    Rule(
        "URL-001",
        "links",
        re.compile(r"""(?i)\bhttps?://[^\s<>""']+\b"""),
        15,
        "Contiene un enlace HTTP o HTTPS explícito.",
    ),
    Rule(
        "IP-001",
        "links",
        re.compile(r"""(?i)\bhttps?://(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:/[^\s<>""']*)?\b"""),
        20,
        "Contiene una URL basada en dirección IP directa (frecuente en phishing).",
    ),
    Rule(
        "URG-001",
        "urgency",
        re.compile(
            r"\b(?:urgente|urgencia|inmediatamente|ahora mismo|"
            r"última oportunidad|ultima oportunidad|último aviso|"
            r"ultimo aviso|plazo inmediato|atención urgente)\b",
            re.IGNORECASE,
        ),
        15,
        "Utiliza lenguaje de presión temporal y urgencia.",
    ),
    Rule(
        "CRED-001",
        "credentials",
        re.compile(
            r"\b(?:ingresa|introduce|envía|envia|confirma|verifica|"
            r"actualiza)\b.{0,40}\b(?:contraseña|contrasena|clave|"
            r"password|código de verificación|codigo de verificacion|"
            r"código OTP|codigo OTP|pin|datos de acceso)\b",
            re.IGNORECASE | re.DOTALL,
        ),
        25,
        "Solicita acciones sobre credenciales, claves o códigos OTP.",
    ),
    Rule(
        "PRIZE-001",
        "prize",
        re.compile(
            r"\b(?:premio|ganador|ganaste|has ganado|regalo|recompensa|sorteo)"
            r"\b.{0,80}\b(?:reclama|reclamar|cobra|cobrar|participa|"
            r"haz clic|hacer clic|reclamarlo)\b",
            re.IGNORECASE | re.DOTALL,
        ),
        15,
        "Promete un premio o recompensa vinculado a una acción de cobro o reclamo.",
    ),
    Rule(
        "MONEY-001",
        "money",
        re.compile(
            r"(?i)\b(?:Bs\.?|BOB|USD|\$|EUR|€)\s?\d+(?:[.,]\d{1,2})?\b"
        ),
        0,
        "Menciona cantidades monetarias (indicador informativo).",
    ),
    Rule(
        "STYLE-001",
        "style",
        re.compile(r"!{3,}"),
        5,
        "Emplea exclamaciones excesivas consecutivas (!{3,}).",
    ),
    Rule(
        "ACC-001",
        "account",
        re.compile(
            r"\b(?:cuenta|usuario|perfil|banco|tarjeta|servicio)"
            r"\b.{0,60}\b(?:bloqueada|bloqueado|suspendida|suspendido|"
            r"cerrada|cerrado|desactivada|desactivado|inactiva|inactivo|"
            r"requiere|necesita|debe|verifica|revisa|actualiza)\b",
            re.IGNORECASE | re.DOTALL,
        ),
        20,
        "Alerta sobre bloqueo, suspensión o revisión urgente de cuenta o servicio.",
    ),
    Rule(
        "OFFER-001",
        "offer",
        re.compile(
            r"\b(?:oferta|descuento|rebaja|promoción|promocion|bono|beneficio|"
            r"regalo|premio especial|oferta exclusiva)\b.{0,80}\b(?:hoy|"
            r"por tiempo limitado|limitado|solo hoy|última oportunidad|"
            r"ultima oportunidad|ahora mismo|urgente)\b",
            re.IGNORECASE | re.DOTALL,
        ),
        15,
        "Combina ofertas comerciales con escasez o presión de tiempo.",
    ),
    Rule(
        "CTA-001",
        "call_to_action",
        re.compile(
            r"\b(?:haz clic|haga clic|hacer clic|da clic|abre|abre el enlace|"
            r"presiona|entra|ingresa|responde|contesta|revisa)\b.{0,60}\b(?:aquí|"
            r"aca|enlace|link|sitio|pagina|página|web|mensaje)\b",
            re.IGNORECASE | re.DOTALL,
        ),
        10,
        "Incluye llamado a la acción dirigido hacia un enlace o sitio específico.",
    ),
    Rule(
        "CRYPTO-001",
        "crypto",
        re.compile(
            r"\b(?:0x[a-fA-F0-9]{40}|bc1[q0-9az]{38,58}|T[a-km-zA-HJ-NP-Z1-9]{33})\b|"
            r"\b(?:bitcoin|ethereum|usdt|criptomoneda|wallet|billetera)\b.{0,40}\b(?:envía|envia|deposita|transfiere|paga)\b",
            re.IGNORECASE | re.DOTALL,
        ),
        15,
        "Hace referencia a criptomonedas, wallets o solicita transferencias en activos digitales.",
    ),
    Rule(
        "PHONE-001",
        "contact",
        re.compile(
            r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}\b"
        ),
        5,
        "Contiene números telefónicos o de contacto directo (posible canal de estafa).",
    ),
]
