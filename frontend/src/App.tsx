import { useState, useEffect, useRef } from "react";
import TopicInput from "./components/TopicInput";
import LearningMap from "./components/LearningMap";
import RelatedTopics from "./components/RelatedTopics";
import { LearningRoadmap } from "./types";

function App() {
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const roadmapRef = useRef<HTMLDivElement>(null);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<
    "beginner" | "intermediate" | "advanced"
  >("intermediate");
  const abortControllerRef = useRef<AbortController | null>(null);
  const [lastTopic, setLastTopic] = useState<string>("");
  const [lastLevel, setLastLevel] = useState<
    "beginner" | "intermediate" | "advanced"
  >("intermediate");

  const handleGenerate = async (
    topic: string,
    level: "beginner" | "intermediate" | "advanced"
  ) => {
    if (abortControllerRef.current) {
      console.log("Cancelling previous request...");
      abortControllerRef.current.abort();
    }

    console.log(`Generating roadmap for "${topic}" (${level} level)`);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);
    setRoadmap(null);
    setCurrentLevel(level);
    setLastTopic(topic);
    setLastLevel(level);

    try {
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, 60000);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "/api"}/generate-map`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ topic, level }),
          signal: abortController.signal,
        }
      );

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to generate roadmap"
        );
      }

      const roadmapData = data.data;
      setRoadmap(roadmapData);
      setShowRoadmap(true);

      console.log(`Roadmap generated successfully!`);
      console.log(
        `Found ${
          roadmapData.branches.length
        } main branches with ${roadmapData.branches.reduce(
          (acc: number, b: any) => acc + b.subtopics.length,
          0
        )} subtopics`
      );
      if (
        roadmapData.relatedTopics?.length ||
        roadmapData.nextLearningPaths?.length
      ) {
        console.log(
          `Also generated ${
            (roadmapData.relatedTopics?.length || 0) +
            (roadmapData.nextLearningPaths?.length || 0)
          } topic suggestions`
        );
      }

      setTimeout(() => {
        roadmapRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Request was cancelled");
        return;
      }
      const errorMessage = err.message || "An unexpected error occurred";
      setError(errorMessage);
      console.error("Failed to generate roadmap:", errorMessage);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleRetry = () => {
    if (lastTopic) {
      console.log("Retrying with previous topic...");
      handleGenerate(lastTopic, lastLevel);
    }
  };

  const handleExport = () => {
    if (!roadmap) return;

    const dataStr = JSON.stringify(roadmap, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${roadmap.topic.replace(
      /\s+/g,
      "-"
    )}-roadmap.json`;

    console.log(`Exporting roadmap: ${exportFileDefaultName}`);

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    console.log("Roadmap exported successfully!");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRelatedTopicClick = (topic: string) => {
    console.log(`Exploring related topic: "${topic}"`);
    handleGenerate(topic, currentLevel);
  };

  useEffect(() => {
    if (loading) {
      setShowRoadmap(false);
    }
  }, [loading]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && error) {
        setError(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [error]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header
          className={`text-center mb-16 transition-all duration-500 overflow-visible ${
            showRoadmap ? "opacity-40 scale-95" : "opacity-100 scale-100"
          }`}
        >
          <div className="mb-4 overflow-visible">
            <h1 className="text-6xl md:text-7xl font-bold gradient-text mb-3 tracking-tight leading-none pb-2 overflow-visible">
              Inagiffy
            </h1>
            <p className="text-lg text-slate-600 font-medium">
              AI-Powered Learning Maps
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="h-1 w-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
            <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            <div className="h-1 w-12 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full"></div>
          </div>
        </header>

        <div
          className={`transition-all duration-500 ${
            showRoadmap ? "opacity-30 scale-95" : "opacity-100 scale-100"
          }`}
        >
          <TopicInput onGenerate={handleGenerate} loading={loading} />
        </div>

        {error && (
          <div className="mt-6 max-w-2xl mx-auto animate-fadeIn">
            <div className="card p-6 bg-red-50 border-red-200">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <p className="font-semibold text-red-900">{error}</p>
                </div>
                <div className="flex gap-2">
                  {lastTopic && (
                    <button
                      onClick={handleRetry}
                      className="btn-primary text-sm px-4 py-2"
                    >
                      Retry
                    </button>
                  )}
                  <button
                    onClick={() => setError(null)}
                    className="btn-secondary text-sm px-4 py-2"
                    aria-label="Dismiss error"
                    title="Press Escape to dismiss"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-12 text-center animate-fadeIn">
            <div className="card-elevated inline-block p-10">
              <div className="w-16 h-16 mx-auto mb-6 relative">
                <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="font-semibold text-slate-900 text-xl mb-2">
                Generating Your Learning Map
              </p>
              <p className="text-sm text-slate-600">
                This may take a few seconds
              </p>
            </div>
          </div>
        )}

        {roadmap && (
          <div
            ref={roadmapRef}
            className={`mt-16 transition-all duration-700 ${
              showRoadmap
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-10"
            }`}
          >
            <div className="mb-8">
              <div className="card-elevated p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="badge mb-3">Learning Roadmap</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                      {roadmap.topic}
                    </h2>
                    <p className="text-sm text-slate-600">
                      {roadmap.branches.length} main branches •{" "}
                      {roadmap.branches.reduce(
                        (acc, b) => acc + b.subtopics.length,
                        0
                      )}{" "}
                      subtopics
                    </p>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={handleExport}
                      className="btn-primary text-sm"
                    >
                      Export JSON
                    </button>
                    <button
                      onClick={scrollToTop}
                      className="btn-secondary text-sm"
                    >
                      Back to Top
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-elevated p-6 animate-fadeIn">
              <div className="mb-4 flex items-center gap-2 text-sm text-slate-600">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Click any node to expand and see details</span>
              </div>
              <LearningMap roadmap={roadmap} />
            </div>

            {roadmap &&
              ((roadmap.relatedTopics?.length ?? 0) > 0 ||
                (roadmap.nextLearningPaths?.length ?? 0) > 0) && (
                <div className="mt-8">
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
