import React, { useState } from 'react';
import {
  Award,
  ShieldCheck,
  Search,
  ExternalLink,
  PhoneCall,
  CheckCircle2,
  FileCheck,
  AlertCircle,
} from 'lucide-react';

export const DoctorsSection: React.FC = () => {
  const [searchReg, setSearchReg] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    name: '',
    registrationNumber: '',
    council: 'State Medical Council / NMC',
    specialty: 'Obstetrics & Gynecology',
    clinicName: '',
    officialEmail: '',
  });

  const handleSubmitVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionSuccess(true);
    setTimeout(() => {
      setSubmissionSuccess(false);
      setSubmitForm({
        name: '',
        registrationNumber: '',
        council: 'State Medical Council / NMC',
        specialty: 'Obstetrics & Gynecology',
        clinicName: '',
        officialEmail: '',
      });
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Verification Standard Header */}
      <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#D9658B]" />
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#3D1E28]">
            Verified Medical Practitioner Directory
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#7E5265] max-w-2xl leading-relaxed">
          In strict compliance with healthcare ethics and safety principles, Sakhi Cycle never displays unverified provider records, synthetic ratings, or commercial advertisements. All listed practitioners undergo formal credential auditing.
        </p>
      </div>

      {/* Honest Empty State & Verification Notice */}
      <div className="p-8 bg-white/90 rounded-3xl border border-[#F4D5DC] shadow-xs text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-[#FFF0F3] text-[#D9658B] flex items-center justify-center mx-auto">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div className="max-w-lg mx-auto space-y-2">
          <h3 className="text-lg font-serif font-bold text-[#3D1E28]">
            Official Credential Verification Queue
          </h3>
          <p className="text-xs text-[#7E5265] leading-relaxed">
            We are currently auditing registered Gynecologists, Obstetricians, and Reproductive Endocrinologists against official National Medical Commission (NMC) registries. No unverified practitioner records are published.
          </p>
        </div>

        {/* Official Emergency & Public Health Resources */}
        <div className="pt-4 border-t border-[#FCECEF] grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="p-4 bg-[#FFF8F8] rounded-2xl border border-[#F4D5DC]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#3D1E28]">
              <PhoneCall className="w-3.5 h-3.5 text-[#D9658B]" />
              <span>National Emergency Care</span>
            </div>
            <div className="text-lg font-serif font-bold text-[#D9658B] mt-1 tabular-nums">
              112
            </div>
            <p className="text-[11px] text-[#7E5265] mt-0.5">
              24/7 All-India Emergency Assistance
            </p>
          </div>

          <div className="p-4 bg-[#FFF8F8] rounded-2xl border border-[#F4D5DC]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#3D1E28]">
              <PhoneCall className="w-3.5 h-3.5 text-[#D9658B]" />
              <span>Women’s Helpline</span>
            </div>
            <div className="text-lg font-serif font-bold text-[#D9658B] mt-1 tabular-nums">
              1091
            </div>
            <p className="text-[11px] text-[#7E5265] mt-0.5">
              Toll-free immediate support for women
            </p>
          </div>

          <div className="p-4 bg-[#FFF8F8] rounded-2xl border border-[#F4D5DC]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#3D1E28]">
              <PhoneCall className="w-3.5 h-3.5 text-[#D9658B]" />
              <span>Tele-MANAS Mental Health</span>
            </div>
            <div className="text-lg font-serif font-bold text-[#D9658B] mt-1 tabular-nums">
              14416
            </div>
            <p className="text-[11px] text-[#7E5265] mt-0.5">
              Government tele-counseling support
            </p>
          </div>
        </div>
      </div>

      {/* Practitioner Verification Submission Form */}
      <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-[#58B988]" />
          <h3 className="text-base font-serif font-bold text-[#3D1E28]">
            Are you a Licensed Gynecologist or Clinic?
          </h3>
        </div>
        <p className="text-xs text-[#7E5265]">
          Submit your official council registration number and clinical credentials for audit and inclusion in the verified directory.
        </p>

        {submissionSuccess && (
          <div className="p-4 bg-[#F3FAF5] border border-[#BFE7D0] text-[#226947] rounded-2xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#58B988]" />
            <span>Credentials received! Our clinical audit team will verify your registration against official state council databases.</span>
          </div>
        )}

        <form onSubmit={handleSubmitVerification} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-[#3D1E28] mb-1">
              Full Legal Doctor Name
            </label>
            <input
              type="text"
              required
              value={submitForm.name}
              onChange={(e) => setSubmitForm({ ...submitForm, name: e.target.value })}
              placeholder="Dr. Ananya Sharma, MD, DGO"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:ring-2 focus:ring-[#D9658B] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3D1E28] mb-1">
              Official Medical Registration No.
            </label>
            <input
              type="text"
              required
              value={submitForm.registrationNumber}
              onChange={(e) => setSubmitForm({ ...submitForm, registrationNumber: e.target.value })}
              placeholder="e.g., MCI-2018-98432"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:ring-2 focus:ring-[#D9658B] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3D1E28] mb-1">
              State Medical Council / National Council
            </label>
            <input
              type="text"
              required
              value={submitForm.council}
              onChange={(e) => setSubmitForm({ ...submitForm, council: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:ring-2 focus:ring-[#D9658B] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3D1E28] mb-1">
              Institutional / Clinic Email
            </label>
            <input
              type="email"
              required
              value={submitForm.officialEmail}
              onChange={(e) => setSubmitForm({ ...submitForm, officialEmail: e.target.value })}
              placeholder="doctor@hospital.org"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:ring-2 focus:ring-[#D9658B] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              Submit Credentials for Verification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
