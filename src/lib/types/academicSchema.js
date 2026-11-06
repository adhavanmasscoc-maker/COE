/**
 * src/lib/types/academicSchema.js
 * Short-key mapping for minimal memory footprint and LLM token context savings:
 * u: unitNumber, t: topic, en: contentEn, ta: contentTa, f: keyFormulas, p: pitfalls
 */

export const compressSyllabusChunk = (chunk) => ({
  u: chunk.unitNumber || 1,
  t: chunk.topic || chunk.chunkTitle || chunk.title || 'Core Syllabus',
  en: chunk.contentEn || chunk.summaryMarkdownEn || chunk.en || '',
  ta: chunk.contentTa || chunk.summaryMarkdownTa || chunk.ta || chunk.contentEn || '',
  f: chunk.keyFormulas || [],
  p: chunk.commonPitfalls || []
});

/**
 * Strips formatting bloat before feeding ground-truth context to Gemini (token-thrifty)
 * @param {object} compressedChunk - Chunk object returned by compressSyllabusChunk
 * @param {string} lang - "en" or "ta"
 * @returns {string} Compact single-line context string
 */
export const serializeForAiContext = (compressedChunk, lang = 'en') => {
  if (!compressedChunk) return '';
  const content = (lang === 'ta' ? (compressedChunk.ta || compressedChunk.en) : (compressedChunk.en || compressedChunk.ta)) || '';
  const formulas = (compressedChunk.f && compressedChunk.f.length > 0) ? `|Formulas:${compressedChunk.f.join(';')}` : '';
  const pitfalls = (compressedChunk.p && compressedChunk.p.length > 0) ? `|Traps:${compressedChunk.p.join(';')}` : '';
  return `[U${compressedChunk.u}:${compressedChunk.t}] ${content} ${formulas} ${pitfalls}`.trim();
};

