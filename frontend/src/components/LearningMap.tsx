import { useCallback, useMemo, useEffect, useState, useRef } from 'react';
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
  expanded?: boolean;
  subtopics?: Array<{ name: string; description: string; resources: Array<{ type: string; title: string; url: string }> }>;
  onExpand?: () => void;
}

// Custom node component for branches
function BranchNode({ data, selected }: { data: CustomNodeData; selected?: boolean }) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onExpand) {
      data.onExpand();
    }
  };

  return (
    <div 
      className={`neo-border-thick neo-shadow bg-cyan-400 p-4 min-w-[200px] max-w-[400px] cursor-pointer expandable-node ${selected ? 'ring-4 ring-black' : ''}`}
      onClick={handleClick}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="font-black text-black uppercase text-base flex-1">{data.label}</div>
        <div className="text-lg font-black text-black">
          {data.expanded ? '▼' : '▶'}
        </div>
      </div>
      {data.description && (
        <div className="text-sm text-black font-bold mb-2">{data.description}</div>
      )}
      {data.expanded && data.subtopics && (
        <div className="mt-3 pt-3 border-t-4 border-black space-y-2 expanded-content">
          <div className="text-xs font-black text-black uppercase mb-2">Subtopics ({data.subtopics.length}):</div>
          {data.subtopics.map((subtopic, idx) => (
            <div key={idx} className="neo-border bg-yellow-300 p-2">
              <div className="text-xs font-black text-black uppercase">{subtopic.name}</div>
              {subtopic.description && (
                <div className="text-xs text-black font-bold mt-1">{subtopic.description}</div>
              )}
              {subtopic.resources && subtopic.resources.length > 0 && (
                <div className="mt-2 pt-2 border-t-2 border-black">
                  {subtopic.resources.map((resource, rIdx) => (
                    <a
                      key={rIdx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        window.open(resource.url, '_blank', 'noopener,noreferrer');
                      }}
                      className="text-xs text-black font-black uppercase block truncate hover:underline cursor-pointer"
                    >
                      → {resource.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

// Custom node component for subtopics
function SubtopicNode({ data, selected }: { data: CustomNodeData; selected?: boolean }) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onExpand) {
      data.onExpand();
    }
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
  };

  const showAllResources = data.expanded && data.resources && data.resources.length > 2;
  const displayedResources = showAllResources ? data.resources : (data.resources?.slice(0, 2) || []);

  return (
    <div 
      className={`neo-border neo-shadow-sm bg-yellow-300 p-3 min-w-[180px] max-w-[320px] cursor-pointer expandable-node ${selected ? 'ring-4 ring-black' : ''}`}
      onClick={handleClick}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="font-black text-black uppercase text-sm flex-1">{data.label}</div>
        {data.resources && data.resources.length > 2 && (
          <div className="text-sm font-black text-black">
            {data.expanded ? '▼' : '▶'}
          </div>
        )}
      </div>
      {data.description && (
        <div className={`text-xs text-black font-bold mb-2 ${data.expanded ? '' : 'line-clamp-2'}`}>
          {data.description}
        </div>
      )}
      {data.resources && data.resources.length > 0 && (
        <div className="mt-2 pt-2 border-t-4 border-black pointer-events-auto">
          <div className="text-xs font-black text-black uppercase mb-1">
            Resources {!showAllResources && data.resources.length > 2 ? `(${data.resources.length} total)` : ''}:
          </div>
          {displayedResources.map((resource, idx) => (
            <a
              key={idx}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                window.open(resource.url, '_blank', 'noopener,noreferrer');
              }}
              className="text-xs text-black font-black uppercase block truncate hover:underline cursor-pointer relative pointer-events-auto mb-1"
              style={{ zIndex: 1000 }}
            >
              → {resource.title}
            </a>
          ))}
          {!showAllResources && data.resources.length > 2 && (
            <div className="text-xs text-black font-bold mt-1">
              Click to see all {data.resources.length} resources
            </div>
          )}
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

// Function to get node dimensions based on type and expanded state
function getNodeDimensions(type: string, expanded: boolean = false, data?: CustomNodeData): { width: number; height: number } {
  switch (type) {
    case 'topic':
      return { width: 350, height: 100 };
    case 'branch':
      if (expanded && data?.subtopics) {
        // Calculate height based on number of subtopics
        const baseHeight = 140;
        const subtopicHeight = 120;
        const totalHeight = baseHeight + (data.subtopics.length * subtopicHeight);
        return { width: 400, height: Math.min(totalHeight, 600) };
      }
      return { width: 300, height: 140 };
    case 'subtopic':
      if (expanded && data?.resources && data.resources.length > 2) {
        const baseHeight = 180;
        const resourceHeight = 25;
        const totalHeight = baseHeight + ((data.resources.length - 2) * resourceHeight);
        return { width: 320, height: Math.min(totalHeight, 400) };
      }
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
    const nodeData = node.data as CustomNodeData;
    const dimensions = getNodeDimensions(node.type || 'subtopic', nodeData.expanded || false, nodeData);
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
  const initialFitDone = useRef(false);

  useEffect(() => {
    // Only fit view on initial mount, not on every expansion/collapse
    if (!initialFitDone.current) {
      const timeoutId = setTimeout(() => {
        fitView({ padding: 80, maxZoom: 1, duration: 300 });
        initialFitDone.current = true;
      }, 150);
      
      return () => clearTimeout(timeoutId);
    }
  }, [fitView, nodes.length]);

  return null;
}

export default function LearningMap({ roadmap }: LearningMapProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
        setSelectedNode(null);
      } else {
        newSet.add(nodeId);
        setSelectedNode(nodeId);
      }
      return newSet;
    });
  }, []);

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
      const isExpanded = expandedNodes.has(branchNodeId);
      
      nodes.push({
        id: branchNodeId,
        type: 'branch',
        data: {
          label: branch.name,
          description: branch.description,
          expanded: isExpanded,
          subtopics: branch.subtopics,
          onExpand: () => toggleNode(branchNodeId),
        },
        selected: selectedNode === branchNodeId,
      });

      // Connect topic to branch
      edges.push({
        id: `edge-${topicNodeId}-${branchNodeId}`,
        source: topicNodeId,
        target: branchNodeId,
        style: { stroke: '#000', strokeWidth: 4 },
      });

      // Add subtopic nodes and connect to branch (only if branch is not expanded)
      if (!isExpanded) {
        branch.subtopics.forEach((subtopic, subtopicIndex) => {
          const subtopicNodeId = `subtopic-${branchIndex}-${subtopicIndex}`;
          const isSubtopicExpanded = expandedNodes.has(subtopicNodeId);
          
          nodes.push({
            id: subtopicNodeId,
            type: 'subtopic',
            data: {
              label: subtopic.name,
              description: subtopic.description,
              resources: subtopic.resources,
              expanded: isSubtopicExpanded,
              onExpand: () => toggleNode(subtopicNodeId),
            },
            selected: selectedNode === subtopicNodeId,
          });

          // Connect branch to subtopic
          edges.push({
            id: `edge-${branchNodeId}-${subtopicNodeId}`,
            source: branchNodeId,
            target: subtopicNodeId,
            style: { stroke: '#000', strokeWidth: 3 },
          });
        });
      }
    });

    // Apply automatic layout using dagre
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
    
    return { nodes: layoutedNodes, edges: layoutedEdges };
  }, [roadmap, expandedNodes, selectedNode, toggleNode]);

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

