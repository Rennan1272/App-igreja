import { useState } from 'react'
import { canAccess, hasScheduleAccess } from '../utils/helpers.js'
import s from './DiscoverTab.module.css'

/**
 * DiscoverTab — central hub for all app features.
 * Does NOT duplicate any feature — only routes to existing tabs/screens.
 * Items shown vary by user role via canAccess helper.
 */

const ALL_ITEMS = [
  {
    key: 'stories',
    icon: '▶',
    label: 'Stories & Reels',
    desc: 'Publicações em vídeo e stories da comunidade',
    color: '#FF8C00',
    bg: '#1a0a00',
    roles: null, // all
  },
  {
    key: 'calendar',
    icon: '📅',
    label: 'Agenda',
    desc: 'Programação de cultos e eventos',
    color: '#fff',
    bg: '#1a1a1a',
    roles: null,
  },
  {
    key: 'canteen',
    icon: '🍽️',
    label: 'Cantina',
    desc: 'Cardápio e reserva de lanches',
    color: '#FF8C00',
    bg: '#1a0a00',
    roles: null,
  },
  {
    key: 'fundraising',
    icon: '💰',
    label: 'Arrecadação',
    desc: 'Campanhas e chaves PIX',
    color: '#4caf50',
    bg: '#0a1a0a',
    roles: null,
  },
  {
    key: 'schedule',
    icon: '📋',
    label: 'Escala',
    desc: 'Sua escala no ministério',
    color: '#aaa',
    bg: '#1a1a1a',
    roleCheck: (role) => hasScheduleAccess(role),
  },
  {
    key: 'missions',
    icon: '✈️',
    label: 'Pedidos de Missão',
    desc: 'Solicitar e aprovar pedidos',
    color: '#85B7EB',
    bg: '#0a0f1a',
    roleCheck: (role) => ['lider_missoes', 'pastor'].includes(role),
  },
  {
    key: 'financial',
    icon: '📊',
    label: 'Financeiro',
    desc: 'Dízimos e ofertas por filial',
    color: '#FF8C00',
    bg: '#1a0a00',
    roleCheck: (role) => role === 'pastor',
  },
  {
    key: 'admin',
    icon: '⚙️',
    label: 'Cadastro',
    desc: 'Gerenciar membros da igreja',
    color: '#aaa',
    bg: '#1a1a1a',
    roleCheck: (role) => role === 'pastor',
  },
]

export default function DiscoverTab({ user, setTab, missionRequests }) {
  const [search, setSearch] = useState('')

  const visible = ALL_ITEMS.filter(item => {
    if (item.roleCheck && !item.roleCheck(user.role)) return false
    if (search) return item.label.toLowerCase().includes(search.toLowerCase()) || item.desc.toLowerCase().includes(search.toLowerCase())
    return true
  })

  const pendingMissions = (missionRequests || []).filter(r => r.status === 'pendente').length

  return (
    <div className={s.wrap}>
      <div className={s.header}>
        <h2 className={s.title}>DESCOBRIR</h2>
        <p className={s.subtitle}>Todas as funcionalidades do app</p>
      </div>

      <div className={s.searchWrap}>
        <input
          className={s.search}
          placeholder="🔍  Buscar funcionalidade..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className={s.grid}>
        {visible.map(item => (
          <button
            key={item.key}
            className={s.card}
            style={{ borderColor: item.color + '33', background: item.bg }}
            onClick={() => setTab(item.key)}
          >
            <div className={s.cardIcon} style={{ color: item.color }}>{item.icon}</div>
            <div className={s.cardLabel}>{item.label}</div>
            <div className={s.cardDesc}>{item.desc}</div>
            {item.key === 'missions' && pendingMissions > 0 && (
              <div className={s.pendingBadge}>{pendingMissions} pendente{pendingMissions > 1 ? 's' : ''}</div>
            )}
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <div className={s.empty}>Nenhuma funcionalidade encontrada para "{search}"</div>
      )}
    </div>
  )
}
