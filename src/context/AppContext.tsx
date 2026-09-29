import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Language,
  CycleSettings,
  DailyLogEntry,
  PartnerPermissions,
  ForumPost,
  BuddyProfile,
  CyclePhase,
} from '../types';
import { formatDateToISO, calculateCycleStatus } from '../utils/cycleCalculations';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { useAuth } from './AuthContext';

export interface DailyReflectionPrompt {
  phase: CyclePhase;
  phaseTitle: string;
  question: string;
  date: string;
  suggestion: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  activeSection: string;
  setActiveSection: (sec: string) => void;
  activeSubSection: string;
  setActiveSubSection: (sub: string) => void;
  cycleSettings: CycleSettings;
  updateCycleSettings: (settings: Partial<CycleSettings>) => Promise<boolean>;
  dailyLogs: Record<string, DailyLogEntry>; // keyed by YYYY-MM-DD
  saveDailyLog: (entry: DailyLogEntry) => Promise<boolean>;
  deleteDailyLog: (date: string) => Promise<boolean>;
  getLogForDate: (date: string) => DailyLogEntry | undefined;
  partnerPermissions: PartnerPermissions;
  updatePartnerPermissions: (updates: Partial<PartnerPermissions>) => Promise<boolean>;
  disconnectPartner: () => void;
  forumPosts: ForumPost[];
  addForumPost: (title: string, content: string, category: ForumPost['category']) => Promise<boolean>;
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
  syncErrorMsg: string | null;
  syncAllLogsToCloud: () => Promise<boolean>;
  dailyReflectionPrompt: DailyReflectionPrompt | null;
  dismissReflectionPrompt: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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
  shareDailyLogs: false,
  shareSymptoms: false,
  sharePrivateNotes: false,
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

const getInitialLogs = (): Record<string, DailyLogEntry> => {
  const logs: Record<string, DailyLogEntry> = {};

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
    syncedToCloud: false,
  };

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
    syncedToCloud: false,
  };

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
    syncedToCloud: false,
  };

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
    syncedToCloud: false,
  };

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
    syncedToCloud: false,
  };

  return logs;
};

