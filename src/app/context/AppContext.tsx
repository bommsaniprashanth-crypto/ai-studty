import { createContext, useContext, useState, ReactNode } from 'react';

interface CurrentActivity {
  type: 'book' | 'video' | 'code';
  title: string;
  subtitle: string;
  progress: number;
  lastAccessed: Date;
  link?: string;
  notes?: string;
}

interface StickyNote {
  id: string;
  content: string;
  isPinned: boolean;
  tags: string[];
  deadline?: Date;
  createdAt: Date;
}

interface Resource {
  id: string;
  type: 'youtube' | 'article' | 'github' | 'website' | 'pdf' | 'design';
  title: string;
  url: string;
  category: string;
  status: 'not-started' | 'in-progress' | 'completed';
  notes?: string;
  thumbnail?: string;
  duration?: number; // Duration in minutes for videos
  addedAt: Date;
}

interface Goal {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly';
  completed: boolean;
  deadline?: Date;
}

interface Achievement {
  type: 'book' | 'coding' | 'video' | 'streak' | 'level' | 'goal';
  title: string;
  description: string;
  xp?: number;
}

interface CustomPage {
  id: string;
  title: string;
  icon: string;
  path: string;
  createdAt: Date;
}

interface MonthlyProgress {
  id: string;
  month: string; // Format: "YYYY-MM" e.g., "2026-06"
  year: number;
  monthName: string; // e.g., "June"
  totalHours: number;
  totalVideosWatched: number;
  totalProjects: number;
  totalProblems: number;
  skillsCompleted: number;
  videoDuration: number; // Total minutes of videos watched
  booksRead: number;
  createdAt: Date;
}

