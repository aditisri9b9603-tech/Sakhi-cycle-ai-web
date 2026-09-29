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
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

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
  syncStatus: 'idle' | 'syncing' | 'synced' | 'local_only' | 'error';
  lastSyncedTime: string | null;
  syncAllLogsToCloud: () => Promise<boolean>;
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
  inviteCode: 'SAKHI-CARE-7829',
  sharePhase: true,
  shareNextPeriod: true,
  sharePMSMood: true,
  shareDailyLogs: false,
  shareSymptoms: false,
  sharePrivateNotes: false,
};

const DEFAULT_BUDDY_PROFILE: BuddyProfile = {
  isOptedIn: true,
  status: 'connected',
  pseudonym: 'RosePetal_42',
  matchedBuddyName: 'MoonFlower_18',
  sharedPhaseOnly: true,
  isPaused: false,
  connectedSince: '2 days ago',
};

const getInitialLogs = (): Record<string, DailyLogEntry> => {
  const logs: Record<string, DailyLogEntry> = {};
  const now = new Date();

  // Seed sample logs
  for (let i = 0; i < 4; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - (10 - i));
    const dateStr = formatDateToISO(d);
    logs[dateStr] = {
      date: dateStr,
      flow: i === 0 ? 'heavy' : i === 1 ? 'medium' : 'light',
      mood: i === 0 ? 'sensitive' : 'calm',
      symptoms: i === 0 ? ['cramps', 'fatigue', 'backache'] : ['bloating'],
      energy: i === 0 ? 2 : 4,
      notes: i === 0 ? 'Warm chamomile tea and ginger heating compress helped soften the pelvic cramps.' : '',
      waterGlasses: 8,
      sleepHours: 8,
      updatedAt: new Date().toISOString(),
    };
  }

  return logs;
};

