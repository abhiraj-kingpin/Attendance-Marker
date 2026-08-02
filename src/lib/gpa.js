export const GRADE_POINTS = { O: 10, 'A+': 9, A: 8, 'B+': 7, B: 6, C: 5, P: 4, F: 0 };
export const GRADES = ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F'];

export function computeSGPA(subjects) {
  let creditSum = 0;
  let weightedSum = 0;
  for (const s of subjects) {
    const credits = Number(s.credits) || 0;
    if (credits <= 0) continue;
    const points = GRADE_POINTS[s.grade] ?? 0;
    creditSum += credits;
    weightedSum += credits * points;
  }
  const totalCredits = creditSum;
  const sgpa = creditSum === 0 ? null : weightedSum / creditSum;
  return { sgpa, totalCredits };
}

export function computeCGPA(semesters) {
  let creditSum = 0;
  let weightedSum = 0;
  const perSemester = semesters.map((sem) => {
    const { sgpa, totalCredits } = computeSGPA(sem.subjects || []);
    if (sgpa !== null && totalCredits > 0) {
      creditSum += totalCredits;
      weightedSum += sgpa * totalCredits;
    }
    return { id: sem.id, sgpa, totalCredits };
  });
  const cgpa = creditSum === 0 ? null : weightedSum / creditSum;
  return { cgpa, totalCredits: creditSum, perSemester };
}

export function cgpaToPercentage(cgpa, admissionPeriod) {
  if (cgpa === null || cgpa === undefined) return null;
  if (admissionPeriod === '2024plus') return (cgpa - 0.75) * 10;
  return cgpa * 10;
}