const INITIAL_FORUM_POSTS: ForumPost[] = [
  {
    id: 'post-1',
    authorPseudonym: 'LavenderMoon_42',
    authorAvatar: '🌸',
    title: 'Switching to menstrual cups: what helped me finally feel comfortable',
    content:
      'For months I was intimidated by menstrual cups, but trying the "punch-down fold" in the shower made all the difference! Remember to boil it in clean water between cycles.',
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
    content:
      'During the luteal phase (after ovulation), I add 1 tbsp ground sunflower seeds and 1 tbsp sesame seeds to my morning warm oats. It has helped my luteal mood swings feel so much softer.',
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
    content:
      'We set up partner view so my husband only gets a gentle notification when I enter my luteal and menstrual phases. He started bringing me hot chamomile tea without me even having to ask!',
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
  const [syncErrorMsg, setSyncErrorMsg] = useState<string | null>(null);

  // Daily Reflection prompt triggered after logging symptoms
  const [dailyReflectionPrompt, setDailyReflectionPrompt] = useState<DailyReflectionPrompt | null>(() => {
    const saved = localStorage.getItem('sakhi_daily_reflection');
    return saved ? JSON.parse(saved) : null;
  });

  const dismissReflectionPrompt = () => {
    setDailyReflectionPrompt(null);
    localStorage.removeItem('sakhi_daily_reflection');
  };

  // Helper to generate reflection questions based on current cycle phase
  const generateReflectionForPhase = useCallback((phase: CyclePhase): DailyReflectionPrompt => {
    switch (phase) {
      case 'menstrual':
        return {
          phase: 'menstrual',
          phaseTitle: 'Menstrual Phase (Rest & Cleansing)',
          question:
            'In this tender time of physical letting go, what expectation, pressure, or task can you give yourself permission to release today?',
          date: formatDateToISO(new Date()),
          suggestion: 'Sip warm herbal tea, rest with a heating pad, and speak kindly to yourself.',
        };
      case 'follicular':
        return {
          phase: 'follicular',
          phaseTitle: 'Follicular Phase (Renewal & Rising Energy)',
          question:
            'As fresh hormonal vitality begins to awaken within you, what new idea or creative intention feels exciting to cultivate this week?',
          date: formatDateToISO(new Date()),
          suggestion: 'Take a brisk morning walk, journal your dreams, and nourish with fresh crisp greens.',
        };
      case 'ovulation':
        return {
          phase: 'ovulation',
          phaseTitle: 'Ovulatory Phase (Peak Radiance & Connection)',
          question:
            'With your confidence and communication at their zenith, how can you express love, gratitude, or your authentic truth today?',
          date: formatDateToISO(new Date()),
          suggestion: 'Connect with a friend, voice an important goal, and celebrate your radiant presence.',
        };
      case 'luteal':
      default:
        return {
          phase: 'luteal',
          phaseTitle: 'Luteal Phase (Inward Wisdom & Nurture)',
          question:
            'As your internal rhythm winds inward toward sanctuary, what soothing boundary or comfort ritual will you gift your body this evening?',
          date: formatDateToISO(new Date()),
          suggestion: 'Dim warm lighting, enjoy roasted pumpkin or sunflower seeds, and protect your peace.',
        };
    }
  }, []);

  // Supabase Real-Time Synchronization when user session changes
  useEffect(() => {
    let isCancelled = false;

    async function syncFromSupabase() {
      if (!user || user.isGuest || !isSupabaseConfigured || !supabase) {
        setSyncStatus('local_only');
        return;
      }

      setSyncStatus('syncing');
      setSyncErrorMsg(null);

      try {
        // 1. Fetch Cycle Settings from Supabase
        const { data: cycleData, error: cycleErr } = await supabase
          .from('cycle_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (cycleData && !isCancelled) {
          setCycleSettings({
            lastPeriodDate: cycleData.last_period_date,
            cycleLength: Number(cycleData.cycle_length) || 28,
            periodDuration: Number(cycleData.period_duration) || 5,
            lutealLength: Number(cycleData.luteal_length) || 14,
          });
        } else if (!cycleData && !cycleErr && !isCancelled) {
          // Add local settings to Supabase
          await supabase.from('cycle_settings').upsert({
            user_id: user.id,
            last_period_date: cycleSettings.lastPeriodDate,
            cycle_length: cycleSettings.cycleLength,
            period_duration: cycleSettings.periodDuration,
            luteal_length: cycleSettings.lutealLength,
            updated_at: new Date().toISOString(),
          });
        }

        // 2. Fetch Partner Permissions from Supabase
        const { data: permData } = await supabase
          .from('partner_permissions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (permData && !isCancelled) {
          setPartnerPermissions({
            isLinked: Boolean(permData.is_linked),
            partnerName: permData.partner_name || 'Arjun',
            inviteCode: permData.invite_code || 'SAKHI-CARE-9281',
            sharePhase: Boolean(permData.share_phase),
            shareNextPeriod: Boolean(permData.share_next_period),
            sharePMSMood: Boolean(permData.share_pms_mood),
            shareDailyLogs: Boolean(permData.share_daily_logs),
            shareSymptoms: Boolean(permData.share_symptoms),
            sharePrivateNotes: Boolean(permData.share_private_notes),
          });
        }

        // 3. Fetch Daily Logs from Supabase
        const { data: logsData, error: logsErr } = await supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', user.id);

        if (logsData && !isCancelled) {
          const cloudLogs: Record<string, DailyLogEntry> = {};
          logsData.forEach((row) => {
            cloudLogs[row.date] = {
              date: row.date,
              mood: row.mood,
              energy: Number(row.energy) || 3,
              flow: row.flow,
              symptoms: Array.isArray(row.symptoms) ? row.symptoms : [],
              sleepHours: Number(row.sleep_hours) || 8,
              waterGlasses: Number(row.water_glasses) || 8,
              notes: row.notes || '',
              updatedAt: row.updated_at,
              syncedToCloud: true,
            };
          });

          // Merge local and cloud entries (cloud wins conflicts, but unsynced locals are uploaded)
          setDailyLogs((prev) => {
            const merged = { ...prev, ...cloudLogs };
            // Upload local entries that weren't in cloud yet
            Object.values(prev).forEach(async (localEntry) => {
              if (!cloudLogs[localEntry.date]) {
                await supabase
                  ?.from('daily_logs')
                  .upsert({
                    user_id: user.id,
                    date: localEntry.date,
                    mood: localEntry.mood,
                    energy: localEntry.energy,
                    flow: localEntry.flow,
                    symptoms: localEntry.symptoms,
                    sleep_hours: localEntry.sleepHours,
                    water_glasses: localEntry.waterGlasses,
                    notes: localEntry.notes,
                    updated_at: new Date().toISOString(),
                  }, { onConflict: 'user_id,date' });
              }
            });
            return merged;
          });
        }

        if (!isCancelled) {
          setSyncStatus('synced');
          setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      } catch (err: any) {
        console.warn('Supabase sync notice:', err?.message || err);
        if (!isCancelled) {
          setSyncStatus('error');
          setSyncErrorMsg('Could not reach cloud database. Operating safely in local offline mode.');
        }
      }
    }

    syncFromSupabase();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  // Local storage backup
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

  useEffect(() => {
    if (dailyReflectionPrompt) {
      localStorage.setItem('sakhi_daily_reflection', JSON.stringify(dailyReflectionPrompt));
    }
  }, [dailyReflectionPrompt]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Update Cycle Settings with Supabase persistence
  const updateCycleSettings = async (settings: Partial<CycleSettings>): Promise<boolean> => {
    const updated = { ...cycleSettings, ...settings };
    setCycleSettings(updated);

    if (user && !user.isGuest && isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('cycle_settings').upsert({
          user_id: user.id,
          last_period_date: updated.lastPeriodDate,
          cycle_length: updated.cycleLength,
          period_duration: updated.periodDuration,
          luteal_length: updated.lutealLength,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

        if (error) {
          console.warn('Supabase cycle_settings save warning:', error.message);
          return false;
        }
        return true;
      } catch (e) {
        console.warn('Supabase cycle_settings network error:', e);
        return false;
      }
    }
    return true;
  };

  // Save Daily Log with confirmed Supabase write & reflection question generation
  const saveDailyLog = async (entry: DailyLogEntry): Promise<boolean> => {
    const updatedEntry: DailyLogEntry = {
      ...entry,
      updatedAt: new Date().toISOString(),
      syncedToCloud: false,
    };

    setDailyLogs((prev) => ({
      ...prev,
      [entry.date]: updatedEntry,
    }));

    // Trigger daily reflection question based on user's current cycle phase!
    const cycleStatus = calculateCycleStatus(cycleSettings);
    const reflection = generateReflectionForPhase(cycleStatus.currentPhase);
    setDailyReflectionPrompt(reflection);

    if (user && !user.isGuest && isSupabaseConfigured && supabase) {
      setSyncStatus('syncing');
      try {
        const { error } = await supabase.from('daily_logs').upsert({
          user_id: user.id,
          date: entry.date,
          mood: entry.mood,
          energy: entry.energy,
          flow: entry.flow,
          symptoms: entry.symptoms,
          sleep_hours: entry.sleepHours,
          water_glasses: entry.waterGlasses,
          notes: entry.notes,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,date' });

        if (error) {
          console.warn('Supabase daily_logs write error:', error.message);
          setSyncStatus('error');
          setSyncErrorMsg(error.message);
          return false;
        }

        // Mark as confirmed written
        setDailyLogs((prev) => ({
          ...prev,
          [entry.date]: { ...updatedEntry, syncedToCloud: true },
        }));
        setSyncStatus('synced');
        setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        return true;
      } catch (e: any) {
        console.warn('Network error saving daily log to Supabase:', e);
        setSyncStatus('error');
        setSyncErrorMsg('Network interrupted. Saved locally.');
        return false;
      }
    } else {
      setSyncStatus('local_only');
      return true;
    }
  };

  // Delete Daily Log entry with confirmed Supabase removal
  const deleteDailyLog = async (date: string): Promise<boolean> => {
    setDailyLogs((prev) => {
      const copy = { ...prev };
      delete copy[date];
      return copy;
    });

    if (user && !user.isGuest && isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('daily_logs')
          .delete()
          .match({ user_id: user.id, date });

        if (error) {
          console.warn('Supabase delete error:', error.message);
          return false;
        }
        return true;
      } catch (e) {
        console.warn('Supabase delete dailyLog network error:', e);
        return false;
      }
    }
    return true;
  };

  const getLogForDate = (date: string): DailyLogEntry | undefined => {
    return dailyLogs[date];
  };

  const updatePartnerPermissions = async (updates: Partial<PartnerPermissions>): Promise<boolean> => {
    const updated = { ...partnerPermissions, ...updates };
    setPartnerPermissions(updated);

    if (user && !user.isGuest && isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('partner_permissions').upsert({
          user_id: user.id,
          is_linked: updated.isLinked,
          partner_name: updated.partnerName,
          invite_code: updated.inviteCode,
          share_phase: updated.sharePhase,
          share_next_period: updated.shareNextPeriod,
          share_pms_mood: updated.sharePMSMood,
          share_daily_logs: updated.shareDailyLogs,
          share_symptoms: updated.shareSymptoms,
          share_private_notes: updated.sharePrivateNotes,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

        return !error;
      } catch {
        return false;
      }
    }
    return true;
  };

  const disconnectPartner = () => {
    updatePartnerPermissions({
      isLinked: false,
      shareDailyLogs: false,
      shareSymptoms: false,
      sharePrivateNotes: false,
    });
  };

  const addForumPost = async (
    title: string,
    content: string,
    category: ForumPost['category']
  ): Promise<boolean> => {
    const newPost: ForumPost = {
      id: `post-${Date.now()}`,
      authorPseudonym: user?.displayName ? `${user.displayName.split(' ')[0]}_${Math.floor(10 + Math.random() * 89)}` : 'SakhiSister_22',
      authorAvatar: '🌸',
      title,
      content,
      category,
      createdAt: formatDateToISO(new Date()),
      reactions: { heart: 1, helpful: 0, hug: 0 },
      userReactions: { heart: true },
      comments: [],
    };

    setForumPosts((prev) => [newPost, ...prev]);

    if (user && !user.isGuest && isSupabaseConfigured && supabase) {
      try {
        await supabase.from('forum_posts').insert({
          user_id: user.id,
          author_pseudonym: newPost.authorPseudonym,
          author_avatar: newPost.authorAvatar,
          title,
          content,
          category,
          reactions: newPost.reactions,
          comments: [],
        });
      } catch (e) {
        console.warn('Could not sync forum post to Supabase:', e);
      }
    }
    return true;
  };

  const addForumComment = (postId: string, text: string) => {
    setForumPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const newComment = {
          id: `c-${Date.now()}`,
          author: user?.displayName ? `${user.displayName.split(' ')[0]}` : 'Sister_Bloom',
          text,
          createdAt: formatDateToISO(new Date()),
        };
        return {
          ...p,
          comments: [...p.comments, newComment],
        };
      })
    );
  };

  const toggleReaction = (postId: string, reactionType: 'heart' | 'helpful' | 'hug') => {
    setForumPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const currentlyActive = p.userReactions?.[reactionType];
        const newCount = (p.reactions[reactionType] || 0) + (currentlyActive ? -1 : 1);
        return {
          ...p,
          reactions: {
            ...p.reactions,
            [reactionType]: Math.max(0, newCount),
          },
          userReactions: {
            ...p.userReactions,
            [reactionType]: !currentlyActive,
          },
        };
      })
    );
  };

  const reportPost = (postId: string) => {
    setForumPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isReported: true } : p))
    );
  };

  const updateBuddyProfile = (updates: Partial<BuddyProfile>) => {
    setBuddyProfile((prev) => ({ ...prev, ...updates }));
  };

  // Full manual cloud sync trigger
  const syncAllLogsToCloud = async (): Promise<boolean> => {
    if (!user || user.isGuest) {
      setSyncStatus('local_only');
      return false;
    }
    if (!isSupabaseConfigured || !supabase) {
      setSyncStatus('local_only');
      return false;
    }

    setSyncStatus('syncing');
    setSyncErrorMsg(null);
    try {
      // 1. Sync Cycle Settings
      await supabase.from('cycle_settings').upsert({
        user_id: user.id,
        last_period_date: cycleSettings.lastPeriodDate,
        cycle_length: cycleSettings.cycleLength,
        period_duration: cycleSettings.periodDuration,
        luteal_length: cycleSettings.lutealLength,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      // 2. Sync Partner Permissions
      await supabase.from('partner_permissions').upsert({
        user_id: user.id,
        is_linked: partnerPermissions.isLinked,
        partner_name: partnerPermissions.partnerName,
        invite_code: partnerPermissions.inviteCode,
        share_phase: partnerPermissions.sharePhase,
        share_next_period: partnerPermissions.shareNextPeriod,
        share_pms_mood: partnerPermissions.sharePMSMood,
        share_daily_logs: partnerPermissions.shareDailyLogs,
        share_symptoms: partnerPermissions.shareSymptoms,
        share_private_notes: partnerPermissions.sharePrivateNotes,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      // 3. Sync all daily logs
      const entries = Object.values(dailyLogs);
      for (const entry of entries) {
        await supabase.from('daily_logs').upsert({
          user_id: user.id,
          date: entry.date,
          mood: entry.mood,
          energy: entry.energy,
          flow: entry.flow,
          symptoms: entry.symptoms,
          sleep_hours: entry.sleepHours,
          water_glasses: entry.waterGlasses,
          notes: entry.notes,
          updated_at: entry.updatedAt || new Date().toISOString(),
        }, { onConflict: 'user_id,date' });
      }

      // Mark all logs as synced
      setDailyLogs((prev) => {
        const copy: Record<string, DailyLogEntry> = {};
        for (const [k, v] of Object.entries(prev)) {
          copy[k] = { ...v, syncedToCloud: true };
        }
        return copy;
      });

      setSyncStatus('synced');
      setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      return true;
    } catch (err: any) {
      console.warn('Manual cloud sync failed:', err);
      setSyncStatus('error');
      setSyncErrorMsg(err?.message || 'Sync failed. Local data preserved.');
      return false;
    }
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
        syncErrorMsg,
        syncAllLogsToCloud,
        dailyReflectionPrompt,
        dismissReflectionPrompt,
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
