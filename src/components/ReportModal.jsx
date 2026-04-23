import { useState } from 'react'
import s from './ReportModal.module.css'

const REPORT_REASONS_POST = [
  'Conteúdo ofensivo ou inadequado',
  'Informação falsa ou enganosa',
  'Spam ou propaganda',
  'Assédio ou bullying',
  'Conteúdo que viola valores cristãos',
  'Outro motivo',
]

const REPORT_REASONS_USER = [
  'Comportamento inadequado',
  'Assédio ou intimidação',
  'Perfil falso',
  'Spam de mensagens',
  'Linguagem ofensiva',
  'Outro motivo',
]

const REPORT_REASONS_MSG = [
  'Mensagem ofensiva',
  'Assédio',
  'Spam',
  'Conteúdo inapropriado',
  'Outro motivo',
]

/**
 * ReportModal
 * type: 'post' | 'user' | 'message'
 * targetName: displayed in the header
 * onDone: called with { action: 'report'|'block'|'cancel', reason? }
 */
export default function ReportModal({ type, targetName, onDone }) {
  const [step, setStep]     = useState('menu')   // 'menu' | 'report' | 'block_confirm' | 'done'
  const [reason, setReason] = useState('')
  const [action, setAction] = useState(null)

  const reasons = type === 'user' ? REPORT_REASONS_USER
    : type === 'message' ? REPORT_REASONS_MSG
    : REPORT_REASONS_POST

  const typeLabel = type === 'user' ? 'usuário'
    : type === 'message' ? 'mensagem'
    : 'publicação'

  const handleReport = () => {
    if (!reason) return
    setAction('report')
    setStep('done')
    // In production: POST /reports { type, targetId, reason }
  }

  const handleBlock = () => {
    setAction('block')
    setStep('done')
    // In production: POST /blocks { targetUserId }
  }

  const handleDone = () => onDone({ action, reason })

  return (
    <div className={s.overlay} onClick={() => onDone({ action: 'cancel' })}>
      <div className={s.sheet} onClick={e => e.stopPropagation()}>
        <div className={s.handle} />

        {/* ── MENU ── */}
        {step === 'menu' && (
          <>
            <h3 className={s.title}>
              {type === 'user' ? `@${targetName}` : 'Opções'}
            </h3>

            <button className={s.optionBtn} onClick={() => setStep('report')}>
              <span className={s.optionIcon}>🚩</span>
              <div>
                <div className={s.optionLabel}>Denunciar {typeLabel}</div>
                <div className={s.optionSub}>Reportar conteúdo inadequado</div>
              </div>
            </button>

            {type === 'user' && (
              <button className={s.optionBtn} onClick={() => setStep('block_confirm')}>
                <span className={s.optionIcon}>🚫</span>
                <div>
                  <div className={s.optionLabel}>Bloquear usuário</div>
                  <div className={s.optionSub}>{targetName} não poderá mais te enviar mensagens</div>
                </div>
              </button>
            )}

            <button className={s.cancelBtn} onClick={() => onDone({ action: 'cancel' })}>
              Cancelar
            </button>
          </>
        )}

        {/* ── REPORT REASONS ── */}
        {step === 'report' && (
          <>
            <h3 className={s.title}>Por que está denunciando?</h3>
            <div className={s.reasonList}>
              {reasons.map(r => (
                <button
                  key={r}
                  className={`${s.reasonBtn} ${reason === r ? s.reasonSelected : ''}`}
                  onClick={() => setReason(r)}
                >
                  {reason === r && '✓ '}{r}
                </button>
              ))}
            </div>
            <button
              className={s.submitBtn}
              onClick={handleReport}
              style={{ opacity: reason ? 1 : 0.4 }}
              disabled={!reason}
            >
              Enviar denúncia
            </button>
            <button className={s.cancelBtn} onClick={() => setStep('menu')}>Voltar</button>
          </>
        )}

        {/* ── BLOCK CONFIRM ── */}
        {step === 'block_confirm' && (
          <>
            <div className={s.confirmIcon}>🚫</div>
            <h3 className={s.title}>Bloquear {targetName}?</h3>
            <p className={s.confirmText}>
              {targetName} não conseguirá mais te enviar mensagens ou ver seu perfil.
              Você pode desbloquear a qualquer momento nas configurações do perfil.
            </p>
            <button className={s.blockBtn} onClick={handleBlock}>Confirmar bloqueio</button>
            <button className={s.cancelBtn} onClick={() => setStep('menu')}>Cancelar</button>
          </>
        )}

        {/* ── SUCCESS ── */}
        {step === 'done' && (
          <>
            <div className={s.confirmIcon}>{action === 'block' ? '🚫' : '✅'}</div>
            <h3 className={s.title}>
              {action === 'block' ? 'Usuário bloqueado' : 'Denúncia enviada'}
            </h3>
            <p className={s.confirmText}>
              {action === 'block'
                ? 'Você bloqueou este usuário. Ele não poderá mais entrar em contato com você.'
                : 'Obrigado por reportar. Nossa equipe de moderação irá analisar em breve.'}
            </p>
            <button className={s.submitBtn} onClick={handleDone}>OK</button>
          </>
        )}
      </div>
    </div>
  )
}
