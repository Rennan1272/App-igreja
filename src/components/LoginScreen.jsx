import { useState, useEffect } from 'react'
import { ROLE_LABELS } from '../data/initialData.js'
import Logo from './Logo.jsx'
import BiometricSetup from './BiometricSetup.jsx'
import {
  isBiometricAvailable,
  getBiometricPreference,
  authenticateWithBiometric,
  disableBiometric,
  detectBiometricType,
  BIOMETRIC_LABELS,
} from '../utils/biometric.js'
import s from './LoginScreen.module.css'

// Apple review test account — always visible in demo list
const APPLE_TEST_USER = {
  id: 999,
  name: 'Usuário Teste Apple',
  role: 'membro',
  username: 'apple_review',
  password: 'Apple2024!',
  age: 30,
  sector: 'Congregação',
  birthDate: '1994-01-01',
  photo: null,
}

export default function LoginScreen({ users, onLogin, onShowPrivacy }) {
  const [username, setUsername]             = useState('')
  const [password, setPassword]             = useState('')
  const [error, setError]                   = useState('')
  const [showDemo, setShowDemo]             = useState(false)
  const [showPermissions, setShowPermissions] = useState(false)

  // Biometric state
  const [bioAvailable, setBioAvailable]     = useState(false)
  const [bioPreference, setBioPref]         = useState(null)
  const [bioLoading, setBioLoading]         = useState(false)
  const [bioError, setBioError]             = useState('')
  const [showBioSetup, setShowBioSetup]     = useState(false)
  const [pendingUser, setPendingUser]       = useState(null)

  const bioType   = detectBiometricType()
  const bioLabels = BIOMETRIC_LABELS[bioType]

  useEffect(() => {
    isBiometricAvailable().then(available => {
      setBioAvailable(available)
      if (available) setBioPref(getBiometricPreference())
    })
  }, [])

  // All users including the Apple test user
  const allUsers = [...users, APPLE_TEST_USER]

  const handlePasswordLogin = () => {
    setError('')
    setBioError('')

    const found = allUsers.find(
      u => u.username === username.toLowerCase().trim() && u.password === password.trim()
    )

    if (!found) {
      setError('Usuário ou senha incorretos. Verifique os dados e tente novamente.')
      return
    }

    const pref = getBiometricPreference()
    if (bioAvailable && !pref?.enabled) {
      setPendingUser(found)
      setShowBioSetup(true)
    } else {
      onLogin(found)
    }
  }

  const handleBiometricLogin = async () => {
    setBioError('')
    setBioLoading(true)
    const result = await authenticateWithBiometric()
    setBioLoading(false)

    if (result.success) {
      const found = allUsers.find(u => u.username === result.username)
      if (found) { onLogin(found) }
      else { disableBiometric(); setBioPref(null); setBioError('Sessão expirada. Faça login com sua senha.') }
    } else {
      setBioError(result.error || 'Falha na autenticação. Use sua senha.')
    }
  }

  const handleBioSetupDone = (enabled) => {
    setShowBioSetup(false)
    if (enabled) setBioPref(getBiometricPreference())
    onLogin(pendingUser)
    setPendingUser(null)
  }

  const hasBioSession = bioAvailable && bioPreference?.enabled

  return (
    <div className={s.wrap}>
      {showBioSetup && pendingUser && (
        <BiometricSetup username={pendingUser.username} onDone={handleBioSetupDone} />
      )}

      {/* Logo */}
      <div className={s.logoBox}>
        <Logo size={80} />
        <h1 className={s.brand}>ADMIRAI</h1>
        <p className={s.brandSub}>SISTEMA DA IGREJA</p>
      </div>

      <div className={s.card}>
        <h2 className={s.cardTitle}>Entrar</h2>

        {/* Biometric quick entry */}
        {hasBioSession && (
          <div className={s.bioSection}>
            <button className={s.btnBiometric} onClick={handleBiometricLogin} disabled={bioLoading}>
              {bioLoading
                ? <span className={s.bioSpinner} />
                : <span className={s.bioIcon}>{bioLabels.icon}</span>
              }
              <div className={s.bioText}>
                <span className={s.bioLabel}>{bioLoading ? 'Aguardando…' : `Entrar com ${bioLabels.name}`}</span>
                <span className={s.bioSub}>@{bioPreference.username}</span>
              </div>
            </button>
            {bioError && <p className={s.bioError}>{bioError}</p>}
            <div className={s.divider}>
              <span className={s.dividerLine} />
              <span className={s.dividerText}>ou entre com senha</span>
              <span className={s.dividerLine} />
            </div>
          </div>
        )}

        {/* Password form */}
        <div className={s.field}>
          <label>USUÁRIO</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePasswordLogin()}
            placeholder="Digite seu usuário"
            autoComplete="username"
            autoCapitalize="none"
          />
        </div>

        <div className={s.field}>
          <label>SENHA</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePasswordLogin()}
            placeholder="Digite sua senha"
            autoComplete="current-password"
          />
        </div>

        {error && <p className={s.error}>{error}</p>}

        <button className={s.btnLogin} onClick={handlePasswordLogin}>ACESSAR</button>

        {hasBioSession && (
          <button className={s.btnDisableBio} onClick={() => { disableBiometric(); setBioPref(null) }}>
            Desativar {bioLabels.name}
          </button>
        )}

        {/* Permission info toggle */}
        <button className={s.btnDemo} onClick={() => setShowPermissions(!showPermissions)}>
          {showPermissions ? 'Ocultar' : '🔒 Permissões solicitadas pelo app'}
        </button>

        {showPermissions && (
          <div className={s.permissionsBox}>
            {[
              { icon: '📷', title: 'Câmera', desc: 'Usada para foto de perfil e publicar posts com imagem. Nunca acessada sem sua ação.' },
              { icon: '🖼️', title: 'Galeria', desc: 'Para selecionar fotos existentes para posts ou perfil.' },
              { icon: '🔔', title: 'Notificações', desc: 'Para avisar sobre escalas, eventos, aniversários e pedidos de missão.' },
            ].map(p => (
              <div key={p.title} className={s.permItem}>
                <span className={s.permIcon}>{p.icon}</span>
                <div>
                  <div className={s.permTitle}>{p.title}</div>
                  <div className={s.permDesc}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button className={s.btnDemo} onClick={() => setShowDemo(!showDemo)}>
          {showDemo ? 'Ocultar usuários demo' : 'Ver usuários demo'}
        </button>
      </div>

      {/* Privacy policy link */}
      <button className={s.privacyLink} onClick={onShowPrivacy}>
        🔒 Política de Privacidade
      </button>

      {/* Test user for Apple review */}
      <div className={s.testUserBox}>
        <p className={s.testUserTitle}>CONTA DE REVISÃO (App Store)</p>
        <p className={s.testUserCred}>Login: <strong>apple_review</strong></p>
        <p className={s.testUserCred}>Senha: <strong>Apple2024!</strong></p>
        <button className={s.testUserBtn} onClick={() => { setUsername('apple_review'); setPassword('Apple2024!') }}>
          Preencher automaticamente
        </button>
      </div>

      {/* Demo users */}
      {showDemo && (
        <div className={s.demoPanel}>
          <p className={s.demoHeader}>USUÁRIOS DE DEMONSTRAÇÃO (senha: 123)</p>
          {users.map(u => (
            <button key={u.id} className={s.demoItem} onClick={() => { setUsername(u.username); setPassword('123') }}>
              <span className={s.demoName}>{u.name}</span>
              <span className={s.demoRole}>{ROLE_LABELS[u.role]}</span>
              <span className={s.demoUser}>@{u.username}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
