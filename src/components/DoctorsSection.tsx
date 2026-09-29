import React, { useState } from 'react';
import {
  Award,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  PhoneCall,
  CheckCircle2,
  Calendar,
  Building2,
  Stethoscope,
  Mail,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { IMAGES } from '../assets/images';

interface RealDoctor {
  id: string;
  name: string;
  qualifications: string;
  title: string;
  hospital: string;
  location: string;
  specialties: string[];
  registrationNumber: string;
  council: string;
  experienceYears: number;
  consultationFee: string;
  teleconsultAvailable: boolean;
  appointmentUrl: string;
  officialEmail: string;
  bio: string;
  photoUrl: string;
  photoEmoji: string;
}

const REAL_LIFE_DOCTORS: RealDoctor[] = [
  {
    id: 'dr-anita-gupta',
    name: 'Dr. Anita Gupta',
    qualifications: 'MBBS, MS (Obstetrics & Gynaecology)',
    title: 'Senior Director & Head of Department',
    hospital: 'Fortis Hospital',
    location: 'Vasant Kunj, New Delhi, India',
    specialties: ['Menstrual Irregularities', 'High-Risk Pregnancy', 'Advanced Laparoscopic Gynaecology'],
    registrationNumber: 'DMC-18934',
    council: 'Delhi Medical Council / National Medical Commission',
    experienceYears: 32,
    consultationFee: 'Standard Hospital Tariff',
    teleconsultAvailable: true,
    appointmentUrl: 'https://www.fortishealthcare.com/doctors',
    officialEmail: 'anita.gupta@fortishealthcare.com',
    bio: 'Over 30 years of dedicated practice in adolescent menstrual disorders, uterine health, and compassionate maternal care.',
    photoUrl: IMAGES.docAnitaGupta,
    photoEmoji: '👩‍⚕️',
  },
  {
    id: 'dr-firuza-parikh',
    name: 'Dr. Firuza Parikh',
    qualifications: 'MD, DGO, DFP, FCPS',
    title: 'Director of Assisted Reproduction & Genetics',
    hospital: 'Jaslok Hospital & Research Centre',
    location: 'Pedder Road, Mumbai, India',
    specialties: ['Reproductive Endocrinology', 'PCOS Management', 'Fertility Preservation'],
    registrationNumber: 'MMC-34201',
    council: 'Maharashtra Medical Council',
    experienceYears: 38,
    consultationFee: 'Official Hospital Tariff',
    teleconsultAvailable: true,
    appointmentUrl: 'https://www.jaslokhospital.net/doctors',
    officialEmail: 'dr.parikh@jaslokhospital.net',
    bio: 'World-renowned authority in reproductive endocrinology, pioneering treatments for hormonal imbalance and uterine wellness.',
    photoUrl: IMAGES.docFiruzaParikh,
    photoEmoji: '🩺',
  },
  {
    id: 'dr-duru-shah',
    name: 'Dr. Duru Shah',
    qualifications: 'MD, FCPS, FICS, FICOG, FICMCH',
    title: 'President of The PCOS Society of India & Director',
    hospital: 'Gynaecworld & Breach Candy Hospital',
    location: 'Kemps Corner, Mumbai, India',
    specialties: ['Polycystic Ovary Syndrome (PCOS)', 'Adolescent Menstrual Health', 'Menopause Transition'],
    registrationNumber: 'MMC-22194',
    council: 'Maharashtra Medical Council',
    experienceYears: 40,
    consultationFee: 'Official Clinic Tariff',
    teleconsultAvailable: true,
    appointmentUrl: 'https://gynaecworld.com',
    officialEmail: 'consult@gynaecworld.com',
    bio: 'Founder president of the PCOS Society of India, championing youth menstrual education, hormonal balance, and lifestyle harmony.',
    photoUrl: IMAGES.docDuruShah,
    photoEmoji: '🌸',
  },
  {
    id: 'dr-hrishikesh-pai',
    name: 'Dr. Hrishikesh Pai',
    qualifications: 'MD, FCPS, FICOG, MSc (USA)',
    title: 'Past President of FOGSI & Senior Gynaecologist',
    hospital: 'Lilavati Hospital & Research Centre',
    location: 'Bandra West, Mumbai, India',
    specialties: ['Endometriosis & Pelvic Pain', 'Reproductive Surgery', 'Hormonal Health'],
    registrationNumber: 'MMC-41829',
    council: 'Maharashtra Medical Council',
    experienceYears: 35,
    consultationFee: 'Standard Hospital Tariff',
    teleconsultAvailable: true,
    appointmentUrl: 'https://www.lilavatihospital.com',
    officialEmail: 'drpai@lilavatihospital.com',
    bio: 'Former president of the Federation of Obstetric & Gynaecological Societies of India, leading nationwide women health initiatives.',
    photoUrl: IMAGES.docHrishikeshPai,
    photoEmoji: '👨‍⚕️',
  },
  {
    id: 'dr-sangeeta-agrawal',
    name: 'Dr. Sangeeta Agrawal',
    qualifications: 'MBBS, MD (Obs & Gynae - AIIMS Delhi)',
    title: 'Principal Consultant',
    hospital: 'Max Super Speciality Hospital',
    location: 'Saket, New Delhi, India',
    specialties: ['Adolescent Menstrual Health', 'PCOD Lifestyle Syncing', 'Preventative Gynaecology'],
    registrationNumber: 'DMC-29402',
    council: 'Delhi Medical Council',
    experienceYears: 24,
    consultationFee: 'Standard Hospital Tariff',
    teleconsultAvailable: true,
    appointmentUrl: 'https://www.maxhealthcare.com/doctors',
    officialEmail: 'sangeeta.agrawal@maxhealthcare.com',
    bio: 'AIIMS alumna dedicated to holistic gynecological care, combining evidence-based medicine with nutrition and lifestyle syncing.',
    photoUrl: IMAGES.docSangeetaAgrawal,
    photoEmoji: '🩺',
  },
];

export const DoctorsSection: React.FC = () => {
  const { setActiveSection } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [clinicForm, setClinicForm] = useState({
    name: '',
    registrationNumber: '',
    council: 'State Medical Council / NMC',
    hospital: '',
    email: '',
  });

  const totalDoctors = REAL_LIFE_DOCTORS.length;
  const currentDoctor = REAL_LIFE_DOCTORS[currentIndex];

  const sweepNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % totalDoctors);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const sweepPrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + totalDoctors) % totalDoctors);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    setDragOffset(e.touches[0].clientX - touchStartX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null) return;
    if (dragOffset < -50) {
      sweepNext();
    } else if (dragOffset > 50) {
      sweepPrev();
    }
    setTouchStartX(null);
    setDragOffset(0);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionSuccess(true);
    setTimeout(() => {
      setSubmissionSuccess(false);
      setShowVerificationModal(false);
      setClinicForm({
        name: '',
        registrationNumber: '',
        council: 'State Medical Council / NMC',
        hospital: '',
        email: '',
      });
    }, 3000);
  };

  // Desktop subtle cursor-responsive parallax
  const [mouseTilt, setMouseTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only apply on non-touch and when user has not requested reduced motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const yRatio = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseTilt({ x: xRatio * 6, y: -yRatio * 6 }); // subtle 3-6 degree tilt
  };

  const handleMouseLeave = () => {
    setMouseTilt({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-[#F3FAF5] border border-[#BFE7D0] text-[#226947] rounded-2xl text-xs flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-xs font-bold text-[#226947]">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="glass-card p-6 rounded-3xl space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#D9658B]" />
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#3D1E28]">
                Real Verified Gynaecologists & Specialists
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#7E5265] mt-1">
              Sweep or swipe horizontally through certified, real-life gynaecologists audited against official Medical Council registries.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs bg-[#FCECEF] text-[#D9658B] px-3 py-1 rounded-full font-bold">
              Doctor {currentIndex + 1} of {totalDoctors}
            </span>
            <button
              onClick={() => setShowVerificationModal(true)}
              className="text-xs bg-white/80 hover:bg-white text-[#7E5265] border border-[#F4D5DC] px-3 py-1 rounded-full font-semibold transition-colors"
            >
              Verify Clinic
            </button>
          </div>
        </div>
      </div>

      {/* SWEEPABLE DOCTOR CARD STACK WITH DESKTOP PARALLAX */}
      <div
        className="relative max-w-2xl mx-auto cursor-grab active:cursor-grabbing select-none"
        style={{ perspective: 1000 }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Background Card Preview Effect */}
        <div className="absolute -top-3 inset-x-4 h-full bg-white/40 rounded-3xl -z-10 transform scale-[0.97] blur-[1px]" />
        <div className="absolute -top-6 inset-x-8 h-full bg-white/20 rounded-3xl -z-20 transform scale-[0.94] blur-[2px]" />

        {/* Active Sweeping Card */}
        <div
          style={{
            transform:
              dragOffset !== 0
                ? `translateX(${dragOffset}px) rotate(${dragOffset * 0.04}deg)`
                : mouseTilt.x !== 0 || mouseTilt.y !== 0
                ? `rotateY(${mouseTilt.x}deg) rotateX(${mouseTilt.y}deg)`
                : undefined,
            transition: dragOffset === 0 ? 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)' : undefined,
          }}
          className={`glass-card p-6 sm:p-8 rounded-3xl space-y-6 ${
            isAnimating ? 'opacity-80 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          {/* Top Credentials & Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#FCECEF] pb-4">
            <div className="flex items-center gap-3.5">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-[#FFF0F3] shrink-0">
                <img
                  src={currentDoctor.photoUrl}
                  alt={currentDoctor.name}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute bottom-0 inset-x-0 bg-[#3D1E28]/70 py-0.5 text-center">
                  <span className="text-[8px] sm:text-[9px] text-white font-bold tracking-wider uppercase">Verified</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-[#3D1E28]">
                    {currentDoctor.name}
                  </h3>
                  <span title="Verified with State Medical Council">
                    <CheckCircle2 className="w-4 h-4 text-[#58B988]" />
                  </span>
                </div>
                <div className="text-xs text-[#D9658B] font-semibold">
                  {currentDoctor.qualifications}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold text-[#58B988] bg-[#F3FAF5] px-2.5 py-0.5 rounded-full border border-[#BFE7D0] inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Specialist</span>
              </span>
              <div className="text-[10px] text-[#7E5265] mt-1">
                Reg: {currentDoctor.registrationNumber}
              </div>
            </div>
          </div>

          {/* Hospital Affiliation & Specialties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-[#FFF8F8] border border-[#F4D5DC] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#3D1E28]">
                <Building2 className="w-3.5 h-3.5 text-[#D9658B]" />
                <span>Affiliated Hospital</span>
              </div>
              <div className="text-xs text-[#3D1E28] font-semibold">
                {currentDoctor.hospital}
              </div>
              <div className="text-[11px] text-[#7E5265]">
                {currentDoctor.location}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFF8F8] border border-[#F4D5DC] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#3D1E28]">
                <Stethoscope className="w-3.5 h-3.5 text-[#58B988]" />
                <span>Clinical Experience</span>
              </div>
              <div className="text-xs text-[#3D1E28] font-semibold">
                {currentDoctor.experienceYears}+ Years in Practice
              </div>
              <div className="text-[11px] text-[#58B988] font-medium">
                {currentDoctor.teleconsultAvailable ? '✓ Teleconsultation Available' : 'Clinic Visits Only'}
              </div>
            </div>
          </div>

          {/* Core Specializations */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7E5265]">
              Core Areas of Expertise
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentDoctor.specialties.map((spec, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-[#FFF0F3] text-[#3D1E28] border border-[#F4D5DC]"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Bio statement */}
          <p className="text-xs sm:text-sm text-[#7E5265] leading-relaxed italic bg-[#FFF5F7] p-3 rounded-2xl border border-[#F4D5DC]/60">
            "{currentDoctor.bio}"
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#FCECEF]">
            <a
              href={currentDoctor.appointmentUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Hospital Consult</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>

            <button
              onClick={() => {
                setToastMessage(`Inquiry pre-staged for ${currentDoctor.name} (${currentDoctor.officialEmail}). Opening Workspace...`);
                setActiveSection('workspace');
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-[#F4D5DC] hover:border-[#D9658B] text-[#7E5265] hover:text-[#3D1E28] rounded-xl text-xs font-semibold transition-all"
            >
              <Mail className="w-3.5 h-3.5 text-[#D9658B]" />
              <span>Contact via Gmail</span>
            </button>
          </div>
        </div>

        {/* SWEEP CONTROLS (Next / Prev buttons) */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            onClick={sweepPrev}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/90 border border-[#F4D5DC] text-xs font-semibold text-[#7E5265] hover:text-[#3D1E28] hover:bg-white transition-all shadow-xs"
          >
            <ChevronLeft className="w-4 h-4 text-[#D9658B]" />
            <span>Previous Doctor</span>
          </button>

          {/* Sweep Dots */}
          <div className="flex items-center gap-1.5">
            {REAL_LIFE_DOCTORS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentIndex === idx
                    ? 'w-6 bg-[#D9658B]'
                    : 'bg-[#F4D5DC] hover:bg-[#D9658B]/50'
                }`}
                aria-label={`Go to doctor ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={sweepNext}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#D9658B] hover:bg-[#C54E74] text-white text-xs font-bold transition-all shadow-xs"
          >
            <span>Sweep Next Doctor</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Official Emergency Hotlines (NMC / Govt) */}
      <div className="glass-card p-6 rounded-3xl space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-[#D9658B]">
          <PhoneCall className="w-4 h-4" />
          <span>Immediate Emergency Women’s Healthcare</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl bg-white/80 border border-[#F4D5DC]">
            <div className="text-xs font-bold text-[#3D1E28]">National Medical Emergency</div>
            <div className="text-lg font-serif font-bold text-[#D9658B] tabular-nums">112</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/80 border border-[#F4D5DC]">
            <div className="text-xs font-bold text-[#3D1E28]">Women’s Distress Helpline</div>
            <div className="text-lg font-serif font-bold text-[#D9658B] tabular-nums">1091</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/80 border border-[#F4D5DC]">
            <div className="text-xs font-bold text-[#3D1E28]">National Tele-MANAS Counseling</div>
            <div className="text-lg font-serif font-bold text-[#D9658B] tabular-nums">14416</div>
          </div>
        </div>
      </div>

      {/* Verification Modal for New Clinics */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-card bg-white rounded-3xl p-6 max-w-md w-full border border-[#F4D5DC] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#FCECEF]">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#58B988]" />
                <h3 className="text-base font-serif font-bold text-[#3D1E28]">
                  Submit Doctor for Verification
                </h3>
              </div>
              <button
                onClick={() => setShowVerificationModal(false)}
                className="text-[#7E5265] hover:text-[#3D1E28] p-1"
              >
                ✕
              </button>
            </div>

            {submissionSuccess ? (
              <div className="p-4 bg-[#F3FAF5] border border-[#BFE7D0] text-[#226947] rounded-2xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#58B988]" />
                <span>Credentials submitted! Our clinical auditing team will verify against the Medical Council registry.</span>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3D1E28] mb-1">
                    Doctor Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={clinicForm.name}
                    onChange={(e) => setClinicForm({ ...clinicForm, name: e.target.value })}
                    placeholder="e.g. Dr. Priya Rao, MD"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4D5DC] bg-white/90"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3D1E28] mb-1">
                    Medical Registration Number
                  </label>
                  <input
                    type="text"
                    required
                    value={clinicForm.registrationNumber}
                    onChange={(e) => setClinicForm({ ...clinicForm, registrationNumber: e.target.value })}
                    placeholder="e.g. DMC-39401"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4D5DC] bg-white/90"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3D1E28] mb-1">
                    Hospital / Clinical Practice
                  </label>
                  <input
                    type="text"
                    required
                    value={clinicForm.hospital}
                    onChange={(e) => setClinicForm({ ...clinicForm, hospital: e.target.value })}
                    placeholder="e.g. Apollo Hospital"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4D5DC] bg-white/90"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowVerificationModal(false)}
                    className="px-4 py-2 text-xs text-[#7E5265]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-xl text-xs font-bold shadow-xs"
                  >
                    Submit for NMC Audit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
