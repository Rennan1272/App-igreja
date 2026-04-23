import { useState } from 'react'
import { ROLE_LABELS } from '../data/initialData.js'
import { ROLES, ROLE_LABELS as AUTH_ROLE_LABELS, CONGREGATIONS, canRegisterMembers, canRegisterPastors, isPresidente } from '../utils/auth.js'
import { initials, formatBirthDate, isBirthdayToday } from '../utils/helpers.js'
import s from './AdminTab.module.css'

// Ministry roles that can be assigned to members (not pastor hierarchy)
const MINISTRY_ROLES = Object.entries(ROLE_LABELS).filter(([k]) =>
  !['pastor', 'pastor_presidente'].includes(k)
)

export default function AdminTab({ users, setUsers, currentUser }) {
  const [tab, setTab]         = useState('membros')
  const [search, setSearch]   = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError]     = useState('')

  // Member form
  const [memberForm, setMemberForm] = useState({
    name: '', age: '', role: ROLES.MEMBRO, username: '', password: '',
    sector: '', birthDate: '', igrejaId: 'rj',
  })

  // Pastor form
  const [pastorForm, setPastorForm] = useState({
    name: '', age: '', username: '', password: '',
    birthDate: '', igrejaId: '', // empty = no church linked
  })

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  )

  const notify = (msg, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(''), 4000) }
    else          { setSuccess(msg); setTimeout(() => setSuccess(''), 4000) }
  }

  const registerMember = () => {
    if (!canRegisterMembers({ role: currentUser?.role })) {
      return notify('Apenas o Pastor Presidente pode cadastrar membros.', true)
    }
    if (!memberForm.name || !memberForm.username || !memberForm.password) {
      return notify('Preencha nome, usuário e senha.', true)
    }
    if (users.find(u => u.username === memberForm.username.toLowerCase().trim())) {
      return notify('Este nome de usuário já está em uso.', true)
    }
    const newUser = {
      id: Date.now(),
      name: memberForm.name.trim(),
      age: parseInt(memberForm.age) || 0,
      role: memberForm.role,
      username: memberForm.username.toLowerCase().trim(),
      password: memberForm.password,
      sector: memberForm.sector || 'Congregação',
      birthDate: memberForm.birthDate,
      igrejaId: memberForm.igrejaId || null,
      photo: null,
    }
    setUsers(prev => [...prev, newUser])
    setMemberForm({ name: '', age: '', role: ROLES.MEMBRO, username: '', password: '', sector: '', birthDate: '', igrejaId: 'rj' })
    notify(`Membro "${newUser.name}" cadastrado! Login: @${newUser.username}`)
    setTab('membros')
  }

  const registerPastor = () => {
    if (!canRegisterPastors({ role: currentUser?.role })) {
      return notify('Apenas o Pastor Presidente pode cadastrar pastores.', true)
    }
    if (!pastorForm.name || !pastorForm.username || !pastorForm.password) {
      return notify('Preencha nome, usuário e senha.', true)
    }
    if (users.find(u => u.username === pastorForm.username.toLowerCase().trim())) {
      return notify('Este nome de usuário já está em uso.', true)
    }
    const newPastor = {
      id: Date.now(),
      name: pastorForm.name.trim(),
      age: parseInt(pastorForm.age) || 0,
      role: ROLES.PASTOR,
      username: pastorForm.username.toLowerCase().trim(),
      password: pastorForm.password,
      sector: 'Pastoral',
      birthDate: pastorForm.birthDate,
      igrejaId: pastorForm.igrejaId || null,  // null = no church linked
      photo: null,
    }
    setUsers(prev => [...prev, newPastor])
    setPastorForm({ name: '', age: '', username: '', password: '', birthDate: '', igrejaId: '' })
    const churchName = CONGREGATIONS.find(c => c.id === newPastor.igrejaId)?.name
    notify(`Pastor "${newPastor.name}" cadastrado${churchName ? ` — vinculado à ${churchName}` : ' — sem igreja vinculada'}.`)
    setTab('membros')
  }

  const getRoleLabel = (u) => {
    const label = AUTH_ROLE_LABELS[u.role] || ROLE_LABELS[u.role] || u.role
    if (u.role === ROLES.PASTOR && !u.igrejaId) return `${label} (sem igreja)`
    if (u.role === ROLES.PASTOR && u.igrejaId) {
      const c = CONGREGATIONS.find(x => x.id === u.igrejaId)
      return `${label} — ${c?.name || u.igrejaId}`
    }
    return label
  }

  const tabs = [
    { key: 'membros',     label: '👥 Membros' },
    { key: 'add_member',  label: '➕ Novo Membro' },
    { key: 'add_pastor',  label: '✝️ Novo Pastor' },
  ]

  return (
    <div className={s.wrap}>
      <div className={s.tabBar}>
        {tabs.map(t => (
          <button key={t.key} className={`${s.tabBtn} ${tab === t.key ? s.active : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className={s.content}>
        {success && <div className={s.successMsg}>✅ {success}</div>}
        {error   && <div className={s.errorMsg}>⚠️ {error}</div>}

        {/* ── MEMBERS LIST ── */}
        {tab === 'membros' && (
          <>
            <input className={s.search} value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Buscar membro..." />
            {filtered.map(u => (
              <div key={u.id} className={s.memberRow}>
                <div className={s.avatarWrap}>
                  {u.photo
                    ? <img src={u.photo} className={s.avatarImg} alt="foto" />
                    : <div className={s.avatar}>{initials(u.name)}</div>
                  }
                  {isBirthdayToday(u.birthDate) && <span className={s.bdBadge}>🎂</span>}
                </div>
                <div className={s.memberInfo}>
                  <span className={s.memberName}>{u.name} {isBirthdayToday(u.birthDate) ? '🎉' : ''}</span>
                  <span className={s.memberMeta}>@{u.username} · {u.age} anos</span>
                  {u.birthDate && <span className={s.memberBd}>Nasc: {formatBirthDate(u.birthDate)}</span>}
                </div>
                <span className={`${s.roleBadge} ${u.role === 'pastor_presidente' ? s.rolePres : u.role === 'pastor' ? s.rolePast : ''}`}>
                  {getRoleLabel(u)}
                </span>
              </div>
            ))}
          </>
        )}

        {/* ── REGISTER MEMBER ── */}
        {tab === 'add_member' && (
          <>
            <div className={s.formHeader}>
              <div className={s.formHeaderIcon}>👤</div>
              <div>
                <div className={s.formHeaderTitle}>Cadastrar Membro</div>
                <div className={s.formHeaderSub}>Acesso padrão à congregação selecionada</div>
              </div>
            </div>

            {[
              { label: 'NOME COMPLETO',     key: 'name',     placeholder: 'Nome do membro' },
              { label: 'USUÁRIO (login)',   key: 'username', placeholder: 'sem_espaços_ou_acentos' },
              { label: 'SENHA',             key: 'password', placeholder: 'Senha inicial', type: 'password' },
              { label: 'IDADE',             key: 'age',      placeholder: 'Idade', type: 'number' },
              { label: 'DATA DE NASCIMENTO',key: 'birthDate',type: 'date' },
            ].map(f => (
              <div key={f.key} className={s.formField}>
                <label className={s.formLabel}>{f.label}</label>
                <input className={s.formInput} type={f.type || 'text'} value={memberForm[f.key]}
                  onChange={e => setMemberForm({ ...memberForm, [f.key]: e.target.value })}
                  placeholder={f.placeholder || ''} />
              </div>
            ))}

            {/* Congregation — REQUIRED */}
            <div className={s.formField}>
              <label className={s.formLabel}>CONGREGAÇÃO <span className={s.required}>*obrigatório</span></label>
              <select className={s.formInput} value={memberForm.igrejaId}
                onChange={e => setMemberForm({ ...memberForm, igrejaId: e.target.value })}>
                {CONGREGATIONS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Ministry role */}
            <div className={s.formField}>
              <label className={s.formLabel}>FUNÇÃO NO MINISTÉRIO</label>
              <select className={s.formInput} value={memberForm.role}
                onChange={e => setMemberForm({ ...memberForm, role: e.target.value })}>
                {MINISTRY_ROLES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>

            <div className={s.formField}>
              <label className={s.formLabel}>SETOR / OBSERVAÇÃO</label>
              <input className={s.formInput} value={memberForm.sector}
                onChange={e => setMemberForm({ ...memberForm, sector: e.target.value })}
                placeholder="Ex: Conjunto, Obreiros..." />
            </div>

            <button className={s.btnSubmit} onClick={registerMember}>CADASTRAR MEMBRO</button>
          </>
        )}

        {/* ── REGISTER PASTOR ── */}
        {tab === 'add_pastor' && (
          <>
            <div className={s.formHeader}>
              <div className={s.formHeaderIcon}>✝️</div>
              <div>
                <div className={s.formHeaderTitle}>Cadastrar Pastor</div>
                <div className={s.formHeaderSub}>A vinculação à igreja é opcional</div>
              </div>
            </div>

            {/* Access rule info box */}
            <div className={s.accessRuleBox}>
              <div className={s.accessRuleTitle}>📋 Regras de acesso do Pastor</div>
              <div className={s.accessRuleItem}>
                <span className={s.accessIcon}>✅</span>
                <span><strong>Com igreja vinculada:</strong> pode editar agenda e visualizar dados da sua congregação apenas.</span>
              </div>
              <div className={s.accessRuleItem}>
                <span className={s.accessIcon}>🚫</span>
                <span><strong>Sem igreja vinculada:</strong> acesso apenas às funcionalidades básicas do app. Sem edição de dados de igrejas.</span>
              </div>
            </div>

            {[
              { label: 'NOME COMPLETO',     key: 'name',     placeholder: 'Nome do pastor' },
              { label: 'USUÁRIO (login)',   key: 'username', placeholder: 'ex: pr_joao' },
              { label: 'SENHA',             key: 'password', placeholder: 'Senha inicial', type: 'password' },
              { label: 'IDADE',             key: 'age',      placeholder: 'Idade', type: 'number' },
              { label: 'DATA DE NASCIMENTO',key: 'birthDate',type: 'date' },
            ].map(f => (
              <div key={f.key} className={s.formField}>
                <label className={s.formLabel}>{f.label}</label>
                <input className={s.formInput} type={f.type || 'text'} value={pastorForm[f.key]}
                  onChange={e => setPastorForm({ ...pastorForm, [f.key]: e.target.value })}
                  placeholder={f.placeholder || ''} />
              </div>
            ))}

            {/* Church — OPTIONAL */}
            <div className={s.formField}>
              <label className={s.formLabel}>IGREJA QUE PASTOREIA <span className={s.optional}>(opcional)</span></label>
              <select className={s.formInput} value={pastorForm.igrejaId}
                onChange={e => setPastorForm({ ...pastorForm, igrejaId: e.target.value })}>
                <option value="">— Nenhuma (acesso básico apenas) —</option>
                {CONGREGATIONS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {!pastorForm.igrejaId && (
                <p className={s.fieldNote}>⚠️ Sem igreja vinculada, o pastor não poderá editar agendas nem visualizar dados de congregações.</p>
              )}
            </div>

            <button className={s.btnSubmit} onClick={registerPastor}>CADASTRAR PASTOR</button>
          </>
        )}
      </div>
    </div>
  )
}
