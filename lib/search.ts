// Splits the query into words and requires every word to match at least one
// field, so "2023 ford" and "ford 2023" return the same rows.
export function matchesSearch(query: string, fields: Array<string | null | undefined>): boolean {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return true

  const haystacks = fields.filter((field): field is string => Boolean(field)).map((field) => field.toLowerCase())

  return terms.every((term) => haystacks.some((field) => field.includes(term)))
}
