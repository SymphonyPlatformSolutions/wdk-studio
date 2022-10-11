import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { addEdge, ConnectionLineType, useNodesState, useEdgesState, Controls, Background, MarkerType } from 'reactflow';
import dagre from 'dagre';
import styled from "styled-components";
import './diagram/style.css';
import {api} from "./api";

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

const NodeItem = styled.div`
    
`;


var dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 50;
const position = { x: 0, y: 0 };
const edgeType = 'step';

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, {width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = isHorizontal ? 'left' : 'top';
        node.sourcePosition = isHorizontal ? 'right' : 'bottom';

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes, edges };
};

const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements([], []);

const Diagram = ({ direction = 'TB', currentWorkflowId }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
    const [definition, setDefinition] = useState();

    useEffect(() => {
        loadDefinition();
    }, []);

    const loadDefinition = () => api.getWorkflowDefinition(currentWorkflowId, (data) => {
        const nodes = new Array();
        const edges = new Array();
        const regexName = /(_ACTIVITY)|(_EVENT)/gm;
        const regexType = /(.*)(_)/gm

        setDefinition(data);

        data?.flowNodes?.map((element, index) => {
            nodes.push( {
                id: element.nodeId,
                data: { label: (<><div>{element.type.replace(regexName, '')}</div><b>{element.nodeId.replace(regexType, '')}</b></>) },
                position,
                type: (element.parents?.length==0) ? 'input' : (element.children?.length==0) ? 'output' : 'default',
                nodeType: element.type.replace(regexType, ''),
                style: {
                    borderRadius: element.type.replace(regexType, '')=="EVENT" ? '50%' : '4px',
                    background: element.type.replace(regexType, '')=="EVENT" ? '#2ebf45' : '#ffffff',
                    color: element.type.replace(regexType, '')=="EVENT" ? '#ffffff' : '#2a2a2a',
                }
            });
            element.parents.map((edgeItem, j) => {
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