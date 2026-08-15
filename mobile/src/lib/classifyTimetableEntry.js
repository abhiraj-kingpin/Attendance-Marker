const BREAK_ACTIVITIES = [
  'library', 'ncc', 'nss', 'sports', 'games', 'lunch', 'lunch break', 'break',
  'recess', 'gym', 'yoga', 'assembly', 'free period', 'free', 'self study',
  'club activity', 'counselling', 'mentoring', 'placement', 'seminar hall',
  'induction', 'orientation', 'workshop',
];

const TEACHER_TITLE_RE = /^(dr|prof|mr|mrs|ms|er|shri|smt)\.?\s+/i;

// e.g. "431", "A204", "LT-2", "Lab 3", "Room 12" — 1-3 letters + 1-4 digits,
// optionally prefixed by a label word. Matched as a whole token so it
// doesn't eat into subject text like "3D Modeling".
const ROOM_RE = /\b(?:room|lab|lt)?[\s-]?([a-z]{0,3}-?\d{1,4}[a-z]?)\b/i;

function normalize(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function stripRoom(text) {
  const match = text.match(ROOM_RE);
  if (!match) return { text, room: null, wasRoomOnly: false };
  // Keep just the captured room code (group 1), not the optional "Room"/
  // "Lab"/"LT" label word the outer match also swallowed.
  const room = normalize(match[1]).toUpperCase();
  const stripped = normalize((text.slice(0, match.index) + text.slice(match.index + match[0].length)).replace(/[-–\s]+$/, ''));
  return { text: stripped, room, wasRoomOnly: !stripped };
}

function extractTeacher(text) {
  const paren = text.match(/\(([^)]*)\)/);
  if (paren && TEACHER_TITLE_RE.test(paren[1].trim())) {
    return { text: normalize(text.replace(paren[0], '')), teacher: normalize(paren[1]) };
  }
  const titleMatch = text.match(TEACHER_TITLE_RE);
  if (titleMatch) {
    // Whole string reads as "Dr. Name" with nothing else — this line IS a
    // teacher, not a subject with a teacher in it.
    return { text: '', teacher: normalize(text), wasTeacherOnly: true };
  }
  return { text, teacher: null };
}

function isBreakActivity(text) {
  const lower = text.toLowerCase().trim();
  return BREAK_ACTIVITIES.some((activity) => lower === activity || lower.startsWith(activity + ' '));
}

function looksLikeSubjectCode(text) {
  return /^[A-Z]{2,6}$/.test(text.trim());
}

/**
 * Classifies one OCR'd timetable line. `known` is an optional lookup of
 * { subjects: Set<lowercase name>, activities: Set<lowercase text> } built
 * from the user's existing subjects and past corrections, checked before
 * falling back to generic heuristics.
 */
export function classifyEntry(rawText, known = {}) {
  const original = normalize(rawText);
  if (!original) return null;

  const lowerOriginal = original.toLowerCase();

  if (known.activities?.has(lowerOriginal)) {
    return { raw: original, subject: null, teacher: null, room: null, isBreakActivity: true, confidence: 95, mergeOnly: false };
  }
  if (known.subjects?.has(lowerOriginal)) {
    return { raw: original, subject: original, teacher: null, room: null, isBreakActivity: false, confidence: 95, mergeOnly: false };
  }

  if (isBreakActivity(original)) {
    return { raw: original, subject: null, teacher: null, room: null, isBreakActivity: true, confidence: 90, mergeOnly: false };
  }

  const { text: afterRoom, room, wasRoomOnly } = stripRoom(original);
  if (wasRoomOnly) {
    return { raw: original, subject: null, teacher: null, room, isBreakActivity: false, confidence: 85, mergeOnly: true };
  }

  const { text: subjectText, teacher, wasTeacherOnly } = extractTeacher(afterRoom);
  if (wasTeacherOnly) {
    return { raw: original, subject: null, teacher, room, isBreakActivity: false, confidence: 80, mergeOnly: true };
  }

  let confidence = 55;
  const wordCount = subjectText.split(' ').filter(Boolean).length;
  if (known.subjects?.has(subjectText.toLowerCase())) confidence = 95;
  else if (looksLikeSubjectCode(subjectText)) confidence = 75;
  else if (wordCount >= 2 && wordCount <= 6) confidence = 78;
  else if (wordCount === 1 && subjectText.length <= 3) confidence = 40;

  if (teacher) confidence = Math.min(confidence + 5, 95);
  if (room) confidence = Math.min(confidence + 5, 95);
  if (!subjectText) confidence = 20;

  return {
    raw: original,
    subject: subjectText || null,
    teacher,
    room,
    isBreakActivity: false,
    confidence,
    mergeOnly: false,
  };
}

export function buildKnownDictionary(subjects, learnedActivities = []) {
  return {
    subjects: new Set(subjects.map((s) => s.name.trim().toLowerCase())),
    activities: new Set(learnedActivities.map((a) => a.trim().toLowerCase())),
  };
}
