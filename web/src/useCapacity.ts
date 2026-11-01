import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { request, type Capacity, type Person } from './api'

export type CapacityEdit = {
  person: Person
  draft: string
  status: 'editing' | 'saving' | 'error'
  error?: { kind: 'validation' | 'save'; message: string }
}

type EditState = {
  editor: CapacityEdit | null
  drafts: Record<number, string>
}

type EditAction =
  | { type: 'open'; person: Person }
  | { type: 'change'; draft: string }
  | { type: 'close' }
  | { type: 'saving' }
  | { type: 'saved' }
  | { type: 'error'; error: NonNullable<CapacityEdit['error']> }

type LoadState = {
  key: string
  range: string
  data?: Capacity
  error?: string
}

export function useCapacity(from: string, to: string) {
  const [editState, dispatch] = useReducer(editReducer, { editor: null, drafts: {} })
  const [refresh, setRefresh] = useState({ revision: 0, afterSave: false })
  const [state, setState] = useState<LoadState>({ key: '', range: '' })
  const writing = useRef(false)
  const range = `${from}/${to}`
  const key = `${range}/${refresh.revision}`

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    request<Capacity>(`/api/capacity?${new URLSearchParams({ from, to })}`, {
      signal: controller.signal,
    })
      .then(data => {
        if (active) setState({ key, range, data })
      })
      .catch((error: unknown) => {
        if (!active) return
        setState(previous => ({
          key,
          range,
          data: previous.range === range ? previous.data : undefined,
          error: errorMessage(error, 'Could not load capacity. Try again.'),
        }))
      })
    return () => {
      active = false
      controller.abort()
    }
  }, [from, to, key, range])

  const edit = useCallback((person: Person) => {
    if (writing.current) return
    dispatch({ type: 'open', person })
    setRefresh(previous => ({ ...previous, afterSave: false }))
  }, [])

  function retry() {
    setRefresh(previous => ({ ...previous, revision: previous.revision + 1 }))
  }

  async function save() {
    const editor = editState.editor
    if (!editor || writing.current) return
    const hours = Number(editor.draft)
    if (editor.draft.trim() === '' || !Number.isFinite(hours) || hours < 0) {
      dispatch({
        type: 'error',
        error: { kind: 'validation', message: 'Enter weekly hours of zero or more.' },
      })
      return
    }

    // A ref blocks a second write before React commits the saving state.
    writing.current = true
    dispatch({ type: 'saving' })
    try {
      await request(`/api/people/${editor.person.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weeklyHours: hours }),
      })
      dispatch({ type: 'saved' })
      setRefresh(previous => ({ revision: previous.revision + 1, afterSave: true }))
    } catch (error) {
      dispatch({
        type: 'error',
        error: { kind: 'save', message: errorMessage(error, 'Could not confirm the save. Try again.') },
      })
    } finally {
      writing.current = false
    }
  }

  const load = state.key === key
    ? { data: state.data, loading: false, error: state.error, afterSave: refresh.afterSave }
    : {
        data: state.range === range ? state.data : undefined,
        loading: true,
        error: undefined,
        afterSave: refresh.afterSave,
      }

  return {
    load,
    editor: editState.editor,
    actions: {
      edit,
      changeDraft: (draft: string) => dispatch({ type: 'change', draft }),
      close: () => dispatch({ type: 'close' }),
      save,
      retry,
    },
  }
}

function editReducer(state: EditState, action: EditAction): EditState {
  const { editor, drafts } = state
  if (editor?.status === 'saving' && action.type !== 'saved' && action.type !== 'error') return state

  if (action.type === 'open') {
    return {
      drafts,
      editor: {
        person: action.person,
        draft: drafts[action.person.id] ?? String(action.person.weeklyHours),
        status: 'editing',
      },
    }
  }
  if (!editor) return state

  switch (action.type) {
    case 'change':
      return {
        drafts: { ...drafts, [editor.person.id]: action.draft },
        editor: { ...editor, draft: action.draft, status: 'editing', error: undefined },
      }
    case 'saved':
    case 'close': {
      const remaining = { ...drafts }
      delete remaining[editor.person.id]
      return { drafts: remaining, editor: null }
    }
    case 'saving':
      return { drafts, editor: { ...editor, status: 'saving', error: undefined } }
    case 'error':
      return { drafts, editor: { ...editor, status: 'error', error: action.error } }
  }
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}
