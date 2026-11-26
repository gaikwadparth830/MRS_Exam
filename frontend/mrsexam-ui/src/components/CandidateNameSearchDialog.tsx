import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { MarathiNameField, MarathiPhoneticToggle } from './MarathiNameField'
import { marathiNameFieldSx } from '../utils/marathiTransliterate'

export type NameSearchColumn<T> = {
  id: string
  label: string
  width?: number | string
  align?: 'left' | 'right' | 'center'
  render: (row: T) => ReactNode
}

type Props<T> = {
  open: boolean
  onClose: () => void
  title?: string
  /** Label for the query field (default: Name). */
  queryLabel?: string
  queryHelperText?: string
  phoneticAssist: boolean
  onPhoneticAssistChange?: (enabled: boolean) => void
  /** Called when query has at least minChars (after debounce). */
  searchFn: (query: string) => Promise<T[]>
  getRowKey: (row: T) => string
  columns: Array<NameSearchColumn<T>>
  onSelect: (row: T) => void
  minChars?: number
  debounceMs?: number
  emptyHint?: string
}

/**
 * Modal name search: phonetic English → Marathi, live matches, click to open record.
 */
export function CandidateNameSearchDialog<T>({
  open,
  onClose,
  title = 'Search by name',
  queryLabel = 'Name',
  queryHelperText,
  phoneticAssist,
  onPhoneticAssistChange,
  searchFn,
  getRowKey,
  columns,
  onSelect,
  minChars = 2,
  debounceMs = 350,
  emptyHint = 'Type at least 2 characters. Example: gaikwad → गायकवाड (Space to convert).',
}: Props<T>) {
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState<T[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const requestIdRef = useRef(0)
  const listRef = useRef<HTMLDivElement | null>(null)
  const searchFnRef = useRef(searchFn)
  searchFnRef.current = searchFn

  useEffect(() => {
    if (!open) return
    setQuery('')
    setRows([])
    setActiveIndex(0)
    setError(null)
    setSearched(false)
    setLoading(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    const trimmed = query.trim()
    if (trimmed.length < minChars) {
      setRows([])
      setSearched(false)
      setLoading(false)
      setError(null)
      return
    }

    const requestId = ++requestIdRef.current
    setLoading(true)
    setError(null)
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const matches = await searchFnRef.current(trimmed)
          if (requestId !== requestIdRef.current) return
          setRows(matches)
          setActiveIndex(0)
          setSearched(true)
        } catch (err) {
          if (requestId !== requestIdRef.current) return
          setRows([])
          setSearched(true)
          setError(err instanceof Error ? err.message : 'Search failed.')
        } finally {
          if (requestId === requestIdRef.current) setLoading(false)
        }
      })()
    }, debounceMs)

    return () => window.clearTimeout(timer)
  }, [query, open, minChars, debounceMs])

  useEffect(() => {
    if (!open || rows.length === 0) return
    const el = listRef.current?.querySelector<HTMLElement>(`[data-search-row="${activeIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open, rows.length])

  const statusText = useMemo(() => {
    if (loading) return 'Searching…'
    if (!searched) return emptyHint
    if (rows.length === 0) return `No matches for “${query.trim()}”.`
    return `${rows.length} match${rows.length === 1 ? '' : 'es'} — click a row or Ctrl+Enter.`
  }, [loading, searched, rows.length, query, emptyHint])

  const selectRow = (row: T) => {
    onSelect(row)
    onClose()
  }

  const onKeyDownCapture = (event: React.KeyboardEvent) => {
    if (!open || rows.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, rows.length - 1))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
      return
    }
    if (event.key === 'Enter' && event.ctrlKey) {
      const row = rows[activeIndex]
      if (row && searched && !loading) {
        event.preventDefault()
        selectRow(row)
      }
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      onKeyDownCapture={onKeyDownCapture}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {onPhoneticAssistChange ? (
            <MarathiPhoneticToggle
              enabled={phoneticAssist}
              onChange={onPhoneticAssistChange}
            />
          ) : null}

          <MarathiNameField
            label={queryLabel}
            value={query}
            required={false}
            phoneticAssist={phoneticAssist}
            showAssistControls={false}
            onChange={setQuery}
            helperText={
              queryHelperText
                ?? (phoneticAssist
                  ? 'Type English (gaikwad), press Space to convert, matches appear below.'
                  : 'Type Marathi name. Matches appear as you type.')
            }
          />

          <Stack direction="row" spacing={1} alignItems="center">
            {loading ? <CircularProgress size={16} /> : null}
            <Typography variant="body2" color="text.secondary">
              {statusText}
            </Typography>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}

          {rows.length > 0 ? (
            <Box
              ref={listRef}
              sx={{
                maxHeight: 360,
                overflow: 'auto',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5,
              }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {columns.map((col) => (
                      <TableCell
                        key={col.id}
                        align={col.align ?? 'left'}
                        sx={{ width: col.width, fontWeight: 700, bgcolor: '#f4f8fb' }}
                      >
                        {col.label}
                      </TableCell>
                    ))}
                    <TableCell sx={{ width: 88, fontWeight: 700, bgcolor: '#f4f8fb' }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, index) => {
                    const selected = index === activeIndex
                    return (
                      <TableRow
                        key={getRowKey(row)}
                        hover
                        selected={selected}
                        data-search-row={index}
                        onClick={() => selectRow(row)}
                        onMouseEnter={() => setActiveIndex(index)}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: selected ? 'rgba(11, 79, 108, 0.08)' : undefined,
                        }}
                      >
                        {columns.map((col) => (
                          <TableCell
                            key={col.id}
                            align={col.align ?? 'left'}
                            sx={
                              col.id === 'name'
                                ? marathiNameFieldSx['& .MuiInputBase-input']
                                : undefined
                            }
                          >
                            {col.render(row)}
                          </TableCell>
                        ))}
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant={selected ? 'contained' : 'outlined'}
                            onClick={(e) => {
                              e.stopPropagation()
                              selectRow(row)
                            }}
                          >
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Box>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
