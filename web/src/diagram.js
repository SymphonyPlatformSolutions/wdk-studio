import React, { useEffect } from 'react';
import ReactFlow, {
    ConnectionLineType, useNodesState, useEdgesState, Controls, Background, MarkerType
} from 'reactflow';
import dagre from 'dagre';
import styled from 'styled-components';
import './diagram/style.css';
import { api } from './api';

const Root = styled.div`
    border: #8f959e 1px solid;
    height: 400px;
    background: #ffffff;
`;

const reactFlowStyle = {
    background: '#ffffff',
    width: '100%',
    height: 400,
};

var dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 50;
const position = { x: 0, y: 0 };
const edgeType = 'step';

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });
    nodes.forEach((node) => dagreGraph.setNode(node.id, {width: nodeWidth, height: nodeHeight }));
    edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));
    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = isHorizontal ? 'left' : 'top';
        node.sourcePosition = isHorizontal ? 'right' : 'bottom';

        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };
        return node;
    });
    return { nodes, edges };
};

const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements([], []);

const Diagram = ({ currentWorkflowId }) => {
    const [ nodes, setNodes, onNodesChange ] = useNodesState(layoutedNodes);
    const [ edges, setEdges, onEdgesChange ] = useEdgesState(layoutedEdges);

    useEffect(() => loadDefinition(), []);

    const loadDefinition = () => api.getWorkflowDefinition(currentWorkflowId, (data) => {
        const nodes = new Array();
        const edges = new Array();
        const regexType = /(.*)(_)/gm;

        data?.flowNodes?.map((element) => {
            const isEvent = element.group === "EVENT";
            nodes.push({
                id: element.nodeId,
                data: {
                    label: (<>{element.type}<br/><b>{element.nodeId.replace(regexType, '')}</b></>)
                },
                position,
                type: (element.parents?.length==0) ? 'input' : (element.children?.length==0) ? 'output' : 'default',
                nodeType: element.group,
                style: {
                    borderRadius: isEvent ? '50%' : '4px',
                    background: isEvent ? '#2ebf45' : '#ffffff',
                    color: isEvent ? '#ffffff' : '#2a2a2a',
                }
            });
            element.parents.map((edgeItem) => {
                edges.push({ id: Math.floor(Math.random() * 10000), source: edgeItem, target: element.nodeId, type: edgeType, animated: false, markerEnd: {type: MarkerType.Arrow, color: '#383838'}, style: {stroke: '#383838'} })
            });
        });
        setNodes(nodes);
        setEdges(edges);
        getLayoutedElements(nodes, edges);
    });

    return (
        <Root>
            <ReactFlow
                style={reactFlowStyle}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                connectionLineType={ConnectionLineType.SmoothStep}
                fitView
            >
                <Background variant={"lines"} gap={50} size={1} />
                <Controls />
            </ReactFlow>
        </Root>
    );
};

export default Diagram;
