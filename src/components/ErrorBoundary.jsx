import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[Admirai Error]', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0a0a0a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          fontFamily: 'Georgia, serif',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: '#fff', fontSize: 18, marginBottom: 10 }}>Algo deu errado</h2>
          <p style={{ color: '#666', fontSize: 13, marginBottom: 24, maxWidth: 300 }}>
            O aplicativo encontrou um erro inesperado. Tente recarregar a página.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ background: '#fff', color: '#000', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            Recarregar
          </button>
          <details style={{ marginTop: 20, maxWidth: 340, textAlign: 'left' }}>
            <summary style={{ color: '#444', fontSize: 11, cursor: 'pointer' }}>Detalhes do erro</summary>
            <pre style={{ color: '#FF4500', fontSize: 10, marginTop: 8, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {this.state.error?.message}
            </pre>
          </details>
        </div>
      )
    }
    return this.props.children
  }
}
