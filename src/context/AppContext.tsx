import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  CycleSettings,
  DailyLogEntry,
  PartnerPermissions,
  ForumPost,
  BuddyProfile,
} from '../types';
import { formatDateToISO } from '../utils/cycleCalculations';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  activeSection: string;
  setActiveSection: (sec: string) => void;
  activeSubSection: string;
  setActiveSubSection: (sub: string) => void;
  cycleSettings: CycleSettings;
  updateCycleSettings: (settings: Partial<CycleSettings>) => void;
  dailyLogs: Record<string, DailyLogEntry>; // keyed by YYYY-MM-DD
  saveDailyLog: (entry: DailyLogEntry) => void;
  deleteDailyLog: (date: string) => void;
  getLogForDate: (date: string) => DailyLogEntry | undefined;
  partnerPermissions: PartnerPermissions;
  updatePartnerPermissions: (updates: Partial<PartnerPermissions>) => void;
  disconnectPartner: () => void;
  forumPosts: ForumPost[];
  addForumPost: (title: string, content: string, category: ForumPost['category']) => void;
  addForumComment: (postId: string, text: string) => void;
  toggleReaction: (postId: string, reactionType: 'heart' | 'helpful' | 'hug') => void;
  reportPost: (postId: string) => void;
  buddyProfile: BuddyProfile;
  updateBuddyProfile: (updates: Partial<BuddyProfile>) => void;
  partnerModeActive: boolean;
  setPartnerModeActive: (active: boolean) => void;
  selectedCalendarDate: string;
  setSelectedCalendarDate: (date: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper for initial default date (e.g., 8 days ago)
const today = new Date();
const defaultStartDate = new Date(today);
defaultStartDate.setDate(today.getDate() - 10);

const DEFAULT_CYCLE_SETTINGS: CycleSettings = {
  lastPeriodDate: formatDateToISO(defaultStartDate),
  cycleLength: 28,
  periodDuration: 5,
  lutealLength: 14,
};

const DEFAULT_PARTNER_PERMISSIONS: PartnerPermissions = {
  isLinked: false,
  partnerName: 'Arjun',
  inviteCode: 'SAKHI-CARE-9281',
  sharePhase: true,
  shareNextPeriod: true,
  sharePMSMood: true,
  shareDailyLogs: false, // Strictly false by default
  shareSymptoms: false,  // Strictly false by default
  sharePrivateNotes: false, // Strictly false by default
};

const DEFAULT_BUDDY_PROFILE: BuddyProfile = {
  isOptedIn: true,
  status: 'connected',
  pseudonym: 'RoseBloom_34',
  matchedBuddyName: 'LotusWisdom_89',
  sharedPhaseOnly: true,
  isPaused: false,
  connectedSince: '2026-09-15',
};

// Seed realistic sample daily logs for the current cycle to populate Insights meaningfully
const getInitialLogs = (): Record<string, DailyLogEntry> => {
  const logs: Record<string, DailyLogEntry> = {};
  
  // Day -10 (period day 1)
  const d1 = new Date(today);
  d1.setDate(today.getDate() - 10);
  const s1 = formatDateToISO(d1);
  logs[s1] = {
    date: s1,
    mood: 'sensitive',
    energy: 2,
    flow: 'medium',
    symptoms: ['Abdominal Cramps', 'Lower Backache'],
    sleepHours: 7.5,
    waterGlasses: 7,
    notes: 'Drinking warm ginger tea. Taking things slowly today.',
  };

  // Day -9 (period day 2)
  const d2 = new Date(today);
  d2.setDate(today.getDate() - 9);
  const s2 = formatDateToISO(d2);
  logs[s2] = {
    date: s2,
    mood: 'calm',
    energy: 2,
    flow: 'heavy',
    symptoms: ['Abdominal Cramps', 'Body Fatigue'],
    sleepHours: 8,
    waterGlasses: 8,
    notes: 'Heating pad is helping deeply. Rested in the afternoon.',
  };

  // Day -8 (period day 3)
  const d3 = new Date(today);
  d3.setDate(today.getDate() - 8);
  const s3 = formatDateToISO(d3);
  logs[s3] = {
    date: s3,
    mood: 'calm',
    energy: 3,
    flow: 'medium',
    symptoms: ['Mild Nausea'],
    sleepHours: 7,
    waterGlasses: 8,
    notes: 'Feeling a bit more energy returning.',
  };

  // Day -3 (follicular phase)
  const d4 = new Date(today);
  d4.setDate(today.getDate() - 3);
  const s4 = formatDateToISO(d4);
  logs[s4] = {
    date: s4,
    mood: 'energetic',
    energy: 4,
    flow: 'none',
    symptoms: [],
    sleepHours: 8,
    waterGlasses: 9,
    notes: 'Went for a peaceful sunrise garden walk.',
  };

  // Day -1 (yesterday)
  const d5 = new Date(today);
  d5.setDate(today.getDate() - 1);
  const s5 = formatDateToISO(d5);
  logs[s5] = {
    date: s5,
    mood: 'happy',
    energy: 5,
    flow: 'none',
    symptoms: [],
    sleepHours: 8.5,
    waterGlasses: 10,
    notes: 'Creative brainstorming flowed easily.',
  };

  return logs;
};

const INITIAL_FORUM_POSTS: ForumPost[] = [
  {
    id: 'post-1',
    authorPseudonym: 'LavenderMoon_42',
    authorAvatar: '🌸',
    title: 'Switching to menstrual cups: what helped me finally feel comfortable',
    content: 'For months I was intimidated by menstrual cups, but trying the "punch-down fold" in the shower made all the difference! Remember to boil it in clean water between cycles.',
    category: 'wellness',
    createdAt: '2026-09-26',
    reactions: { heart: 28, helpful: 45, hug: 12 },
    userReactions: { heart: true, helpful: true },
    comments: [
      {
        id: 'c-1',
        author: 'Marigold_11',
        text: 'The punch down fold completely changed it for me too! So glad you shared this.',
        createdAt: '2026-09-27',
      },
    ],
  },
  {
    id: 'post-2',
    authorPseudonym: 'ChaiAndCare_77',
    authorAvatar: '☕',
    title: 'My favorite seed cycling recipe for luteal phase balance',
    content: 'During the luteal phase (after ovulation), I add 1 tbsp ground sunflower seeds and 1 tbsp sesame seeds to my morning warm oats. It has helped my luteal mood swings feel so much softer.',
    category: 'nutrition',
    createdAt: '2026-09-25',
    reactions: { heart: 34, helpful: 52, hug: 18 },
    userReactions: {},
    comments: [
      {
        id: 'c-2',
        author: 'JasmineSoul_09',
        text: 'Do you grind them fresh or store them in the fridge?',
        createdAt: '2026-09-26',
      },
    ],
  },
  {
    id: 'post-3',
    authorPseudonym: 'GracefulPebble_93',
    authorAvatar: '🌿',
    title: 'How Flo-style partner sharing helped my spouse understand my low-energy days',
    content: 'We set up partner view so my husband only gets a gentle notification when I enter my luteal and menstrual phases. He started bringing me hot chamomile tea without me even having to ask!',
    category: 'wellness',
    createdAt: '2026-09-24',
    reactions: { heart: 49, helpful: 38, hug: 29 },
    userReactions: { hug: true },
    comments: [],
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('sakhi_lang') as Language) || 'en';
  });

  const [activeSection, setActiveSection] = useState<string>('home');
  const [activeSubSection, setActiveSubSection] = useState<string>('calendar');
  const [partnerModeActive, setPartnerModeActive] = useState<boolean>(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(formatDateToISO(new Date()));

  const [cycleSettings, setCycleSettings] = useState<CycleSettings>(() => {
    const saved = localStorage.getItem('sakhi_cycle_settings');
    return saved ? JSON.parse(saved) : DEFAULT_CYCLE_SETTINGS;
  });

  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLogEntry>>(() => {
    const saved = localStorage.getItem('sakhi_daily_logs');
    return saved ? JSON.parse(saved) : getInitialLogs();
  });

  const [partnerPermissions, setPartnerPermissions] = useState<PartnerPermissions>(() => {
    const saved = localStorage.getItem('sakhi_partner_permissions');
    return saved ? JSON.parse(saved) : DEFAULT_PARTNER_PERMISSIONS;
  });

  const [forumPosts, setForumPosts] = useState<ForumPost[]>(() => {
    const saved = localStorage.getItem('sakhi_forum_posts');
    return saved ? JSON.parse(saved) : INITIAL_FORUM_POSTS;
  });

  const [buddyProfile, setBuddyProfile] = useState<BuddyProfile>(() => {
    const saved = localStorage.getItem('sakhi_buddy_profile');
    return saved ? JSON.parse(saved) : DEFAULT_BUDDY_PROFILE;
  });

  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem('sakhi_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('sakhi_cycle_settings', JSON.stringify(cycleSettings));
  }, [cycleSettings]);

  useEffect(() => {
    localStorage.setItem('sakhi_daily_logs', JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  useEffect(() => {
    localStorage.setItem('sakhi_partner_permissions', JSON.stringify(partnerPermissions));
  }, [partnerPermissions]);

  useEffect(() => {
    localStorage.setItem('sakhi_forum_posts', JSON.stringify(forumPosts));
  }, [forumPosts]);

  useEffect(() => {
    localStorage.setItem('sakhi_buddy_profile', JSON.stringify(buddyProfile));
  }, [buddyProfile]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const updateCycleSettings = (settings: Partial<CycleSettings>) => {
    setCycleSettings((prev) => ({ ...prev, ...settings }));
  };

  const saveDailyLog = (entry: DailyLogEntry) => {
    setDailyLogs((prev) => ({
      ...prev,
      [entry.date]: { ...entry, updatedAt: new Date().toISOString() },
    }));
  };

  const deleteDailyLog = (date: string) => {
    setDailyLogs((prev) => {
      const copy = { ...prev };
      delete copy[date];
      return copy;
    });
  };

  const getLogForDate = (date: string) => dailyLogs[date];

  const updatePartnerPermissions = (updates: Partial<PartnerPermissions>) => {
    setPartnerPermissions((prev) => ({ ...prev, ...updates }));
  };

  const disconnectPartner = () => {
    setPartnerPermissions((prev) => ({
      ...prev,
      isLinked: false,
      partnerName: '',
      inviteCode: `SAKHI-CARE-${Math.floor(1000 + Math.random() * 9000)}`,
    }));
  };

  const addForumPost = (title: string, content: string, category: ForumPost['category']) => {
    const newPost: ForumPost = {
      id: `post-${Date.now()}`,
      authorPseudonym: `RosePetal_${Math.floor(10 + Math.random() * 90)}`,
      authorAvatar: '🌺',
      title,
      content,
      category,
      createdAt: formatDateToISO(new Date()),
      reactions: { heart: 1, helpful: 0, hug: 0 },
      userReactions: { heart: true },
      comments: [],
    };
    setForumPosts((prev) => [newPost, ...prev]);
  };

  const addForumComment = (postId: string, text: string) => {
    setForumPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const newComment = {
            id: `c-${Date.now()}`,
            author: 'You (Anonymous)',
            text,
            createdAt: formatDateToISO(new Date()),
          };
          return { ...post, comments: [...post.comments, newComment] };
        }
        return post;
      })
    );
  };

  const toggleReaction = (postId: string, reactionType: 'heart' | 'helpful' | 'hug') => {
    setForumPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const hasReacted = Boolean(post.userReactions[reactionType]);
          const currentCount = post.reactions[reactionType] || 0;
          return {
            ...post,
            reactions: {
              ...post.reactions,
              [reactionType]: hasReacted ? Math.max(0, currentCount - 1) : currentCount + 1,
            },
            userReactions: {
              ...post.userReactions,
              [reactionType]: !hasReacted,
            },
          };
        }
        return post;
      })
    );
  };

  const reportPost = (postId: string) => {
    setForumPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, isReported: true } : post))
    );
  };

  const updateBuddyProfile = (updates: Partial<BuddyProfile>) => {
    setBuddyProfile((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        activeSection,
        setActiveSection,
        activeSubSection,
        setActiveSubSection,
        cycleSettings,
        updateCycleSettings,
        dailyLogs,
        saveDailyLog,
        deleteDailyLog,
        getLogForDate,
        partnerPermissions,
        updatePartnerPermissions,
        disconnectPartner,
        forumPosts,
        addForumPost,
        addForumComment,
        toggleReaction,
        reportPost,
        buddyProfile,
        updateBuddyProfile,
        partnerModeActive,
        setPartnerModeActive,
        selectedCalendarDate,
        setSelectedCalendarDate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
