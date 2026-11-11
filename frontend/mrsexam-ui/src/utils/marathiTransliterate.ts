/**
 * Free, offline English phonetic → Devanagari (Marathi) helper.
 * Prefer Windows/Chrome Marathi IME for best quality at high volume.
 */

const VOWELS: Record<string, string> = {
  ai: '\u0910',
  au: '\u0914',
  aa: '\u0906',
  ee: '\u0908',
  ii: '\u0908',
  oo: '\u090A',
  uu: '\u090A',
  ri: '\u090B',
  a: '\u0905',
  i: '\u0907',
  u: '\u0909',
  e: '\u090F',
  o: '\u0913',
}

const MATRAS: Record<string, string> = {
  ai: '\u0948',
  au: '\u094C',
  aa: '\u093E',
  ee: '\u0940',
  ii: '\u0940',
  oo: '\u0942',
  uu: '\u0942',
  ri: '\u0943',
  a: '',
  i: '\u093F',
  u: '\u0941',
  e: '\u0947',
  o: '\u094B',
}

const CONSONANTS: Record<string, string> = {
  ksh: '\u0915\u094D\u0937',
  chh: '\u091B',
  th: '\u0925',
  dh: '\u0927',
  ph: '\u092B',
  bh: '\u092D',
  sh: '\u0936',
  kh: '\u0916',
  gh: '\u0918',
  ch: '\u091A',
  jh: '\u091D',
  ng: '\u0919',
  ny: '\u091E',
  tr: '\u0924\u094D\u0930',
  gy: '\u091C\u094D\u091E',
  // Retroflex forms used often in Marathi names
  dd: '\u0921',
  tt: '\u091F',
  d: '\u0926',
  t: '\u0924',
  k: '\u0915',
  g: '\u0917',
  c: '\u0915',
  j: '\u091C',
  n: '\u0928',
  p: '\u092A',
  b: '\u092C',
  m: '\u092E',
  y: '\u092F',
  r: '\u0930',
  l: '\u0932',
  v: '\u0935',
  w: '\u0935',
  s: '\u0938',
  h: '\u0939',
  q: '\u0915',
  x: '\u0915\u094D\u0938',
  f: '\u092B',
  z: '\u091C',
}

const VOWEL_TOKENS = ['ai', 'au', 'aa', 'ee', 'ii', 'oo', 'uu', 'ri', 'a', 'i', 'u', 'e', 'o']
const CONSONANT_TOKENS = [
  'ksh', 'chh', 'th', 'dh', 'ph', 'bh', 'sh', 'kh', 'gh', 'ch', 'jh', 'ng', 'ny', 'tr', 'gy',
  'dd', 'tt',
  'k', 'g', 'c', 'j', 't', 'd', 'n', 'p', 'b', 'm', 'y', 'r', 'l', 'v', 'w', 's', 'h', 'q', 'x', 'f', 'z',
]

/**
 * Exact common Marathi name/surname spellings.
 * Keep lowercase keys.
 */
