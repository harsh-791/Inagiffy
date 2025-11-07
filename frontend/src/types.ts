export interface LearningResource {
  type: 'Article' | 'Video' | 'Book' | 'Course';
  title: string;
  url: string;
}

export interface Subtopic {
  name: string;
  description: string;
  resources: LearningResource[];
}

export interface Branch {
  name: string;
  description: string;
  subtopics: Subtopic[];
}

export interface RelatedTopic {
  topic: string;
  description: string;
  reason: string;
}

export interface LearningRoadmap {
  topic: string;
  branches: Branch[];
  relatedTopics?: RelatedTopic[];
  nextLearningPaths?: RelatedTopic[];
}

