import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

import type { Center } from '../api/generatedClient'
import {
  marathiNameFieldSx,
  normalizeCentreCode,
  toAsciiDigits,
  transliterateEnglishToDevanagari,
} from '../utils/marathiTransliterate'

type Props = {
  label: string
  centres: Center[]
  value: string
  disabled?: boolean
  /** When true, clearing the field is allowed (e.g. “All centres” on reports). */
  allowEmpty?: boolean
  helperText?: string
  onChange: (centreNo: string) => void
}

const centreLabel = (centre: Center): string => {
  const code = centre.centreNo?.trim() || ''
  const name = centre.centreName?.trim() || ''
  const city = centre.city?.trim() || ''
  if (name && city) return `${code} · ${name}, ${city}`
  if (name) return `${code} · ${name}`
  if (city) return `${code} · ${city}`
  return code
}

const searchableText = (centre: Center): string => {
  const parts = [
    centre.centreNo,
    centre.centreName,
    centre.city,
    centre.districtName,
  ]
  return parts
    .filter((part): part is string => Boolean(part && String(part).trim()))
    .map((part) => `${part} ${toAsciiDigits(part)} ${normalizeCentreCode(part)}`)
    .join(' ')
    .toLowerCase()
}

const queryVariants = (query: string): string[] => {
  const trimmed = query.trim()
  if (!trimmed) return []
  const ascii = toAsciiDigits(trimmed).toLowerCase()
  const variants = new Set<string>([ascii])

  // "tha/001" / "thane" → also match Devanagari spellings in the list
  const latinChunks = trimmed.match(/[A-Za-z]+/g) ?? []
  for (const chunk of latinChunks) {
    const marathi = transliterateEnglishToDevanagari(chunk)
    if (marathi) variants.add(marathi.toLowerCase())
  }
  if (/^[A-Za-z0-9/\-\s]+$/u.test(trimmed)) {
    const full = transliterateEnglishToDevanagari(trimmed.replace(/[0-9/\-]+/g, ' '))
    if (full) variants.add(full.toLowerCase())
  }

  return [...variants].filter(Boolean)
}

/**
 * Searchable centre picker for Marathi lists (4000+ centres).
 * Type centre code, Marathi name/city, or English phonetic (e.g. thane, joshi).
 */
export const CentreSearchField = ({
  label,
  centres,
  value,
  disabled = false,
  allowEmpty = true,
  helperText,
  onChange,
}: Props) => {
  const selected =
    centres.find((item) => normalizeCentreCode(item.centreNo ?? '') === normalizeCentreCode(value))
    ?? null

  return (
    <Autocomplete
      size="small"
      fullWidth
      disabled={disabled}
      options={centres}
      value={selected}
      getOptionLabel={centreLabel}
      isOptionEqualToValue={(a, b) =>
        normalizeCentreCode(a.centreNo ?? '') === normalizeCentreCode(b.centreNo ?? '')
      }
      filterOptions={(options, state) => {
        const variants = queryVariants(state.inputValue)
        if (variants.length === 0) return options.slice(0, 80)
        const matched = options.filter((option) => {
          const haystack = searchableText(option)
          return variants.some((q) => haystack.includes(q))
        })
        return matched.slice(0, 80)
      }}
      onChange={(_, next) => onChange(next?.centreNo?.trim() ?? '')}
      disableClearable={!allowEmpty}
      renderOption={(props, option) => {
        const { key, ...rest } = props as typeof props & { key?: string }
        return (
          <Box component="li" key={key ?? option.centreNo} {...rest} sx={{ display: 'block !important', py: 0.75 }}>
            <Typography variant="body2" sx={{ ...marathiNameFieldSx, fontWeight: 600 }}>
              {option.centreNo}
              {option.centreName ? ` · ${option.centreName}` : ''}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={marathiNameFieldSx}>
              {[option.city, option.districtName].filter(Boolean).join(' · ') || '—'}
            </Typography>
          </Box>
        )
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder="Type English or Marathi: thane, joshi, ठा/001…"
          helperText={
            helperText
            ?? (allowEmpty
              ? 'Search by code, name, or city — clear for all centres'
              : 'Search by code, name, or city')
          }
          InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
          inputProps={{
            ...params.inputProps,
            lang: 'mr',
            spellCheck: false,
          }}
          sx={marathiNameFieldSx}
        />
      )}
      noOptionsText="No match — try English (thane), code (ठा/001), or Marathi name"
      clearOnBlur={false}
      autoHighlight
    />
  )
}
