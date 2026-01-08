import React, { useState, useEffect } from 'react';
import { TweetData, AnalysisResult, CalendarEntry } from '../types';
import { analyzePerformance, generateCalendar } from '../services/geminiService';
import { Loader2, Calendar as CalIcon, Lock, Zap } from 'lucide-react';

interface StrategyViewProps {
  tweets: TweetData[];
}

const StrategyView: React.FC<StrategyViewProps> = ({ tweets }) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [calendar, setCalendar] = useState<CalendarEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const TWEET_THRESHOLD = 35; // 5 tweets * 7 days
  const progress = Math.min(100, (tweets.length / TWEET_THRESHOLD) * 100);
  const isLocked = tweets.length < TWEET_THRESHOLD;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzePerformance(tweets);
      setAnalysis(result);

      if (!isLocked) {
        const cal = await generateCalendar(tweets, result.nicheAnalysis);
        setCalendar(cal);
      }
    } catch (e) {
      setError("Failed to generate strategy. Please check your API Key.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-analyze if we have data but no analysis yet
  useEffect(() => {
    if (tweets.length > 0 && !analysis && !loading) {
       // Optional: Auto trigger or wait for user. Let's wait for user to save tokens.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">AI Strategy Center</h2>
          <p className="text-slate-500 mt-1">
            Data-driven insights to optimize your X presence.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || tweets.length === 0}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Zap className="w-5 h-5" />}
          Run Analysis
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Progress Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-slate-800">Learning Phase Progress</h3>
          <span className="text-sm font-medium text-slate-600">{tweets.length} / {TWEET_THRESHOLD} Tweets</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-brand-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Upload 5 tweets/day for a week to unlock the full AI content calendar.
        </p>
      </div>

      {/* Analysis Grid */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Niche Detected</h4>
            <p className="text-xl font-bold text-slate-800">{analysis.nicheAnalysis}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Engagement Score</h4>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-brand-600">{analysis.engagementScore}</span>
              <span className="text-slate-400 mb-1">/ 100</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Best Posting Times</h4>
            <ul className="space-y-2">
              {analysis.bestTimeSlots.map((slot, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-700 font-medium">
                  <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                  {slot}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Calendar Section */}
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-slate-100 rounded-lg">
            <CalIcon className="w-6 h-6 text-slate-700" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Upcoming Schedule</h3>
        </div>

        {isLocked ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
              <Lock className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="text-lg font-semibold text-slate-800 mb-2">Calendar Locked</h4>
            <p className="text-slate-500 max-w-md">
              The AI needs more data to generate an effective schedule. 
              Please complete the initial learning phase of {TWEET_THRESHOLD} tweets.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {calendar.length > 0 ? (
              calendar.map((entry, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6">
                  <div className="md:w-48 flex-shrink-0 border-r border-slate-100 pr-6 flex flex-col justify-center">
                    <span className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">{entry.day}</span>
                    <span className="text-2xl font-bold text-slate-800">{entry.time}</span>
                    <span className="text-sm text-slate-500 mt-1">{entry.topic}</span>
                  </div>
                  <div className="flex-grow">
                    <h5 className="text-xs font-semibold text-slate-400 uppercase mb-2">Suggested Draft</h5>
                    <p className="text-slate-800 font-medium leading-relaxed italic">"{entry.hook}"</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                <p className="text-slate-500">Click "Run Analysis" to generate your calendar.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategyView;
