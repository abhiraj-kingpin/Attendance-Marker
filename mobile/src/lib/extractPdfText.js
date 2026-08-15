import { inflate } from 'pako';

// Minimal, dependency-light PDF text extractor. Handles the common case —
// a typeset (not scanned/handwritten) PDF with FlateDecode-compressed
// content streams and standard text encoding, which covers the large
// majority of real syllabus/course-handbook PDFs. It does not attempt to
// build a full PDF object graph, decode custom font CMaps, or OCR scanned
// pages — for anything it can't read cleanly, it returns as much text as
// it found so the caller can decide whether to fall back to manual paste.

const STREAM_RE = /(\d+)\s+0\s+obj[\s\S]*?<<([\s\S]*?)>>\s*stream\r?\n([\s\S]*?)\r?\nendstream/g;

function bytesToLatin1String(bytes) {
  let out = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    out += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + chunk, bytes.length)));
  }
  return out;
}

function decodeStream(dict, rawBody) {
  const bytes = new Uint8Array(rawBody.length);
  for (let i = 0; i < rawBody.length; i++) bytes[i] = rawBody.charCodeAt(i) & 0xff;

  if (!/\/FlateDecode/.test(dict)) return bytesToLatin1String(bytes);

  try {
    const inflated = inflate(bytes);
    return bytesToLatin1String(inflated);
  } catch {
    return null; // corrupt or non-Flate stream we can't decode — skip it
  }
}

function unescapePdfString(str) {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .replace(/\\(\d{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
}

// Pulls text-showing operators (Tj, TJ, ', ") out of a decoded content
// stream, inserting line breaks on positioning operators (Td/TD/T*) so the
// output roughly preserves the source's line structure.
function extractTextFromContentStream(content) {
  const out = [];
  const tokenRe = /\((?:[^()\\]|\\.)*\)\s*Tj|\[(?:[^\[\]]|\\.)*\]\s*TJ|\((?:[^()\\]|\\.)*\)\s*'|T\*|Td|TD/g;
  let match;
  while ((match = tokenRe.exec(content))) {
    const tok = match[0];
    if (tok === 'T*' || tok.endsWith('Td') || tok.endsWith('TD')) {
      out.push('\n');
      continue;
    }
    if (tok.endsWith('TJ')) {
      // A TJ array interleaves strings with kerning numbers, e.g.
      // [(Data Types) -250 (and) -250 (Variables)] — a sufficiently
      // negative number between two strings is the PDF's way of leaving a
      // gap for a space, not just tightening letter spacing within a word.
      const arrayBody = tok.slice(1, tok.lastIndexOf(']'));
      const partRe = /\((?:[^()\\]|\\.)*\)|-?\d+(?:\.\d+)?/g;
      let m;
      while ((m = partRe.exec(arrayBody))) {
        if (m[0].startsWith('(')) {
          out.push(unescapePdfString(m[0].slice(1, -1)));
        } else if (parseFloat(m[0]) < -100) {
          out.push(' ');
        }
      }
    } else {
      const strMatch = tok.match(/\((?:[^()\\]|\\.)*\)/);
      if (strMatch) out.push(unescapePdfString(strMatch[0].slice(1, -1)));
      if (tok.endsWith("'")) out.push('\n');
    }
  }
  return out.join('');
}

/**
 * `pdfBytes` is a Uint8Array of the raw PDF file contents.
 * Returns { text, pageCount, partial } — `partial: true` means some
 * streams couldn't be decoded (e.g. an unsupported filter), so the text may
 * be incomplete.
 */
export function extractPdfText(pdfBytes) {
  const raw = bytesToLatin1String(pdfBytes);
  const pageCount = (raw.match(/\/Type\s*\/Page[^s]/g) || []).length;

  let text = '';
  let partial = false;
  let match;
  STREAM_RE.lastIndex = 0;
  while ((match = STREAM_RE.exec(raw))) {
    const [, , dict, body] = match;
    if (/\/Font\b/.test(dict) || /\/Image\b/.test(dict)) continue; // not a content stream
    const decoded = decodeStream(dict, body);
    if (decoded == null) {
      partial = true;
      continue;
    }
    const chunk = extractTextFromContentStream(decoded);
    if (chunk.trim()) text += chunk + '\n';
  }

  return { text: text.trim(), pageCount: pageCount || null, partial };
}
