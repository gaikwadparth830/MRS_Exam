import type { HTMLAttributes } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'
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

type BaseProps = {
  label: string
  centres: Center[]
  disabled?: boolean
  helperText?: string
}

type SingleProps = BaseProps & {
  multiple?: false
  value: string
  /** When true, clearing the field is allowed (e.g. “All centres” on reports). */
  allowEmpty?: boolean
  onChange: (centreNo: string) => void
}

type MultiProps = BaseProps & {
  multiple: true
  value: string[]
  allowEmpty?: boolean
  onChange: (centreNos: string[]) => void
}

type Props = SingleProps | MultiProps

const RESULT_LIMIT = 300

const centreLabel = (centre: Center): string => {
  const code = centre.centreNo?.trim() || ''
  const name = centre.centreName?.trim() || ''
  const city = centre.city?.trim() || ''
  if (name && city) return `${code} · ${name}, ${city}`
  if (name) return `${code} · ${name}`
  if (city) return `${code} · ${city}`
  return code
}

const chipLabel = (centre: Center): string => {
  const code = centre.centreNo?.trim() || ''
  const name = centre.centreName?.trim() || ''
  if (code && name) {
    const shortName = name.length > 28 ? `${name.slice(0, 28)}…` : name
    return `${code} · ${shortName}`
  }
  return code || name || '-'
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
    .map((part) => {
      const raw = part.trim()
      const ascii = toAsciiDigits(raw)
      const code = normalizeCentreCode(raw)
      return `${raw} ${ascii} ${code}`
    })
    .join(' ')
    .toLowerCase()
}

/** Expand one token into English + Devanagari + digit-normalized forms. */
const tokenVariants = (token: string): string[] => {
  const trimmed = token.trim()
  if (!trimmed) return []
  const variants = new Set<string>()
  const ascii = toAsciiDigits(trimmed).toLowerCase()
  variants.add(ascii)
  variants.add(trimmed.toLowerCase())
  variants.add(normalizeCentreCode(trimmed).toLowerCase())

  const marathi = transliterateEnglishToDevanagari(trimmed)
  if (marathi) {
    variants.add(marathi.toLowerCase())
    // Common phonetic near-misses for पुणे
    if (marathi === 'पुने') variants.add('पुणे')
    if (marathi === 'पुणे') variants.add('पुने')
  }

  return [...variants].filter(Boolean)
}

const queryTokens = (query: string): string[] =>
  query
    .trim()
    .split(/[\s,;]+/u)
    .map((part) => part.trim())
    .filter(Boolean)

/**
 * Multi-token AND match: every token must hit the centre text via at least one variant.
 * Single token still matches broadly (code / name / city / district).
 */
const centreMatchesQuery = (centre: Center, query: string): boolean => {
  const tokens = queryTokens(query)
  if (tokens.length === 0) return true
  const haystack = searchableText(centre)
  return tokens.every((token) => {
    const variants = tokenVariants(token)
    return variants.some((variant) => variant.length > 0 && haystack.includes(variant))
  })
}

const rankCentre = (centre: Center, query: string): number => {
  const tokens = queryTokens(query)
  const code = normalizeCentreCode(centre.centreNo ?? '').toLowerCase()
  const name = (centre.centreName ?? '').toLowerCase()
  const city = (centre.city ?? '').toLowerCase()
  let score = 0
  for (const token of tokens) {
    for (const variant of tokenVariants(token)) {
      if (!variant) continue
      if (code.startsWith(variant)) score += 40
      else if (code.includes(variant)) score += 25
      if (city.includes(variant)) score += 20
      if (name.includes(variant)) score += 10
    }
  }
  return score
}

const findCentre = (centres: Center[], centreNo: string): Center | undefined =>
  centres.find((item) => normalizeCentreCode(item.centreNo ?? '') === normalizeCentreCode(centreNo))

/**
 * Searchable centre picker for Marathi lists (4000+ centres).
 * Supports single or multiple selection.
 */
export const CentreSearchField = (props: Props) => {
  const {
    label,
    centres,
    disabled = false,
    allowEmpty = true,
    helperText,
    multiple = false,
  } = props

  const filterOptions = (options: Center[], state: { inputValue: string }) => {
    const query = state.inputValue.trim()
    if (!query) return options.slice(0, 80)

    const matched = options
      .filter((option) => centreMatchesQuery(option, query))
      .sort((a, b) => {
        const rankDiff = rankCentre(b, query) - rankCentre(a, query)
        if (rankDiff !== 0) return rankDiff
        return (a.centreNo ?? '').localeCompare(b.centreNo ?? '', 'mr')
      })

    return matched.slice(0, RESULT_LIMIT)
  }

  const common = {
    size: 'small' as const,
    fullWidth: true,
    disabled,
    options: centres,
    getOptionLabel: centreLabel,
    isOptionEqualToValue: (a: Center, b: Center) =>
      normalizeCentreCode(a.centreNo ?? '') === normalizeCentreCode(b.centreNo ?? ''),
    filterOptions,
    filterSelectedOptions: true,
    renderOption: (liProps: HTMLAttributes<HTMLLIElement> & { key?: string }, option: Center) => {
      const { key, ...rest } = liProps
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
    },
    noOptionsText: 'No match — try pune, पुणे, english, or code पुणे/001',
    clearOnBlur: false,
    autoHighlight: true,
    ListboxProps: {
      style: { maxHeight: 360 },
    },
  }

  if (multiple) {
    const { value, onChange } = props as MultiProps
    const selected = value
      .map((code) => findCentre(centres, code))
      .filter((item): item is Center => Boolean(item))

    return (
      <Autocomplete
        {...common}
        multiple
        value={selected}
        onChange={(_, next) => onChange(next.map((item) => item.centreNo?.trim() ?? '').filter(Boolean))}
        disableCloseOnSelect
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => {
            const { key, ...tagProps } = getTagProps({ index })
            return (
              <Chip
                key={key ?? option.centreNo}
                size="small"
                label={chipLabel(option)}
                sx={marathiNameFieldSx}
                {...tagProps}
              />
            )
          })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder="Type pune / पुणे / english / centre no…"
            helperText={
              helperText
              ?? 'Select one or more centres. Each centre prints on a new page.'
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
      />
    )
  }

  const { value, onChange } = props as SingleProps
  const selected = findCentre(centres, value) ?? null

  return (
    <Autocomplete
      {...common}
      value={selected}
      onChange={(_, next) => onChange(next?.centreNo?.trim() ?? '')}
      disableClearable={!allowEmpty}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder="Type English or Marathi: pune, joshi, ठा/001…"
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
    />
  )
}
