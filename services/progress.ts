import AsyncStorage from '@react-native-async-storage/async-storage';

export type PracticeSession = {
  id: string;
  userId: string;
  date: string;        // 'YYYY-MM-DD'
  timestamp: number;   // epoch ms
  duration: number;    // minutes
  score: number;       // 0-100
  accuracy: number;    // 0-100
  lessonId: string;
  lessonTitle: string;
  lessonNumber: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
};

export type UserStats = {
  streak: number;
  overallScore: number;
  practiceTimeToday: number;
  lessonsDoneThisWeek: number;
  accuracyAverage: number;
  dailyGoalMinutes: number;
  lastLesson: Pick<PracticeSession, 'lessonTitle' | 'lessonNumber' | 'difficulty'> | null;
};

const sessionsKey = (userId: string) => `fc_sessions_${userId}`;
const goalKey     = (userId: string) => `fc_goal_${userId}`;

const today     = () => new Date().toISOString().slice(0, 10);
const dayOf     = (ts: number) => new Date(ts).toISOString().slice(0, 10);
const startOfWeek = () => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export const progress = {
  /** Load all sessions for a user. */
  getSessions: async (userId: string): Promise<PracticeSession[]> => {
    const raw = await AsyncStorage.getItem(sessionsKey(userId));
    return raw ? JSON.parse(raw) : [];
  },

  /** Add a completed practice session. */
  addSession: async (session: Omit<PracticeSession, 'id' | 'date'>): Promise<void> => {
    const sessions = await progress.getSessions(session.userId);
    const newSession: PracticeSession = {
      ...session,
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      date: dayOf(session.timestamp),
    };
    await AsyncStorage.setItem(
      sessionsKey(session.userId),
      JSON.stringify([...sessions, newSession]),
    );
  },

  /** Get / set the user's daily practice goal (minutes). */
  getDailyGoal: async (userId: string): Promise<number> => {
    const raw = await AsyncStorage.getItem(goalKey(userId));
    return raw ? parseInt(raw, 10) : 20;
  },
  setDailyGoal: (userId: string, minutes: number) =>
    AsyncStorage.setItem(goalKey(userId), String(minutes)),

  /** Return average score per lessonId across all sessions. */
  getAllLessonProgress: async (userId: string): Promise<Record<string, number>> => {
    const sessions = await progress.getSessions(userId);
    const byLesson: Record<string, number[]> = {};
    for (const s of sessions) {
      if (!byLesson[s.lessonId]) byLesson[s.lessonId] = [];
      byLesson[s.lessonId].push(s.score);
    }
    const result: Record<string, number> = {};
    for (const [lessonId, scores] of Object.entries(byLesson)) {
      result[lessonId] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }
    return result;
  },

  /** Compute all dashboard stats for a user from their session history. */
  getStats: async (userId: string): Promise<UserStats> => {
    const sessions      = await progress.getSessions(userId);
    const dailyGoal     = await progress.getDailyGoal(userId);
    const todayStr      = today();
    const weekStart     = startOfWeek();

    if (sessions.length === 0) {
      return {
        streak: 0,
        overallScore: 0,
        practiceTimeToday: 0,
        lessonsDoneThisWeek: 0,
        accuracyAverage: 0,
        dailyGoalMinutes: dailyGoal,
        lastLesson: null,
      };
    }

    // ── Streak ──────────────────────────────────────────────────────────────
    const practicedDays = [...new Set(sessions.map(s => s.date))].sort().reverse();
    let streak = 0;
    let cursor = new Date(todayStr);
    for (const day of practicedDays) {
      const expected = cursor.toISOString().slice(0, 10);
      if (day === expected) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else if (streak === 0 && day === new Date(cursor.getTime() - 86400000).toISOString().slice(0, 10)) {
        // Hasn't practiced today yet — start counting from yesterday
        streak++;
        cursor.setDate(cursor.getDate() - 2);
      } else {
        break;
      }
    }

    // ── Today's practice time ────────────────────────────────────────────────
    const practiceTimeToday = sessions
      .filter(s => s.date === todayStr)
      .reduce((sum, s) => sum + s.duration, 0);

    // ── Lessons done this week ───────────────────────────────────────────────
    const thisWeekSessions = sessions.filter(s => s.timestamp >= weekStart);
    const lessonsDoneThisWeek = new Set(thisWeekSessions.map(s => s.lessonId)).size;

    // ── Overall score (avg of all sessions) ─────────────────────────────────
    const overallScore = Math.round(
      sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length,
    );

    // ── Accuracy average ─────────────────────────────────────────────────────
    const accuracyAverage = Math.round(
      sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length,
    );

    // ── Last lesson ──────────────────────────────────────────────────────────
    const latest = sessions.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));
    const lastLesson = {
      lessonTitle: latest.lessonTitle,
      lessonNumber: latest.lessonNumber,
      difficulty: latest.difficulty,
    };

    return {
      streak,
      overallScore,
      practiceTimeToday,
      lessonsDoneThisWeek,
      accuracyAverage,
      dailyGoalMinutes: dailyGoal,
      lastLesson,
    };
  },
};
