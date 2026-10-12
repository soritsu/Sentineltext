import { useState, useEffect } from 'react'
import './App.css'

interface MatchResult {
  rule_id: string
  category: string
  matched_text: string
  start: number
  end: number
  description: string
}

interface AnalyzeResponse {
  score: number
  level: 'low' | 'medium' | 'high'
  matches: MatchResult[]
  disclaimer: string
}

interface BatchAnalyzeResponse {
  results: AnalyzeResponse[]
  total_analyzed: number
  average_score: number
  high_risk_count: number
}

const EXAMPLE_MESSAGES = [
  {
    label: 'Alerta Phishing (Alto)',
    text: 'URGENTE: Tu cuenta ha sido bloqueada. Ingresa tu contraseña inmediatamente en https://example.com/login y reclama tu premio ahora mismo!!!!',
  },
  {
    label: 'Solicitud de Credenciales (Medio)',
    text: 'Estimado usuario, por favor verifica tu clave de acceso ingresando al sistema.',
  },
  {
    label: 'Referencia Monetaria (Bajo)',
    text: 'El servicio técnico tiene un costo de Bs 150 para la revisión.',
  },
  {
    label: 'Mensaje Normal (Limpio)',
    text: 'Hola profesor, le envío el resumen del proyecto de lenguajes formales para la clase de mañana.',
  },
]

