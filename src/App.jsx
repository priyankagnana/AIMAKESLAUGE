import { useState, useCallback } from 'react';
import { generateJoke } from './groqClient';
import './App.css';

const COMEDIANS = [
  { name: 'Dave Chappelle', emoji: '🎤' },
  { name: 'John Mulaney', emoji: '🎭' },
  { name: 'Bo Burnham', emoji: '🎹' },
  { name: 'Hannah Gadsby', emoji: '🌈' },
  { name: 'Mitch Hedberg', emoji: '😎' },
  { name: 'Ali Wong', emoji: '🔥' },
  { name: 'Gabriel Iglesias', emoji: '😂' },
  { name: 'Norm Macdonald', emoji: '🃏' },
  { name: 'Desi Lydic', emoji: '💅' },
  { name: 'Trevor Noah', emoji: '🌍' },
];

const SITUATION_SUGGESTIONS = [
  'Your WiFi drops right before an important call',
  'Autocorrect ruins a serious text message',
  'Running into your ex at the grocery store',
  'Trying to parallel park while people watch',
  'Accidentally liking a 3-year-old Instagram post',
  'The gym in January vs February',
  'Adulting for the first time',
  'Online dating profiles vs reality',
];

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [apiKeySet, setApiKeySet] = useState(false);
  const [mode, setMode] = useState('comedian');
  const [selectedComedian, setSelectedComedian] = useState('');
  const [topic, setTopic] = useState('');
  const [situation, setSituation] = useState('');
  const [joke, setJoke] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [jokeHistory, setJokeHistory] = useState([]);

  const handleSetApiKey = () => {
    if (apiKey.trim().startsWith('gsk_')) {
      setApiKeySet(true);
      setError('');
    } else {
      setError('Invalid API key. Groq keys start with "gsk_"');
    }
  };

  const handleGenerate = useCallback(async () => {
    if (mode === 'comedian' && !selectedComedian) {
      setError('Pick a comedian first!');
      return;
    }
    if (mode === 'situation' && !situation.trim()) {
      setError('Describe a situation first!');
      return;
    }
    setError('');
    setLoading(true);
    setJoke('');
    try {
      const result = await generateJoke({
        mode,
        comedian: selectedComedian,
        topic: topic.trim(),
        situation: situation.trim(),
        apiKey,
      });
      setJoke(result);
      setJokeHistory((prev) => [
        { text: result, mode, comedian: selectedComedian, situation, topic, id: Date.now() },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      setError(err?.message || 'Something went wrong. Check your API key.');
    } finally {
      setLoading(false);
    }
  }, [mode, selectedComedian, topic, situation, apiKey]);

  const handleCopy = () => {
    navigator.clipboard.writeText(joke);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSuggestion = (s) => {
    setSituation(s);
    setError('');
  };

  if (!apiKeySet) {
    return (
      <div className="app">
        <div className="api-gate">
          <div className="logo">
            <span className="logo-icon">😂</span>
            <h1 className="logo-text">AI Makes Laugh</h1>
          </div>
          <p className="tagline">Groq-powered comedy. Real comedian styles. Infinite punchlines.</p>
          <div className="api-card">
            <h2>Enter your Groq API Key</h2>
            <p className="api-hint">
              Get a free key at{' '}
              <a href="https://console.groq.com" target="_blank" rel="noreferrer">
                console.groq.com
              </a>
            </p>
            <div className="api-input-row">
              <input
                type="password"
                placeholder="gsk_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSetApiKey()}
                className="api-input"
              />
              <button onClick={handleSetApiKey} className="btn-primary">
                Let's Go →
              </button>
            </div>
            {error && <p className="error-msg">{error}</p>}
            <p className="api-disclaimer">Your key stays in your browser. Never sent to our servers.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">😂</span>
          <h1 className="logo-text">AI Makes Laugh</h1>
        </div>
        <button
          className="btn-ghost"
          onClick={() => {
            setApiKeySet(false);
            setApiKey('');
            setJoke('');
            setJokeHistory([]);
          }}
        >
          Change Key
        </button>
      </header>

      <main className="main">
        <div className="mode-tabs">
          <button
            className={`tab ${mode === 'comedian' ? 'tab-active' : ''}`}
            onClick={() => { setMode('comedian'); setError(''); setJoke(''); }}
          >
            🎤 Comedian Style
          </button>
          <button
            className={`tab ${mode === 'situation' ? 'tab-active' : ''}`}
            onClick={() => { setMode('situation'); setError(''); setJoke(''); }}
          >
            🎭 Situation Joke
          </button>
        </div>

        <div className="card">
          {mode === 'comedian' ? (
            <>
              <h2 className="section-title">Pick a comedian</h2>
              <div className="comedian-grid">
                {COMEDIANS.map((c) => (
                  <button
                    key={c.name}
                    className={`comedian-btn ${selectedComedian === c.name ? 'comedian-btn-active' : ''}`}
                    onClick={() => { setSelectedComedian(c.name); setError(''); }}
                  >
                    <span className="comedian-emoji">{c.emoji}</span>
                    <span className="comedian-name">{c.name}</span>
                  </button>
                ))}
              </div>
              <div className="topic-row">
                <label className="label">Topic (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. social media, airports, relationships..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="text-input"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
              </div>
            </>
          ) : (
            <>
              <h2 className="section-title">Describe a situation</h2>
              <textarea
                className="textarea"
                placeholder="e.g. Your alarm didn't go off and you're late for an important meeting..."
                value={situation}
                onChange={(e) => { setSituation(e.target.value); setError(''); }}
                rows={3}
              />
              <div className="suggestions">
                <span className="suggestions-label">Try these:</span>
                <div className="suggestions-list">
                  {SITUATION_SUGGESTIONS.map((s) => (
                    <button key={s} className="suggestion-chip" onClick={() => handleSuggestion(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {error && <p className="error-msg">{error}</p>}

          <button
            className="btn-generate"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <span className="loading-text">
                <span className="spinner" /> Writing the joke...
              </span>
            ) : (
              '⚡ Generate Joke'
            )}
          </button>
        </div>

        {joke && (
          <div className="joke-card">
            <div className="joke-label">
              {mode === 'comedian'
                ? `${COMEDIANS.find((c) => c.name === selectedComedian)?.emoji} ${selectedComedian} style${topic ? ` · "${topic}"` : ''}`
                : `🎭 Situation: "${situation.length > 50 ? situation.slice(0, 50) + '…' : situation}"`}
            </div>
            <p className="joke-text">{joke}</p>
            <div className="joke-actions">
              <button className="btn-action" onClick={handleCopy}>
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
              <button className="btn-action" onClick={handleGenerate} disabled={loading}>
                🔄 Another one
              </button>
            </div>
          </div>
        )}

        {jokeHistory.length > 1 && (
          <div className="history-section">
            <h3 className="history-title">Recent Jokes</h3>
            <div className="history-list">
              {jokeHistory.slice(1).map((h) => (
                <div key={h.id} className="history-item">
                  <span className="history-meta">
                    {h.mode === 'comedian'
                      ? `${COMEDIANS.find((c) => c.name === h.comedian)?.emoji} ${h.comedian}`
                      : `🎭 ${h.situation?.slice(0, 40)}…`}
                  </span>
                  <p className="history-text">{h.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Powered by <strong>Groq</strong> + <strong>Llama 3.3 70B</strong> · Built with ❤️ and bad jokes</p>
      </footer>
    </div>
  );
}
