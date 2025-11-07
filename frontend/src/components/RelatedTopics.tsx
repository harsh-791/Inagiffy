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
    <div className="mt-8 space-y-6">
      {/* Related Topics Section */}
      {relatedTopics.length > 0 && (
        <div className="neo-border-thick neo-shadow-lg bg-white p-6">
          <div className="neo-border neo-shadow-sm bg-cyan-400 inline-block px-4 py-2 mb-4">
            <p className="text-xs font-black text-black uppercase">🔗 Related Topics</p>
          </div>
          <p className="text-sm text-black font-bold mb-4">
            Explore these complementary topics that expand on your current learning:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedTopics.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onTopicClick(item.topic)}
                className="neo-border neo-shadow-sm bg-yellow-300 p-4 text-left hover:bg-yellow-400 transition-colors cursor-pointer group"
              >
                <div className="font-black text-black uppercase text-base mb-2 group-hover:underline">
                  {item.topic}
                </div>
                <div className="text-xs text-black font-bold mb-2 line-clamp-2">
                  {item.description}
                </div>
                <div className="text-xs text-black font-bold italic">
                  💡 {item.reason}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Next Learning Paths Section */}
      {nextLearningPaths.length > 0 && (
        <div className="neo-border-thick neo-shadow-lg bg-white p-6">
          <div className="neo-border neo-shadow-sm bg-magenta-400 inline-block px-4 py-2 mb-4">
            <p className="text-xs font-black text-black uppercase">🚀 Next Learning Paths</p>
          </div>
          <p className="text-sm text-black font-bold mb-4">
            After mastering this topic, consider these logical next steps:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nextLearningPaths.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onTopicClick(item.topic)}
                className="neo-border neo-shadow-sm bg-cyan-300 p-4 text-left hover:bg-cyan-400 transition-colors cursor-pointer group"
              >
                <div className="font-black text-black uppercase text-base mb-2 group-hover:underline">
                  {item.topic}
                </div>
                <div className="text-xs text-black font-bold mb-2 line-clamp-2">
                  {item.description}
                </div>
                <div className="text-xs text-black font-bold italic">
                  ➡️ {item.reason}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

