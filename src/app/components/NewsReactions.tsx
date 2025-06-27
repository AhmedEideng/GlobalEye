"use client";
import { useState, useEffect } from "react";
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
  const [reactions, setReactions] = useState<Reaction[]>([
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

  return (
    <div className="flex flex-col gap-3 mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        React to this article
      </h3>
      
      <div className="flex gap-4">
        {reactions.map((reaction) => (
          <button
            key={reaction.id}
            onClick={() => handleReaction(reaction.type)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              reaction.userReacted 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            disabled={loading}
          >
            <span className="text-sm font-medium">{reaction.count}</span>
            <span className="capitalize">{reaction.type}</span>
          </button>
        ))}
      </div>
      {toast && (
        <div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',zIndex:9999}} className="bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg animate-fade-in-up">
          {toast}
        </div>
      )}
    </div>
  );
} 