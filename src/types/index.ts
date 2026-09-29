export type Language = 'en' | 'hi';

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export interface CycleSettings {
  lastPeriodDate: string; // YYYY-MM-DD
  cycleLength: number; // e.g. 28
  periodDuration: number; // e.g. 5
  lutealLength: number; // e.g. 14
}

export type MoodType = 'calm' | 'happy' | 'energetic' | 'sensitive' | 'irritable' | 'anxious' | 'low';
export type FlowType = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export interface DailyLogEntry {
  date: string; // YYYY-MM-DD
  mood?: MoodType;
  energy?: number; // 1 to 5
  flow?: FlowType;
  symptoms: string[];
  sleepHours: number;
  waterGlasses: number;
  notes?: string;
  updatedAt?: string;
  syncedToCloud?: boolean;
}

export interface PartnerPermissions {
  isLinked: boolean;
  partnerName: string;
  inviteCode: string;
  sharePhase: boolean;
  shareNextPeriod: boolean;
  sharePMSMood: boolean;
  // Strictly false by default for private sensitive details
  shareDailyLogs: boolean;
  shareSymptoms: boolean;
  sharePrivateNotes: boolean;
  linkedSince?: string;
}

export interface ForumComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface ForumPost {
  id: string;
  authorPseudonym: string;
  authorAvatar: string;
  title: string;
  content: string;
  category: 'wellness' | 'pcos' | 'first-period' | 'nutrition' | 'mood';
  createdAt: string;
  reactions: {
    heart: number;
    helpful: number;
    hug: number;
  };
  userReactions: {
    heart?: boolean;
    helpful?: boolean;
    hug?: boolean;
  };
  comments: ForumComment[];
  isReported?: boolean;
}

export interface BuddyProfile {
  isOptedIn: boolean;
  status: 'inactive' | 'searching' | 'connected';
  pseudonym: string;
  matchedBuddyName?: string;
  sharedPhaseOnly: boolean;
  isPaused: boolean;
  connectedSince?: string;
}

export interface VerifiedDoctor {
  id: string;
  name: string;
  qualifications: string;
  specialty: string;
  hospital: string;
  location: string;
  registrationNumber: string;
  council: string;
  experienceYears: number;
  consultationFee: string;
  teleconsultAvailable: boolean;
  appointmentUrl: string;
  officialEmail: string;
  bio: string;
  photoUrl?: string;
  photoEmoji?: string;
}

export interface PeriodProduct {
  id: string;
  name: string;
  brand?: string;
  price?: string;
  rating?: number;
  category: 'cups' | 'pads' | 'tampons' | 'panties' | 'relief';
  description: string;
  pros: string[];
  cons: string[];
  usageSteps: string[];
  cleaningInstructions?: string;
  wearTimeHours: string;
  ecoImpact: 'Reusable / Low' | 'Biodegradable' | 'Single-Use';
  officialRetailUrl?: string;
  inStock?: boolean;
  tutorialYoutubeId: string;
  tutorialTitle: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  isGuest?: boolean;
  provider?: 'google' | 'email' | 'guest';
  createdAt?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  badge?: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  tier: 'free' | 'plus' | 'premium';
}

export interface DoctorInquiry {
  id: string;
  doctorId: string;
  doctorName: string;
  patientName: string;
  patientEmail: string;
  symptomsSummary: string;
  preferredDate: string;
  notes?: string;
  status: 'pending' | 'confirmed';
  createdAt: string;
}
