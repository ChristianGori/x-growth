import React from 'react';
import { TipCard } from '../types';

const TIPS_DATA: TipCard[] = [
  {
    title: "Engagement Hierarchy",
    category: "Engagement",
    content: "Not all interactions are equal. Replies > Reposts > Likes. A post with 10 quality comments beats one with 100 likes. Even 'Dwell time' (pausing to read) counts.",
    actionable: "Focus on writing posts that invite conversation, not just passive likes."
  },
  {
    title: "The Golden 30 Minutes",
    category: "Algorithm",
    content: "The first 15-30 minutes are critical. The algorithm tests your post with a small batch. No interaction? It gets buried.",
    actionable: "Warm up the algorithm 15-30 mins BEFORE posting by replying to others. Be online when you post to reply immediately."
  },
  {
    title: "Reply Guy Strategy",
    category: "Growth",
    content: "For small accounts (<1000 followers), posting alone won't work. Comment insightfully 50-100 times/day on relevant large accounts.",
    actionable: "Add value in comments. People see your comment on a viral post and visit your profile."
  },
  {
    title: "Communities vs. Main Feed",
    category: "Growth",
    content: "Since late 2024, X promotes small accounts in the Main Feed. Communities are hidden in menus. Don't hide your best content in a Community.",
    actionable: "Use communities for networking, but post your 'banger' threads on the main timeline."
  },
  {
    title: "Hashtag Strategy",
    category: "Content",
    content: "Do not spam. Use 1-3 niche hashtags naturally woven into sentences. Generic tags like #marketing are saturated.",
    actionable: "Good: 'Building a #SaaS is hard.' Bad: 'Building a startup. #SaaS #Tech #Growth #Marketing'"
  },
  {
    title: "Account Trust Score",
    category: "Algorithm",
    content: "Avoid being 'noisy'. Posting 15x a day looks like spam. A balanced follower/following ratio and verified status (Premium) helps.",
    actionable: "Quality > Quantity. 1 excellent post > 5 mediocre ones."
  }
];

const TipsView: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Growth Handbook</h2>
        <p className="text-slate-600">Essential rules for growing from 0 to 1,000 followers based on 2024-2025 algorithm changes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TIPS_DATA.map((tip, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col">
            <div className="mb-4">
              <span className={`
                px-2 py-1 text-xs font-semibold rounded-full 
                ${tip.category === 'Engagement' ? 'bg-blue-100 text-blue-700' : ''}
                ${tip.category === 'Algorithm' ? 'bg-purple-100 text-purple-700' : ''}
                ${tip.category === 'Growth' ? 'bg-green-100 text-green-700' : ''}
                ${tip.category === 'Content' ? 'bg-orange-100 text-orange-700' : ''}
              `}>
                {tip.category}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-3">{tip.title}</h3>
            <p className="text-slate-600 text-sm mb-4 flex-grow leading-relaxed">
              {tip.content}
            </p>
            <div className="mt-auto bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Actionable</p>
              <p className="text-sm text-slate-800 font-medium">{tip.actionable}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TipsView;
