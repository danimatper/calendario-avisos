export const CATEGORY_COLORS: Record<string, {
  bg: string
  text: string
  border: string
  lightBg: string
  lightText: string
}> = {
  'Seguros':         { bg: 'bg-blue-600',    text: 'text-white', border: 'border-blue-600',    lightBg: 'bg-blue-100',    lightText: 'text-blue-800' },
  'ITV / Revisión':  { bg: 'bg-red-500',     text: 'text-white', border: 'border-red-500',     lightBg: 'bg-red-100',     lightText: 'text-red-800' },
  'Licencias':       { bg: 'bg-purple-600',  text: 'text-white', border: 'border-purple-600',  lightBg: 'bg-purple-100',  lightText: 'text-purple-800' },
  'Tacógrafo':       { bg: 'bg-orange-500',  text: 'text-white', border: 'border-orange-500',  lightBg: 'bg-orange-100',  lightText: 'text-orange-800' },
  'Contratos':       { bg: 'bg-teal-600',    text: 'text-white', border: 'border-teal-600',    lightBg: 'bg-teal-100',    lightText: 'text-teal-800' },
  'Pagos':           { bg: 'bg-green-600',   text: 'text-white', border: 'border-green-600',   lightBg: 'bg-green-100',   lightText: 'text-green-800' },
  'Fitosanitario':   { bg: 'bg-lime-600',    text: 'text-white', border: 'border-lime-600',    lightBg: 'bg-lime-100',    lightText: 'text-lime-800' },
  'Mantenimiento':   { bg: 'bg-yellow-500',  text: 'text-white', border: 'border-yellow-500',  lightBg: 'bg-yellow-100',  lightText: 'text-yellow-800' },
  'Permisos':        { bg: 'bg-indigo-600',  text: 'text-white', border: 'border-indigo-600',  lightBg: 'bg-indigo-100',  lightText: 'text-indigo-800' },
  'Otros':           { bg: 'bg-slate-500',   text: 'text-white', border: 'border-slate-500',   lightBg: 'bg-slate-100',   lightText: 'text-slate-700' },
}

const FALLBACK_PALETTE = [
  { bg: 'bg-blue-600',   text: 'text-white', border: 'border-blue-600',   lightBg: 'bg-blue-100',   lightText: 'text-blue-800' },
  { bg: 'bg-rose-500',   text: 'text-white', border: 'border-rose-500',   lightBg: 'bg-rose-100',   lightText: 'text-rose-800' },
  { bg: 'bg-violet-600', text: 'text-white', border: 'border-violet-600', lightBg: 'bg-violet-100', lightText: 'text-violet-800' },
  { bg: 'bg-emerald-600',text: 'text-white', border: 'border-emerald-600',lightBg: 'bg-emerald-100',lightText: 'text-emerald-800' },
  { bg: 'bg-amber-500',  text: 'text-white', border: 'border-amber-500',  lightBg: 'bg-amber-100',  lightText: 'text-amber-800' },
  { bg: 'bg-cyan-600',   text: 'text-white', border: 'border-cyan-600',   lightBg: 'bg-cyan-100',   lightText: 'text-cyan-800' },
  { bg: 'bg-pink-500',   text: 'text-white', border: 'border-pink-500',   lightBg: 'bg-pink-100',   lightText: 'text-pink-800' },
  { bg: 'bg-indigo-600', text: 'text-white', border: 'border-indigo-600', lightBg: 'bg-indigo-100', lightText: 'text-indigo-800' },
]

export function getCategoryStyle(category: string | null) {
  if (!category) return FALLBACK_PALETTE[0]
  if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category]
  let hash = 0
  for (let i = 0; i < category.length; i++) hash += category.charCodeAt(i)
  return FALLBACK_PALETTE[hash % FALLBACK_PALETTE.length]
}

export const DEFAULT_CATEGORIES = Object.keys(CATEGORY_COLORS)
