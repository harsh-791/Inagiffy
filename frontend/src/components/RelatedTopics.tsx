import { RelatedTopic } from '../types';

interface RelatedTopicsProps {
  relatedTopics: RelatedTopic[];
  nextLearningPaths: RelatedTopic[];
  onTopicClick: (topic: string) => void;
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
}

export default function RelatedTopics({
  relatedTopics,
  nextLearningPaths,
  onTopicClick,
  currentLevel,
}: RelatedTopicsProps) {
  if (relatedTopics.length === 0 && nextLearningPaths.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {relatedTopics.length > 0 && (
        <div className="card-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
            <h3 className="section-title">Related Topics</h3>
          </div>
          <p className="section-subtitle">
            Explore these complementary topics that expand on your current learning
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedTopics.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onTopicClick(item.topic)}
                className="card p-4 text-left hover:shadow-xl transition-all duration-200 hover:-translate-y-1 group"
              >
                <div className="font-semibold text-slate-900 text-base mb-2 group-hover:text-indigo-600 transition-colors">
                  {item.topic}
                </div>
                <div className="text-sm text-slate-600 mb-3 line-clamp-2">
                  {item.description}
                </div>
                <div className="text-xs text-slate-500 italic flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>{item.reason}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {nextLearningPaths.length > 0 && (
        <div className="card-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
            <h3 className="section-title">Next Learning Paths</h3>
          </div>
          <p className="section-subtitle">
            After mastering this topic, consider these logical next steps
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nextLearningPaths.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onTopicClick(item.topic)}
                className="card p-4 text-left hover:shadow-xl transition-all duration-200 hover:-translate-y-1 group"
              >
                <div className="font-semibold text-slate-900 text-base mb-2 group-hover:text-purple-600 transition-colors">
                  {item.topic}
                </div>
                <div className="text-sm text-slate-600 mb-3 line-clamp-2">
                  {item.description}
                </div>
                <div className="text-xs text-slate-500 italic flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span>{item.reason}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

