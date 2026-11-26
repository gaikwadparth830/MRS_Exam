namespace mrsexam_backend.Services
{
    /// <summary>
    /// Converts DV-TTAakash / DV-TTSurekhEN encoded Marathi text to Unicode Devanagari.
    /// Glyph map is based on unidev DV-TTSurekhEN with Aakash-specific patches for Ê/Ë/Ç.
    /// </summary>
    public static class DvTtAakashConverter
    {
        // Placeholder markers used like Krutidev for matra reordering in ApplyFontRepl.
        private const char IMatraPlaceholder = '\u03B1'; // α → ि
        private const char IAnusvaraPlaceholder = '\u03B2'; // β → िं
        private const char RephaPlaceholder = '\u03B3'; // γ → र्

        private static readonly string[] GlyphMap =
        {
            "\u00ca", "\u03b1",
            "\u00cb", "\u03b2",
            // Common Surekh leftover used inside English/Devanagari mixes (e.g. इंग्लिश).
            "\u00ce", "",
            "$", "\u0950",
            "&", "\u0903",
            "*", "\u0964",
            "\u00a3\u00c3", "\u092b\u093c\u094d\u0930",
            "+\u00c9\u00e4", "\u0913",
            "+\u00c9\u00e8", "\u0914",
            "+\u00c9", "\u0906",
            "+", "\u0905",
            "<\u00c8", "\u0908\u0902",
            "<\u00c7", "\u0908",
            "<", "\u0907",
            ">", "\u090a",
            "=", "\u0909",
            "@", "\u090b",
            "A", "\u0960",
            "B\u00e5", "\u0910\u0902",
            "B\u00e4", "\u0910",
            "\u2039\u00e4", "\u0910",
            "B", "\u090f",
            "\u2039", "\u090f",
            "\u0906\u00e5", "\u0913\u0902",
            "\u0906\u00e9", "\u0914\u0902",
            "C", "\u0915\u094d",
            "D", "\u0915\u093c\u094d",
            "E", "\u0915",
            "F", "\u0915\u093c",
            "G", "\u0915\u094d\u0930",
            "H", "\u0915\u094d\u0924",
            "I", "\u0915\u094d\u0937\u094d",
            "J", "\u0916\u094d",
            "K", "\u0916\u093c\u094d",
            "L", "\u0916\u094d\u0930\u094d",
            "M", "\u0917\u094d",
            "N", "\u0917\u093c\u094d",
            "O", "\u0917\u094d\u0930\u094d",
            "P", "\u0918\u094d",
            "Q", "\u0918\u094d\u0930\u094d",
            "R", "\u0919",
            "S", "\u091a\u094d",
            "T", "\u091a\u094d\u0930\u094d",
            "U", "\u091b",
            "V", "\u091c\u094d",
            "W", "\u091c\u093c\u094d",
            "X", "\u091c\u094d\u0930\u094d",
            "Y", "\u091c\u094d\u091e\u094d",
            "Z", "\u091d\u094d",
            "[", "\u091d\u094d\u0930\u094d",
            "\\", "\u091e\u094d",
            "]", "\u091f",
            "^", "\u091f\u094d\u091f",
            "_", "\u091f\u094d\u0920",
            "`", "\u0920",
            "a", "\u0920\u094d\u0920",
            "b", "\u0921",
            "c", "\u0921\u093c",
            "d", "\u0921\u094d\u0921",
            "e", "\u0921\u094d\u0922",
            "f", "\u0922",
            "g", "\u0922\u093c",
            "h", "\u0923\u094d",
            "i", "\u0924\u094d",
            "j", "\u0924\u094d\u0930\u094d",
            "k", "\u0924\u094d\u0924\u094d",
            "l", "\u0925\u094d",
            "m", "\u0925\u094d\u0930\u094d",
            "n", "\u0926",
            "o", "\u0926\u0943",
            "p", "\u0926\u094d\u0930",
            "q", "\u0926\u094d\u0926",
            "r", "\u0926\u094d\u0927",
            "s", "\u0926\u094d\u092e",
            "t", "\u0926\u094d\u092f",
            "u", "\u0926\u094d\u0935",
            "v", "\u0927\u094d",
            "w", "\u0927\u094d\u0930\u094d",
            "x", "\u0928\u094d",
            "y", "\u0928\u094d\u0930\u094d",
            "z", "\u0928\u094d\u0928\u094d",
            "{", "\u092a\u094d",
            "|", "\u092a\u094d\u0930\u094d",
            "}", "\u092b\u094d",
            "~", "\u092b\u093c\u094d",
            "\u00a1", "\u092b",
            "\u00a2", "\u092b\u093c",
            "\u00a3", "\u092b\u094d\u0930",
            "\u00a4", "\u092c\u094d",
            "\u00a5", "\u092c\u094d\u0930\u094d",
            "\u00a6", "\u092d\u094d",
            "\u00a7", "\u092d\u094d\u0930\u094d",
            "\u00a8", "\u092e\u094d",
            "\u00a9", "\u092e\u094d\u0930\u094d",
            "\u00aa", "\u092f\u094d",
            "\u00ab", "\u092f\u094d\u0930\u094d",
            "\u00ae", "\u0930",
            "\u00af", "\u0930\u0941",
            "\u00ac", "\u094d\u092f",
            "\u00b0", "\u0930\u0942",
            "\u00b1", "\u0932\u094d",
            "\u00b2", "\u0933\u094d",
            "\u00b3", "\u0933",
            "\u00b4", "\u0935\u094d",
            "\u00b5", "\u0935\u094d\u0930\u094d",
            "\u00b6", "\u0936\u094d",
            "\u2022", "\u0936\u094d\u0935\u094d",
            "\u00b7", "\u0936\u094d\u0935\u094d",
            "\u00b8", "\u0936\u094d\u0930\u094d",
            "\u00b9", "\u0937\u094d",
            "\u00ba", "\u0938\u094d",
            "\u00bb", "\u0938\u094d\u0930\u094d",
            "\u00c0", "\u0939\u094d\u092e",
            "\u00c1", "\u0939\u094d\u092f",
            "\u00be", "\u0939\u0943",
            "\u00bf", "\u0939\u094d\u0930",
            "\u00bc", "\u0939\u094d",
            "\u00bd", "\u0939",
            "\u00c2", "\u094d",
            "\u00c3", "\u093c",
            "\u00c4", "\u0901",
            "\u00c6", "\u0902",
            "\u00c5", "\u094d\u0930",
            "\u00e4", "\u0947",
            "\u00e8", "\u0948",
            "\u00c9\u00e4", "\u094b",
            "\u00c9\u00e8", "\u094c",
            "\u00c9", "\u093e",
            "\u00d2", "\u0940",
            "\u00d6", "\u0941",
            "\u00d7", "\u0941",
            "\u00d9", "\u0941",
            "\u00da", "\u0942",
            "\u00dd", "\u0942",
            "\u00de", "\u0943",
            "\u00df", "\u0944",
            "\u094d\u093e", "",
            "\u00e5", "\u0947\u0902",
            "\u00e9", "\u0948\u0902",
            "\u00ec", "\u0945",
            "\u00f0", "",
            "\u00f1", "",
            "\u00f2", "",
            "\u00f3", "",
            "\u00f4", "",
            "\u00f5", "",
            "\u00f6", "",
            "\u00f7", "",
            "\u00f8", "",
            "\u00f9", "",
            "\u00fa", "",
            "\u00fb", "",
            "\u00fc", "",
            "\u00fd", "",
            "\u00fe", "",
            "\u093e\u0947", "\u094b",
            "\u093e\u0948", "\u094c",
            "\u0906\u0945", "\u0911",
            "\u093e\u0945", "\u0949",
            "'", "\"",
            "\u0930\u0942 ", " \u0921\u093f\u0917\u094d\u0930\u0940 ",
            "\u00c7", "\u03b3"
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
                if (ch >= '\u0900' && ch <= '\u097F')
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
            return text.IndexOfAny(new[] { '{', '}', '+', '=', '<', '>', '\u0060', '~', '|' }) >= 0;
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
                $"([{IMatraPlaceholder}{IAnusvaraPlaceholder}])([\u0915-\u0939\u0958-\u095F])",
                "$2$1");
            processedText = System.Text.RegularExpressions.Regex.Replace(
                processedText,
                $"([{IMatraPlaceholder}{IAnusvaraPlaceholder}])((\u094D[\u0915-\u0939\u0958-\u095F])+)",
                "$2$1");
            processedText = processedText.Replace(IMatraPlaceholder.ToString(), "\u093F");
            processedText = processedText.Replace(IAnusvaraPlaceholder.ToString(), "\u093F\u0902");

            // Move repha placeholder before the preceding consonant (+ optional matras / halant cluster).
            processedText = System.Text.RegularExpressions.Regex.Replace(
                processedText,
                $"([\u0915-\u0939\u0958-\u095F])([\u093E-\u094C\u0902\u0901]*)({RephaPlaceholder})",
                "$3$1$2");
            processedText = System.Text.RegularExpressions.Regex.Replace(
                processedText,
                $"(([\u0915-\u0939\u0958-\u095F]\u094D)+)({RephaPlaceholder})",
                "$3$1");
            processedText = processedText.Replace(RephaPlaceholder.ToString(), "\u0930\u094D");

            return processedText;
        }

        /// <summary>
        /// Normalize SESSION.MONTH for print: English → Marathi, DV-TTAakash → Unicode, keep Unicode as-is.
        /// </summary>
        public static string? NormalizeMonth(string? month)
        {
            if (string.IsNullOrWhiteSpace(month))
                return month;

            var trimmed = month.Trim();
            if (trimmed.Any(c => c is >= '\u0900' and <= '\u097F'))
                return trimmed;

            var english = trimmed.ToLowerInvariant() switch
            {
                "january" or "jan" => "जनवरी",
                "february" or "feb" => "फरवरी",
                "march" or "mar" => "मार्च",
                "april" or "apr" => "अप्रैल",
                "may" => "मई",
                "june" or "jun" => "जून",
                "july" or "jul" => "जुलाई",
                "august" or "aug" => "अगस्त",
                "september" or "sep" or "sept" => "सितंबर",
                "october" or "oct" => "अक्टूबर",
                "november" or "nov" => "नवंबर",
                "december" or "dec" => "दिसंबर",
                _ => null,
            };
            if (english is not null)
                return english;

            if (trimmed.Any(c => c > 127))
            {
                var converted = Convert(trimmed).Trim();
                if (!string.IsNullOrEmpty(converted))
                {
                    // Prefer common print spelling used on legacy attendance sheets.
                    if (converted == "अक्तूबर")
                        return "अक्टूबर";
                    return converted;
                }
            }

            return trimmed;
        }
    }
}
