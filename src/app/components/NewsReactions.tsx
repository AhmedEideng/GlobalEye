"use client";
import { useState, useEffect } from "react";
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import { supabase } from "../utils/supabaseClient";

interface Reaction {
  id: string;
  type: 'like' | 'dislike' | 'share';
  count: number;
  userReacted: boolean;
}

interface NewsReactionsProps {
  articleUrl: string;
}

export function NewsReactions({ articleUrl }: NewsReactionsProps) {
  const [user, setUser] = useState<any>(null);
  const [reactions, setReactions] = useState([
    { id: 'like', type: 'like', count: 0, userReacted: false },
    { id: 'dislike', type: 'dislike', count: 0, userReacted: false },
    { id: 'share', type: 'share', count: 0, userReacted: false }
  ]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    if (!articleUrl) return;
    const fetchReactions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('news_reactions')
        .select('type, user_id')
        .eq('article_url', articleUrl);
      if (!error && data) {
        const counts = { like: 0, dislike: 0, share: 0 };
        let userReactions: Record<string, boolean> = {};
        data.forEach((r: { type: 'like'|'dislike'|'share', user_id: string }) => {
          if (r.type in counts) counts[r.type as keyof typeof counts]++;
          if (user && r.user_id === user.id) userReactions[r.type] = true;
        });
        setReactions([
          { id: 'like', type: 'like', count: counts.like, userReacted: !!userReactions.like },
          { id: 'dislike', type: 'dislike', count: counts.dislike, userReacted: !!userReactions.dislike },
          { id: 'share', type: 'share', count: counts.share, userReacted: !!userReactions.share }
        ]);
      }
      setLoading(false);
    };
    fetchReactions();
  }, [articleUrl, user]);

  const handleReaction = async (type: string) => {
    if (!user) {
      setToast('Please sign in to react!');
      setTimeout(() => setToast(null), 2000);
      return;
    }
    setLoading(true);
    const current = reactions.find(r => r.type === type);
    if (!current) return;
    if (current.userReacted) {
      // Remove reaction
      const { error } = await supabase
        .from('news_reactions')
        .delete()
        .eq('article_url', articleUrl)
        .eq('user_id', user.id)
        .eq('type', type);
      if (!error) setToast('Reaction removed!');
      else setToast('Failed to remove reaction');
    } else {
      // Add reaction
      const { error } = await supabase
        .from('news_reactions')
        .insert({ article_url: articleUrl, user_id: user.id, type });
      if (!error) setToast('Reaction added!');
      else setToast('Failed to add reaction');
    }
    setTimeout(() => setToast(null), 2000);
    // Refresh
    const { data, error } = await supabase
      .from('news_reactions')
      .select('type, user_id')
      .eq('article_url', articleUrl);
    if (!error && data) {
      const counts = { like: 0, dislike: 0, share: 0 };
      let userReactions: Record<string, boolean> = {};
      data.forEach((r: { type: 'like'|'dislike'|'share', user_id: string }) => {
        if (r.type in counts) counts[r.type as keyof typeof counts]++;
        if (user && r.user_id === user.id) userReactions[r.type] = true;
      });
      setReactions([
        { id: 'like', type: 'like', count: counts.like, userReacted: !!userReactions.like },
        { id: 'dislike', type: 'dislike', count: counts.dislike, userReacted: !!userReactions.dislike },
        { id: 'share', type: 'share', count: counts.share, userReacted: !!userReactions.share }
      ]);
    }
    setLoading(false);
  };

  // دمج بيانات الأيقونة والنص مع العدادات
  const reactionMeta = {
    like: {
      icon: <ThumbUpAltOutlinedIcon sx={{ fontSize: 28, color: '#1976d2' }} />, label: 'Like'
    },
    dislike: {
      icon: <ThumbDownAltOutlinedIcon sx={{ fontSize: 28, color: '#e53935' }} />, label: 'Dislike'
    },
    share: {
      icon: <ShareOutlinedIcon sx={{ fontSize: 28, color: '#43a047' }} />, label: 'Share'
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 mt-8 mb-2 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 max-w-md mx-auto">
      <div className="flex gap-6 justify-center w-full">
        {reactions.map((reaction) => {
          const meta = reactionMeta[reaction.type as keyof typeof reactionMeta];
          return (
            <button
              key={reaction.id}
              onClick={() => handleReaction(reaction.type)}
              className={`flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-full text-base font-semibold shadow-md border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/60 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-110 active:scale-95 ${reaction.userReacted ? 'ring-2 ring-primary' : ''}`}
              title={meta.label}
              disabled={loading || reaction.userReacted}
            >
              {meta.icon}
              <span className="text-xs capitalize tracking-wide mt-1">{meta.label}</span>
              <span className="text-xs font-bold mt-0.5">{reaction.count}</span>
            </button>
          );
        })}
      </div>
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-primary text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-up">
          {toast}
        </div>
      )}
    </div>
  );
} 