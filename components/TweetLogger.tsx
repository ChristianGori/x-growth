import React, { useState, useRef } from 'react';
import { TweetData } from '../types';
import { rewriteTweet } from '../services/geminiService';
import { saveTweetToDb } from '../services/firebase';
import { User } from 'firebase/auth';
import { Plus, Image as ImageIcon, Sparkles, Loader2, Clock, Eye, Heart, MessageCircle, X, Copy, Check } from 'lucide-react';

interface TweetLoggerProps {
  tweets: TweetData[];
  setTweets: React.Dispatch<React.SetStateAction<TweetData[]>>;
  user: User;
}

const TweetLogger: React.FC<TweetLoggerProps> = ({ tweets, setTweets, user }) => {
  const [formData, setFormData] = useState({
    text: '',
    views: '',
    likes: '',
    comments: '',
    postedAt: '',
    imageUrl: '' as string | null,
    imageName: '' as string | null,
  });
  
  const [isRewriting, setIsRewriting] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // Limit to 1MB for Firestore efficiency
        alert("Image too large. Please use images under 1MB for database sync.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          imageUrl: event.target?.result as string,
          imageName: file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: null, imageName: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text || !formData.postedAt) return;
    
    setIsSaving(true);

    try {
      // FIX: Firestore throws error if field is 'undefined'.
      // We construct the object and conditionally add imageUrl only if it has a value.
      const tweetPayload: Record<string, any> = {
        userId: user.uid,
        text: formData.text,
        views: Number(formData.views) || 0,
        likes: Number(formData.likes) || 0,
        comments: Number(formData.comments) || 0,
        postedAt: formData.postedAt,
        timestamp: Date.now(),
      };

      if (formData.imageUrl) {
        tweetPayload.imageUrl = formData.imageUrl;
      }

      // Save to Firebase
      const savedTweet = await saveTweetToDb(tweetPayload as any);

      // Update local state immediately with the ID from firebase
      setTweets(prev => [savedTweet as TweetData, ...prev]);
      
      // Reset form
      setFormData({ text: '', views: '', likes: '', comments: '', postedAt: '', imageUrl: null, imageName: null });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      alert("Failed to save tweet to database.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRewrite = async (id: string, text: string) => {
    setIsRewriting(id);
    setCopied(false);
    try {
      const rewritten = await rewriteTweet(text);
      setModalContent(rewritten);
    } catch (e) {
      setModalContent("An unexpected error occurred while contacting the AI service.");
    } finally {
      setIsRewriting(null);
    }
  };

  const copyToClipboard = () => {
    if (modalContent) {
      navigator.clipboard.writeText(modalContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8 max-w-7xl mx-auto relative">
      {/* Modal Overlay */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-600" />
                AI Rewrite Suggestion
              </h3>
              <button 
                onClick={() => setModalContent(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-slate-800 text-base leading-relaxed whitespace-pre-wrap">
                {modalContent}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button
                onClick={() => setModalContent(null)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left: Input Form */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-600" /> Log New Tweet
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tweet Text</label>
              <textarea
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all h-32 resize-none"
                placeholder="Paste your tweet content here..."
                value={formData.text}
                onChange={e => setFormData({ ...formData, text: e.target.value })}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time</label>
                 <input
                  type="datetime-local"
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-brand-500 outline-none"
                  value={formData.postedAt}
                  onChange={e => setFormData({ ...formData, postedAt: e.target.value })}
                  required
                 />
              </div>
              <div className="flex flex-col justify-end">
                {!formData.imageName ? (
                  <label className="flex items-center gap-2 w-full border border-dashed border-slate-300 rounded-lg p-2 text-slate-500 text-sm cursor-pointer hover:bg-slate-50 hover:border-brand-300 hover:text-brand-600 transition-all justify-center h-[38px]">
                    <ImageIcon className="w-4 h-4" />
                    <span>Optional Img</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                    />
                  </label>
                ) : (
                  <div className="flex items-center gap-2 w-full border border-brand-200 bg-brand-50 rounded-lg p-2 text-brand-700 text-sm h-[38px] px-3">
                    <ImageIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate flex-grow text-xs font-medium" title={formData.imageName}>{formData.imageName}</span>
                    <button 
                      type="button" 
                      onClick={handleRemoveImage}
                      className="hover:bg-brand-100 p-1 rounded-full transition-colors flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1 uppercase">Views</label>
                <input
                  type="number"
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                  value={formData.views}
                  onChange={e => setFormData({ ...formData, views: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1 uppercase">Likes</label>
                <input
                  type="number"
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                  value={formData.likes}
                  onChange={e => setFormData({ ...formData, likes: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1 uppercase">Comments</label>
                <input
                  type="number"
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                  value={formData.comments}
                  onChange={e => setFormData({ ...formData, comments: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-600 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log Activity'}
            </button>
          </form>
        </div>
      </div>

      {/* Right: History List */}
      <div className="lg:col-span-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          Recent Activity <span className="text-sm font-normal text-slate-500 ml-2">({tweets.length})</span>
        </h2>
        
        {tweets.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200 border-dashed">
            <p className="text-slate-400">No tweets found for this account. Start logging!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tweets.map(tweet => (
              <div key={tweet.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-brand-200 transition-colors group">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex-grow">
                    <p className="text-slate-800 text-base leading-relaxed whitespace-pre-wrap font-medium">
                      {tweet.text}
                    </p>
                    {tweet.imageUrl && (
                      <div className="mt-3 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 max-w-md">
                        <img 
                          src={tweet.imageUrl} 
                          alt="Post visual" 
                          className="w-full h-auto max-h-[300px] object-contain"
                        />
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => handleRewrite(tweet.id, tweet.text)}
                    disabled={!!isRewriting}
                    className="flex-shrink-0 text-brand-600 hover:bg-brand-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                    title="Generate AI Rewrite"
                  >
                    {isRewriting === tweet.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Rewrite
                  </button>
                </div>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 pt-3 border-t border-slate-50 mt-3">
                  <div className="flex items-center gap-1.5" title="Date Posted">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(tweet.postedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-4 ml-auto">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Eye className="w-4 h-4" />
                      <span className="font-medium">{tweet.views}</span>
                    </div>
                    <div className="flex items-center gap-1 text-pink-500">
                      <Heart className="w-4 h-4" />
                      <span className="font-medium">{tweet.likes}</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-500">
                      <MessageCircle className="w-4 h-4" />
                      <span className="font-medium">{tweet.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TweetLogger;