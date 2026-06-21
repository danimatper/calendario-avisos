import { describe, it, expect } from 'vitest'
import { getCategoryStyle, CATEGORY_COLORS } from '../lib/categories'

describe('getCategoryStyle', () => {
  it('devuelve un estilo por defecto cuando la categoría es null', () => {
    const estilo = getCategoryStyle(null)
    expect(estilo).toHaveProperty('bg')
    expect(estilo).toHaveProperty('lightBg')
  })

  it('devuelve el color predefinido para una categoría conocida', () => {
    expect(getCategoryStyle('Seguros')).toEqual(CATEGORY_COLORS['Seguros'])
  })

  it('es determinista para categorías desconocidas', () => {
    const a = getCategoryStyle('CategoriaInventada')
    const b = getCategoryStyle('CategoriaInventada')
    expect(a).toEqual(b)
  })
})
