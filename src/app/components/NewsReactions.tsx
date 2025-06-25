"use client";
import { useState } from "react";

interface Reaction {
  id: string;
  type: 'like' | 'dislike' | 'share';
  count: number;
  userReacted: boolean;
}

export function NewsReactions() {
  const [reactions, setReactions] = useState<Reaction[]>([
    { id: 'like', type: 'like', count: 0, userReacted: false },
    { id: 'dislike', type: 'dislike', count: 0, userReacted: false },
    { id: 'share', type: 'share', count: 0, userReacted: false }
  ]);

  const handleReaction = (type: string) => {
    setReactions(prev => prev.map(reaction => {
      if (reaction.type === type) {
        return {
          ...reaction,
          count: reaction.userReacted ? reaction.count - 1 : reaction.count + 1,
          userReacted: !reaction.userReacted
        };
      }
      return reaction;
    }));
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
          >
            <span className="text-sm font-medium">{reaction.count}</span>
            <span className="capitalize">{reaction.type}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 