/**
 * auth.js — Centralized authorization layer
 *
 * Role hierarchy:
 *   pastor_presidente  → full master access, only one who can register members/pastors
 *   pastor             → limited access; if igrejaId set, can edit that church; if null, read-only basics
 *   membro + outros    → access to their own ministry features
 *
 * In production: these guards must also run server-side as middleware.
 * Client-side checks are UX only — backend must re-validate every request.
 */

// ── Role constants ────────────────────────────────────────────────────────────
export const ROLES = {
  PASTOR_PRESIDENTE: 'pastor_presidente',
  PASTOR:            'pastor',
  MEMBRO:            'membro',
  // Ministry leaders
  LIDER_MUSICOS:     'lider_musicos',
  LIDER_INFANTIL:    'lider_infantil',
  LIDER_OBREIROS:    'lider_obreiros',
  LIDER_MISSOES:     'lider_missoes',
  LIDER_CIRCULO:     'lider_circulo',
  LIDER_CANTINA:     'lider_cantina',
  // Ministry members
  MUSICO:            'musico',
  OBREIRO:           'obreiro',
  EDUCADORA:         'educadora',
  CIRCULO_ORACAO:    'circulo_oracao',
}

export const ROLE_LABELS = {
  pastor_presidente: 'Pastor Presidente',
  pastor:            'Pastor',
  membro:            'Membro',
  lider_musicos:     'Líder do Conjunto',
  lider_infantil:    'Líder Min. Infantil',
  lider_obreiros:    'Líder dos Obreiros',
  lider_missoes:     'Líder de Missões',
  lider_circulo:     'Líder do Círculo',
  lider_cantina:     'Líder da Cantina',
  musico:            'Músico',
  obreiro:           'Obreiro',
  educadora:         'Educadora Infantil',
  circulo_oracao:    'Círculo de Oração',
}

export const CONGREGATIONS = [
  { id: 'rj',  name: 'Rio de Janeiro' },
  { id: 'gui', name: 'Guiricema' },
  { id: 'boa', name: 'Boa Família' },
  { id: 'mir', name: 'Miraí' },
]

// ── Core permission checks ────────────────────────────────────────────────────

/** Is the user the master admin? */
export const isPresidente = (user) =>
  user?.role === ROLES.PASTOR_PRESIDENTE

/** Is the user any kind of pastor? */
export const isPastor = (user) =>
  user?.role === ROLES.PASTOR_PRESIDENTE || user?.role === ROLES.PASTOR

/** Can this user register new members? Only presidente. */
export const canRegisterMembers = (user) =>
  isPresidente(user)

/** Can this user register new pastors? Only presidente. */
export const canRegisterPastors = (user) =>
  isPresidente(user)

/**
 * Church access for a pastor.
 * CASE 1: Pastor with igrejaId → can only access that church.
 * CASE 2: Pastor without igrejaId → no church data access.
 * CASE 3: Pastor Presidente → all churches.
 */
export const canAccessChurch = (user, churchId) => {
  if (isPresidente(user)) return true                // full access
  if (user?.role === ROLES.PASTOR) {
    if (!user.igrejaId) return false                 // no church linked → blocked
    return user.igrejaId === churchId                // only their church
  }
  return false
}

/** Can this user edit the calendar? */
export const canManageCalendar = (user, churchId) => {
  if (isPresidente(user)) return true
  if (user?.role === ROLES.PASTOR && user.igrejaId) {
    return churchId == null || user.igrejaId === churchId
  }
  return false
}

/** Can this user view financial data for a church? */
export const canViewFinancial = (user, churchId) => {
  if (isPresidente(user)) return true
  if (user?.role === ROLES.PASTOR && user.igrejaId) {
    return user.igrejaId === churchId
  }
  return false
}

/** Can this user manage fundraising campaigns? */
export const canManageFundraising = (user) =>
  isPresidente(user) || user?.role === ROLES.LIDER_MISSOES

/** Can this user manage PIX keys? */
export const canManagePix = (user) =>
  isPresidente(user)

/** Can this user create schedules? */
export const canCreateSchedule = (user) => {
  const schedulerRoles = [
    ROLES.PASTOR_PRESIDENTE,
    ROLES.LIDER_MUSICOS, ROLES.LIDER_INFANTIL,
    ROLES.LIDER_OBREIROS, ROLES.LIDER_CIRCULO,
  ]
  return schedulerRoles.includes(user?.role)
}

/** Can this user access the admin panel? */
export const canAccessAdmin = (user) =>
  isPresidente(user)

/** Can this user access mission requests? */
export const canAccessMissions = (user) =>
  isPresidente(user) || user?.role === ROLES.LIDER_MISSOES

/** Can this user manage cantina? */
export const canManageCantina = (user) =>
  isPresidente(user) || user?.role === ROLES.LIDER_CANTINA

/** Can this user view financial dashboard? */
export const canViewFinancialDashboard = (user) =>
  isPresidente(user) || (user?.role === ROLES.PASTOR && !!user?.igrejaId)

/** Has access to a schedule tab (ministry members) */
export const hasScheduleAccess = (user) => {
  const scheduleRoles = [
    ROLES.MUSICO, ROLES.OBREIRO, ROLES.EDUCADORA, ROLES.CIRCULO_ORACAO,
    ROLES.LIDER_MUSICOS, ROLES.LIDER_INFANTIL, ROLES.LIDER_OBREIROS,
    ROLES.LIDER_CIRCULO, ROLES.PASTOR_PRESIDENTE,
  ]
  return scheduleRoles.includes(user?.role)
}

/**
 * Get a user-friendly description of what a pastor can/cannot do.
 * Used in the UI to show informative messages.
 */
export const getPastorAccessDescription = (user) => {
  if (!user || user.role !== ROLES.PASTOR) return null
  if (!user.igrejaId) {
    return {
      level: 'restricted',
      message: 'Seu acesso é limitado. Nenhuma igreja foi vinculada ao seu perfil. Contate o Pastor Presidente para configurar seu acesso.',
      canEdit: false,
      churchName: null,
    }
  }
  const church = CONGREGATIONS.find(c => c.id === user.igrejaId)
  return {
    level: 'church',
    message: `Você tem acesso aos dados da congregação ${church?.name || user.igrejaId}.`,
    canEdit: true,
    churchName: church?.name,
  }
}

// ── Legacy compatibility (used in older components via helpers.js) ─────────────
// These map the new auth system back to the old canAccess() pattern
export const legacyCanAccess = (role, feature) => {
  const PRESIDENTE = ROLES.PASTOR_PRESIDENTE
  const PASTOR     = ROLES.PASTOR

  const access = {
    schedule_musico:    ['musico', 'lider_musicos', PRESIDENTE],
    schedule_obreiro:   ['obreiro', 'lider_obreiros', PRESIDENTE],
    schedule_educadora: ['educadora', 'lider_infantil', PRESIDENTE],
    schedule_circulo:   ['circulo_oracao', 'lider_circulo', PRESIDENTE],
    create_schedule:    ['lider_musicos', 'lider_infantil', 'lider_obreiros', 'lider_circulo', PRESIDENTE],
    create_fundraising: ['lider_missoes', PRESIDENTE],
    manage_fundraising: [PRESIDENTE],
    manage_pix:         [PRESIDENTE],
    manage_calendar:    [PRESIDENTE, PASTOR],  // pastor filtered by church in component
    manage_canteen:     ['lider_cantina', PRESIDENTE],
    admin:              [PRESIDENTE],
  }
  return access[feature]?.includes(role) ?? false
}
