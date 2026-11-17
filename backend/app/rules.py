
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
        re.compile(r"""(?i)\bhttps?://[^\s<>"']+"""),
        15,
        "Contiene un enlace HTTP o HTTPS.",
    ),
    Rule(
        "URG-001",
        "urgency",
        re.compile(
            r"\b(?:urgente|urgencia|inmediatamente|ahora mismo|"
            r"última oportunidad|ultima oportunidad|último aviso|"
            r"ultimo aviso|plazo inmediato)\b",
            re.IGNORECASE,
        ),
        15,
        "Contiene lenguaje de urgencia.",
    ),
    Rule(
        "CRED-001",
        "credentials",
        re.compile(
            r"\b(?:ingresa|introduce|envía|envia|confirma|verifica|"
            r"actualiza)\b.{0,40}\b(?:contraseña|contrasena|clave|"
            r"password|código de verificación|codigo de verificacion|"
            r"código OTP|codigo OTP|datos de acceso)\b",
            re.IGNORECASE,
        ),
        25,
        "Solicita acciones relacionadas con credenciales o códigos.",
    ),
    Rule(
        "PRIZE-001",
        "prize",
        re.compile(
            r"\b(?:premio|ganador|ganaste|has ganado|regalo|recompensa)"
            r"\b.{0,80}\b(?:reclama|reclamar|cobra|cobrar|participa|"
            r"haz clic|hacer clic)\b",
            re.IGNORECASE | re.DOTALL,
        ),
        15,
        "Combina un premio o recompensa con una llamada a la acción.",
    ),
    Rule(
        "MONEY-001",
        "money",
        re.compile(
            r"(?i)\b(?:Bs\.?|BOB|USD|\$)\s?\d+(?:[.,]\d{1,2})?\b"
        ),
        0,
        "Menciona una cantidad monetaria; por sí sola no suma riesgo.",
    ),
    Rule(
        "STYLE-001",
        "style",
        re.compile(r"!{3,}"),
        5,
        "Contiene tres o más signos de exclamación consecutivos.",
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
        "Combina una referencia a una cuenta o servicio con un aviso de bloqueo o revisión.",
    ),
    Rule(
        "OFFER-001",
        "offer",
        re.compile(
            r"\b(?:oferta|descuento|rebaja|promoción|promocion|bono|beneficio|"
            r"regalo|premio especial|oferta especial)\b.{0,80}\b(?:hoy|"
            r"por tiempo limitado|limitado|solo hoy|última oportunidad|"
            r"ultima oportunidad|ahora mismo|urgente)\b",
            re.IGNORECASE | re.DOTALL,
        ),
        15,
        "Combina una oferta comercial con presión temporal o una ventana de oportunidad limitada.",
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
        "Pide una acción inmediata vinculada a un enlace, sitio o mensaje específico.",
    ),
    Rule(
        "IP-001",
        "links",
        re.compile(
            r"""(?i)\bhttps?://(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:/[^\s<>""']*)?\b"""
        ),
        20,
        "Contiene una URL basada en dirección IP directa (común en phishing).",
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
        "Menciona direcciones de criptomonedas o solicita transferencias en activos digitales.",
    ),
]
