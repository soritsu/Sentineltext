from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import AnalyzeRequest, AnalyzeResponse, BatchAnalyzeRequest, BatchAnalyzeResponse
from app.analyzer import analyze_text

app = FastAPI(
    title="SentinelText API",
    description="Detector de señales de riesgo en mensajes mediante regex.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/health")
def health_check():
    return {"status": "ok", "service": "SentinelText"}

@app.post("/api/v1/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest):
    return analyze_text(request.text)

@app.post("/api/v1/analyze/batch", response_model=BatchAnalyzeResponse)
def analyze_batch(request: BatchAnalyzeRequest):
    if not request.texts:
        raise HTTPException(status_code=400, detail="La lista de mensajes no puede estar vacía.")
    
    results = []
    for t in request.texts:
        cleaned = t.strip()
        if not cleaned:
            # skip or default empty analysis
            continue
        if len(cleaned) > 10_000:
            cleaned = cleaned[:10_000]
        results.append(analyze_text(cleaned))

    if not results:
        raise HTTPException(status_code=400, detail="Ningún mensaje válido para analizar.")

    total = len(results)
    avg_score = sum(r.score for r in results) / total
    high_risk = sum(1 for r in results if r.level == "high")

    return BatchAnalyzeResponse(
        results=results,
        total_analyzed=total,
        average_score=round(avg_score, 2),
        high_risk_count=high_risk,
    )