function App() {
  const [mode, setMode] = useState<'single' | 'batch'>('single')
  const [text, setText] = useState('')
  const [batchTexts, setBatchTexts] = useState('URGENTE: entra a https://example.com\nHola profesor\nIngresa tu clave de acceso')
  
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [batchResult, setBatchResult] = useState<BatchAnalyzeResponse | null>(null)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [backendStatus, setBackendStatus] = useState<string>('Verificando...')

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/health')
      .then((res) => res.json())
      .then((data) => setBackendStatus(data.status === 'ok' ? 'Conectado (Online)' : 'Estado desconocido'))
      .catch(() => setBackendStatus('Desconectado (Asegure backend en :8000)'))
  }, [])

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!text.trim()) {
      setError('El mensaje no puede estar vacío.')
      return
    }
    if (text.length > 10000) {
      setError('El mensaje supera el límite de 10.000 caracteres.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('http://localhost:8000/api/v1/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || `Error HTTP: ${response.status}`)
      }

      const data: AnalyzeResponse = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  const handleBatchAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    const lines = batchTexts.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)
    if (lines.length === 0) {
      setError('Debe ingresar al menos un mensaje válido.')
      return
    }
    if (lines.length > 20) {
      setError('Máximo 20 mensajes por lote.')
      return
    }

    setLoading(true)
    setError(null)
    setBatchResult(null)

    try {
      const response = await fetch('http://localhost:8000/api/v1/analyze/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: lines }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || `Error HTTP: ${response.status}`)
      }

      const data: BatchAnalyzeResponse = await response.json()
      setBatchResult(data)
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!result) return
    const headers = 'rule_id,category,matched_text,start,end,description\n'
    const rows = result.matches
      .map(
        (m) =>
          `"${m.rule_id}","${m.category}","${m.matched_text.replace(/"/g, '""')}",${m.start},${m.end},"${m.description.replace(/"/g, '""')}"`
      )
      .join('\n')

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `sentineltext_report_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getLevelBadge = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return <span className="badge badge-low">Riesgo Bajo (0-24)</span>
      case 'medium':
        return <span className="badge badge-medium">Riesgo Medio (25-49)</span>
      case 'high':
        return <span className="badge badge-high">Riesgo Alto (50-100)</span>
    }
  }

  // Render text with highlighted matches
  const renderHighlightedText = (originalText: string, matches: MatchResult[]) => {
    if (!matches || matches.length === 0) return <span>{originalText}</span>

    // Sort matches by start index
    const sorted = [...matches].sort((a, b) => a.start - b.start)
    const parts = []
    let lastIndex = 0

    sorted.forEach((m, idx) => {
      if (m.start > lastIndex) {
        parts.push(<span key={`text-${idx}`}>{originalText.substring(lastIndex, m.start)}</span>)
      }
      parts.push(
        <mark key={`match-${idx}`} className="highlight-match" title={`Regla: ${m.rule_id}`}>
          {originalText.substring(m.start, m.end)}
        </mark>
      )
      lastIndex = Math.max(lastIndex, m.end)
    })

    if (lastIndex < originalText.length) {
      parts.push(<span key="text-end">{originalText.substring(lastIndex)}</span>)
    }

    return <div className="highlighted-box">{parts}</div>
  }

  return (
    <div className="container">
      <header className="header">
        <div className="badge-status">API Backend: {backendStatus}</div>
        <h1>SentinelText</h1>
        <p className="subtitle">
          Detector léxico de señales de riesgo en mensajes mediante expresiones regulares (SIS120)
        </p>
        <div className="mode-tabs">
          <button
            type="button"
            className={`tab-btn ${mode === 'single' ? 'active' : ''}`}
            onClick={() => { setMode('single'); setError(null); }}
          >
            Análisis Individual
          </button>
          <button
            type="button"
            className={`tab-btn ${mode === 'batch' ? 'active' : ''}`}
            onClick={() => { setMode('batch'); setError(null); }}
          >
            Análisis por Lote (P1)
          </button>
        </div>
      </header>

      <main className="main-content">
        {mode === 'single' ? (
          <>
            <div className="card input-card">
              <h2>Analizar Mensaje</h2>
              <div className="examples-bar">
                <span>Ejemplos rápidos:</span>
                {EXAMPLE_MESSAGES.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="btn-example"
                    onClick={() => {
                      setText(ex.text)
                      setError(null)
                    }}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAnalyze}>
                <div className="textarea-wrapper">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Escribe o pega aquí el mensaje que deseas analizar (máx. 10.000 caracteres)..."
                    rows={6}
                    maxLength={10000}
                  />
                  <div className="char-counter">{text.length} / 10,000</div>
                </div>

                {error && <div className="error-message">Error: {error}</div>}

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Analizando...' : 'Analizar Mensaje'}
                </button>
              </form>
            </div>

            {result && (
              <div className="card results-card">
                <div className="results-top-bar">
                  <h2>Resultados del Análisis</h2>
                  <button type="button" className="btn-secondary" onClick={exportToCSV}>
                    Exportar CSV
                  </button>
                </div>

                <div className="results-summary">
                  <div className="score-box">
                    <span className="score-number">{result.score}</span>
                    <span className="score-max">/ 100</span>
                    <div className="score-label">Puntuación Heurística</div>
                  </div>
                  <div className="level-box">
                    {getLevelBadge(result.level)}
                    <p className="disclaimer">{result.disclaimer}</p>
                  </div>
                </div>

                <div className="highlight-section">
                  <h3>Texto con Coincidencias Resaltadas</h3>
                  {renderHighlightedText(text, result.matches)}
                </div>

                <div className="matches-section">
                  <h3>Señales y Evidencias Detectadas ({result.matches.length})</h3>
                  {result.matches.length === 0 ? (
                    <p className="no-matches">No se detectaron señales de riesgo en este texto.</p>
                  ) : (
                    <div className="matches-list">
                      {result.matches.map((match, idx) => (
                        <div key={idx} className="match-item">
                          <div className="match-header">
                            <span className="rule-badge">{match.rule_id}</span>
                            <span className="category-badge">{match.category}</span>
                            <span className="positions">
                              [{match.start} - {match.end}]
                            </span>
                          </div>
                          <div className="matched-text">
                            <strong>Fragmento:</strong> "{match.matched_text}"
                          </div>
                          <div className="match-desc">{match.description}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="card input-card">
            <h2>Análisis por Lote de Mensajes</h2>
            <p className="subtitle" style={{ marginBottom: '16px' }}>
              Introduce un mensaje por línea (máximo 20 mensajes).
            </p>

            <form onSubmit={handleBatchAnalyze}>
              <div className="textarea-wrapper">
                <textarea
                  value={batchTexts}
                  onChange={(e) => setBatchTexts(e.target.value)}
                  placeholder="Mensaje 1&#10;Mensaje 2&#10;Mensaje 3..."
                  rows={8}
                />
              </div>

              {error && <div className="error-message">Error: {error}</div>}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Analizando Lote...' : 'Analizar Lote'}
              </button>
            </form>

            {batchResult && (
              <div className="batch-results" style={{ marginTop: '24px' }}>
                <h3>Resumen del Lote</h3>
                <div className="batch-stats">
                  <div className="stat-box">
                    <span className="stat-value">{batchResult.total_analyzed}</span>
                    <span className="stat-label">Analizados</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">{batchResult.average_score}</span>
                    <span className="stat-label">Punt. Promedio</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">{batchResult.high_risk_count}</span>
                    <span className="stat-label">Riesgo Alto</span>
                  </div>
                </div>

                <div className="matches-list" style={{ marginTop: '20px' }}>
                  {batchResult.results.map((res, i) => (
                    <div key={i} className="match-item">
                      <div className="match-header">
                        <span className="rule-badge"># {i + 1}</span>
                        {getLevelBadge(res.level)}
                        <span className="positions">Puntuación: {res.score}/100</span>
                      </div>
                      <div className="match-desc">
                        Coincidencias encontradas: {res.matches.length}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>SentinelText · Proyecto Académico SIS120 · Lenguajes Formales y Autómatas</p>
      </footer>
    </div>
  )
}

export default App
