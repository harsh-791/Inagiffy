import { useState } from 'react';

interface TopicInputProps {
  onGenerate: (topic: string, level: 'beginner' | 'intermediate' | 'advanced') => void;
  loading: boolean;
}

export default function TopicInput({ onGenerate, loading }: TopicInputProps) {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onGenerate(topic.trim(), level);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="neo-card p-8">
        <div className="mb-6">
          <label htmlFor="topic" className="block font-black text-black uppercase mb-3 text-lg">
            🎯 Enter a Topic
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Web Development, Machine Learning, Photography..."
            className="neo-input w-full px-5 py-4 text-lg"
            disabled={loading}
            autoFocus
          />
          <p className="text-xs text-black font-bold mt-2">
            💡 Tip: Be specific! Try "React Development" instead of just "Programming"
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="level" className="block font-black text-black uppercase mb-3 text-lg">
            📚 Learning Level
          </label>
          <select
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
            className="neo-input w-full px-5 py-4 text-lg uppercase font-black"
            disabled={loading}
          >
            <option value="beginner">🌱 Beginner</option>
            <option value="intermediate">🚀 Intermediate</option>
            <option value="advanced">⚡ Advanced</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !topic.trim()}
          className="neo-button w-full py-4 text-xl relative overflow-hidden"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-pulse">⚙️</span>
              Generating...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>✨</span>
              Generate Learning Map
            </span>
          )}
        </button>
        
        {!loading && topic.trim() && (
          <p className="text-center text-xs text-black font-bold mt-4">
            Ready to create your roadmap! 🗺️
          </p>
        )}
      </form>
    </div>
  );
}

