import { useState } from 'react';
import TopicInput from './components/TopicInput';
import LearningMap from './components/LearningMap';
import { LearningRoadmap } from './types';

function App() {
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (topic: string, level: 'beginner' | 'intermediate' | 'advanced') => {
    setLoading(true);
    setError(null);
    setRoadmap(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Inagiffy
            </span>
          </h1>
          <p className="text-xl text-gray-600">
            AI-Powered Interactive Learning Maps
          </p>
        </header>

        <TopicInput onGenerate={handleGenerate} loading={loading} />

        {error && (
          <div className="mt-6 max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {roadmap && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4 max-w-7xl mx-auto">
              <h2 className="text-2xl font-semibold text-gray-800">
                Learning Map: {roadmap.topic}
              </h2>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                Export JSON
              </button>
            </div>
            <LearningMap roadmap={roadmap} />
          </div>
        )}

        {loading && (
          <div className="mt-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Generating your learning map...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

