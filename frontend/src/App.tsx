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

interface HistoryItem {
  id: string
  text: string
  score: number
  level: string
  timestamp: string
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

const ALL_RULES_INFO = [
  { id: 'URL-001', name: 'Enlaces HTTP/HTTPS', weight: 15 },
  { id: 'URG-001', name: 'Lenguaje de Urgencia', weight: 15 },
  { id: 'CRED-001', name: 'Solicitud de Credenciales', weight: 25 },
  { id: 'PRIZE-001', name: 'Promesa de Premio', weight: 15 },
  { id: 'MONEY-001', name: 'Referencias Monetarias', weight: 0 },
  { id: 'STYLE-001', name: 'Exceso de Exclamación', weight: 5 },
  { id: 'STYLE-002', name: 'Proporción de Mayúsculas', weight: 5 },
]

function App() {
  const [mode, setMode] = useState<'single' | 'batch' | 'rules' | 'history'>('single')
  const [text, setText] = useState('')
  const [batchTexts, setBatchTexts] = useState('URGENTE: entra a https://example.com\nHola profesor\nIngresa tu clave de acceso')
  
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [batchResult, setBatchResult] = useState<BatchAnalyzeResponse | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [backendStatus, setBackendStatus] = useState<string>('Verificando...')

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/health')
      .then((res) => res.json())
      .then((data) => setBackendStatus(data.status === 'ok' ? 'ONLINE (SECURE)' : 'DESCONOCIDO'))
      .catch(() => setBackendStatus('OFFLINE (INICIAR BACKEND)'))
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

      // Add to history
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        text: text.length > 50 ? text.substring(0, 50) + '...' : text,
        score: data.score,
        level: data.level,
        timestamp: new Date().toLocaleTimeString(),
      }
      setHistory((prev) => [newItem, ...prev.slice(0, 9)])
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
        return <span className="badge badge-low">RIESGO BAJO (0-24)</span>
      case 'medium':
        return <span className="badge badge-medium">RIESGO MEDIO (25-49)</span>
      case 'high':
        return <span className="badge badge-high">RIESGO ALTO (50-100)</span>
    }
  }

  const renderHighlightedText = (originalText: string, matches: MatchResult[]) => {
    if (!matches || matches.length === 0) return <span>{originalText}</span>

    const sorted = [...matches].sort((a, b) => a.start - b.start)
    const parts = []
    let lastIndex = 0

    sorted.forEach((m, idx) => {
      if (m.start > lastIndex) {
        parts.push(<span key={`text-${idx}`}>{originalText.substring(lastIndex, m.start)}</span>)
      }
      parts.push(
        <mark key={`match-${idx}`} className="highlight-match" title={`Regla: ${m.rule_id} - ${m.description}`}>
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
    <div className="cyber-container">
      <div className="cyber-grid-bg"></div>
      
      <header className="cyber-header">
        <div className="status-pill">
          <span className="pulse-dot"></span>
          STATUS: {backendStatus}
        </div>
        <h1>SENTINEL<span className="text-neon">TEXT</span></h1>
        <p className="subtitle">
          Sistema Autónomo de Análisis Léxico & Detección de Riesgos (SIS120)
        </p>

        <nav className="cyber-tabs">
          <button
            type="button"
            className={`cyber-tab ${mode === 'single' ? 'active' : ''}`}
            onClick={() => { setMode('single'); setError(null); }}
          >
            [01] Analizador
          </button>
          <button
            type="button"
            className={`cyber-tab ${mode === 'batch' ? 'active' : ''}`}
            onClick={() => { setMode('batch'); setError(null); }}
          >
            [02] Lotes (P1)
          </button>
          <button
            type="button"
            className={`cyber-tab ${mode === 'rules' ? 'active' : ''}`}
            onClick={() => { setMode('rules'); setError(null); }}
          >
            [03] Catálogo Reglas
          </button>
          <button
            type="button"
            className={`cyber-tab ${mode === 'history' ? 'active' : ''}`}
            onClick={() => { setMode('history'); setError(null); }}
          >
            [04] Historial ({history.length})
          </button>
        </nav>
      </header>

      <main className="cyber-main">
        {mode === 'single' && (
          <>
            <section className="cyber-card">
              <div className="card-header-tag">INSPECTOR DE MENSAJES</div>
              <h2>Análisis de Texto en Tiempo Real</h2>
              
              <div className="examples-bar">
                <span className="label-presets">Presets de Prueba:</span>
                {EXAMPLE_MESSAGES.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="btn-preset"
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
                    placeholder="Introduce el mensaje de texto para evaluar patrones léxicos y señales de riesgo..."
                    rows={6}
                    maxLength={10000}
                  />
                  <div className="char-counter">{text.length} / 10,000 chars</div>
                </div>

                {error && <div className="cyber-error">ALERTA: {error}</div>}

                <button type="submit" className="cyber-btn" disabled={loading}>
                  {loading ? 'ANALIZANDO MATRICES...' : 'EJECUTAR ANÁLISIS LÉXICO'}
                </button>
              </form>
            </section>

            {result && (
              <section className="cyber-card result-fade-in">
                <div className="results-top-bar">
                  <div className="card-header-tag">DIAGNOSTICO HEURÍSTICO</div>
                  <button type="button" className="cyber-btn-secondary" onClick={exportToCSV}>
                    EXPORTAR REPORTE CSV
                  </button>
                </div>

                <div className="results-summary">
                  <div className="score-box">
                    <span className="score-number">{result.score}</span>
                    <span className="score-max">/100</span>
                    <div className="score-label">PUNTUACIÓN RIESGO</div>
                  </div>
                  <div className="level-box">
                    {getLevelBadge(result.level)}
                    <p className="disclaimer">{result.disclaimer}</p>
                  </div>
                </div>

                <div className="highlight-section">
                  <h3>VISUALIZADOR DE COINCIDENCIAS</h3>
                  {renderHighlightedText(text, result.matches)}
                </div>

                <div className="matches-section">
                  <h3>EVIDENCIAS DETECTADAS ({result.matches.length})</h3>
                  {result.matches.length === 0 ? (
                    <p className="no-matches">Ninguna regla activa detectada en este mensaje.</p>
                  ) : (
                    <div className="matches-list">
                      {result.matches.map((match, idx) => (
                        <div key={idx} className="match-item">
                          <div className="match-header">
                            <span className="rule-badge">{match.rule_id}</span>
                            <span className="category-badge">{match.category}</span>
                            <span className="positions">POS: [{match.start}:{match.end}]</span>
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
              </section>
            )}
          </>
        )}

        {mode === 'batch' && (
          <section className="cyber-card">
            <div className="card-header-tag">PROCESAMIENTO EN LOTE</div>
            <h2>Análisis Múltiple de Mensajes</h2>
            <p className="subtitle" style={{ marginBottom: '20px' }}>
              Ingrese un mensaje por línea (máximo 20 mensajes simultáneos).
            </p>

            <form onSubmit={handleBatchAnalyze}>
              <div className="textarea-wrapper">
                <textarea
                  value={batchTexts}
                  onChange={(e) => setBatchTexts(e.target.value)}
                  placeholder="Mensaje 1&#10;Mensaje 2..."
                  rows={8}
                />
              </div>

              {error && <div className="cyber-error">ALERTA: {error}</div>}

              <button type="submit" className="cyber-btn" disabled={loading}>
                {loading ? 'PROCESANDO LOTE...' : 'EJECUTAR ANÁLISIS EN LOTE'}
              </button>
            </form>

            {batchResult && (
              <div className="batch-results" style={{ marginTop: '30px' }}>
                <h3>ESTADÍSTICAS DEL LOTE</h3>
                <div className="batch-stats">
                  <div className="stat-box">
                    <span className="stat-value">{batchResult.total_analyzed}</span>
                    <span className="stat-label">TOTAL ANALIZADOS</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">{batchResult.average_score}</span>
                    <span className="stat-label">PROM. PUNTUACIÓN</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">{batchResult.high_risk_count}</span>
                    <span className="stat-label">CASOS ALTO RIESGO</span>
                  </div>
                </div>

                <div className="matches-list" style={{ marginTop: '20px' }}>
                  {batchResult.results.map((res, i) => (
                    <div key={i} className="match-item">
                      <div className="match-header">
                        <span className="rule-badge">ITEM #{i + 1}</span>
                        {getLevelBadge(res.level)}
                        <span className="positions">Puntuación: {res.score}/100</span>
                      </div>
                      <div className="match-desc">
                        Señales encontradas: {res.matches.length}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {mode === 'rules' && (
          <section className="cyber-card">
            <div className="card-header-tag">CATÁLOGO VERSIONADO</div>
            <h2>Reglas Léxicas Activas</h2>
            <p className="subtitle" style={{ marginBottom: '20px' }}>
              Motor de expresiones regulares compiladas en Python.
            </p>
            <div className="rules-grid">
              {ALL_RULES_INFO.map((rule) => (
                <div key={rule.id} className="rule-card">
                  <div className="rule-card-header">
                    <span className="rule-badge">{rule.id}</span>
                    <span className="rule-weight">Peso: {rule.weight} pts</span>
                  </div>
                  <div className="rule-name">{rule.name}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {mode === 'history' && (
          <section className="cyber-card">
            <div className="card-header-tag">REGISTRO DE SESIÓN</div>
            <h2>Historial Temporal</h2>
            {history.length === 0 ? (
              <p className="no-matches" style={{ marginTop: '20px' }}>No hay análisis registrados en esta sesión.</p>
            ) : (
              <div className="matches-list" style={{ marginTop: '20px' }}>
                {history.map((item) => (
                  <div key={item.id} className="match-item">
                    <div className="match-header">
                      <span className="rule-badge">{item.timestamp}</span>
                      <span className={`badge badge-${item.level}`}>{item.level.toUpperCase()} ({item.score} pts)</span>
                    </div>
                    <div className="matched-text">"{item.text}"</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="cyber-footer">
        <p>SENTINELTEXT V1.0 · PROYECTO ACADÉMICO SIS120 · LENGUAJES FORMALES Y AUTÓMATAS</p>
      </footer>
    </div>
  )
}

export default App