const EXACT_WORD_MAP: Record<string, string> = {
  gaikwad: 'गायकवाड',
  gayakwad: 'गायकवाड',
  gayakvaad: 'गायकवाड',
  gaikvaad: 'गायकवाड',
  patil: 'पाटील',
  paatil: 'पाटील',
  deshmukh: 'देशमुख',
  jadhav: 'जाधव',
  jaadhav: 'जाधव',
  shinde: 'शिंदे',
  pawar: 'पवार',
  more: 'मोरे',
  kale: 'काळे',
  joshi: 'जोशी',
  kulkarni: 'कुलकर्णी',
  deshpande: 'देशपांडे',
  chavan: 'चव्हाण',
  chavhan: 'चव्हाण',
  sawant: 'सावंत',
  naik: 'नाईक',
  rane: 'राणे',
  bhosale: 'भोसले',
  bhosle: 'भोसले',
  salunkhe: 'साळुंखे',
  salunke: 'साळुंखे',
  thatte: 'तट्टे',
  khot: 'खोत',
  gore: 'गोरे',
  whaval: 'व्हावळ',
  pisal: 'पिसाळ',
  pisaal: 'पिसाळ',
  sangli: 'सांगली',
  sangali: 'सांगली',
  saangli: 'सांगली',
  saangali: 'सांगली',
  // session months
  january: 'जानेवारी',
  february: 'फेब्रुवारी',
  march: 'मार्च',
  april: 'एप्रिल',
  may: 'मे',
  june: 'जून',
  july: 'जुलै',
  august: 'ऑगस्ट',
  september: 'सप्टेंबर',
  october: 'ऑक्टोबर',
  november: 'नोव्हेंबर',
  december: 'डिसेंबर',
  jan: 'जानेवारी',
  feb: 'फेब्रुवारी',
  mar: 'मार्च',
  apr: 'एप्रिल',
  jun: 'जून',
  jul: 'जुलै',
  aug: 'ऑगस्ट',
  sep: 'सप्टेंबर',
  sept: 'सप्टेंबर',
  oct: 'ऑक्टोबर',
  nov: 'नोव्हेंबर',
  dec: 'डिसेंबर',
  // given-name samples often typed phonetically
  suresh: 'सुरेश',
  ramesh: 'रमेश',
  ganesh: 'गणेश',
  mahesh: 'महेश',
  sunil: 'सुनील',
  anil: 'अनिल',
  sachin: 'सचिन',
  rahul: 'राहुल',
  priya: 'प्रिया',
  sneha: 'स्नेहा',
  ashok: 'अशोक',
  vijay: 'विजय',
  sanjay: 'संजय',
  ajay: 'अजय',
}

const DEVANAGARI_CHAR = /[\u0900-\u097F]/
const LATIN_WORD = /[A-Za-z]+/
const CUSTOM_WORD_MAP_STORAGE_KEY = 'mrsexam.marathiCustomWordMap'

export const containsDevanagari = (value: string): boolean => DEVANAGARI_CHAR.test(value)

const normalizeEnglishKey = (value: string): string => value.trim().toLowerCase()

const readCustomWordMap = (): Record<string, string> => {
  if (typeof window === 'undefined') return {}

  try {
    const raw = window.localStorage.getItem(CUSTOM_WORD_MAP_STORAGE_KEY)
    if (!raw) return {}

    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}

    const next: Record<string, string> = {}
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      const english = normalizeEnglishKey(key)
      const marathi = typeof value === 'string' ? value.trim() : ''
      if (!english || !marathi || !DEVANAGARI_CHAR.test(marathi)) continue
      next[english] = marathi
    }
    return next
  } catch {
    return {}
  }
}

const writeCustomWordMap = (map: Record<string, string>) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CUSTOM_WORD_MAP_STORAGE_KEY, JSON.stringify(map))
}

/** Runtime spellings saved by operators (browser localStorage). */
export const listCustomMarathiSpellings = (): Array<{ english: string; marathi: string }> => {
  return Object.entries(readCustomWordMap())
    .map(([english, marathi]) => ({ english, marathi }))
    .sort((a, b) => a.english.localeCompare(b.english))
}

export const saveCustomMarathiSpelling = (english: string, marathi: string): string | null => {
  const key = normalizeEnglishKey(english)
  const value = marathi.trim()
  if (!key || !/^[a-z]+$/u.test(key)) {
    return 'English word must contain only letters (a-z).'
  }
  if (!value || !DEVANAGARI_CHAR.test(value)) {
    return 'Marathi spelling must include Devanagari characters.'
  }

  const map = readCustomWordMap()
  map[key] = value
  writeCustomWordMap(map)
  return null
}

export const removeCustomMarathiSpelling = (english: string) => {
  const key = normalizeEnglishKey(english)
  if (!key) return
  const map = readCustomWordMap()
  if (!(key in map)) return
  delete map[key]
  writeCustomWordMap(map)
}

