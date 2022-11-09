import React, { useEffect, useState } from 'react';
import ReactFlow, {
    ConnectionLineType, useNodesState, useEdgesState, Controls, Background, MarkerType, applyEdgeChanges
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
const nodeHeight = 60;
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

const Diagram = ({ currentWorkflowId, selectedInstance }) => {
    const [ nodes, setNodes, onNodesChange ] = useNodesState(layoutedNodes);
    const [ edges, setEdges, onEdgesChange ] = useEdgesState(layoutedEdges);
    const [ activityData, setActivityData ] = useState();

    useEffect(() => {
        setNodes([]);
        setEdges([]);
        loadDefinition();
    }, []);

    useEffect(() => {
        if (selectedInstance) {
            api.getInstanceData(selectedInstance.id, selectedInstance.instanceId, (r) => setActivityData(r));
        }
    }, [ selectedInstance ]);

    useEffect( () => {
        setNodes((nds) => {
            const edgeChanges = new Array();
            nds.map((node) => {
                const isNodeid = (currentNode) => {
                    return currentNode.nodeId == node.id;
                };
                const existingActivity = activityData.activities.nodes.find(isNodeid);
                if (existingActivity) {
                    edges.map((edg) => {
                        const isGateway = nodes.find(({ id, nodeType }) => id === edg.target && nodeType === 'GATEWAY');
                        if (edg.target == node.id || (edg.source == node.id && isGateway)) {
                            const endDate = new Date(existingActivity.endDate);
                            edg.animated = true;
                            edg.style = { stroke: '#03900b' };
                            edg.label = endDate.getHours() + ':' + endDate.getMinutes() + ':' + endDate.getSeconds();
                            edgeChanges.push({item: edg, type: 'reset'});
                        }
                    });
                } else if (node.nodeType !== 'GATEWAY') {
                    edges.map((edg) => {
                        const isTargetGateway = nodes.find(({ id, nodeType }) => id === edg.target && nodeType === 'GATEWAY');
                        if (edg.target == node.id || (edg.source == node.id && isTargetGateway )) {
                            edgeChanges.push({item: edg, type: 'reset'});
                        }
                    });
                }
                return node;
            })
            setEdges((edgs) => applyEdgeChanges(edgeChanges, edgs));
        });
    }, [activityData, setNodes]);

    const loadDefinition = () => api.getWorkflowDefinition(currentWorkflowId, (data) => {
        const nodes = new Array();
        const edges = new Array();
        const regexType = /(.*)(_)/gm;

        data?.flowNodes?.map((element) => {
            const isEvent = element.group === "EVENT";
            const isGateway = element.group === "GATEWAY";

            nodes.push({
                id: element.nodeId,
                data: {
                    label: (
                        <>
                            {isGateway
                                ? <div className={'react-flow__node-title-gateway'}>
                                    <img src={'./gateway_icon.png'} style={{width: '18px'}} />
                                </div>
                                : <span>
                                    <div className={'react-flow__node-title'} style={{background: isEvent ? '#4bd19b' : '#0098ff'}}>
                                        <img src={(element.group=='EVENT') ? './event_icon.png' : './activity_icon.png'} style={{float: 'left', marginLeft: '4px', marginTop: '-4px', width: '12px'}} />
                                        <div style={{margin: '0 auto'}}>{element.type}</div>
                                    </div>
                                </span>
                            }
                            {!isGateway &&
                                <div className={'react-flow__node-content'}>
                                    {element.nodeId.replace(regexType, '')}
                                </div>
                            }
                        </>
                    )
                },
                position,
                type: (element.parents?.length==0) ? 'input' : (element.children?.length==0) ? 'output' : 'default',
                nodeType: element.group,
                style: {
                    border: isGateway ? '0px' : 'inherit',
                    boxShadow: isGateway ? 'inherit' : '0px'
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
                elementsSelectable={false}
                nodesConnectable={false}
                nodesDraggable={true}
                panOnDrag={true}
                minZoom={0.3}
                fitView
            >
                <Background variant={"lines"} gap={50} size={1} />
            </ReactFlow>
        </Root>
    );
};

export default Diagram;
