
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class AnalyzeRequest(BaseModel):
    text: str = Field(max_length=10_000)

    @field_validator("text")
    @classmethod
    def text_must_not_be_empty(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("El mensaje no puede estar vacío.")
        return value


class MatchResult(BaseModel):
    rule_id: str
    category: str
    matched_text: str
    start: int
    end: int
    description: str


class AnalyzeResponse(BaseModel):
    score: int = Field(ge=0, le=100)
    level: Literal["low", "medium", "high"]
    matches: list[MatchResult]
    disclaimer: str


class BatchAnalyzeRequest(BaseModel):
    texts: list[str] = Field(max_length=20)


class BatchAnalyzeResponse(BaseModel):
    results: list[AnalyzeResponse]
    total_analyzed: int
    average_score: float
    high_risk_count: int
