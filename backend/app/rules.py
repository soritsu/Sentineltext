
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
]
