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
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-4">
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
            Enter a Topic
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Web Development, Machine Learning, Photography..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
            Learning Level
          </label>
          <select
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {loading ? 'Generating...' : 'Generate Learning Map'}
        </button>
      </form>
    </div>
  );
}