interface AppContextType {
  currentReading: CurrentActivity | null;
  currentWatching: CurrentActivity | null;
  currentCoding: CurrentActivity | null;
  stickyNotes: StickyNote[];
  resources: Resource[];
  goals: Goal[];
  xp: number;
  streak: number;
  lastActivityDate: Date | null;
  currentAchievement: Achievement | null;
  customPages: CustomPage[];
  monthlyProgress: MonthlyProgress[];
  currentMonth: string;
  addStickyNote: (note: Omit<StickyNote, 'id' | 'createdAt'>) => void;
  updateStickyNote: (id: string, note: Partial<StickyNote>) => void;
  deleteStickyNote: (id: string) => void;
  addResource: (resource: Omit<Resource, 'id' | 'addedAt'>) => void;
  updateResource: (id: string, resource: Partial<Resource>) => void;
  deleteResource: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  toggleGoal: (id: string) => void;
  updateCurrentActivity: (type: 'book' | 'video' | 'code', activity: CurrentActivity | null) => void;
  addXP: (amount: number) => void;
  triggerAchievement: (achievement: Achievement) => void;
  clearAchievement: () => void;
  updateStreak: () => void;
  addCustomPage: (page: Omit<CustomPage, 'id' | 'createdAt'>) => void;
  deleteCustomPage: (id: string) => void;
  updateCustomPage: (id: string, updates: Partial<CustomPage>) => void;
  saveMonthlyProgress: (data: Omit<MonthlyProgress, 'id' | 'createdAt'>) => void;
  getMonthlyProgressHistory: () => MonthlyProgress[];
  getCurrentMonthProgress: () => MonthlyProgress | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentReading, setCurrentReading] = useState<CurrentActivity | null>(null);

  const [currentWatching, setCurrentWatching] = useState<CurrentActivity | null>(null);

  const [currentCoding, setCurrentCoding] = useState<CurrentActivity | null>(null);

  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);

  const [resources, setResources] = useState<Resource[]>([]);

  const [goals, setGoals] = useState<Goal[]>([]);

  const [xp, setXP] = useState<number>(0);

  const [streak, setStreak] = useState<number>(0);

  const [lastActivityDate, setLastActivityDate] = useState<Date | null>(null);

  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  const [customPages, setCustomPages] = useState<CustomPage[]>([]);

  const [monthlyProgress, setMonthlyProgress] = useState<MonthlyProgress[]>([]);

  // Get current month in YYYY-MM format
  const getCurrentMonthString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const [currentMonth] = useState<string>(getCurrentMonthString());

  const saveMonthlyProgress = (data: Omit<MonthlyProgress, 'id' | 'createdAt'>) => {
    const existing = monthlyProgress.find(mp => mp.month === data.month);

    if (existing) {
      // Update existing month
      setMonthlyProgress(monthlyProgress.map(mp =>
        mp.month === data.month
          ? { ...mp, ...data }
          : mp
      ));
    } else {
      // Add new month
      const newProgress: MonthlyProgress = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      setMonthlyProgress([...monthlyProgress, newProgress]);
    }
  };

  const getMonthlyProgressHistory = () => {
    return monthlyProgress.sort((a, b) =>
      new Date(b.month).getTime() - new Date(a.month).getTime()
    );
  };

  const getCurrentMonthProgress = () => {
    return monthlyProgress.find(mp => mp.month === currentMonth) || null;
  };

  const addStickyNote = (note: Omit<StickyNote, 'id' | 'createdAt'>) => {
    const newNote: StickyNote = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setStickyNotes([newNote, ...stickyNotes]);
  };

  const updateStickyNote = (id: string, updates: Partial<StickyNote>) => {
    setStickyNotes(stickyNotes.map(note => note.id === id ? { ...note, ...updates } : note));
  };

  const deleteStickyNote = (id: string) => {
    setStickyNotes(stickyNotes.filter(note => note.id !== id));
  };

  const addResource = (resource: Omit<Resource, 'id' | 'addedAt'>) => {
    const newResource: Resource = {
      ...resource,
      id: Date.now().toString(),
      addedAt: new Date(),
    };
    setResources([newResource, ...resources]);
  };

  const updateResource = (id: string, updates: Partial<Resource>) => {
    setResources(resources.map(res => res.id === id ? { ...res, ...updates } : res));
  };

  const deleteResource = (id: string) => {
    setResources(resources.filter(res => res.id !== id));
  };

  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
    };
    setGoals([newGoal, ...goals]);
  };

  const toggleGoal = (id: string) => {
    setGoals(goals.map(goal => goal.id === id ? { ...goal, completed: !goal.completed } : goal));
  };

  const updateCurrentActivity = (type: 'book' | 'video' | 'code', activity: CurrentActivity | null) => {
    if (type === 'book') setCurrentReading(activity);
    else if (type === 'video') setCurrentWatching(activity);
    else if (type === 'code') setCurrentCoding(activity);
  };

  const addXP = (amount: number) => {
    const oldXP = xp;
    const newXP = oldXP + amount;
    setXP(newXP);

    // Check for level up
    const oldLevel = Math.floor(oldXP / 100) + 1;
    const newLevel = Math.floor(newXP / 100) + 1;

    if (newLevel > oldLevel) {
      triggerAchievement({
        type: 'level',
        title: `Level ${newLevel} Reached!`,
        description: `You've advanced to a new level!`,
        xp: 50,
      });
    }
  };

  const triggerAchievement = (achievement: Achievement) => {
    setCurrentAchievement(achievement);
    if (achievement.xp) {
      setXP(xp + achievement.xp);
    }
  };

  const clearAchievement = () => {
    setCurrentAchievement(null);
  };

  const updateStreak = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!lastActivityDate) {
      setStreak(1);
      setLastActivityDate(today);
      return;
    }

    const lastDate = new Date(lastActivityDate);
    lastDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setLastActivityDate(today);

      if (newStreak % 7 === 0) {
        triggerAchievement({
          type: 'streak',
          title: `${newStreak} Day Streak!`,
          description: 'Keep up the amazing consistency!',
          xp: 30,
        });
      }
    } else if (diffDays > 1) {
      setStreak(1);
      setLastActivityDate(today);
    }
  };

  const addCustomPage = (page: Omit<CustomPage, 'id' | 'createdAt'>) => {
    const newPage: CustomPage = {
      ...page,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setCustomPages([...customPages, newPage]);
  };

  const deleteCustomPage = (id: string) => {
    setCustomPages(customPages.filter(page => page.id !== id));
  };

  const updateCustomPage = (id: string, updates: Partial<CustomPage>) => {
    setCustomPages(customPages.map(page => page.id === id ? { ...page, ...updates } : page));
  };

  return (
    <AppContext.Provider
      value={{
        currentReading,
        currentWatching,
        currentCoding,
        stickyNotes,
        resources,
        goals,
        xp,
        streak,
        lastActivityDate,
        currentAchievement,
        customPages,
        monthlyProgress,
        currentMonth,
        addStickyNote,
        updateStickyNote,
        deleteStickyNote,
        addResource,
        updateResource,
        deleteResource,
        addGoal,
        toggleGoal,
        updateCurrentActivity,
        addXP,
        triggerAchievement,
        clearAchievement,
        updateStreak,
        addCustomPage,
        deleteCustomPage,
        updateCustomPage,
        saveMonthlyProgress,
        getMonthlyProgressHistory,
        getCurrentMonthProgress,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
