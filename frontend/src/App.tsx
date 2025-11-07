import { useState, useEffect, useRef } from 'react';
import TopicInput from './components/TopicInput';
import LearningMap from './components/LearningMap';
import RelatedTopics from './components/RelatedTopics';
import { LearningRoadmap } from './types';

function App() {
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const roadmapRef = useRef<HTMLDivElement>(null);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  const handleGenerate = async (topic: string, level: 'beginner' | 'intermediate' | 'advanced') => {
    setLoading(true);
    setError(null);
    setRoadmap(null);
    setCurrentLevel(level);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/generate-map`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, level }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to generate roadmap');
      }

      setRoadmap(data.data);
      setShowRoadmap(true);
      
      // Smooth scroll to roadmap after a brief delay
      setTimeout(() => {
        roadmapRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 300);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      console.error('Error generating roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!roadmap) return;

    const dataStr = JSON.stringify(roadmap, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${roadmap.topic.replace(/\s+/g, '-')}-roadmap.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRelatedTopicClick = (topic: string) => {
    // Generate a new roadmap for the clicked related topic
    handleGenerate(topic, currentLevel);
  };

  // Reset showRoadmap when generating new roadmap
  useEffect(() => {
    if (loading) {
      setShowRoadmap(false);
    }
  }, [loading]);

  return (
    <div className="min-h-screen bg-yellow-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <header className={`text-center mb-12 transition-all duration-500 ${showRoadmap ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="inline-block neo-border-thick neo-shadow-lg bg-magenta-400 px-8 py-4 mb-4">
            <h1 className="text-6xl font-black text-black uppercase tracking-tight">
              INAGIFFY
            </h1>
          </div>
          <div className="neo-border neo-shadow bg-cyan-400 inline-block px-6 py-2">
            <p className="text-xl font-black text-black uppercase">
              AI-Powered Learning Maps
            </p>
          </div>
        </header>

        {/* Input Section */}
        <div className={`transition-all duration-500 ${showRoadmap ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}`}>
          <TopicInput onGenerate={handleGenerate} loading={loading} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 max-w-2xl mx-auto animate-fadeIn">
            <div className="neo-border neo-shadow bg-red-400 px-6 py-4">
              <p className="font-black text-black uppercase text-lg">
                ⚠️ Error: {error}
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mt-12 text-center animate-fadeIn">
            <div className="neo-border-thick neo-shadow-lg bg-white inline-block p-8">
              <div className="neo-border-thick bg-cyan-400 w-16 h-16 mx-auto mb-4 animate-pulse"></div>
              <p className="font-black text-black uppercase text-xl">
                Generating Your Learning Map...
              </p>
              <p className="text-sm text-black font-bold mt-2">
                This may take a few seconds
              </p>
            </div>
          </div>
        )}

        {/* Roadmap Section - Main Focus */}
        {roadmap && (
          <div 
            ref={roadmapRef}
            className={`mt-16 transition-all duration-700 ${showRoadmap ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10'}`}
          >
            {/* Roadmap Header with Actions */}
            <div className="max-w-7xl mx-auto mb-6">
              <div className="neo-border-thick neo-shadow-lg bg-white p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="neo-border neo-shadow-sm bg-magenta-400 inline-block px-4 py-2 mb-2">
                      <p className="text-xs font-black text-black uppercase">Learning Roadmap</p>
                    </div>
                    <h2 className="text-4xl font-black text-black uppercase mt-2">
                      {roadmap.topic}
                    </h2>
                    <p className="text-sm text-black font-bold mt-2">
                      {roadmap.branches.length} main branches • {roadmap.branches.reduce((acc, b) => acc + b.subtopics.length, 0)} subtopics
                    </p>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={handleExport}
                      className="neo-button px-6 py-3 text-base"
                    >
                      📥 Export JSON
                    </button>
                    <button
                      onClick={scrollToTop}
                      className="neo-border neo-shadow bg-yellow-300 px-6 py-3 text-base font-black text-black uppercase"
                    >
                      ↑ Back to Top
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Roadmap Visualization */}
            <div className="neo-border-thick neo-shadow-lg bg-white p-4 animate-fadeIn">
              <div className="mb-3 neo-border bg-yellow-300 px-4 py-2 inline-block">
                <p className="text-xs font-black text-black uppercase">
                  💡 Click any node to expand and see details
                </p>
              </div>
              <LearningMap roadmap={roadmap} />
            </div>

            {/* Related Topics and Next Learning Paths */}
            {roadmap && (roadmap.relatedTopics?.length > 0 || roadmap.nextLearningPaths?.length > 0) && (
              <div className="max-w-7xl mx-auto">
                <RelatedTopics
                  relatedTopics={roadmap.relatedTopics || []}
                  nextLearningPaths={roadmap.nextLearningPaths || []}
                  onTopicClick={handleRelatedTopicClick}
                  currentLevel={currentLevel}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

