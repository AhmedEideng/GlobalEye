"use client";
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

const reactions = [
  { type: "like", icon: "👍" },
  { type: "love", icon: "❤️" },
  { type: "wow", icon: "😲" },
  { type: "angry", icon: "😡" },
  { type: "dislike", icon: "👎" },
  { type: "share", icon: "🔁" },
];

export function NewsReactions({ articleUrl }: { articleUrl: string }) {
  const [user, setUser] = useState<any>(null);
  const [myReaction, setMyReaction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) fetchReaction(data.user.id);
    });
    // eslint-disable-next-line
  }, [articleUrl]);

  async function fetchReaction(userId: string) {
    const { data } = await supabase
      .from("news_reactions")
      .select("reaction")
      .eq("user_id", userId)
      .eq("article_url", articleUrl)
      .single();
    setMyReaction(data?.reaction || null);
  }

  async function handleReact(type: string) {
    if (!user) {
      setError("You must sign in to react.");
      return;
    }
    setLoading(true);
    setError("");
    const { error } = await supabase.from("news_reactions").upsert({
      user_id: user.id,
      article_url: articleUrl,
      reaction: type,
    });
    setLoading(false);
    if (error) setError(error.message);
    else setMyReaction(type);
  }

  return (
    <div className="flex gap-2 mt-2 items-center">
      {reactions.map(r => (
        <button
          key={r.type}
          onClick={() => handleReact(r.type)}
          disabled={loading}
          className={`
            text-2xl bg-transparent border-none rounded-lg px-2 py-1 cursor-pointer transition-all duration-200
            ${myReaction === r.type 
              ? 'bg-primary text-primary-foreground ring-2 ring-primary' 
              : 'hover:bg-muted'
            }
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          aria-label={r.type}
        >
          {r.icon}
        </button>
      ))}
      {error && (
        <span className="text-destructive text-xs ml-2">
          {error}
        </span>
      )}
    </div>
  );
} 