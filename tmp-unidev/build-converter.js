const fs = require('fs')
const path = require('path')
const m = require('./node_modules/unidev/src/mapper_hindi')

const base = m.fontmap['DV-TTSurekhEN'].slice()
// Ê = i-matra (before consonant), Ë = i+anusvara, Ç = repha (after matras).
// Put Ç AFTER multi-char entries that include Ç (e.g. <Ç → ई).
const map = ['Ê', 'α', 'Ë', 'β', ...base, 'Ç', 'γ']

function convertPatched(s) {
  let out = s
  for (let i = 0; i < map.length; i += 2) {
    while (out.indexOf(map[i]) !== -1) {
      out = out.replace(map[i], map[i + 1])
    }
  }
  return m.fontrepl(out)
}

const thane = String.fromCharCode(96) + 'öÉhÉä'
const districts = [
  [thane, 'ठाणे'],
  ['{É®ú¦ÉhÉÒ', 'परभणी'],
  ['{ÉÖhÉä', 'पुणे'],
  ['{ÉÖhÉä ¶É½þ®ú', 'पुणे शहर'],
  ['¦ÉÆb÷É®úÉ', 'भंडारा'],
  ['¨ÉÖÆ¤É<Ç', 'मुंबई'],
  ['´ÉÉÊ¶É¨É', 'वाशिम'],
  ['´ÉvÉÉÇ', 'वर्धा'],
  ['+¨É®úÉ´ÉiÉÒ', 'अमरावती'],
  ['+½þ¨ÉnùxÉMÉ®ú', 'अहमदनगर'],
  ['+Éè®ÆúMÉÉ¤ÉÉnù', 'औरंगाबाद'],
  ['+EòÉä±ÉÉ', 'अकोला'],
  ['=º¨ÉÉxÉÉ¤ÉÉnù', 'उस्मानाबाद'],
  ['±ÉÉiÉÚ®ú', 'लातूर'],
  ['¤Éä³ýMÉÉÆ´É', 'बेळगांव'],
  ['¤ÉÖ±ÉføÉhÉÉ', 'बुलढाणा'],
  ['¤ÉÒb÷', 'बीड'],
  ['®úÉªÉMÉb÷', 'रायगड'],
  ['®úixÉÉÊMÉ®úÒ', 'रत्नागिरी'],
  ['ªÉ´ÉiÉ¨ÉÉ³ý', 'यवतमाळ'],
  ['Ë½þMÉÉä±ÉÒ', 'हिंगोली'],
  ['EòÉä±½þÉ{ÉÖ®ú', 'कोल्हापुर'],
  ['ËºÉvÉÖnÖùMÉÇ', 'सिंधुदुर्ग'],
  ['MÉÉä´ÉÉ', 'गोवा'],
  ['MÉÉåÊnùªÉÉ', 'गोंदिया'],
  ['ºÉÉä±ÉÉ{ÉÖ®ú', 'सोलापुर'],
  ['ºÉÉÆMÉ±ÉÒ', 'सांगली'],
  ['ºÉÉiÉÉ®úÉ', 'सातारा'],
  ['SÉÆpù{ÉÖ®ú', 'चंद्रपुर'],
  ['VÉ³ýMÉÉ´É', 'जळगाव'],
  ['VÉÉ±ÉxÉÉ', 'जालना'],
  ['vÉÖ³äý', 'धुळे'],
  ['xÉÆnÖù®ú¤ÉÉ®ú', 'नंदुरबार'],
  ['xÉÉÆnäùb÷', 'नांदेड'],
  ['xÉÉÊ¶ÉEò', 'नाशिक'],
  ['xÉÉMÉ{ÉÖ®ú', 'नागपुर'],
]

let ok = 0
for (const [o, e] of districts) {
  const got = convertPatched(o)
  if (got === e) {
    ok++
  } else {
    console.log('DIFF', JSON.stringify(o), '=>', got, 'expected', e)
  }
}
console.log('PASS', `${ok}/${districts.length}`)

function csharpEscape(s) {
  let out = '"'
  for (const ch of s) {
    const code = ch.codePointAt(0)
    if (ch === '\\') out += '\\\\'
    else if (ch === '"') out += '\\"'
    else if (ch === '\n') out += '\\n'
    else if (ch === '\r') out += '\\r'
    else if (ch === '\t') out += '\\t'
    else if (code < 32 || code > 126) out += '\\u' + code.toString(16).padStart(4, '0')
    else out += ch
  }
  out += '"'
  return out
}

