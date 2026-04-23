import { useRef, useState, useEffect } from 'react'
import { ROLE_LABELS } from '../data/initialData.js'
import { initials, formatBirthDate, isBirthdayToday } from '../utils/helpers.js'
import Logo from '../components/Logo.jsx'
import BiometricSetup from '../components/BiometricSetup.jsx'
import PrivacyPolicyScreen from '../components/PrivacyPolicyScreen.jsx'
import HelpCenter from '../components/HelpCenter.jsx'
import QRCode from '../components/QRCode.jsx'
import {
  isBiometricAvailable, getBiometricPreference,
  disableBiometric, detectBiometricType, BIOMETRIC_LABELS,
} from '../utils/biometric.js'
import s from './ProfileTab.module.css'

const DELETE_REASONS = [
  'Não uso mais o aplicativo',
  'Prefiro outro meio de comunicação',
  'Problemas técnicos ou erros',
  'Dados pessoais ou privacidade',
  'Mudei de igreja',
  'Outro motivo',
]

export default function ProfileTab({ user, onUpdateUser, onBack, onDeleteAccount, calendarEvents }) {
  const fileRef = useRef()

  // Sub-screens
  const [screen, setScreen] = useState('main') // 'main' | 'privacy' | 'help' | 'qr'

  // Delete
  const [showDeleteFlow, setShowDeleteFlow] = useState(false)
  const [deleteReason, setDeleteReason]     = useState('')
  const [deleteComment, setDeleteComment]   = useState('')
  const [deleteStep, setDeleteStep]         = useState(1)

  // Biometric
  const [bioAvailable, setBioAvailable] = useState(false)
  const [bioEnabled, setBioEnabled]     = useState(false)
  const [showBioSetup, setShowBioSetup] = useState(false)

  // Invite
  const [inviteCopied, setInviteCopied] = useState(false)

  const bioType   = detectBiometricType()
  const bioLabels = BIOMETRIC_LABELS[bioType]

  useEffect(() => {
    isBiometricAvailable().then(available => {
      setBioAvailable(available)
      if (available) setBioEnabled(getBiometricPreference()?.enabled || false)
    })
  }, [])

  // Sub-screen routing
  if (screen === 'privacy') return <PrivacyPolicyScreen onBack={() => setScreen('main')} />
  if (screen === 'help')    return <HelpCenter onBack={() => setScreen('main')} />
  if (screen === 'qr')      return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', padding: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid #1e1e1e' }}>
        <button onClick={() => setScreen('main')} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: 13, cursor: 'pointer' }}>← Voltar</button>
        <span style={{ color: '#777', fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>MEU QR CODE</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', gap: 20 }}>
        <QRCode data={`admirai:user:${user.id}:${user.username}`} size={200} label={`@${user.username} · ID #${String(user.id).padStart(6,'0')}`} />
        <div style={{ background: '#141414', border: '1px solid #222', borderRadius: 14, padding: 18, width: '100%', maxWidth: 300, textAlign: 'center' }}>
          <div style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{user.name}</div>
          <div style={{ color: '#FF8C00', fontSize: 12, marginBottom: 12 }}>{ROLE_LABELS[user.role]}</div>
          <div style={{ color: '#555', fontSize: 11 }}>Outros membros podem escanear este QR Code para adicionar você como contato no Admirai.</div>
        </div>
      </div>
    </div>
  )

  // Upcoming events (today + this week)
  const today = new Date(); today.setHours(0,0,0,0)
  const upcomingEvents = (calendarEvents || [])
    .filter(ev => {
      const d = new Date(ev.date + 'T00:00:00')
      const diff = Math.round((d - today) / 86400000)
      return diff >= 0 && diff <= 7
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4)

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onUpdateUser({ ...user, photo: ev.target.result })
    reader.readAsDataURL(file)
  }

  const handleBioToggle = () => {
    if (bioEnabled) { disableBiometric(); setBioEnabled(false) }
    else setShowBioSetup(true)
  }

  const handleDeleteConfirm = () => {
    if (!deleteReason) return
    onDeleteAccount()
  }

  const handleInvite = () => {
    const link = `https://admirai.app/convite?ref=${user.username}`
    if (navigator.share) {
      navigator.share({ title: 'Admirai Igreja', text: `Venha fazer parte da comunidade Admirai! Use meu convite:`, url: link }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(link)
      setInviteCopied(true)
      setTimeout(() => setInviteCopied(false), 2500)
    }
  }

  const TYPE_ICONS = { culto: '⛪', oracao: '🙏', infantil: '🌟', cantina: '🍽️', evento: '🎉' }
  const DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

  return (
    <div className={s.wrap}>
      {showBioSetup && <BiometricSetup username={user.username} onDone={(en) => { setShowBioSetup(false); setBioEnabled(en) }} />}

      {/* Delete modal */}
      {showDeleteFlow && (
        <div className={s.deleteModal}>
          <div className={s.deleteCard}>
            {deleteStep === 1 && (
              <>
                <div className={s.deleteIcon}>⚠️</div>
                <h3 className={s.deleteTitle}>Excluir conta</h3>
                <p className={s.deleteDesc}>Conte o motivo. Seus dados serão removidos conforme a LGPD.</p>
                <div className={s.reasonList}>
                  {DELETE_REASONS.map(r => (
                    <button key={r} className={`${s.reasonBtn} ${deleteReason === r ? s.reasonSelected : ''}`} onClick={() => setDeleteReason(r)}>
                      {deleteReason === r && '✓ '}{r}
                    </button>
                  ))}
                </div>
                <textarea className={s.deleteComment} placeholder="Comentário adicional (opcional)..." value={deleteComment} onChange={e => setDeleteComment(e.target.value)} />
                <button className={s.btnDeleteNext} onClick={() => deleteReason && setDeleteStep(2)} style={{ opacity: deleteReason ? 1 : 0.4 }}>Continuar</button>
                <button className={s.btnDeleteCancel} onClick={() => setShowDeleteFlow(false)}>Cancelar</button>
              </>
            )}
            {deleteStep === 2 && (
              <>
                <div className={s.deleteIcon}>🗑️</div>
                <h3 className={s.deleteTitle}>Tem certeza?</h3>
                <p className={s.deleteDesc}>Esta ação é permanente. Todos os seus dados serão removidos conforme a LGPD.</p>
                <div className={s.reasonSummary}><strong>Motivo:</strong> {deleteReason}</div>
                <button className={s.btnDeleteConfirm} onClick={handleDeleteConfirm}>Sim, excluir minha conta</button>
                <button className={s.btnDeleteCancel} onClick={() => setDeleteStep(1)}>Voltar</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className={s.header}>
        <button className={s.backBtn} onClick={onBack}>← Voltar</button>
        <span className={s.pageTitle}>PERFIL</span>
      </div>

      {/* Quick actions */}
      <div className={s.quickBar}>
        <button className={s.quickBtn} onClick={() => setScreen('privacy')}>🔒 Privacidade</button>
        <button className={s.quickBtnDanger} onClick={() => { setDeleteStep(1); setDeleteReason(''); setShowDeleteFlow(true) }}>🗑️ Excluir conta</button>
      </div>

      {/* Avatar */}
      <div className={s.avatarSection}>
        <div className={s.avatarWrap} onClick={() => fileRef.current.click()}>
          {user.photo
            ? <img src={user.photo} alt="foto" className={s.avatarImg} />
            : <div className={s.avatarPlaceholder}>{initials(user.name)}</div>
          }
          <div className={s.editOverlay}>📷</div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
        <p className={s.photoHint}>Toque para alterar a foto</p>
        <div className={s.userName}>{user.name}</div>
        <div className={s.userRole}>{ROLE_LABELS[user.role]}</div>
      </div>

      {/* Info */}
      <div className={s.card}>
        <h3 className={s.cardTitle}>INFORMAÇÕES</h3>
        {[
          ['Idade', `${user.age} anos`],
          ['Nascimento', formatBirthDate(user.birthDate)],
          ['Função', ROLE_LABELS[user.role]],
          ['Setor', user.sector],
          ['Usuário', `@${user.username}`],
        ].map(([l, v]) => (
          <div key={l} className={s.row}>
            <span className={s.label}>{l}</span>
            <span className={s.value}>{v}</span>
          </div>
        ))}
      </div>

      {/* Church reminders */}
      {upcomingEvents.length > 0 && (
        <div className={s.card}>
          <h3 className={s.cardTitle}>📅 LEMBRETES DE CULTO</h3>
          {upcomingEvents.map(ev => {
            const d = new Date(ev.date + 'T00:00:00')
            const diff = Math.round((d - today) / 86400000)
            return (
              <div key={ev.id} className={s.reminderRow}>
                <div className={s.reminderDate}>
                  <span className={s.reminderDay}>{d.getDate()}</span>
                  <span className={s.reminderWd}>{DAYS[d.getDay()]}</span>
                </div>
                <div>
                  <div className={s.reminderTitle}>{TYPE_ICONS[ev.type] || '•'} {ev.title}</div>
                  <div className={s.reminderMeta}>
                    🕐 {ev.time} · {diff === 0 ? 'hoje' : diff === 1 ? 'amanhã' : `em ${diff} dias`}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Member card */}
      <div className={s.memberCard}>
        <div className={s.memberCardHeader}>
          <Logo size={30} />
          <div>
            <div className={s.churchName}>ADMIRAI</div>
            <div className={s.churchSub}>CARTEIRINHA DE MEMBRO</div>
          </div>
          <button className={s.qrMiniBtn} onClick={() => setScreen('qr')} title="Ver QR Code">⊞</button>
        </div>
        <div className={s.memberCardBody}>
          <div className={s.memberCardAvatar}>
            {user.photo
              ? <img src={user.photo} alt="foto" className={s.memberCardAvatarImg} />
              : <div className={s.memberCardAvatarPlaceholder}>{initials(user.name)}</div>
            }
          </div>
          <div className={s.memberCardInfo}>
            <div className={s.memberCardName}>{user.name}</div>
            <div className={s.memberCardRole}>{ROLE_LABELS[user.role]}</div>
            <div className={s.memberCardDetail}>Setor: {user.sector}</div>
            {user.birthDate && <div className={s.memberCardDetail}>Nasc: {formatBirthDate(user.birthDate)}</div>}
          </div>
        </div>
        <div className={s.memberCardFooter}>
          <div className={s.barcode}>
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className={s.bar} style={{ height: i % 3 === 0 ? 28 : i % 2 === 0 ? 20 : 24 }} />
            ))}
          </div>
          <div className={s.memberId}>ID #{String(user.id).padStart(6, '0')}</div>
        </div>
      </div>

      {/* Security */}
      <div className={s.card}>
        <h3 className={s.cardTitle}>SEGURANÇA</h3>
        {bioAvailable ? (
          <div className={s.bioRow}>
            <div className={s.bioRowLeft}>
              <span className={s.bioRowIcon}>{bioLabels.icon}</span>
              <div>
                <div className={s.bioRowLabel}>{bioLabels.name}</div>
                <div className={s.bioRowSub}>{bioEnabled ? 'Ativado — dados validados pelo sistema' : 'Desativado'}</div>
              </div>
            </div>
            <button className={`${s.toggle} ${bioEnabled ? s.toggleOn : ''}`} onClick={handleBioToggle}>
              <span className={s.toggleThumb} />
            </button>
          </div>
        ) : (
          <div className={s.bioUnavailable}>
            <span>🔒</span>
            <div><div className={s.bioRowLabel}>Biometria</div><div className={s.bioRowSub}>Não disponível neste dispositivo</div></div>
          </div>
        )}
        {bioEnabled && (
          <div className={s.bioNote}>✅ Dados biométricos verificados pelo sistema do dispositivo, não armazenados pelo app.</div>
        )}
      </div>

      {/* Actions */}
      <div className={s.card}>
        <h3 className={s.cardTitle}>MAIS OPÇÕES</h3>
        {[
          { icon: '⊞', label: 'Meu QR Code', sub: 'Compartilhe para ser adicionado como contato', action: () => setScreen('qr') },
          { icon: '🔗', label: inviteCopied ? 'Link copiado!' : 'Convidar amigos', sub: 'Compartilhe o Admirai com sua rede', action: handleInvite },
          { icon: '💡', label: 'Central de Ajuda', sub: 'Guia de uso das funcionalidades', action: () => setScreen('help') },
          { icon: '🔒', label: 'Política de Privacidade', sub: 'LGPD e uso de dados', action: () => setScreen('privacy') },
        ].map(item => (
          <button key={item.label} className={s.actionRow} onClick={item.action}>
            <span className={s.actionIcon}>{item.icon}</span>
            <div className={s.actionInfo}>
              <div className={s.actionLabel}>{item.label}</div>
              <div className={s.actionSub}>{item.sub}</div>
            </div>
            <span className={s.actionChevron}>›</span>
          </button>
        ))}
      </div>

      {/* Danger zone */}
      <div className={s.dangerZone}>
        <h4 className={s.dangerTitle}>ZONA DE PERIGO</h4>
        <p className={s.dangerDesc}>Exclusão permanente de conta e dados conforme a LGPD.</p>
        <button className={s.btnDelete} onClick={() => { setDeleteStep(1); setDeleteReason(''); setShowDeleteFlow(true) }}>
          🗑️ Excluir minha conta
        </button>
      </div>
    </div>
  )
}
