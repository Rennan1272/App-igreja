import { useState } from 'react'
import { ROLE_LABELS } from '../data/initialData.js'
import { initials } from '../utils/helpers.js'
import s from './ContactsTab.module.css'

/**
 * ContactsTab
 * - Lists all church members as contacts
 * - Add contact by phone number
 * - Create groups with multiple members
 * - Each contact opens chat (via onOpenChat)
 */

export default function ContactsTab({ user, users, onOpenChat }) {
  const [subTab, setSubTab]         = useState('contatos') // 'contatos' | 'grupos'
  const [search, setSearch]         = useState('')
  const [showAddPhone, setShowAddPhone] = useState(false)
  const [phone, setPhone]           = useState('')
  const [phoneName, setPhoneName]   = useState('')
  const [phoneAdded, setPhoneAdded] = useState([])

  // Groups state
  const [groups, setGroups]         = useState([
    { id: 1, name: 'Conjunto Musical', members: ['Lúcia Ferreira', 'Maria Santos'], created: 'Pastor José' },
    { id: 2, name: 'Obreiros',         members: ['Pedro Costa', 'Fernanda Alves'], created: 'Pastor José' },
  ])
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [groupName, setGroupName]   = useState('')
  const [selectedMembers, setSelectedMembers] = useState([])

  const contacts = users.filter(u => u.name !== user.name)
  const filtered = contacts.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.sector || '').toLowerCase().includes(search.toLowerCase())
  )

  const addPhoneContact = () => {
    if (!phoneName.trim() || !phone.trim()) return
    setPhoneAdded(prev => [...prev, { name: phoneName, phone, id: Date.now() }])
    setPhone('')
    setPhoneName('')
    setShowAddPhone(false)
  }

  const toggleMember = (name) =>
    setSelectedMembers(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])

  const createGroup = () => {
    if (!groupName.trim() || selectedMembers.length < 1) return
    setGroups(prev => [...prev, {
      id: Date.now(),
      name: groupName,
      members: selectedMembers,
      created: user.name,
    }])
    setGroupName('')
    setSelectedMembers([])
    setShowCreateGroup(false)
  }

  return (
    <div className={s.wrap}>
      {/* Header */}
      <div className={s.header}>
        <h2 className={s.title}>CONTATOS</h2>
        <button className={s.btnAdd} onClick={() => setShowAddPhone(!showAddPhone)}>+ Adicionar</button>
      </div>

      {/* Add by phone form */}
      {showAddPhone && (
        <div className={s.addForm}>
          <h4 className={s.formTitle}>ADICIONAR POR TELEFONE</h4>
          <label className={s.formLabel}>NOME</label>
          <input className={s.formInput} value={phoneName} onChange={e => setPhoneName(e.target.value)} placeholder="Nome do contato" />
          <label className={s.formLabel}>NÚMERO DE TELEFONE</label>
          <input className={s.formInput} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+55 21 99999-9999" />
          <div className={s.formActions}>
            <button className={s.btnSave} onClick={addPhoneContact}>Adicionar</button>
            <button className={s.btnCancel} onClick={() => setShowAddPhone(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Sub-tabs */}
      <div className={s.subTabs}>
        <button className={`${s.subTab} ${subTab === 'contatos' ? s.subActive : ''}`} onClick={() => setSubTab('contatos')}>
          Membros ({contacts.length + phoneAdded.length})
        </button>
        <button className={`${s.subTab} ${subTab === 'grupos' ? s.subActive : ''}`} onClick={() => setSubTab('grupos')}>
          Grupos ({groups.length})
        </button>
      </div>

      {/* Search */}
      <div className={s.searchWrap}>
        <input
          className={s.search}
          placeholder="🔍  Buscar contato..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Contacts list */}
      {subTab === 'contatos' && (
        <div>
          {/* Phone contacts added manually */}
          {phoneAdded.length > 0 && (
            <>
              <div className={s.sectionLabel}>ADICIONADOS POR TELEFONE</div>
              {phoneAdded.map(c => (
                <div key={c.id} className={s.contactRow}>
                  <div className={s.avatar} style={{ background: '#2a2a2a' }}>📱</div>
                  <div className={s.contactInfo}>
                    <div className={s.contactName}>{c.name}</div>
                    <div className={s.contactMeta}>{c.phone}</div>
                  </div>
                </div>
              ))}
            </>
          )}

          <div className={s.sectionLabel}>MEMBROS DA IGREJA ({filtered.length})</div>
          {filtered.map(contact => (
            <button
              key={contact.id}
              className={s.contactRow}
              onClick={() => onOpenChat && onOpenChat(contact.name)}
              style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              {contact.photo
                ? <img src={contact.photo} alt="" className={s.avatarImg} />
                : <div className={s.avatar}>{initials(contact.name)}</div>
              }
              <div className={s.contactInfo}>
                <div className={s.contactName}>{contact.name}</div>
                <div className={s.contactMeta}>{ROLE_LABELS[contact.role]} · {contact.sector}</div>
              </div>
              <div className={s.contactActions}>
                <span className={s.chatIcon} title="Enviar mensagem">💬</span>
              </div>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className={s.empty}>Nenhum contato encontrado.</div>
          )}
        </div>
      )}

      {/* Groups */}
      {subTab === 'grupos' && (
        <div>
          <div className={s.groupHeader}>
            <div className={s.sectionLabel}>GRUPOS ({groups.length})</div>
            <button className={s.btnCreateGroup} onClick={() => setShowCreateGroup(!showCreateGroup)}>
              + Criar grupo
            </button>
          </div>

          {/* Create group form */}
          {showCreateGroup && (
            <div className={s.addForm}>
              <h4 className={s.formTitle}>NOVO GRUPO</h4>
              <label className={s.formLabel}>NOME DO GRUPO</label>
              <input className={s.formInput} value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Ex: Equipe de Louvor" />
              <label className={s.formLabel}>ADICIONAR MEMBROS</label>
              <div className={s.memberPicker}>
                {contacts.map(c => (
                  <button
                    key={c.id}
                    className={`${s.memberChip} ${selectedMembers.includes(c.name) ? s.chipSelected : ''}`}
                    onClick={() => toggleMember(c.name)}
                  >
                    {selectedMembers.includes(c.name) && <span>✓ </span>}
                    {c.name.split(' ')[0]}
                  </button>
                ))}
              </div>
              <div className={s.selectedCount}>
                {selectedMembers.length} membro{selectedMembers.length !== 1 ? 's' : ''} selecionado{selectedMembers.length !== 1 ? 's' : ''}
              </div>
              <div className={s.formActions}>
                <button className={s.btnSave} onClick={createGroup}>Criar grupo</button>
                <button className={s.btnCancel} onClick={() => setShowCreateGroup(false)}>Cancelar</button>
              </div>
            </div>
          )}

          {groups.map(g => (
            <div key={g.id} className={s.groupCard}>
              <div className={s.groupAvatar}>{g.name.charAt(0).toUpperCase()}</div>
              <div className={s.groupInfo}>
                <div className={s.groupName}>{g.name}</div>
                <div className={s.groupMeta}>
                  {g.members.slice(0, 3).join(', ')}{g.members.length > 3 ? ` +${g.members.length - 3}` : ''} · {g.members.length} membros
                </div>
              </div>
              <span className={s.chatIcon}>💬</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
