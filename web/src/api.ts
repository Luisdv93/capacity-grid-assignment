export type Person = {
  id: number
  name: string
  weeklyHours: number
  allocatedHours: number[]
}

export type Capacity = {
  from: string
  to: string
  weeks: string[]
  people: Person[]
}

export async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, cache: 'no-store' })
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null
    throw new Error(body?.error || 'The request failed. Try again.')
  }
  return response.json() as Promise<T>
}