/** Built-in + operator-saved exact spellings. */
export const lookupExactMarathiSpelling = (english: string): string | null => {
  const key = normalizeEnglishKey(english)
  if (!key) return null
  return readCustomWordMap()[key] ?? EXACT_WORD_MAP[key] ?? null
}

const applyMarathiPhoneticHints = (raw: string): string => {
  let text = raw.toLowerCase()

  // Gaikwad-style: "gai" before a consonant is usually गाय, not गै
  // e.g. gaikwad, gaikwadkar
  text = text.replace(/gai(?=[bcdfghjklmnpqrstvwxyz])/g, 'gaay')

  // Surname ending -wad / -waad → वाड (retroflex ड)
  text = text.replace(/waad$/g, 'vaaD')
  text = text.replace(/wad$/g, 'vaaD')
  text = text.replace(/vaad$/g, 'vaaD')
  text = text.replace(/vad$/g, 'vaaD')

  // Common -kar ending stays as-kar (engine handles)
  // Final dental d after long aa in names often retroflex: ...aad → ...aaD
  text = text.replace(/aa[d]$/g, 'aaD')

  // Nasal before consonant: sangali → सांगली (anusvara / dot above)
  // Encode as '~' + consonant so engine inserts ं
  text = text.replace(/n(?=[gkcjtdpb])/g, '~')

  // Encode retroflex D/T as dd/tt for the engine
  text = text.replace(/D/g, 'dd').replace(/T/g, 'tt')

  return text
}

const transliteratePhoneticCore = (input: string): string => {
  const text = applyMarathiPhoneticHints(input)
  let output = ''
  let index = 0

  while (index < text.length) {
    const current = text[index]

    if (current === '~') {
      output += '\u0902' // anusvara (dot above), e.g. सांगली
      index += 1
      continue
    }

    if (!/[a-z]/.test(current)) {
      output += text[index]
      index += 1
      continue
    }

    const consonantToken = CONSONANT_TOKENS.find((token) => text.startsWith(token, index))
    if (consonantToken) {
      const base = CONSONANTS[consonantToken]
      const nextIndex = index + consonantToken.length
      const vowelToken = VOWEL_TOKENS.find((token) => text.startsWith(token, nextIndex))

      if (vowelToken) {
        output += `${base}${MATRAS[vowelToken]}`
        index = nextIndex + vowelToken.length
      } else {
        output += base
        index = nextIndex
      }
      continue
    }

    const vowelToken = VOWEL_TOKENS.find((token) => text.startsWith(token, index))
    if (vowelToken) {
      output += VOWELS[vowelToken]
      index += vowelToken.length
      continue
    }

    output += text[index]
    index += 1
  }

  return output
}

export const transliterateEnglishToDevanagari = (input: string): string => {
  const key = normalizeEnglishKey(input)
  if (!key) return ''

  const exact = lookupExactMarathiSpelling(key)
  if (exact) return exact

  return transliteratePhoneticCore(key)
}

export type TrailingLatinWord = {
  prefix: string
  latinWord: string
  /** Digits / slash / other non-letters kept after the Latin word (e.g. "/001" in tha/001). */
  suffix: string
}

const DEVANAGARI_DIGITS = '०१२३४५६७८९'

/** 0-9 → ०-९ (for codes like ठा/001 → ठा/००१). */
export const toDevanagariDigits = (value: string): string =>
  value.replace(/[0-9]/g, (digit) => DEVANAGARI_DIGITS[Number(digit)] ?? digit)

/**
 * Finds the Latin word to convert.
 * Supports mixed center codes like tha/001 → convert "tha", and digits → ००१.
 */
