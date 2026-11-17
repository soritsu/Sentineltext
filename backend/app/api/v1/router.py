from fastapi import APIRouter, HTTPException, Response
from app.schemas import AnalyzeRequest, AnalyzeResponse, BatchAnalyzeRequest, BatchAnalyzeResponse
from app.services.analyzer import analyze_text

router = APIRouter(prefix="/api/v1", tags=["SentinelText Enterprise API"])

@router.get("/health")
def health_check(response: Response):
    response.headers["X-Service-Status"] = "Operational"
    return {
        "status": "ok",
        "service": "SentinelText Enterprise Engine",
        "version": "2.0.0",
        "architecture": "Clean Architecture / Enterprise Domain"
    }

@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_endpoint(request: AnalyzeRequest):
    return analyze_text(request.text)

@router.post("/analyze/batch", response_model=BatchAnalyzeResponse)
def batch_analyze_endpoint(request: BatchAnalyzeRequest):
    if not request.texts:
        raise HTTPException(status_code=400, detail="La lista de mensajes no puede estar vacía.")
    
    results = []
    for t in request.texts:
        cleaned = t.strip()
        if not cleaned:
            continue
        if len(cleaned) > 10_000:
            cleaned = cleaned[:10_000]
        results.append(analyze_text(cleaned))

    if not results:
        raise HTTPException(status_code=400, detail="Ningún mensaje válido para procesar en el lote.")

    total = len(results)
    avg_score = sum(r.score for r in results) / total
    high_risk = sum(1 for r in results if r.level == "high")

    return BatchAnalyzeResponse(
        results=results,
        total_analyzed=total,
        average_score=round(avg_score, 2),
        high_risk_count=high_risk,
    )
