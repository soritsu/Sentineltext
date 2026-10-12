
from app.analyzer import analyze_text


def test_detects_url_and_correct_positions():
    text = "Visita https://example.com ahora"
    result = analyze_text(text)

    url_match = next(m for m in result.matches if m.rule_id == "URL-001")

    assert url_match.matched_text == "https://example.com"
    assert text[url_match.start:url_match.end] == url_match.matched_text


def test_detects_credential_request():
    result = analyze_text("Ingresa tu contraseña para continuar")

    assert any(m.rule_id == "CRED-001" for m in result.matches)
    assert result.score >= 25


def test_negated_password_message_does_not_match_credential_rule():
    result = analyze_text("Nunca compartas tu contraseña")

    assert not any(m.rule_id == "CRED-001" for m in result.matches)


def test_money_alone_does_not_increase_score():
    result = analyze_text("El precio es Bs 250")

    assert any(m.rule_id == "MONEY-001" for m in result.matches)
    assert result.score == 0
    assert result.level == "low"


def test_repeated_rule_counts_once():
    result = analyze_text(
        "Urgente. Es urgente. Última oportunidad."
    )

    assert result.score == 15


def test_three_exclamation_marks():
    result = analyze_text("Mira esto!!!")

    assert any(m.rule_id == "STYLE-001" for m in result.matches)
    assert result.score == 5


def test_empty_text_is_rejected_by_request_model():
    import pytest
    from pydantic import ValidationError
    from app.schemas import AnalyzeRequest

    with pytest.raises(ValidationError):
        AnalyzeRequest(text="   ")


def test_batch_analyze_endpoint():
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)
    response = client.post(
        "/api/v1/analyze/batch",
        json={"texts": ["Hola normal", "URGENTE: entra a https://example.com"]}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["total_analyzed"] == 2
    assert "results" in data
    assert "average_score" in data