export const getTrailingLatinWord = (fullValue: string): TrailingLatinWord | null => {
  const trimmedEnd = (fullValue ?? '').replace(/\s+$/u, '')
  if (!trimmedEnd) return null

  // Pure trailing Latin: "suresh "
  const trailing = trimmedEnd.match(/^(.*?)([A-Za-z]+)$/u)
  if (trailing) {
    const [, prefix, latinWord] = trailing
    if (LATIN_WORD.test(latinWord)) {
      return { prefix, latinWord, suffix: '' }
    }
  }

  // Mixed code: "tha/001", "tha-12", "ABC001"
  const mixed = trimmedEnd.match(/^(.*?)([A-Za-z]+)([^A-Za-z]*)$/u)
  if (!mixed) return null

  const [, prefix, latinWord, suffix] = mixed
  if (!LATIN_WORD.test(latinWord) || !suffix) return null
  return { prefix, latinWord, suffix }
}

/**
 * Converts Latin letters to Devanagari and Arabic digits to Marathi digits.
 * Example: tha/001 → ठा/००१
 */
export const transliterateTrailingLatinWord = (
  fullValue: string,
  options?: { appendSpace?: boolean },
): string => {
  const appendSpace = options?.appendSpace ?? false
  const value = fullValue ?? ''
  const trimmedEnd = value.replace(/\s+$/u, '')
  if (!trimmedEnd) return appendSpace ? ' ' : ''

  const trailing = getTrailingLatinWord(value)
  if (!trailing) {
    // Already Marathi text with English digits: ठा/001 → ठा/००१
    const digitsConverted = toDevanagariDigits(trimmedEnd)
    if (digitsConverted !== trimmedEnd) {
      return appendSpace ? `${digitsConverted} ` : digitsConverted
    }
    return appendSpace && !/\s$/u.test(value) ? `${trimmedEnd} ` : value
  }

  const converted = transliterateEnglishToDevanagari(trailing.latinWord)
  const next = toDevanagariDigits(`${trailing.prefix}${converted}${trailing.suffix}`)
  // Mixed codes like ठा/००१ should not gain a trailing space.
  const shouldAppendSpace = appendSpace && !trailing.suffix
  return shouldAppendSpace ? `${next} ` : next
}

const uniqueSuggestions = (items: string[]): string[] => {
  const seen = new Set<string>()
  const result: string[] = []
  for (const item of items) {
    const value = item.trim()
    if (!value || seen.has(value)) continue
    seen.add(value)
    result.push(value)
  }
  return result
}

/**
 * Mobile-keyboard style candidates for one English word.
 * Order: saved/built-in exact → Google Input Tools → offline phonetic.
 */
export const fetchMarathiSuggestions = async (
  englishWord: string,
  options?: { limit?: number },
): Promise<string[]> => {
  const key = normalizeEnglishKey(englishWord)
  if (!key) return []

  const limit = options?.limit ?? 5
  const exact = lookupExactMarathiSpelling(key)
  const offline = transliteratePhoneticCore(key)
  const seeded = exact ? [exact, offline] : [offline]

  try {
    const url = `https://inputtools.google.com/request?itc=mr-t-i0-und&num=${limit}&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage&text=${encodeURIComponent(key)}`
    const response = await fetch(url)
    if (!response.ok) {
      return uniqueSuggestions(seeded).slice(0, limit)
    }

    const payload = (await response.json()) as unknown
    if (!Array.isArray(payload) || payload[0] !== 'SUCCESS') {
      return uniqueSuggestions(seeded).slice(0, limit)
    }

    const data = payload[1]
    if (!Array.isArray(data) || data.length === 0 || !Array.isArray(data[0])) {
      return uniqueSuggestions(seeded).slice(0, limit)
    }

    const firstEntry = data[0] as unknown[]
    const googleSuggestions = Array.isArray(firstEntry[1])
      ? firstEntry[1].filter((item): item is string => typeof item === 'string')
      : []

    return uniqueSuggestions([...seeded, ...googleSuggestions]).slice(0, limit)
  } catch {
    return uniqueSuggestions(seeded).slice(0, limit)
  }
}

export const marathiNameFieldSx = {
  '& .MuiInputBase-input': {
    fontFamily: '"Noto Sans Devanagari", "IBM Plex Sans", sans-serif',
    fontSize: '1.05rem',
    letterSpacing: '0.01em',
  },
} as const
