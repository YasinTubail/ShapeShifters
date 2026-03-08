// Currency configuration for Turkish Lira (TRY)
export const CURRENCY = {
  code: 'TRY',
  symbol: '₺',
  locale: 'tr-TR',
}

// Format price in Turkish Lira
export function formatPrice(price: number): string {
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: 'currency',
    currency: CURRENCY.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// Format price without currency symbol (just number with thousands separator)
export function formatPriceNumber(price: number): string {
  return new Intl.NumberFormat(CURRENCY.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}
