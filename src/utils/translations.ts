import { Language } from '../types';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Brand & Header
    brand: 'Sakhi Cycle',
    tagline: 'Your compassionate cycle & wellness sanctuary',
    navHome: 'Home',
    navTrack: 'Track',
    navCalendar: 'Calendar',
    navDailyLog: 'Daily Log',
    navInsights: 'Insights',
    navLearn: 'Learn',
    navLifestyle: 'Lifestyle',
    navProducts: 'Products & Guides',
    navDoctors: 'Verified Doctors',
    navCommunity: 'Community',
    navForum: 'Safe Forum',
    navBuddy: 'Cycle Buddy',
    navPartner: 'Partner Support',
    navVibes: 'Vibes',
    navPlaylists: 'Playlists',
    navAffirmations: 'Affirmations',
    navBreathe: 'Breathe',
    navMoodMatch: 'Mood Match',
    navSettings: 'Profile & Settings',

    // Hero & Status
    todayGreeting: 'Hello, Beautiful Soul',
    cycleDay: 'Day {day} of {total}',
    daysUntilPeriod: '{days} days until next period',
    predictedPeriod: 'Estimated Next Period',
    fertileWindow: 'Estimated Fertile Window',
    ovulationDay: 'Ovulation Crest',
    disclaimerEstimate: 'Estimates for wellness tracking only. Not medical advice or birth control.',
    logTodayCTA: 'Log Today’s Symptoms',
    viewGarden: 'Cycle Garden',

    // Phases
    phaseMenstrual: 'Menstrual Phase',
    phaseFollicular: 'Follicular Phase',
    phaseOvulation: 'Ovulatory Phase',
    phaseLuteal: 'Luteal Phase',
    menstrualDesc: 'Shedding, deep rest, warm nourishment, and inner listening.',
    follicularDesc: 'Estrogen rises, renewal, creative sparks, and rising vitality.',
    ovulationDesc: 'Hormone peak, high social energy, confidence, and fertility crest.',
    lutealDesc: 'Progesterone surge, slowing down, intuitive wisdom, and comforting care.',

    // Daily Log
    logTitle: 'Daily Wellbeing Check-in',
    logSubtitle: 'Check in with your body today without judgment',
    selectDate: 'Date',
    howAreYouFeeling: 'How are you feeling emotionally?',
    energyLevel: 'Energy Level',
    menstrualFlow: 'Flow Intensity',
    symptomsTitle: 'Physical Sensations & Symptoms',
    sleepTitle: 'Sleep Rest',
    hoursSlept: 'Hours of sleep',
    hydrationTitle: 'Hydration',
    glassesWater: 'Glasses of water (250ml)',
    notesTitle: 'Personal Journal Notes (100% Private)',
    notesPlaceholder: 'Write anything on your mind. This is saved securely on your device only.',
    saveEntry: 'Save Daily Check-in',
    entrySaved: 'Check-in saved tenderly',
    entryDeleted: 'Entry removed',

    // Moods
    moodCalm: 'Serene & Calm',
    moodHappy: 'Happy & Radiant',
    moodEnergetic: 'Energetic & Vibrant',
    moodSensitive: 'Tender & Sensitive',
    moodIrritable: 'Irritable & Restless',
    moodAnxious: 'Anxious & Overwhelmed',
    moodLow: 'Low & Withdrawn',

    // Symptoms
    sympCramps: 'Abdominal Cramps',
    sympHeadache: 'Headache',
    sympBloating: 'Bloating',
    sympTenderBreasts: 'Tender Breasts',
    sympBackache: 'Lower Backache',
    sympAcne: 'Skin Breakouts',
    sympCravings: 'Sweet / Salty Cravings',
    sympFatigue: 'Body Fatigue',
    sympNausea: 'Mild Nausea',
    sympInsomnia: 'Trouble Sleeping',
    sympHotFlashes: 'Warm Flushes',
    sympMoodSwings: 'Mood Fluctuations',

    // Flows
    flowNone: 'No Flow',
    flowSpotting: 'Light Spotting',
    flowLight: 'Light Flow',
    flowMedium: 'Medium Flow',
    flowHeavy: 'Heavy Flow',

    // Partner Support
    partnerTitle: 'Flo-Inspired Partner Care Space',
    partnerSubtitle: 'Gentle, consensual understanding for your partner without compromising your private logs.',
    partnerInvitePrompt: 'Generate a private invite code for your partner',
    partnerCodeLabel: 'Your Partner Invite Code',
    copyCode: 'Copy Invite Link',
    copiedNotice: 'Link copied to clipboard!',
    whatsappShare: 'Share via WhatsApp',
    activePermissions: 'Sharing Controls (You remain in total control)',
    sharePhaseLabel: 'Share Current Cycle Phase & General Mood Outlook',
    shareNextPeriodLabel: 'Share Approximate Period Arrival Window',
    sharePMSAlertLabel: 'Share Gentle Supportive Reminders during Luteal / PMS',
    privacyGuaranteeTitle: 'Strict Privacy Shield Guarantee',
    privacyGuaranteeText: 'Your detailed daily logs, symptom checklists, intimacy entries, private notes, and health records are NEVER shared with your partner.',
    disconnectPartner: 'Disconnect Partner',
    partnerModePreview: 'Switch to Partner Care View',
    partnerSimTitle: 'Partner Companion Portal',
    partnerSimNote: 'What your partner sees to support you with kindness:',

    // AI Sakhi
    sakhiTitle: 'Sakhi AI Wellness Guide',
    sakhiSubtitle: 'Ask gentle questions about your cycle, herbal comforts, and symptom relief.',
    sakhiPlaceholder: 'Ask Sakhi anything (e.g., natural tips for day 2 cramps, tea recipes)...',
    sakhiSend: 'Ask Sakhi',
    sakhiEmergencyWarning: 'If experiencing sudden severe pain or heavy bleeding, please visit an emergency care physician immediately.',

    // Common
    loading: 'Loading...',
    emptyState: 'No entries recorded yet.',
    verifiedBadge: 'Verified Clinical Record',
    officialNotice: 'Official Health Reference',
  },
  hi: {
    // Brand & Header
    brand: 'सखी साइकल',
    tagline: 'आपका स्नेही मासिक चक्र और स्वास्थ्य साथी',
    navHome: 'होम',
    navTrack: 'ट्रैक',
    navCalendar: 'कैलेंडर',
    navDailyLog: 'दैनिक लॉग',
    navInsights: 'विश्लेषण',
    navLearn: 'सीखें',
    navLifestyle: 'जीवनशैली',
    navProducts: 'उत्पाद व गाइड',
    navDoctors: 'सत्यापित चिकित्सक',
    navCommunity: 'समुदाय',
    navForum: 'सुरक्षित मंच',
    navBuddy: 'साइकल सखी',
    navPartner: 'पार्टनर सपोर्ट',
    navVibes: 'वाइब्स',
    navPlaylists: 'प्लेलिस्ट',
    navAffirmations: 'सकारात्मक विचार',
    navBreathe: 'श्वास अभ्यास',
    navMoodMatch: 'मूड मैच',
    navSettings: 'प्रोफ़ाइल व सेटिंग्स',

    // Hero & Status
    todayGreeting: 'नमस्ते, सखी',
    cycleDay: 'दिन {day} / कुल {total}',
    daysUntilPeriod: 'अगले पीरियड में {days} दिन शेष',
    predictedPeriod: 'अनुमानित अगला पीरियड',
    fertileWindow: 'अनुमानित गर्भधारण खिड़की',
    ovulationDay: 'ओव्यूलेशन का दिन',
    disclaimerEstimate: 'केवल कल्याण मार्गदर्शन के लिए अनुमान। यह चिकित्सीय सलाह या गर्भनिरोधक नहीं है।',
    logTodayCTA: 'आज के लक्षण दर्ज करें',
    viewGarden: 'साइकल उपवन',

    // Phases
    phaseMenstrual: 'मासिक धर्म चरण (Menstrual)',
    phaseFollicular: 'फॉलिक्यूलर चरण (Follicular)',
    phaseOvulation: 'ओव्यूलेशन चरण (Ovulation)',
    phaseLuteal: 'ल्यूटियल चरण (Luteal)',
    menstrualDesc: 'शारीरिक विश्राम, गर्म आहार, और खुद के प्रति कोमलता का समय।',
    follicularDesc: 'एस्ट्रोजन में वृद्धि, नई ताजगी, रचनात्मकता और ऊर्जा का समय।',
    ovulationDesc: 'हार्मोन का शिखर, आत्मविश्वास, सामाजिक ऊर्जा और ओव्यूलेशन।',
    lutealDesc: 'प्रोजेस्टेरोन प्रभाव, शांति, आत्म-चिंतन और सुकून भरा ख्याल।',

    // Daily Log
    logTitle: 'दैनिक स्वास्थ्य चेक-इन',
    logSubtitle: 'बिना किसी संकोच के अपने शरीर की बात सुनें',
    selectDate: 'तारीख',
    howAreYouFeeling: 'आज आप मन से कैसा महसूस कर रही हैं?',
    energyLevel: 'ऊर्जा का स्तर',
    menstrualFlow: 'पीरियड फ्लो',
    symptomsTitle: 'शारीरिक लक्षण व बदलाव',
    sleepTitle: 'नींद',
    hoursSlept: 'नींद के घंटे',
    hydrationTitle: 'पानी की मात्रा',
    glassesWater: 'पानी के गिलास (250 मिली)',
    notesTitle: 'व्यक्तिगत डायरी (पूर्णतः निजी)',
    notesPlaceholder: 'अपने मन की कोई भी बात लिखें। यह केवल आपके उपकरण में सुरक्षित रहती है।',
    saveEntry: 'चेक-इन सहेजें',
    entrySaved: 'विवरण सुरक्षित कर लिया गया है',
    entryDeleted: 'विवरण हटा दिया गया',

    // Moods
    moodCalm: 'शांत व सुकून भरा',
    moodHappy: 'प्रसन्न व उत्साहित',
    moodEnergetic: 'ऊर्जावान',
    moodSensitive: 'संवेदनशील व भावुक',
    moodIrritable: 'चिड़चिड़ापन',
    moodAnxious: 'बेचैन व चिंतित',
    moodLow: 'उदास व थका हुआ',

    // Symptoms
    sympCramps: 'पेट के निचले हिस्से में ऐंठन',
    sympHeadache: 'सिरदर्द',
    sympBloating: 'पेट फूलना (Bloating)',
    sympTenderBreasts: 'स्तनों में भारीपन/दर्द',
    sympBackache: 'कमर दर्द',
    sympAcne: 'मुंहासे (Acne)',
    sympCravings: 'मीठा या नमकीन खाने की इच्छा',
    sympFatigue: 'थकान व सुस्ती',
    sympNausea: 'हल्की मतली',
    sympInsomnia: 'नींद न आना',
    sympHotFlashes: 'गर्मी लगना',
    sympMoodSwings: 'मूड में उतार-चढ़ाव',

    // Flows
    flowNone: 'कोई फ्लो नहीं',
    flowSpotting: 'हल्के धब्बे (Spotting)',
    flowLight: 'हल्का फ्लो',
    flowMedium: 'सामान्य फ्लो',
    flowHeavy: 'भारी फ्लो',

    // Partner Support
    partnerTitle: 'पार्टनर सपोर्ट स्पेस (Partner Care)',
    partnerSubtitle: 'आपके साथी के लिए समझदारी भरा साथ, आपकी निजी डायरी को पूरी तरह गोपनीय रखते हुए।',
    partnerInvitePrompt: 'अपने साथी के लिए एक सुरक्षित इनवाइट कोड बनाएं',
    partnerCodeLabel: 'आपका पार्टनर इनवाइट कोड',
    copyCode: 'लिंक कॉपी करें',
    copiedNotice: 'लिंक क्लिपबोर्ड पर कॉपी हो गया!',
    whatsappShare: 'व्हाट्सएप पर शेयर करें',
    activePermissions: 'शेयरिंग नियंत्रण (पूरी तरह आपके हाथ में)',
    sharePhaseLabel: 'वर्तमान चक्र चरण और सामान्य मूड सुझाव साझा करें',
    shareNextPeriodLabel: 'आने वाले पीरियड का संभावित समय साझा करें',
    sharePMSAlertLabel: 'ल्यूटियल चरण / पीएमएस के दौरान सहायक देखभाल सुझाव भेजें',
    privacyGuaranteeTitle: 'कठोर गोपनीयता की गारंटी',
    privacyGuaranteeText: 'आपके दैनिक लॉग, लक्षण, निजी डायरी और चिकित्सीय रिकॉर्ड कभी भी पार्टनर से साझा नहीं किए जाते।',
    disconnectPartner: 'पार्टनर को डिस्कनेक्ट करें',
    partnerModePreview: 'पार्टनर केयर व्यू देखें',
    partnerSimTitle: 'पार्टनर साथी पोर्टल',
    partnerSimNote: 'आपका साथी आपका ख्याल रखने के लिए यह देख सकेगा:',

    // AI Sakhi
    sakhiTitle: 'सखी एआई वेलनेस गाइड',
    sakhiSubtitle: 'अपने चक्र, हर्बल चाय, और दर्द में राहत के सरल घरेलू उपाय पूछें।',
    sakhiPlaceholder: 'सखी से कुछ भी पूछें (उदा. पीरियड्स क्रैम्प्स में राहत, हर्बल चाय)...',
    sakhiSend: 'सखी से पूछें',
    sakhiEmergencyWarning: 'यदि तेज असहनीय दर्द या अत्यधिक रक्तस्राव हो, तो कृपया तुरंत नजदीकी चिकित्सक से संपर्क करें।',

    // Common
    loading: 'लोड हो रहा है...',
    emptyState: 'अभी तक कोई प्रविष्टि नहीं है।',
    verifiedBadge: 'सत्यापित मेडिकल रिकॉर्ड',
    officialNotice: 'आधिकारिक स्वास्थ्य संदर्भ',
  },
};

export function getTranslation(lang: Language, key: string, params?: Record<string, string | number>): string {
  let text = TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return text;
}
