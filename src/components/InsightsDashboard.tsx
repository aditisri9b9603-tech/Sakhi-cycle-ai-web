import React from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import {
  Compass,
  Moon,
  Coffee,
  Heart,
  Calendar,
  Sparkles,
  BarChart2,
  TrendingUp,
} from 'lucide-react';

export const InsightsDashboard: React.FC = () => {
  const { dailyLogs, cycleSettings, language, setActiveSection, setActiveSubSection } = useApp();
  const t = (key: string, params?: Record<string, string | number>) =>
    getTranslation(language, key, params);

  const entries = Object.values(dailyLogs);
  const totalEntries = entries.length;

  // Real data calculations
  const totalSleep = entries.reduce((acc, cur) => acc + (cur.sleepHours || 0), 0);
  const avgSleep = totalEntries > 0 ? (totalSleep / totalEntries).toFixed(1) : '0';

  const totalWater = entries.reduce((acc, cur) => acc + (cur.waterGlasses || 0), 0);
  const avgWater = totalEntries > 0 ? (totalWater / totalEntries).toFixed(1) : '0';

  // Symptom frequency count
  const symptomCounts: Record<string, number> = {};
  entries.forEach((entry) => {
    (entry.symptoms || []).forEach((symp) => {
      symptomCounts[symp] = (symptomCounts[symp] || 0) + 1;
    });
  });

  const sortedSymptoms = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]);

  // Mood frequency count
  const moodCounts: Record<string, number> = {};
  entries.forEach((entry) => {
    if (entry.mood) {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-white via-[#FFF0F3] to-white rounded-3xl border border-[#F4D5DC] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#D9658B]" />
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#3D1E28]">
              Personal Cycle Insights
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#7E5265] mt-1 max-w-xl">
            Grounded purely in your saved logs. No artificial metrics or assumptions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-2xl border border-[#F4D5DC] text-center shadow-xs">
            <div className="text-lg font-serif font-bold text-[#D9658B] tabular-nums">
              {totalEntries}
            </div>
            <div className="text-[10px] text-[#7E5265] font-semibold uppercase tracking-wider">
              Logged Days
            </div>
          </div>
          <div className="px-4 py-2 bg-white rounded-2xl border border-[#F4D5DC] text-center shadow-xs">
            <div className="text-lg font-serif font-bold text-[#3D1E28] tabular-nums">
              {cycleSettings.cycleLength}d
            </div>
            <div className="text-[10px] text-[#7E5265] font-semibold uppercase tracking-wider">
              Avg Cycle
            </div>
          </div>
        </div>
      </div>

      {totalEntries === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#F4D5DC] shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FFF0F3] text-[#D9658B] flex items-center justify-center mx-auto text-xl">
            🌸
          </div>
          <h3 className="text-lg font-serif font-bold text-[#3D1E28]">
            No daily logs recorded yet
          </h3>
          <p className="text-xs text-[#7E5265] max-w-md mx-auto">
            Check in for a few days to view real symptom frequencies, hydration rhythm, and sleep correlations.
          </p>
          <button
            onClick={() => {
              setActiveSection('track');
              setActiveSubSection('log');
            }}
            className="px-5 py-2.5 bg-[#D9658B] text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-[#C54E74] transition-colors"
          >
            Log Today’s Check-in
          </button>
        </div>
      ) : (
        <>
          {/* Key Metric Averages */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#7E5265]">
                <Moon className="w-4 h-4 text-[#A663CE]" />
                <span>Sleep Average</span>
              </div>
              <div className="text-2xl font-serif font-bold text-[#3D1E28] mt-2 tabular-nums">
                {avgSleep} <span className="text-sm font-sans font-normal text-[#7E5265]">hrs/night</span>
              </div>
              <div className="text-[11px] text-[#7E5265] mt-1">
                Across {totalEntries} saved records
              </div>
            </div>

            <div className="p-5 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#7E5265]">
                <Coffee className="w-4 h-4 text-[#58B988]" />
                <span>Daily Hydration</span>
              </div>
              <div className="text-2xl font-serif font-bold text-[#3D1E28] mt-2 tabular-nums">
                {avgWater} <span className="text-sm font-sans font-normal text-[#7E5265]">glasses</span>
              </div>
              <div className="text-[11px] text-[#7E5265] mt-1">
                ~{Math.round(parseFloat(avgWater) * 250)} ml daily average
              </div>
            </div>

            <div className="p-5 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#7E5265]">
                <Heart className="w-4 h-4 text-[#E25574]" />
                <span>Active Symptoms</span>
              </div>
              <div className="text-2xl font-serif font-bold text-[#3D1E28] mt-2 tabular-nums">
                {sortedSymptoms.length}{' '}
                <span className="text-sm font-sans font-normal text-[#7E5265]">types logged</span>
              </div>
              <div className="text-[11px] text-[#7E5265] mt-1">
                Tracked physical sensations
              </div>
            </div>
          </div>

          {/* Symptom Trends & Mood Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Reported Symptoms */}
            <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-serif font-bold text-[#3D1E28]">
                  Reported Physical Symptoms
                </h3>
                <span className="text-xs text-[#7E5265]">Real Count</span>
              </div>

              {sortedSymptoms.length === 0 ? (
                <p className="text-xs text-[#7E5265] py-4">No symptoms reported in recent logs.</p>
              ) : (
                <div className="space-y-3">
                  {sortedSymptoms.slice(0, 5).map(([symp, count]) => {
                    const percentage = Math.min(100, Math.round((count / totalEntries) * 100));
                    return (
                      <div key={symp} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-[#3D1E28]">
                          <span>{symp}</span>
                          <span className="text-[#7E5265] tabular-nums">
                            {count} of {totalEntries} days ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#FFF0F3] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#D9658B] h-full rounded-full transition-all duration-700"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mood Frequency */}
            <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-serif font-bold text-[#3D1E28]">
                  Emotional Landscape
                </h3>
                <span className="text-xs text-[#7E5265]">Distribution</span>
              </div>

              {Object.keys(moodCounts).length === 0 ? (
                <p className="text-xs text-[#7E5265] py-4">No moods logged yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {Object.entries(moodCounts).map(([moodKey, count]) => (
                    <div
                      key={moodKey}
                      className="p-3 bg-[#FFF8F8] rounded-2xl border border-[#F4D5DC] flex items-center justify-between"
                    >
                      <span className="text-xs font-semibold capitalize text-[#3D1E28]">
                        {moodKey}
                      </span>
                      <span className="text-xs font-bold text-[#D9658B] bg-white px-2 py-0.5 rounded-full border border-[#F4D5DC] tabular-nums">
                        {count}d
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-3 bg-[#FFF0F3] rounded-2xl text-[11px] text-[#7E5265] leading-relaxed">
                🌱 <strong>Wellness Tip:</strong> Observing how moods correlate with cycle phases allows you to schedule demanding meetings during follicular high-energy days and restful creative work during the luteal phase.
              </div>
            </div>
          </div>

          {/* Recent Log History Table */}
          <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-3">
            <h3 className="text-base font-serif font-bold text-[#3D1E28]">
              Recent Check-in History
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#FCECEF] text-[#7E5265] font-semibold">
                    <th className="pb-2.5">Date</th>
                    <th className="pb-2.5">Mood</th>
                    <th className="pb-2.5">Energy</th>
                    <th className="pb-2.5">Flow</th>
                    <th className="pb-2.5">Symptoms</th>
                    <th className="pb-2.5 text-right">Sleep / Water</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FCECEF]/60">
                  {entries
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .slice(0, 7)
                    .map((item) => (
                      <tr key={item.date} className="hover:bg-[#FFF8F8] transition-colors">
                        <td className="py-2.5 font-medium text-[#3D1E28]">{item.date}</td>
                        <td className="py-2.5 capitalize">{item.mood || '—'}</td>
                        <td className="py-2.5">{item.energy ? `${item.energy}/5` : '—'}</td>
                        <td className="py-2.5 capitalize">{item.flow || 'None'}</td>
                        <td className="py-2.5 text-[#7E5265]">
                          {item.symptoms.length > 0 ? item.symptoms.join(', ') : 'None'}
                        </td>
                        <td className="py-2.5 text-right font-mono tabular-nums text-[#7E5265]">
                          {item.sleepHours}h · {item.waterGlasses}gl
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
