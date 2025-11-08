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

function BranchNode({ data, selected }: { data: CustomNodeData; selected?: boolean }) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onExpand) {
      data.onExpand();
    }
  };

  return (
    <div 
      className={`bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 transition-all duration-300 ${
        selected ? 'border-indigo-500 shadow-lg' : 'border-indigo-200'
      } ${
        data.expanded ? 'shadow-xl' : 'shadow-md'
      } p-4 min-w-[200px] max-w-[400px] cursor-pointer expandable-node`}
      onClick={handleClick}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="font-semibold text-slate-900 text-base flex-1">{data.label}</div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
          data.expanded 
            ? 'bg-indigo-600 text-white rotate-180' 
            : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
        }`}>
          <svg 
            className="w-4 h-4 transition-transform duration-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {data.description && (
        <div className="text-sm text-slate-600 mb-2">{data.description}</div>
      )}
      {data.expanded && data.subtopics && data.subtopics.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-300 space-y-3 expanded-content">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-1 w-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              {data.subtopics.length} {data.subtopics.length === 1 ? 'Subtopic' : 'Subtopics'}
            </div>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {data.subtopics.map((subtopic, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow duration-200 hover:border-indigo-300"
              >
                <div className="flex items-start gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-slate-900 mb-1">{subtopic.name}</div>
                    {subtopic.description && (
                      <div className="text-xs text-slate-600 mb-2 leading-relaxed">{subtopic.description}</div>
                    )}
                    {subtopic.resources && subtopic.resources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <div className="text-xs font-medium text-slate-500 mb-1.5">Resources:</div>
                        <div className="space-y-1">
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
                              className="text-xs text-indigo-600 font-medium block truncate hover:underline cursor-pointer hover:text-indigo-700 flex items-center gap-1.5 group"
                            >
                              <svg className="w-3 h-3 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <span>{resource.title}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!data.expanded && data.subtopics && data.subtopics.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="text-xs text-slate-500 italic flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Click to expand {data.subtopics.length} {data.subtopics.length === 1 ? 'subtopic' : 'subtopics'}
          </div>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

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
      className={`bg-white rounded-xl border-2 transition-all duration-300 ${
        selected ? 'border-purple-400 shadow-lg' : 'border-slate-200'
      } ${
        data.expanded ? 'shadow-md' : 'shadow-sm'
      } p-3 min-w-[180px] max-w-[320px] cursor-pointer expandable-node`}
      onClick={handleClick}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="font-semibold text-slate-900 text-sm flex-1">{data.label}</div>
        {data.resources && data.resources.length > 2 && (
          <div className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 ${
            data.expanded 
              ? 'bg-purple-600 text-white' 
              : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
          }`}>
            <svg 
              className="w-3 h-3 transition-transform duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>
      {data.description && (
        <div className={`text-xs text-slate-600 mb-2 transition-all duration-300 ${data.expanded ? '' : 'line-clamp-2'}`}>
          {data.description}
        </div>
      )}
      {data.resources && data.resources.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-200 pointer-events-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-slate-700">
              Resources {!showAllResources && data.resources.length > 2 ? `(${data.resources.length})` : `(${data.resources.length})`}:
            </div>
          </div>
          <div className={`space-y-1 ${data.expanded && data.resources.length > 2 ? 'expanded-content' : ''}`}>
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
                className="text-xs text-indigo-600 font-medium block truncate hover:underline cursor-pointer relative pointer-events-auto hover:text-indigo-700 flex items-center gap-1.5 group py-0.5"
                style={{ zIndex: 1000 }}
              >
                <svg className="w-3 h-3 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span>{resource.title}</span>
              </a>
            ))}
          </div>
          {!showAllResources && data.resources.length > 2 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (data.onExpand) {
                  data.onExpand();
                }
              }}
              className="text-xs text-purple-600 font-medium mt-2 hover:text-purple-700 flex items-center gap-1.5 group"
            >
              <svg className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>Show all {data.resources.length} resources</span>
            </button>
          )}
          {showAllResources && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (data.onExpand) {
                  data.onExpand();
                }
              }}
              className="text-xs text-purple-600 font-medium mt-2 hover:text-purple-700 flex items-center gap-1.5 group"
            >
              <svg className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>Show less</span>
            </button>
          )}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function TopicNode({ data }: { data: CustomNodeData }) {
  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl border-2 border-indigo-700 p-6 min-w-[250px] shadow-xl">
      <div className="font-bold text-white text-2xl">{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  topic: TopicNode,
  branch: BranchNode,
  subtopic: SubtopicNode,
};

function getNodeDimensions(type: string, expanded: boolean = false, data?: CustomNodeData): { width: number; height: number } {
  switch (type) {
    case 'topic':
      return { width: 350, height: 100 };
    case 'branch':
      if (expanded && data?.subtopics) {
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

function getLayoutedElements(nodes: Node[], edges: Edge[], direction: 'TB' | 'LR' = 'TB') {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ 
    rankdir: direction,
    nodesep: 100,
    ranksep: 150,
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
        console.log(`Collapsed node: ${nodeId}`);
      } else {
        newSet.add(nodeId);
        setSelectedNode(nodeId);
        console.log(`Expanded node: ${nodeId}`);
      }
      return newSet;
    });
  }, []);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const topicNodeId = 'topic';
    nodes.push({
      id: topicNodeId,
      type: 'topic',
      data: { label: roadmap.topic, isMain: true },
    });

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

      edges.push({
        id: `edge-${topicNodeId}-${branchNodeId}`,
        source: topicNodeId,
        target: branchNodeId,
        style: { stroke: '#6366f1', strokeWidth: 2 },
        animated: false,
      });

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

          edges.push({
            id: `edge-${branchNodeId}-${subtopicNodeId}`,
            source: branchNodeId,
            target: subtopicNodeId,
            style: { stroke: '#8b5cf6', strokeWidth: 2 },
            animated: false,
          });
        });
      }
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
    
    return { nodes: layoutedNodes, edges: layoutedEdges };
  }, [roadmap, expandedNodes, selectedNode, toggleNode]);

  const onNodesChange = useCallback(() => {}, []);
  const onEdgesChange = useCallback(() => {}, []);

  return (
    <div className="w-full h-[800px] bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl overflow-hidden">
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
        <Background color="#e2e8f0" gap={20} size={1} />
        <Controls 
          style={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'topic') return '#6366f1'; // indigo
            if (node.type === 'branch') return '#8b5cf6'; // purple
            return '#a78bfa'; // purple light
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
          style={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
      </ReactFlow>
    </div>
  );
}

