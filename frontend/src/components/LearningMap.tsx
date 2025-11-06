import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { LearningRoadmap } from '../types';

interface LearningMapProps {
  roadmap: LearningRoadmap;
}

interface CustomNodeData {
  label: string;
  description?: string;
  resources?: Array<{ type: string; title: string; url: string }>;
  isMain?: boolean;
}

// Custom node component for branches
function BranchNode({ data }: { data: CustomNodeData }) {
  return (
    <div className="bg-white border-2 border-blue-500 rounded-lg shadow-xl p-4 min-w-[200px] max-w-[250px]">
      <Handle type="target" position={Position.Top} />
      <div className="font-bold text-blue-700 text-lg mb-2">{data.label}</div>
      {data.description && (
        <div className="text-sm text-gray-600 mb-2">{data.description}</div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

// Custom node component for subtopics
function SubtopicNode({ data }: { data: CustomNodeData }) {
  return (
    <div className="bg-white border-2 border-purple-400 rounded-lg shadow-lg p-3 min-w-[180px] max-w-[220px]">
      <Handle type="target" position={Position.Top} />
      <div className="font-semibold text-purple-700 text-base mb-1">{data.label}</div>
      {data.description && (
        <div className="text-xs text-gray-600 mb-2 line-clamp-2">{data.description}</div>
      )}
      {data.resources && data.resources.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="text-xs font-medium text-gray-500 mb-1">Resources:</div>
          {data.resources.slice(0, 2).map((resource, idx) => (
            <a
              key={idx}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 block truncate"
            >
              {resource.title}
            </a>
          ))}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

// Custom node component for main topic
function TopicNode({ data }: { data: CustomNodeData }) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-2xl p-6 min-w-[250px]">
      <div className="font-bold text-2xl">{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  topic: TopicNode,
  branch: BranchNode,
  subtopic: SubtopicNode,
};

export default function LearningMap({ roadmap }: LearningMapProps) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Add main topic node
    const topicNodeId = 'topic';
    nodes.push({
      id: topicNodeId,
      type: 'topic',
      position: { x: 400, y: 0 },
      data: { label: roadmap.topic, isMain: true },
    });

    // Calculate positions for branches
    const branchCount = roadmap.branches.length;
    const branchSpacing = 300;
    const startX = 400 - ((branchCount - 1) * branchSpacing) / 2;

    roadmap.branches.forEach((branch, branchIndex) => {
      const branchNodeId = `branch-${branchIndex}`;
      const branchX = startX + branchIndex * branchSpacing;
      const branchY = 150;

      // Add branch node
      nodes.push({
        id: branchNodeId,
        type: 'branch',
        position: { x: branchX, y: branchY },
        data: {
          label: branch.name,
          description: branch.description,
        },
      });

      // Connect topic to branch
      edges.push({
        id: `edge-${topicNodeId}-${branchNodeId}`,
        source: topicNodeId,
        target: branchNodeId,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      });

      // Add subtopics
      const subtopicCount = branch.subtopics.length;
      const subtopicSpacing = 200;
      const subtopicStartX = branchX - ((subtopicCount - 1) * subtopicSpacing) / 2;

      branch.subtopics.forEach((subtopic, subtopicIndex) => {
        const subtopicNodeId = `subtopic-${branchIndex}-${subtopicIndex}`;
        const subtopicX = subtopicStartX + subtopicIndex * subtopicSpacing;
        const subtopicY = branchY + 180;

        nodes.push({
          id: subtopicNodeId,
          type: 'subtopic',
          position: { x: subtopicX, y: subtopicY },
          data: {
            label: subtopic.name,
            description: subtopic.description,
            resources: subtopic.resources,
          },
        });

        // Connect branch to subtopic
        edges.push({
          id: `edge-${branchNodeId}-${subtopicNodeId}`,
          source: branchNodeId,
          target: subtopicNodeId,
          style: { stroke: '#a855f7', strokeWidth: 1.5 },
        });
      });
    });

    return { nodes, edges };
  }, [roadmap]);

  const onNodesChange = useCallback(() => {}, []);
  const onEdgesChange = useCallback(() => {}, []);

  return (
    <div className="w-full h-[600px] bg-white rounded-xl shadow-lg border border-gray-200">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'topic') return '#3b82f6';
            if (node.type === 'branch') return '#60a5fa';
            return '#a855f7';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
}

