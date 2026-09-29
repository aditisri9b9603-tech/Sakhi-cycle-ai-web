import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Language,
  CycleSettings,
  DailyLogEntry,
  PartnerPermissions,
  ForumPost,
  BuddyProfile,
  UserProfile,
  ReminderModel,
  CycleModel,
  LogEntryModel,
} from '../types';
import { formatDateToISO } from '../utils/cycleCalculations';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { firestore, isFirebaseConfigured } from '../lib/firebaseClient';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { useAuth } from './AuthContext';

export type SyncStatusType = 'idle' | 'syncing' | 'synced' | 'local_only' | 'error';

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
  userProfile: UserProfile | null;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<boolean>;
  reminders: ReminderModel[];
  saveReminder: (reminder: Omit<ReminderModel, 'id'>, id?: string) => Promise<boolean>;
  deleteReminder: (id: string) => Promise<boolean>;
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
  syncStatus: SyncStatusType;
  syncError: string | null;
  lastSyncedTime: string | null;
  syncAllLogsToCloud: () => Promise<boolean>;
  retryFailedSync: () => Promise<boolean>;
  isPremiumMember: boolean;
  membershipPlan: 'monthly' | 'annual' | null;
  activateMembership: (
    planId: 'monthly' | 'annual',
    details: { orderId: string; paymentId: string; amount: number }
  ) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial default cycle dates
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, activeProvider } = useAuth();

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('sakhi_lang') as Language) || 'en';
  });

  const [activeSection, setActiveSection] = useState<string>('home');
  const [activeSubSection, setActiveSubSection] = useState<string>('');
  const [partnerModeActive, setPartnerModeActive] = useState<boolean>(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(formatDateToISO(new Date()));

  const [syncStatus, setSyncStatus] = useState<SyncStatusType>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);

  // Membership state
  const [isPremiumMember, setIsPremiumMember] = useState<boolean>(() => {
    return localStorage.getItem('sakhi_premium_active') === 'true';
  });
  const [membershipPlan, setMembershipPlan] = useState<'monthly' | 'annual' | null>(() => {
    return (localStorage.getItem('sakhi_premium_plan') as 'monthly' | 'annual') || null;
  });

  // Cycle settings
  const [cycleSettings, setCycleSettings] = useState<CycleSettings>(() => {
    const saved = localStorage.getItem('sakhi_cycle_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return DEFAULT_CYCLE_SETTINGS;
  });

  // Daily logs (keyed by YYYY-MM-DD)
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLogEntry>>(() => {
    const saved = localStorage.getItem('sakhi_daily_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {};
  });

  // Partner permissions
  const [partnerPermissions, setPartnerPermissions] = useState<PartnerPermissions>(() => {
    const saved = localStorage.getItem('sakhi_partner_permissions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return DEFAULT_PARTNER_PERMISSIONS;
  });

  // Buddy profile
  const [buddyProfile, setBuddyProfile] = useState<BuddyProfile>(() => {
    const saved = localStorage.getItem('sakhi_buddy_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return DEFAULT_BUDDY_PROFILE;
  });

  // User Profile (matching User schema: email, displayName, birthDate, healthGoals)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('sakhi_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  // Reminders (matching Reminder schema: reminderType, reminderDate, isEnabled)
  const [reminders, setReminders] = useState<ReminderModel[]>(() => {
    const saved = localStorage.getItem('sakhi_user_reminders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'rem-default-1',
        userId: 'local',
        reminderType: 'Period Approaching (2 Days Notice)',
        reminderDate: '2026-10-15T09:00:00Z',
        isEnabled: true,
      },
      {
        id: 'rem-default-2',
        userId: 'local',
        reminderType: 'Daily Seed Cycling & Hydration',
        reminderDate: '2026-10-01T08:30:00Z',
        isEnabled: true,
      },
    ];
  });

  // Community forum posts
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([
    {
      id: 'post-1',
      authorPseudonym: 'LotusSister',
      authorAvatar: '🌸',
      title: 'First month trying seed cycling - noticeable difference in luteal fatigue',
      content:
        'I started adding ground pumpkin and flax seeds to my morning oats during follicular, then sesame and sunflower in luteal. My mood swings before day 28 feel much softer this time around.',
      category: 'nutrition',
      createdAt: '2026-09-28',
      reactions: { heart: 24, helpful: 18, hug: 7 },
      userReactions: { heart: true },
      comments: [
        {
          id: 'c-1',
          author: 'GreenTeaBreeze',
          text: 'Did you grind them fresh or store a week batch in the fridge? Glad it helped!',
          createdAt: '2026-09-28',
        },
      ],
    },
    {
      id: 'post-2',
      authorPseudonym: 'PCOS_Warrior_9',
      authorAvatar: '🌿',
      title: 'Gentle reminder: irregular cycles do not mean your body is broken',
      content:
        'Sending love to everyone whose calendar doesn’t match textbook 28 days. Every cycle is a dialogue with our nervous system, sleep, and thyroid.',
      category: 'pcos',
      createdAt: '2026-09-27',
      reactions: { heart: 46, helpful: 32, hug: 29 },
      userReactions: { hug: true },
      comments: [],
    },
  ]);

  // Persist locally as immediate resilient offline storage
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
    localStorage.setItem('sakhi_buddy_profile', JSON.stringify(buddyProfile));
  }, [buddyProfile]);

  // Load authenticated user's private data from Cloud Database on login
  useEffect(() => {
    if (!user) {
      setSyncStatus('local_only');
      setSyncError(null);
      return;
    }

    let isCancelled = false;
    const currentUserId = user.uid || user.id;

    async function loadUserCloudData() {
      setSyncStatus('syncing');
      setSyncError(null);

      // --- 1. FIREBASE FIRESTORE ---
      if (activeProvider === 'firebase' && firestore) {
        try {
          // Load Cycle Settings
          const settingsDocRef = doc(firestore, 'users', currentUserId, 'cycleSettings', 'current');
          const settingsSnap = await getDoc(settingsDocRef);
          if (settingsSnap.exists() && !isCancelled) {
            const data = settingsSnap.data() as CycleSettings;
            setCycleSettings(data);
          }

          // Load Daily Logs and merge with local logs to ensure no past records are ever lost
          const logsColRef = collection(firestore, 'users', currentUserId, 'dailyLogs');
          const logsSnap = await getDocs(logsColRef);
          if (!isCancelled) {
            const cloudLogs: Record<string, DailyLogEntry> = {};
            logsSnap.forEach((docItem) => {
              const entry = docItem.data() as DailyLogEntry;
              cloudLogs[entry.date] = { ...entry, syncedToCloud: true };
            });
            setDailyLogs((prev) => {
              const merged = { ...prev, ...cloudLogs };
              // Sync any un-synced local logs to Firestore in background
              const activeDb = firestore;
              if (activeDb) {
                Object.entries(prev).forEach(([date, localEntry]) => {
                  if (!cloudLogs[date]) {
                    const logDoc = doc(activeDb, 'users', currentUserId, 'dailyLogs', date);
                    setDoc(logDoc, { ...localEntry, userId: currentUserId, syncedToCloud: true }, { merge: true }).catch(() => {});
                  }
                });
              }
              return merged;
            });
          }

          // Load User Profile (User entity)
          const userDocRef = doc(firestore, 'users', currentUserId);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists() && !isCancelled) {
            const uData = userSnap.data();
            setUserProfile({
              uid: currentUserId,
              email: uData.email || user?.email || '',
              displayName: uData.displayName || user?.displayName || 'Sakhi Member',
              birthDate: uData.birthDate || '',
              healthGoals: uData.healthGoals || 'Regular rhythm, balanced energy, cramp relief',
              photoURL: uData.photoURL || user?.photoURL || '',
              createdAt: uData.createdAt || '',
            });
          } else if (!isCancelled) {
            // Initialize basic profile from auth
            const initialProfile: UserProfile = {
              uid: currentUserId,
              email: user?.email || '',
              displayName: user?.displayName || 'Sakhi Member',
              birthDate: '',
              healthGoals: 'Regular rhythm, balanced energy, cramp relief',
              photoURL: user?.photoURL || '',
            };
            setUserProfile(initialProfile);
            setDoc(userDocRef, initialProfile, { merge: true }).catch(() => {});
          }

          // Load Reminders (Reminder entity)
          const remindersColRef = collection(firestore, 'users', currentUserId, 'reminders');
          const remindersSnap = await getDocs(remindersColRef);
          if (!isCancelled && !remindersSnap.empty) {
            const loadedReminders: ReminderModel[] = [];
            remindersSnap.forEach((rDoc) => {
              loadedReminders.push({ id: rDoc.id, ...rDoc.data() } as ReminderModel);
            });
            setReminders(loadedReminders);
          }

          // Load Membership
          const memberDocRef = doc(firestore, 'users', currentUserId, 'membership', 'current');
          const memberSnap = await getDoc(memberDocRef);
          if (memberSnap.exists() && !isCancelled) {
            const mData = memberSnap.data();
            if (mData.status === 'active' || mData.status === 'verified') {
              setIsPremiumMember(true);
              setMembershipPlan(mData.planId || 'monthly');
              localStorage.setItem('sakhi_premium_active', 'true');
              localStorage.setItem('sakhi_premium_plan', mData.planId || 'monthly');
            }
          }

          if (!isCancelled) {
            setSyncStatus('synced');
            setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          }
          return;
        } catch (err: any) {
          console.warn('Firestore load error:', err);
          if (!isCancelled) {
            setSyncStatus('error');
            setSyncError(err?.message || 'Could not fetch records from Firestore');
          }
          return;
        }
      }

      // --- 2. SUPABASE POSTGRESQL ---
      if (activeProvider === 'supabase' && isSupabaseConfigured && supabase) {
        try {
          // Load Cycle Settings
          let { data: settingsData, error: sErr } = await supabase
            .from('cycle_settings')
            .select('*')
            .eq('user_id', currentUserId)
            .maybeSingle();

          // Fallback to user_cycle_settings if table was named differently
          if (sErr || !settingsData) {
            const fallback = await supabase
              .from('user_cycle_settings')
              .select('*')
              .eq('user_id', currentUserId)
              .maybeSingle();
            if (fallback.data) settingsData = fallback.data;
          }

          if (settingsData && !isCancelled) {
            setCycleSettings({
              lastPeriodDate: settingsData.last_period_date,
              cycleLength: settingsData.cycle_length,
              periodDuration: settingsData.period_duration,
              lutealLength: settingsData.luteal_length,
            });
          }

          // Load Daily Logs
          const { data: logsData, error: lErr } = await supabase
            .from('daily_logs')
            .select('*')
            .eq('user_id', currentUserId);

          if (lErr) throw lErr;

          if (logsData && !isCancelled) {
            const cloudLogsMap: Record<string, DailyLogEntry> = {};
            logsData.forEach((row: any) => {
              cloudLogsMap[row.date] = {
                date: row.date,
                flow: row.flow,
                mood: row.mood,
                symptoms: Array.isArray(row.symptoms) ? row.symptoms : [],
                energy: row.energy,
                notes: row.notes,
                waterGlasses: row.water_glasses,
                sleepHours: row.sleep_hours,
                updatedAt: row.updated_at,
                syncedToCloud: true,
              };
            });
            if (Object.keys(cloudLogsMap).length > 0) {
              setDailyLogs(cloudLogsMap);
            }
          }

          if (!isCancelled) {
            setSyncStatus('synced');
            setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          }
        } catch (err: any) {
          console.warn('Supabase load error:', err);
          if (!isCancelled) {
            setSyncStatus('error');
            setSyncError(err?.message || 'Could not fetch records from Supabase');
          }
        }
      }
    }

    loadUserCloudData();

    return () => {
      isCancelled = true;
    };
  }, [user, activeProvider]);

  // Sync all logs to Cloud
  const syncAllLogsToCloud = useCallback(async (): Promise<boolean> => {
    if (!user) {
      setSyncStatus('local_only');
      return false;
    }

    setSyncStatus('syncing');
    setSyncError(null);
    const currentUserId = user.uid || user.id;

    // Firebase
    if (activeProvider === 'firebase' && firestore) {
      try {
        // Save Settings
        const settingsDocRef = doc(firestore, 'users', currentUserId, 'cycleSettings', 'current');
        await setDoc(
          settingsDocRef,
          {
            ...cycleSettings,
            userId: currentUserId,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        // Save Daily Logs
        const entries = Object.values(dailyLogs);
        for (const entry of entries) {
          const logDocRef = doc(firestore, 'users', currentUserId, 'dailyLogs', entry.date);
          await setDoc(
            logDocRef,
            {
              ...entry,
              userId: currentUserId,
              updatedAt: entry.updatedAt || new Date().toISOString(),
            },
            { merge: true }
          );
        }

        setSyncStatus('synced');
        setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        return true;
      } catch (err: any) {
        console.error('Firestore sync error:', err);
        setSyncStatus('error');
        setSyncError(err?.message || 'Failed to sync data to Firestore');
        return false;
      }
    }

    // Supabase
    if (activeProvider === 'supabase' && isSupabaseConfigured && supabase) {
      try {
        // Upsert Settings
        const { error: sErr } = await supabase.from('cycle_settings').upsert(
          {
            user_id: currentUserId,
            last_period_date: cycleSettings.lastPeriodDate,
            cycle_length: cycleSettings.cycleLength,
            period_duration: cycleSettings.periodDuration,
            luteal_length: cycleSettings.lutealLength,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
        if (sErr) throw sErr;

        // Upsert Daily Logs
        const entries = Object.values(dailyLogs);
        for (const entry of entries) {
          const { error: lErr } = await supabase.from('daily_logs').upsert(
            {
              user_id: currentUserId,
              date: entry.date,
              flow: entry.flow || null,
              mood: entry.mood || null,
              symptoms: entry.symptoms || [],
              energy: entry.energy || 3,
              notes: entry.notes || '',
              water_glasses: entry.waterGlasses || 8,
              sleep_hours: entry.sleepHours || 8,
              updated_at: entry.updatedAt || new Date().toISOString(),
            },
            { onConflict: 'user_id,date' }
          );
          if (lErr) throw lErr;
        }

        setSyncStatus('synced');
        setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        return true;
      } catch (err: any) {
        console.error('Supabase sync error:', err);
        setSyncStatus('error');
        setSyncError(err?.message || 'Failed to sync data to Supabase');
        return false;
      }
    }

    setSyncStatus('local_only');
    return true;
  }, [user, activeProvider, cycleSettings, dailyLogs]);

  // Retry failed sync
  const retryFailedSync = useCallback(async (): Promise<boolean> => {
    return await syncAllLogsToCloud();
  }, [syncAllLogsToCloud]);

  // Update Cycle Settings
  const updateCycleSettings = async (settings: Partial<CycleSettings>): Promise<boolean> => {
    const updated = { ...cycleSettings, ...settings };
    setCycleSettings(updated);

    if (!user) {
      setSyncStatus('local_only');
      return true;
    }

    const currentUserId = user.uid || user.id;
    setSyncStatus('syncing');

    // Firebase
    if (activeProvider === 'firebase' && firestore) {
      try {
        const docRef = doc(firestore, 'users', currentUserId, 'cycleSettings', 'current');
        await setDoc(
          docRef,
          {
            ...updated,
            userId: currentUserId,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        // Also save to Cycle entity in Firestore
        const cycleDocRef = doc(firestore, 'users', currentUserId, 'cycles', 'current');
        await setDoc(
          cycleDocRef,
          {
            userId: currentUserId,
            startDate: updated.lastPeriodDate,
            cycleLength: updated.cycleLength,
            periodDuration: updated.periodDuration,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        setSyncStatus('synced');
        setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        return true;
      } catch (err: any) {
        console.error('Firestore save settings error:', err);
        setSyncStatus('error');
        setSyncError(err?.message || 'Could not save cycle settings to cloud');
        return false;
      }
    }

    // Supabase
    if (activeProvider === 'supabase' && isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('cycle_settings').upsert(
          {
            user_id: currentUserId,
            last_period_date: updated.lastPeriodDate,
            cycle_length: updated.cycleLength,
            period_duration: updated.periodDuration,
            luteal_length: updated.lutealLength,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
        if (error) throw error;
        setSyncStatus('synced');
        setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        return true;
      } catch (err: any) {
        console.error('Supabase save settings error:', err);
        setSyncStatus('error');
        setSyncError(err?.message || 'Could not save cycle settings to Supabase');
        return false;
      }
    }

    setSyncStatus('local_only');
    return true;
  };

  // Save Daily Log
  const saveDailyLog = async (entry: DailyLogEntry): Promise<boolean> => {
    const updatedEntry: DailyLogEntry = {
      ...entry,
      updatedAt: new Date().toISOString(),
      syncedToCloud: false,
    };

    // Resilient local state update first so user never loses their form input
    setDailyLogs((prev) => ({
      ...prev,
      [entry.date]: updatedEntry,
    }));

    if (!user) {
      setSyncStatus('local_only');
      return true;
    }

    const currentUserId = user.uid || user.id;
    setSyncStatus('syncing');
    setSyncError(null);

    // Firebase
    if (activeProvider === 'firebase' && firestore) {
      try {
        const docRef = doc(firestore, 'users', currentUserId, 'dailyLogs', entry.date);
        await setDoc(
          docRef,
          {
            ...updatedEntry,
            userId: currentUserId,
            syncedToCloud: true,
          },
          { merge: true }
        );

        // Also sync LogEntry entity matching the LogEntry schema
        const logEntryRef = doc(firestore, 'users', currentUserId, 'logEntries', entry.date);
        await setDoc(
          logEntryRef,
          {
            userId: currentUserId,
            cycleId: 'current',
            entryDate: entry.date,
            mood: entry.mood || 'calm',
            flowIntensity: entry.flow || 'none',
            notes: entry.notes || '',
            physicalSymptoms: (entry.symptoms || []).join(', '),
            energy: entry.energy || 3,
            sleepHours: entry.sleepHours || 8,
            waterGlasses: entry.waterGlasses || 8,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        setDailyLogs((prev) => ({
          ...prev,
          [entry.date]: { ...updatedEntry, syncedToCloud: true },
        }));
        setSyncStatus('synced');
        setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        return true;
      } catch (err: any) {
        console.error('Firestore save daily log error:', err);
        setSyncStatus('error');
        setSyncError(err?.message || 'Failed to save daily log to Firestore');
        return false;
      }
    }

    // Supabase
    if (activeProvider === 'supabase' && isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('daily_logs').upsert(
          {
            user_id: currentUserId,
            date: entry.date,
            flow: entry.flow || null,
            mood: entry.mood || null,
            symptoms: entry.symptoms || [],
            energy: entry.energy || 3,
            notes: entry.notes || '',
            water_glasses: entry.waterGlasses || 8,
            sleep_hours: entry.sleepHours || 8,
            updated_at: updatedEntry.updatedAt,
          },
          { onConflict: 'user_id,date' }
        );

        if (error) throw error;

        setDailyLogs((prev) => ({
          ...prev,
          [entry.date]: { ...updatedEntry, syncedToCloud: true },
        }));
        setSyncStatus('synced');
        setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        return true;
      } catch (err: any) {
        console.error('Supabase save daily log error:', err);
        setSyncStatus('error');
        setSyncError(err?.message || 'Failed to save daily log to Supabase');
        return false;
      }
    }

    setSyncStatus('local_only');
    return true;
  };

  // Delete Daily Log
  const deleteDailyLog = async (date: string): Promise<boolean> => {
    setDailyLogs((prev) => {
      const copy = { ...prev };
      delete copy[date];
      return copy;
    });

    if (!user) return true;
    const currentUserId = user.uid || user.id;

    if (activeProvider === 'firebase' && firestore) {
      try {
        const docRef = doc(firestore, 'users', currentUserId, 'dailyLogs', date);
        await deleteDoc(docRef);
        const logEntryRef = doc(firestore, 'users', currentUserId, 'logEntries', date);
        await deleteDoc(logEntryRef).catch(() => {});
        return true;
      } catch (err) {
        console.warn('Firestore delete error:', err);
        return false;
      }
    }

    if (activeProvider === 'supabase' && isSupabaseConfigured && supabase) {
      try {
        await supabase.from('daily_logs').delete().eq('user_id', currentUserId).eq('date', date);
        return true;
      } catch (err) {
        console.warn('Supabase delete error:', err);
        return false;
      }
    }

    return true;
  };

  // Update User Profile (User entity in Firestore)
  const updateUserProfile = async (profileUpdates: Partial<UserProfile>): Promise<boolean> => {
    const currentUserId = user ? (user.uid || user.id) : 'guest';
    const merged: UserProfile = {
      uid: currentUserId,
      email: user?.email || '',
      displayName: user?.displayName || 'Sakhi Member',
      birthDate: '',
      healthGoals: 'Regular rhythm, balanced energy, cramp relief',
      photoURL: user?.photoURL || '',
      ...(userProfile || {}),
      ...profileUpdates,
    };

    setUserProfile(merged);
    localStorage.setItem('sakhi_user_profile', JSON.stringify(merged));

    if (user && activeProvider === 'firebase' && firestore) {
      try {
        const userDocRef = doc(firestore, 'users', currentUserId);
        await setDoc(userDocRef, { ...merged, updatedAt: new Date().toISOString() }, { merge: true });
        return true;
      } catch (e) {
        console.error('Failed to update user profile in Firestore:', e);
        return false;
      }
    }
    return true;
  };

  // Save Reminder (Reminder entity in Firestore)
  const saveReminder = async (reminder: Omit<ReminderModel, 'id'>, id?: string): Promise<boolean> => {
    const currentUserId = user ? (user.uid || user.id) : 'guest';
    const reminderId = id || `rem-${Date.now()}`;
    const newReminder: ReminderModel = {
      id: reminderId,
      ...reminder,
      userId: currentUserId,
      createdAt: new Date().toISOString(),
    };

    const nextReminders = [...reminders.filter((r) => r.id !== reminderId), newReminder];
    setReminders(nextReminders);
    localStorage.setItem('sakhi_user_reminders', JSON.stringify(nextReminders));

    if (user && activeProvider === 'firebase' && firestore) {
      try {
        const remRef = doc(firestore, 'users', currentUserId, 'reminders', reminderId);
        await setDoc(remRef, newReminder, { merge: true });
        return true;
      } catch (e) {
        console.error('Failed to save reminder in Firestore:', e);
        return false;
      }
    }
    return true;
  };

  // Delete Reminder
  const deleteReminder = async (id: string): Promise<boolean> => {
    const nextReminders = reminders.filter((r) => r.id !== id);
    setReminders(nextReminders);
    localStorage.setItem('sakhi_user_reminders', JSON.stringify(nextReminders));

    if (user && activeProvider === 'firebase' && firestore) {
      const currentUserId = user.uid || user.id;
      try {
        const remRef = doc(firestore, 'users', currentUserId, 'reminders', id);
        await deleteDoc(remRef);
        return true;
      } catch (e) {
        console.error('Failed to delete reminder from Firestore:', e);
        return false;
      }
    }
    return true;
  };

  // Activate Verified Razorpay Membership
  const activateMembership = async (
    planId: 'monthly' | 'annual',
    details: { orderId: string; paymentId: string; amount: number }
  ): Promise<boolean> => {
    setIsPremiumMember(true);
    setMembershipPlan(planId);
    localStorage.setItem('sakhi_premium_active', 'true');
    localStorage.setItem('sakhi_premium_plan', planId);

    if (!user) return true;
    const currentUserId = user.uid || user.id;

    // Save to Firestore
    if (activeProvider === 'firebase' && firestore) {
      try {
        const memberRef = doc(firestore, 'users', currentUserId, 'membership', 'current');
        await setDoc(memberRef, {
          userId: currentUserId,
          planId,
          status: 'active',
          amount: details.amount,
          activatedAt: new Date().toISOString(),
          lastPaymentId: details.paymentId,
          lastOrderId: details.orderId,
        });

        // Add to payments log
        const paymentRef = doc(firestore, 'users', currentUserId, 'payments', details.paymentId);
        await setDoc(paymentRef, {
          userId: currentUserId,
          orderId: details.orderId,
          paymentId: details.paymentId,
          planId,
          amount: details.amount,
          status: 'verified',
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Firestore payment record save error:', err);
      }
    }

    // Save to Supabase
    if (activeProvider === 'supabase' && isSupabaseConfigured && supabase) {
      try {
        await supabase.from('user_payments').insert({
          user_id: currentUserId,
          order_id: details.orderId,
          payment_id: details.paymentId,
          plan_id: planId,
          amount: details.amount,
          status: 'verified',
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Supabase payment save error:', err);
      }
    }

    return true;
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
        setLanguage: setLanguageState,
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
        userProfile,
        updateUserProfile,
        reminders,
        saveReminder,
        deleteReminder,
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
        syncError,
        lastSyncedTime,
        syncAllLogsToCloud,
        retryFailedSync,
        isPremiumMember,
        membershipPlan,
        activateMembership,
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
