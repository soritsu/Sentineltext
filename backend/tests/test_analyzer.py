import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.analyzer import analyze_text
from app.schemas import AnalyzeRequest
from pydantic import ValidationError

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == "2.0.0"

def test_detects_url_and_ip():
    result = analyze_text("Visita http://192.168.1.1/login o https://example.com")
    assert any(m.rule_id == "IP-001" for m in result.matches)
    assert any(m.rule_id == "URL-001" for m in result.matches)

def test_detects_crypto_and_credentials():
    result = analyze_text("Ingresa tu contraseña y transfiere a 0x71C04391501997d917173bF91219b16D8e9e4368")
    assert any(m.rule_id == "CRED-001" for m in result.matches)
    assert any(m.rule_id == "CRYPTO-001" for m in result.matches)
    assert result.score >= 40

def test_empty_text_validation():
    with pytest.raises(ValidationError):
        AnalyzeRequest(text="   ")

def test_batch_endpoint():
    response = client.post(
        "/api/v1/analyze/batch",
        json={"texts": ["Hola normal", "URGENTE: cuenta bloqueada en http://10.0.0.1"]}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_analyzed"] == 2
    assert data["high_risk_count"] >= 1
