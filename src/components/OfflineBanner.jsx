import { useState, useEffect } from 'react'
import s from './OfflineBanner.module.css'

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine)
  const [showBack, setShowBack] = useState(false)

  useEffect(() => {
    const handleOffline = () => { setOffline(true); setShowBack(false) }
    const handleOnline  = () => { setOffline(false); setShowBack(true); setTimeout(() => setShowBack(false), 3000) }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online',  handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online',  handleOnline)
    }
  }, [])

  if (!offline && !showBack) return null

  return (
    <div className={`${s.banner} ${offline ? s.offline : s.online}`}>
      <span className={s.icon}>{offline ? '📵' : '✅'}</span>
      <span className={s.text}>
        {offline
          ? 'Sem conexão — algumas funções podem não estar disponíveis'
          : 'Conexão restaurada'}
      </span>
    </div>
  )
}
