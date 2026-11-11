import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'

import {
  fetchMarathiSuggestions,
  getTrailingLatinWord,
  listCustomMarathiSpellings,
  marathiNameFieldSx,
  removeCustomMarathiSpelling,
  saveCustomMarathiSpelling,
  toDevanagariDigits,
  transliterateTrailingLatinWord,
} from '../utils/marathiTransliterate'

type MarathiNameFieldProps = {
  label?: string
  value: string
  disabled?: boolean
  required?: boolean
  phoneticAssist: boolean
  onPhoneticAssistChange?: (enabled: boolean) => void
  onChange: (value: string) => void
  helperText?: string
  /** Show switch + convert link under the field. Use false in dense master grids. */
  showAssistControls?: boolean
  fullWidth?: boolean
  sx?: SxProps<Theme>
}

type SuggestionState = {
  prefix: string
  suffix: string
  english: string
  options: string[]
  appendSpace: boolean
}

const MarathiSpellingDictionaryDialog = ({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) => {
  const [english, setEnglish] = useState('')
  const [marathi, setMarathi] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  const rows = useMemo(() => listCustomMarathiSpellings(), [version, open])

  const onSave = () => {
    const saveError = saveCustomMarathiSpelling(english, marathi)
    if (saveError) {
      setError(saveError)
      setSuccess(null)
      return
    }

    setError(null)
    setSuccess(`Saved: ${english.trim().toLowerCase()} → ${marathi.trim()}`)
    setEnglish('')
    setMarathi('')
    setVersion((current) => current + 1)
  }

  const onRemove = (word: string) => {
    removeCustomMarathiSpelling(word)
    setSuccess(`Removed: ${word}`)
    setError(null)
    setVersion((current) => current + 1)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Save Marathi spelling</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            If convert is wrong, save the correct Marathi here. Next Space convert uses it.
            Saved in this browser only.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              size="small"
              label="English word"
              value={english}
              onChange={(event) => setEnglish(event.target.value)}
              fullWidth
              placeholder="sangali"
              inputProps={{ autoComplete: 'off', spellCheck: false }}
            />
            <TextField
              size="small"
              label="Correct Marathi"
              value={marathi}
              onChange={(event) => setMarathi(event.target.value)}
              fullWidth
              placeholder="सांगली"
              sx={marathiNameFieldSx}
              inputProps={{ lang: 'mr', autoComplete: 'off', spellCheck: false }}
            />
          </Stack>

          <Button variant="contained" onClick={onSave} sx={{ alignSelf: 'flex-start' }}>
            Save spelling
          </Button>

          {error ? <Alert severity="error">{error}</Alert> : null}
          {success ? <Alert severity="success">{success}</Alert> : null}

          <Typography variant="subtitle2">Your saved spellings ({rows.length})</Typography>
          {rows.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No custom spellings yet.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>English</TableCell>
                  <TableCell>Marathi</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.english}>
                    <TableCell>{row.english}</TableCell>
                    <TableCell sx={marathiNameFieldSx['& .MuiInputBase-input']}>{row.marathi}</TableCell>
                    <TableCell align="right">
                      <Button size="small" color="error" onClick={() => onRemove(row.english)}>
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export const MarathiPhoneticToggle = ({
  enabled,
  disabled = false,
  onChange,
  endAdornment,
}: {
  enabled: boolean
  disabled?: boolean
  onChange: (enabled: boolean) => void
  endAdornment?: ReactNode
}) => {
  const [dictionaryOpen, setDictionaryOpen] = useState(false)

  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        sx={{
          px: 1.5,
          py: 1,
          borderRadius: 2,
          bgcolor: 'rgba(11, 79, 108, 0.04)',
          border: '1px solid rgba(11, 79, 108, 0.1)',
        }}
      >
        <FormControlLabel
          sx={{ m: 0 }}
          control={(
            <Switch
              size="small"
              checked={enabled}
              disabled={disabled}
              onChange={(event) => onChange(event.target.checked)}
            />
          )}
          label={(
            <Typography variant="body2" fontWeight={600}>
              Phonetic English → Marathi
            </Typography>
          )}
        />
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="caption" color="text.secondary">
            {enabled
              ? 'Space converts and shows multiple Marathi choices (like mobile keyboard).'
              : 'Type Marathi directly with Windows/Chrome Marathi keyboard.'}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            disabled={disabled}
            onClick={() => setDictionaryOpen(true)}
          >
            Save spelling
          </Button>
          {endAdornment}
        </Stack>
      </Stack>

      <MarathiSpellingDictionaryDialog
        open={dictionaryOpen}
        onClose={() => setDictionaryOpen(false)}
      />
    </>
  )
}

export const MarathiNameField = ({
  label = 'Name (Marathi) *',
  value,
  disabled = false,
  required = true,
  phoneticAssist,
  onPhoneticAssistChange,
  onChange,
  helperText,
  showAssistControls = true,
  fullWidth = true,
  sx,
}: MarathiNameFieldProps) => {
  const [suggestions, setSuggestions] = useState<SuggestionState | null>(null)
  const [isSuggesting, setIsSuggesting] = useState(false)
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (!phoneticAssist || disabled) {
      setSuggestions(null)
      setIsSuggesting(false)
    }
  }, [phoneticAssist, disabled])

  const applySuggestion = (marathi: string, state: SuggestionState, remember: boolean) => {
    if (remember) {
      saveCustomMarathiSpelling(state.english, marathi)
    }
    const next = `${state.prefix}${marathi}${state.suffix}${state.appendSpace ? ' ' : ''}`
    onChange(next)
    setSuggestions(null)
  }

  const requestSuggestions = async (appendSpace: boolean) => {
    const trailing = getTrailingLatinWord(value)
    if (!trailing) {
      // Already Marathi text with English digits: ठा/001 → ठा/००१
      const digitsConverted = toDevanagariDigits(value.replace(/\s+$/u, ''))
      if (digitsConverted && digitsConverted !== value.replace(/\s+$/u, '')) {
        onChange(appendSpace ? `${digitsConverted} ` : digitsConverted)
        return
      }
      if (appendSpace && !/\s$/u.test(value)) {
        onChange(`${value} `)
      }
      return
    }

    const requestId = ++requestIdRef.current
    setIsSuggesting(true)
    const marathiSuffix = toDevanagariDigits(trailing.suffix)

    // Instant first choice (exact / offline), then enrich with Google candidates.
    const instant = transliterateTrailingLatinWord(value, { appendSpace })
    onChange(instant)

    try {
      const options = await fetchMarathiSuggestions(trailing.latinWord, { limit: 5 })
      if (requestId !== requestIdRef.current) return

      if (options.length === 0) {
        setSuggestions(null)
        return
      }

      // Keep field on first option; show alternatives like mobile keyboard.
      // Letters → Marathi, digits → ०-९ (tha/001 → ठा/००१).
      const first = options[0]
      const shouldAppendSpace = appendSpace && !trailing.suffix
      onChange(`${trailing.prefix}${first}${marathiSuffix}${shouldAppendSpace ? ' ' : ''}`)
      setSuggestions({
        prefix: trailing.prefix,
        suffix: marathiSuffix,
        english: trailing.latinWord,
        options,
        appendSpace: shouldAppendSpace,
      })
    } finally {
      if (requestId === requestIdRef.current) {
        setIsSuggesting(false)
      }
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled || !phoneticAssist) return

    if (suggestions && /^[1-5]$/.test(event.key)) {
      const index = Number(event.key) - 1
      const option = suggestions.options[index]
      if (option) {
        event.preventDefault()
        applySuggestion(option, suggestions, index > 0)
      }
      return
    }

    if (event.key === 'Escape' && suggestions) {
      event.preventDefault()
      setSuggestions(null)
      return
    }

    if (event.key !== ' ' && event.key !== 'Enter') return

    event.preventDefault()
    void requestSuggestions(event.key === ' ')
  }

  const onConvertNow = () => {
    if (disabled) return
    void requestSuggestions(false)
  }

  const defaultHelper = showAssistControls
    ? (phoneticAssist
      ? 'Space converts. Pick another chip if first choice is wrong (or press 1–5).'
      : 'Enter Marathi (Devanagari).')
    : undefined

  return (
    <Stack spacing={0.5} sx={[{ width: fullWidth ? '100%' : undefined }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>
      <TextField
        label={label}
        value={value}
        required={required}
        disabled={disabled}
        fullWidth={fullWidth}
        size="small"
        onChange={(event) => {
          setSuggestions(null)
          onChange(event.target.value)
        }}
        onKeyDown={onKeyDown}
        sx={marathiNameFieldSx}
        inputProps={{
          lang: 'mr',
          spellCheck: false,
          autoComplete: 'off',
          'aria-label': label,
        }}
        helperText={helperText !== undefined ? helperText : defaultHelper}
      />

      {(isSuggesting || suggestions) ? (
        <Box
          sx={{
            px: 1,
            py: 0.75,
            borderRadius: 1.5,
            border: '1px solid rgba(11, 79, 108, 0.12)',
            bgcolor: 'rgba(11, 79, 108, 0.03)',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="caption" color="text.secondary">
              {isSuggesting ? 'Suggestions…' : `Choices for “${suggestions?.english ?? ''}”`}
            </Typography>
            {isSuggesting ? <CircularProgress size={14} /> : null}
            {suggestions?.options.map((option, index) => (
              <Chip
                key={`${option}-${index}`}
                size="small"
                color={index === 0 ? 'primary' : 'default'}
                variant={index === 0 ? 'filled' : 'outlined'}
                label={`${index + 1}. ${option}`}
                onClick={() => applySuggestion(option, suggestions, index > 0)}
                sx={{
                  fontFamily: '"Noto Sans Devanagari", "IBM Plex Sans", sans-serif',
                  fontSize: '0.95rem',
                }}
              />
            ))}
          </Stack>
        </Box>
      ) : null}

      {showAssistControls && onPhoneticAssistChange ? (
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
          <FormControlLabel
            sx={{ m: 0 }}
            control={(
              <Switch
                size="small"
                checked={phoneticAssist}
                disabled={disabled}
                onChange={(event) => onPhoneticAssistChange(event.target.checked)}
              />
            )}
            label={<Typography variant="caption">Phonetic assist</Typography>}
          />
          {phoneticAssist && !disabled ? (
            <Typography
              component="button"
              type="button"
              variant="caption"
              color="primary"
              onClick={onConvertNow}
              sx={{
                border: 0,
                background: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                p: 0,
                font: 'inherit',
              }}
            >
              Convert now
            </Typography>
          ) : null}
        </Stack>
      ) : null}
    </Stack>
  )
}
