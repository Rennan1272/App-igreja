import { useState } from 'react'
import s from './HelpCenter.module.css'

const TOPICS = [
  {
    icon: '🏠',
    title: 'Aba Início',
    items: [
      'Veja publicações da comunidade no feed principal.',
      'Toque em "+ POST" para criar uma nova publicação com texto ou foto.',
      'Curta (❤️), comente (💬) e compartilhe (↗) qualquer post.',
      'Para denunciar um post, toque em 🚩 no canto do post.',
    ],
  },
  {
    icon: '💬',
    title: 'Conversa (Chat)',
    items: [
      'Acesse mensagens privadas entre membros da igreja.',
      'Toque em um contato para abrir a conversa.',
      'Envie mensagens com Enter ou tocando em ➤.',
      'Ícone ✓ = enviado · ✓✓ = entregue · ✓✓ azul = lido.',
      'Toque em ⋯ na conversa para denunciar ou bloquear.',
    ],
  },
  {
    icon: '🔍',
    title: 'Descobrir',
    items: [
      'Central de acesso a todas as funcionalidades do app.',
      'Busque qualquer funcionalidade pela barra de pesquisa.',
      'Itens exibidos variam conforme sua função na igreja.',
      'Toque em qualquer card para acessar a funcionalidade.',
    ],
  },
  {
    icon: '👥',
    title: 'Contatos',
    items: [
      'Veja todos os membros da igreja como contatos.',
      'Toque em um membro para iniciar uma conversa.',
      'Adicione contatos externos pelo número de telefone.',
      'Crie grupos com múltiplos membros para comunicação coletiva.',
    ],
  },
  {
    icon: '📅',
    title: 'Agenda',
    items: [
      'Visualize cultos, eventos e cantinas no calendário.',
      'Navegue entre meses com as setas ‹ e ›.',
      'Dias com eventos aparecem destacados no calendário.',
      'O Pastor pode adicionar e editar eventos tocando em "+ Evento".',
    ],
  },
  {
    icon: '📋',
    title: 'Escala',
    items: [
      'Veja sua escala de serviço no ministério.',
      'Líderes podem selecionar membros e definir datas.',
      'Músicos têm o instrumento exibido na escala.',
      'Você receberá notificação quando for escalado.',
    ],
  },
  {
    icon: '💰',
    title: 'Arrecadação',
    items: [
      'Veja campanhas ativas com barra de progresso.',
      'Copie a chave PIX de cada campanha com um toque.',
      'Na aba "PIX da Igreja", acesse as chaves para dízimo e oferta.',
      'Líder de Missões e Pastor podem criar novas campanhas.',
    ],
  },
  {
    icon: '🍽️',
    title: 'Cantina',
    items: [
      'Veja os próximos eventos da cantina com cardápio e preço.',
      'Toque em "Reservar lanche" para garantir sua porção.',
      'Pague presencialmente no dia do evento.',
      'Líder da Cantina pode criar novos eventos.',
    ],
  },
  {
    icon: '✈️',
    title: 'Pedidos de Missão',
    items: [
      'Líder de Missões cria pedidos de itens com valor estimado.',
      'Pedidos são enviados automaticamente ao Pastor.',
      'Pastor pode Aprovar ou Rejeitar com uma nota explicativa.',
      'Acompanhe o status: Pendente, Aprovado ou Rejeitado.',
    ],
  },
  {
    icon: '🔐',
    title: 'Segurança e Conta',
    items: [
      'Ative o Face ID/biometria no seu Perfil → Segurança.',
      'Para excluir sua conta: Perfil → Excluir conta.',
      'A exclusão remove todos os dados conforme a LGPD.',
      'Denuncie conteúdo inadequado com o botão 🚩.',
    ],
  },
]

export default function HelpCenter({ onBack }) {
  const [openIdx, setOpenIdx] = useState(null)

  return (
    <div className={s.wrap}>
      <div className={s.header}>
        <button className={s.backBtn} onClick={onBack}>← Voltar</button>
        <span className={s.title}>CENTRAL DE AJUDA</span>
      </div>

      <div className={s.intro}>
        <span className={s.introIcon}>💡</span>
        <p className={s.introText}>Encontre respostas sobre como usar todas as funcionalidades do Admirai.</p>
      </div>

      <div className={s.list}>
        {TOPICS.map((topic, i) => (
          <div key={i} className={s.topic}>
            <button className={s.topicHeader} onClick={() => setOpenIdx(openIdx === i ? null : i)}>
              <span className={s.topicIcon}>{topic.icon}</span>
              <span className={s.topicTitle}>{topic.title}</span>
              <span className={s.chevron}>{openIdx === i ? '▲' : '▼'}</span>
            </button>
            {openIdx === i && (
              <div className={s.topicBody}>
                {topic.items.map((item, j) => (
                  <div key={j} className={s.helpItem}>
                    <span className={s.bullet}>•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={s.footer}>
        <p>Admirai Igreja · v1.6</p>
        <p>Para suporte adicional, fale com o Pastor da sua congregação.</p>
      </div>
    </div>
  )
}
