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
      <form onSubmit={handleSubmit} className="card-elevated p-8">
        <div className="mb-6">
          <label htmlFor="topic" className="block font-semibold text-slate-900 mb-2 text-sm">
            What would you like to learn?
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Web Development, Machine Learning, Photography..."
            className="input-field text-base"
            disabled={loading}
            autoFocus
          />
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Tip: Be specific! Try "React Development" instead of just "Programming"
          </p>
        </div>

        <div className="mb-8">
          <label htmlFor="level" className="block font-semibold text-slate-900 mb-2 text-sm">
            Learning Level
          </label>
          <select
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
            className="input-field text-base"
            disabled={loading}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !topic.trim()}
          className="btn-primary w-full py-4 text-base"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Generate Learning Map
            </span>
          )}
        </button>
        
        {!loading && topic.trim() && (
          <p className="text-center text-xs text-slate-500 mt-4">
            Ready to create your roadmap
          </p>
        )}
      </form>
    </div>
  );
}