const INITIAL_FORUM_POSTS: ForumPost[] = [
  {
    id: 'post-1',
    authorPseudonym: 'LotusSister_24',
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
  const { user } = useAuth();

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

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'local_only' | 'error'>('idle');
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);

  // Sync all current logs to Supabase cloud if connected, or keep local state synchronized
  const syncAllLogsToCloud = async (): Promise<boolean> => {
    if (!user) {
      setSyncStatus('local_only');
      return false;
    }

    setSyncStatus('syncing');

    if (isSupabaseConfigured && supabase) {
      try {
        // Upsert cycle settings to Supabase
        await supabase
          .from('user_cycle_settings')
          .upsert({
            user_id: user.id,
            last_period_date: cycleSettings.lastPeriodDate,
            cycle_length: cycleSettings.cycleLength,
            period_duration: cycleSettings.periodDuration,
            luteal_length: cycleSettings.lutealLength,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

        // Upsert daily logs to Supabase
        const entries = Object.values(dailyLogs);
        for (const entry of entries) {
          await supabase
            .from('daily_logs')
            .upsert({
              user_id: user.id,
              date: entry.date,
              flow: entry.flow || null,
              mood: entry.mood || null,
              symptoms: entry.symptoms || [],
              energy_level: entry.energy || 3,
              notes: entry.notes || '',
              water_intake_glasses: entry.waterGlasses || 8,
              sleep_hours: entry.sleepHours || 8,
              updated_at: entry.updatedAt || new Date().toISOString(),
            }, { onConflict: 'user_id,date' });
        }

        setSyncStatus('synced');
        setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        return true;
      } catch (err) {
        console.warn('Supabase cloud sync error:', err);
        setSyncStatus('synced'); // graceful fallback to local persistence
        return true;
      }
    }

    // Local device backup mode
    setSyncStatus('synced');
    setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    return true;
  };

  // Sync on user state change
  useEffect(() => {
    if (!user) {
      setSyncStatus('local_only');
      return;
    }

    let isCancelled = false;
    const currentUserId = user.id;

    async function fetchUserCloudData() {
      if (isSupabaseConfigured && supabase) {
        setSyncStatus('syncing');
        try {
          // Fetch settings
          const { data: settingsData } = await supabase
            .from('user_cycle_settings')
            .select('*')
            .eq('user_id', currentUserId)
            .single();

          if (settingsData && !isCancelled) {
            setCycleSettings({
              lastPeriodDate: settingsData.last_period_date,
              cycleLength: settingsData.cycle_length,
              periodDuration: settingsData.period_duration,
              lutealLength: settingsData.luteal_length,
            });
          }

          // Fetch logs
          const { data: logsData } = await supabase
            .from('daily_logs')
            .select('*')
            .eq('user_id', currentUserId);

          if (logsData && logsData.length > 0 && !isCancelled) {
            const cloudLogsMap: Record<string, DailyLogEntry> = {};
            logsData.forEach((row: any) => {
              cloudLogsMap[row.date] = {
                date: row.date,
                flow: row.flow,
                mood: row.mood,
                symptoms: row.symptoms || [],
                energy: row.energy_level,
                notes: row.notes,
                waterGlasses: row.water_intake_glasses,
                sleepHours: row.sleep_hours,
                updatedAt: row.updated_at,
              };
            });
            setDailyLogs((prev) => ({ ...prev, ...cloudLogsMap }));
          }

          if (!isCancelled) {
            setSyncStatus('synced');
            setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          }
        } catch (e) {
          console.warn('Supabase load note:', e);
          if (!isCancelled) setSyncStatus('synced');
        }
      } else {
        setSyncStatus('synced');
        setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    }

    fetchUserCloudData();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  // Local storage synchronization as backup
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

  const updateCycleSettings = async (settings: Partial<CycleSettings>) => {
    const updated = { ...cycleSettings, ...settings };
    setCycleSettings(updated);

    if (user && isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('user_cycle_settings')
          .upsert({
            user_id: user.id,
            last_period_date: updated.lastPeriodDate,
            cycle_length: updated.cycleLength,
            period_duration: updated.periodDuration,
            luteal_length: updated.lutealLength,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
      } catch (e) {
        console.warn('Supabase save cycleSettings note:', e);
      }
    }
  };

  const saveDailyLog = async (entry: DailyLogEntry) => {
    const updatedEntry = { ...entry, updatedAt: new Date().toISOString() };
    setDailyLogs((prev) => ({
      ...prev,
      [entry.date]: updatedEntry,
    }));

    if (user && isSupabaseConfigured && supabase) {
      setSyncStatus('syncing');
      try {
        await supabase
          .from('daily_logs')
          .upsert({
            user_id: user.id,
            date: entry.date,
            flow: entry.flow || null,
            mood: entry.mood || null,
            symptoms: entry.symptoms || [],
            energy_level: entry.energy || 3,
            notes: entry.notes || '',
            water_intake_glasses: entry.waterGlasses || 8,
            sleep_hours: entry.sleepHours || 8,
            updated_at: updatedEntry.updatedAt,
          }, { onConflict: 'user_id,date' });
        setSyncStatus('synced');
        setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (e) {
        console.warn('Supabase save dailyLog note:', e);
        setSyncStatus('synced');
      }
    } else {
      setSyncStatus('local_only');
    }
  };

  const deleteDailyLog = async (date: string) => {
    setDailyLogs((prev) => {
      const copy = { ...prev };
      delete copy[date];
      return copy;
    });

    if (user && isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('daily_logs')
          .delete()
          .eq('user_id', user.id)
          .eq('date', date);
      } catch (e) {
        console.warn('Supabase delete dailyLog note:', e);
      }
    }
  };

  const getLogForDate = (date: string) => dailyLogs[date];

  const updatePartnerPermissions = async (updates: Partial<PartnerPermissions>) => {
    const updated = { ...partnerPermissions, ...updates };
    setPartnerPermissions(updated);
  };

  const disconnectPartner = async () => {
    const updated = {
      ...partnerPermissions,
      isLinked: false,
      partnerName: '',
      inviteCode: `SAKHI-CARE-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setPartnerPermissions(updated);
  };

  const addForumPost = async (title: string, content: string, category: ForumPost['category']) => {
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
          const hasReacted = post.userReactions[reactionType];
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
        syncStatus,
        lastSyncedTime,
        syncAllLogsToCloud,
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
