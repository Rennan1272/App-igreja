import s from './PrivacyPolicyScreen.module.css'

export default function PrivacyPolicyScreen({ onBack }) {
  const sections = [
    {
      title: '1. Dados coletados',
      body: 'Coletamos apenas os dados necessários para o funcionamento do aplicativo: nome, data de nascimento, nome de usuário e função na igreja. Não coletamos dados bancários, senhas em texto puro, nem informações de localização.',
    },
    {
      title: '2. Uso dos dados',
      body: 'Seus dados são usados exclusivamente para: identificação no sistema da igreja, exibição de escala e agenda, envio de notificações sobre eventos e comunicação interna entre membros.',
    },
    {
      title: '3. Câmera e galeria',
      body: 'O acesso à câmera e galeria é solicitado apenas quando você opta por adicionar uma foto de perfil ou publicar um post com imagem. Nenhuma imagem é enviada a servidores externos — elas ficam armazenadas localmente no dispositivo.',
    },
    {
      title: '4. Notificações',
      body: 'As notificações são usadas para avisar sobre: escalas do seu ministério, eventos próximos da agenda, aniversários de membros (apenas para o Pastor) e novos pedidos de missão. Você pode desativar as notificações a qualquer momento nas configurações do dispositivo.',
    },
    {
      title: '5. Compartilhamento de dados',
      body: 'Não vendemos, alugamos nem compartilhamos seus dados pessoais com terceiros. Os dados ficam restritos ao sistema interno da Igreja Admirai.',
    },
    {
      title: '6. Segurança',
      body: 'Utilizamos armazenamento seguro do dispositivo (Keychain no iOS / Keystore no Android) para proteger credenciais de autenticação biométrica. Senhas são verificadas localmente e nunca trafegam em texto puro.',
    },
    {
      title: '7. Exclusão de dados',
      body: 'Você pode excluir sua conta a qualquer momento acessando Perfil → Zona de Perigo → Excluir minha conta. Todos os seus dados pessoais serão removidos ou anonimizados imediatamente, conforme a LGPD (Lei nº 13.709/2018).',
    },
    {
      title: '8. Menores de idade',
      body: 'O aplicativo pode ser utilizado por menores de 18 anos apenas com supervisão de um responsável. Não coletamos dados de crianças menores de 13 anos sem consentimento dos pais.',
    },
    {
      title: '9. Contato',
      body: 'Em caso de dúvidas sobre seus dados, entre em contato com o administrador do sistema através do Pastor responsável pela sua congregação.',
    },
    {
      title: '10. Alterações',
      body: 'Esta política pode ser atualizada. Notificaremos os usuários sobre mudanças significativas através do próprio aplicativo. Última atualização: Abril de 2026.',
    },
  ]

  return (
    <div className={s.wrap}>
      <div className={s.header}>
        {onBack && (
          <button className={s.backBtn} onClick={onBack}>← Voltar</button>
        )}
        <span className={s.title}>POLÍTICA DE PRIVACIDADE</span>
      </div>

      <div className={s.content}>
        <div className={s.intro}>
          <div className={s.introIcon}>🔒</div>
          <p className={s.introText}>
            O aplicativo <strong>Admirai</strong> respeita sua privacidade e está em conformidade com a
            Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
          </p>
        </div>

        {sections.map((sec, i) => (
          <div key={i} className={s.section}>
            <h3 className={s.sectionTitle}>{sec.title}</h3>
            <p className={s.sectionBody}>{sec.body}</p>
          </div>
        ))}

        <div className={s.footer}>
          <p>Igreja Admirai · Sistema de Gestão Interno · v1.3</p>
          <p>LGPD em conformidade · Dados protegidos</p>
        </div>
      </div>
    </div>
  )
}
