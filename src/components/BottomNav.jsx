import s from './BottomNav.module.css'

const PRIMARY = [
  { key: 'feed',     icon: '🏠', label: 'INÍCIO' },
  { key: 'conversa', icon: '💬', label: 'CONVERSA' },
  { key: 'discover', icon: '🔍', label: 'DESCOBRIR' },
  { key: 'contacts', icon: '👥', label: 'CONTATOS' },
  { key: 'profile',  icon: '👤', label: 'PERFIL' },
]

export default function BottomNav({ tab, setTab, user, missionRequests }) {
  const pending = (missionRequests || []).filter(r => r.status === 'pendente').length

  return (
    <nav className={s.nav}>
      {PRIMARY.map(item => {
        const badge = item.key === 'discover' && pending > 0 ? pending : 0
        return (
          <button key={item.key} className={s.btn} onClick={() => setTab(item.key)}>
            <div className={s.iconWrap}>
              <span className={s.icon}>{item.icon}</span>
              {badge > 0 && <span className={s.badge}>{badge}</span>}
            </div>
            <span className={`${s.label} ${tab === item.key ? s.active : ''}`}>
              {item.label}
            </span>
            {tab === item.key && <span className={s.dot} />}
          </button>
        )
      })}
    </nav>
  )
}
