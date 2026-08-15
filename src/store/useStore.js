import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { uid } from '../lib/id';
import { attendanceKey } from '../lib/attendance';
import { DAYS } from '../lib/dates';

function emptyTimetable() {
  const t = {};
  for (const day of DAYS) t[day] = [];
  return t;
}

const initialState = {
  subjects: [],
  timetable: emptyTimetable(),
  attendance: {},
  excludedRanges: [],
  syllabus: {},
  exams: [],
  gpa: {
    admissionPeriod: null,
    semesters: [],
  },
  settings: {
    attendanceTarget: 75,
  },
};

export const useStore = create(
  persist(
    (set) => ({
      ...initialState,

      addSubject(name, options = {}) {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((s) => ({
          subjects: [
            ...s.subjects,
            {
              id: uid(),
              name: trimmed,
              colorIndex: s.subjects.length,
              type: options.type === 'lab' ? 'lab' : 'theory',
              credits: Number(options.credits) || 4,
            },
          ],
        }));
      },
      updateSubject(id, patch) {
        set((s) => ({
          subjects: s.subjects.map((sub) => (sub.id === id ? { ...sub, ...patch } : sub)),
        }));
      },
      removeSubject(id) {
        set((s) => {
          const timetable = {};
          for (const day of DAYS) {
            timetable[day] = s.timetable[day].filter((p) => p.subjectId !== id);
          }
          const attendance = Object.fromEntries(
            Object.entries(s.attendance).filter(([, rec]) => rec.subjectId !== id)
          );
          const syllabus = { ...s.syllabus };
          delete syllabus[id];
          const exams = s.exams.filter((e) => e.subjectId !== id);
          return {
            subjects: s.subjects.filter((sub) => sub.id !== id),
            timetable,
            attendance,
            syllabus,
            exams,
          };
        });
      },

      addPeriod(day, subjectId) {
        if (!subjectId) return;
        set((s) => ({
          timetable: {
            ...s.timetable,
            [day]: [...s.timetable[day], { id: uid(), subjectId }],
          },
        }));
      },
      removePeriod(day, periodId) {
        set((s) => ({
          timetable: {
            ...s.timetable,
            [day]: s.timetable[day].filter((p) => p.id !== periodId),
          },
        }));
      },
      movePeriod(day, periodId, direction) {
        set((s) => {
          const list = [...s.timetable[day]];
          const idx = list.findIndex((p) => p.id === periodId);
          const swapWith = idx + direction;
          if (idx === -1 || swapWith < 0 || swapWith >= list.length) return {};
          [list[idx], list[swapWith]] = [list[swapWith], list[idx]];
          return { timetable: { ...s.timetable, [day]: list } };
        });
      },

      setAttendanceStatus(date, periodId, subjectId, status) {
        set((s) => {
          const key = attendanceKey(date, periodId);
          const existing = s.attendance[key];
          const attendance = { ...s.attendance };
          if (existing && existing.status === status) {
            delete attendance[key];
          } else {
            attendance[key] = { date, periodId, subjectId, status };
          }
          return { attendance };
        });
      },

      addExcludedRange(range) {
        set((s) => ({
          excludedRanges: [...s.excludedRanges, { id: uid(), ...range }],
        }));
      },
      removeExcludedRange(id) {
        set((s) => ({
          excludedRanges: s.excludedRanges.filter((r) => r.id !== id),
        }));
      },

      addTopic(subjectId, title) {
        const trimmed = title.trim();
        if (!trimmed) return;
        set((s) => ({
          syllabus: {
            ...s.syllabus,
            [subjectId]: [
              ...(s.syllabus[subjectId] || []),
              { id: uid(), title: trimmed, done: false },
            ],
          },
        }));
      },
      toggleTopic(subjectId, topicId) {
        set((s) => ({
          syllabus: {
            ...s.syllabus,
            [subjectId]: (s.syllabus[subjectId] || []).map((t) =>
              t.id === topicId ? { ...t, done: !t.done } : t
            ),
          },
        }));
      },
      removeTopic(subjectId, topicId) {
        set((s) => ({
          syllabus: {
            ...s.syllabus,
            [subjectId]: (s.syllabus[subjectId] || []).filter((t) => t.id !== topicId),
          },
        }));
      },

      addExam(exam) {
        set((s) => ({ exams: [...s.exams, { id: uid(), ...exam }] }));
      },
      removeExam(id) {
        set((s) => ({ exams: s.exams.filter((e) => e.id !== id) }));
      },

      setAdmissionPeriod(period) {
        set((s) => ({ gpa: { ...s.gpa, admissionPeriod: period } }));
      },
      addSemester(name) {
        set((s) => ({
          gpa: {
            ...s.gpa,
            semesters: [
              ...s.gpa.semesters,
              { id: uid(), name: name || `Semester ${s.gpa.semesters.length + 1}`, subjects: [] },
            ],
          },
        }));
      },
      renameSemester(semId, name) {
        set((s) => ({
          gpa: {
            ...s.gpa,
            semesters: s.gpa.semesters.map((sem) =>
              sem.id === semId ? { ...sem, name } : sem
            ),
          },
        }));
      },
      removeSemester(semId) {
        set((s) => ({
          gpa: { ...s.gpa, semesters: s.gpa.semesters.filter((sem) => sem.id !== semId) },
        }));
      },
      addSemesterSubject(semId, subject) {
        set((s) => ({
          gpa: {
            ...s.gpa,
            semesters: s.gpa.semesters.map((sem) =>
              sem.id === semId
                ? { ...sem, subjects: [...sem.subjects, { id: uid(), ...subject }] }
                : sem
            ),
          },
        }));
      },
      updateSemesterSubject(semId, subId, patch) {
        set((s) => ({
          gpa: {
            ...s.gpa,
            semesters: s.gpa.semesters.map((sem) =>
              sem.id === semId
                ? {
                    ...sem,
                    subjects: sem.subjects.map((sub) =>
                      sub.id === subId ? { ...sub, ...patch } : sub
                    ),
                  }
                : sem
            ),
          },
        }));
      },
      removeSemesterSubject(semId, subId) {
        set((s) => ({
          gpa: {
            ...s.gpa,
            semesters: s.gpa.semesters.map((sem) =>
              sem.id === semId
                ? { ...sem, subjects: sem.subjects.filter((sub) => sub.id !== subId) }
                : sem
            ),
          },
        }));
      },

      setAttendanceTarget(target) {
        const clamped = Math.min(100, Math.max(1, Math.round(Number(target) || 75)));
        set((s) => ({ settings: { ...s.settings, attendanceTarget: clamped } }));
      },
    }),
    {
      name: 'attendance-marker-college-companion',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
