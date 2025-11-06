import { useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  Handle,
  Position,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
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
    <div className="neo-border-thick neo-shadow bg-cyan-400 p-4 min-w-[200px] max-w-[250px]">
      <Handle type="target" position={Position.Top} />
      <div className="font-black text-black uppercase text-base mb-2">{data.label}</div>
      {data.description && (
        <div className="text-sm text-black font-bold mb-2">{data.description}</div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

// Custom node component for subtopics
function SubtopicNode({ data }: { data: CustomNodeData }) {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Stop event propagation to prevent React Flow from intercepting
    e.stopPropagation();
  };

  return (
    <div className="neo-border neo-shadow-sm bg-yellow-300 p-3 min-w-[180px] max-w-[220px]">
      <Handle type="target" position={Position.Top} />
      <div className="font-black text-black uppercase text-sm mb-1">{data.label}</div>
      {data.description && (
        <div className="text-xs text-black font-bold mb-2 line-clamp-2">{data.description}</div>
      )}
      {data.resources && data.resources.length > 0 && (
        <div className="mt-2 pt-2 border-t-4 border-black pointer-events-auto">
          <div className="text-xs font-black text-black uppercase mb-1">Resources:</div>
          {data.resources.slice(0, 2).map((resource, idx) => (
            <a
              key={idx}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                // Open link programmatically to ensure it works
                window.open(resource.url, '_blank', 'noopener,noreferrer');
              }}
              className="text-xs text-black font-black uppercase block truncate hover:underline cursor-pointer relative pointer-events-auto"
              style={{ zIndex: 1000 }}
            >
              → {resource.title}
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
    <div className="neo-border-thick neo-shadow-lg bg-magenta-400 p-6 min-w-[250px]">
      <div className="font-black text-black uppercase text-2xl">{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  topic: TopicNode,
  branch: BranchNode,
  subtopic: SubtopicNode,
};

// Function to get node dimensions based on type
function getNodeDimensions(type: string): { width: number; height: number } {
  switch (type) {
    case 'topic':
      return { width: 350, height: 100 };
    case 'branch':
      return { width: 300, height: 140 };
    case 'subtopic':
      return { width: 260, height: 180 };
    default:
      return { width: 200, height: 100 };
  }
}

// Function to layout nodes using dagre (UML-style hierarchical layout)
function getLayoutedElements(nodes: Node[], edges: Edge[], direction: 'TB' | 'LR' = 'TB') {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ 
    rankdir: direction,
    nodesep: 100, // Horizontal spacing between nodes
    ranksep: 150, // Vertical spacing between ranks
    marginx: 50,
    marginy: 50,
  });

  nodes.forEach((node) => {
    const dimensions = getNodeDimensions(node.type || 'subtopic');
    dagreGraph.setNode(node.id, { 
      width: dimensions.width, 
      height: dimensions.height 
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

function LayoutFlow({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    // Fit view after layout
    setTimeout(() => {
      fitView({ padding: 80, maxZoom: 1 });
    }, 100);
  }, [fitView, nodes.length]);

  return null;
}

export default function LearningMap({ roadmap }: LearningMapProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Add main topic node
    const topicNodeId = 'topic';
    nodes.push({
      id: topicNodeId,
      type: 'topic',
      data: { label: roadmap.topic, isMain: true },
    });

    // Add branch nodes and connect to topic
    roadmap.branches.forEach((branch, branchIndex) => {
      const branchNodeId = `branch-${branchIndex}`;
      
      nodes.push({
        id: branchNodeId,
        type: 'branch',
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
        style: { stroke: '#000', strokeWidth: 4 },
      });

      // Add subtopic nodes and connect to branch
      branch.subtopics.forEach((subtopic, subtopicIndex) => {
        const subtopicNodeId = `subtopic-${branchIndex}-${subtopicIndex}`;
        
        nodes.push({
          id: subtopicNodeId,
          type: 'subtopic',
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
          style: { stroke: '#000', strokeWidth: 3 },
        });
      });
    });

    // Apply automatic layout using dagre
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
    
    return { nodes: layoutedNodes, edges: layoutedEdges };
  }, [roadmap]);

  const onNodesChange = useCallback(() => {}, []);
  const onEdgesChange = useCallback(() => {}, []);

  return (
    <div className="w-full h-[800px] bg-yellow-100">
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 80, maxZoom: 1, minZoom: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        selectNodesOnDrag={false}
      >
        <LayoutFlow nodes={initialNodes} edges={initialEdges} />
        <Background color="#fef3c7" gap={16} />
        <Controls 
          style={{
            backgroundColor: '#fff',
            border: '4px solid #000',
            boxShadow: '4px 4px 0px 0px #000',
          }}
        />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'topic') return '#ec4899'; // magenta
            if (node.type === 'branch') return '#22d3ee'; // cyan
            return '#fde047'; // yellow
          }}
          maskColor="rgba(0, 0, 0, 0.2)"
          style={{
            backgroundColor: '#fff',
            border: '4px solid #000',
            boxShadow: '4px 4px 0px 0px #000',
          }}
        />
      </ReactFlow>
    </div>
  );
}