const pairs = []
for (let i = 0; i < map.length; i += 2) {
  pairs.push(`            ${csharpEscape(map[i])}, ${csharpEscape(map[i + 1])}`)
}

const cs = `namespace mrsexam_backend.Services
{
    /// <summary>
    /// Converts DV-TTAakash / DV-TTSurekhEN encoded Marathi text to Unicode Devanagari.
    /// Glyph map is based on unidev DV-TTSurekhEN with Aakash-specific patches for Ê/Ë/Ç.
    /// </summary>
    public static class DvTtAakashConverter
    {
        // Placeholder markers used like Krutidev for matra reordering in ApplyFontRepl.
        private const char IMatraPlaceholder = '\\u03B1'; // α → ि
        private const char IAnusvaraPlaceholder = '\\u03B2'; // β → िं
        private const char RephaPlaceholder = '\\u03B3'; // γ → र्

        private static readonly string[] GlyphMap =
        {
${pairs.join(',\n')}
        };

        public static bool LooksLikeLegacyEncoding(string? text)
        {
            if (string.IsNullOrWhiteSpace(text))
            {
                return false;
            }

            // Already Unicode Devanagari — leave alone.
            foreach (var ch in text)
            {
                if (ch >= '\\u0900' && ch <= '\\u097F')
                {
                    return false;
                }
            }

            // Legacy rows are mostly Latin-1 lookalikes / DV private glyphs.
            foreach (var ch in text)
            {
                if (ch > 127)
                {
                    return true;
                }
            }

            // ASCII-only with DV marker chars still common in this dataset.
            return text.IndexOfAny(new[] { '{', '}', '+', '=', '<', '>', '\\u0060', '~', '|' }) >= 0;
        }

        public static string Convert(string? text)
        {
            if (string.IsNullOrEmpty(text))
            {
                return text ?? string.Empty;
            }

            if (!LooksLikeLegacyEncoding(text))
            {
                return text;
            }

            var modified = text;
            for (var i = 0; i < GlyphMap.Length; i += 2)
            {
                var from = GlyphMap[i];
                var to = GlyphMap[i + 1];
                if (string.IsNullOrEmpty(from))
                {
                    continue;
                }

                while (modified.Contains(from, StringComparison.Ordinal))
                {
                    modified = modified.Replace(from, to, StringComparison.Ordinal);
                }
            }

            return ApplyFontRepl(modified);
        }

        private static string ApplyFontRepl(string processedText)
        {
            // Move i-matra placeholders after the following consonant / consonant cluster.
            processedText = System.Text.RegularExpressions.Regex.Replace(
                processedText,
                $"([{IMatraPlaceholder}{IAnusvaraPlaceholder}])([\\u0915-\\u0939\\u0958-\\u095F])",
                "$2$1");
            processedText = System.Text.RegularExpressions.Regex.Replace(
                processedText,
                $"([{IMatraPlaceholder}{IAnusvaraPlaceholder}])((\\u094D[\\u0915-\\u0939\\u0958-\\u095F])+)",
                "$2$1");
            processedText = processedText.Replace(IMatraPlaceholder.ToString(), "\\u093F");
            processedText = processedText.Replace(IAnusvaraPlaceholder.ToString(), "\\u093F\\u0902");

            // Move repha placeholder before the preceding consonant (+ optional matras / halant cluster).
            processedText = System.Text.RegularExpressions.Regex.Replace(
                processedText,
                $"([\\u0915-\\u0939\\u0958-\\u095F])([\\u093E-\\u094C\\u0902\\u0901]*)({RephaPlaceholder})",
                "$3$1$2");
            processedText = System.Text.RegularExpressions.Regex.Replace(
                processedText,
                $"(([\\u0915-\\u0939\\u0958-\\u095F]\\u094D)+)({RephaPlaceholder})",
                "$3$1");
            processedText = processedText.Replace(RephaPlaceholder.ToString(), "\\u0930\\u094D");

            return processedText;
        }
    }
}
`

fs.writeFileSync(path.join(__dirname, 'surekh-map-patched.json'), JSON.stringify(map))
fs.writeFileSync(
  path.join(__dirname, '..', 'backend', 'mrsexam-backend', 'Services', 'DvTtAakashConverter.cs'),
  cs,
  'utf8'
)
console.log('Wrote DvTtAakashConverter.cs')
