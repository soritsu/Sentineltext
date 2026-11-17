import time
import re
from app.rules.catalog import RULES, Rule
from app.schemas import AnalyzeResponse, MatchResult

DISCLAIMER = (
    "Análisis Heurístico Avanzado: Las señales detectadas son indicios textuales "
    "y no constituyen una certificación formal de fraude o ciberataque."
)

def analyze_text(text: str, db=None) -> AnalyzeResponse:
    start_time = time.time()
    matches: list[MatchResult] = []
    activated_rules: set[str] = set()

    for rule in RULES:
        for found in rule.pattern.finditer(text):
            start = found.start()
            end = found.end()
            matched_text = found.group()

            if rule.id == "URL-001" or rule.id == "IP-001":
                matched_text = matched_text.rstrip(".,;:!?)]}")
                end = start + len(matched_text)

            if not matched_text:
                continue

            matches.append(
                MatchResult(
                    rule_id=rule.id,
                    category=rule.category,
                    matched_text=matched_text,
                    start=start,
                    end=end,
                    description=rule.description,
                )
            )
            activated_rules.add(rule.id)

    # Style Rule 002: Uppercase ratio
    letters = re.findall(r"[^\W\d_]", text, flags=re.UNICODE)
    if len(letters) >= 20:
        uppercase_count = sum(letter.isupper() for letter in letters)
        if uppercase_count / len(letters) >= 0.70:
            matches.append(
                MatchResult(
                    rule_id="STYLE-002",
                    category="style",
                    matched_text="".join(letters),
                    start=0,
                    end=len(text),
                    description="El 70% o más de los caracteres alfabéticos están en mayúsculas.",
                )
            )
            activated_rules.add("STYLE-002")

    style_weight = 5 if "STYLE-002" in activated_rules else 0

    score = min(
        100,
        sum(rule.weight for rule in RULES if rule.id in activated_rules) + style_weight
    )

    if score >= 50:
        level = "high"
    elif score >= 25:
        level = "medium"
    else:
        level = "low"

    matches.sort(key=lambda m: (m.start, m.end, m.rule_id))

    return AnalyzeResponse(
        score=score,
        level=level,
        matches=matches,
        disclaimer=DISCLAIMER,
    )
