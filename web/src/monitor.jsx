import { atoms } from './core/atoms';
import { useRecoilState } from 'recoil';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from './core/api';
import {
    Button, Modal, ModalBody, ModalFooter, ModalTitle,
} from '@symphony-ui/uitoolkit-components/components';

const MonitorRoot = styled.div`
    flex: 1 1 1px;
    display: flex;
    flex-direction: column;
`;

const TriPlane = styled.div`
    flex: 1 1 1px;
    overflow: auto;
    display: grid;
    grid-template-rows: repeat(3, 1fr);
    gap: .5rem;
`;

const DetailPlane = styled.div`
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
`;

const InstanceMetricPanel = styled.div`
    padding: 1rem 3rem;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
`;

const InstanceMetricItem = styled.div`
    border: 1px var(--tk-color-electricity-20) solid;
    border-radius: .3rem;
    padding: .5rem;
    text-align: center;

    &:last-child {
        border: 1px var(--tk-color-error, #ee3d3d) solid;
        color: var(--tk-color-error, #ee3d3d);
    }
`;

const InstanceMetricItemTitle = styled.div`
    font-weight: 600;
    margin-bottom: .8rem;
`;

const InstanceMetricItemNumber = styled.div`
    font-weight: 300;
    font-size: 2rem;
`;

const TableTitle = styled.h3`
    position: fixed;
    width: calc(100vw - 2.6rem);
    font-weight: 800;
    background: var(--tk-table-hover-color, #cfd0d2);
    padding: .3rem;
    margin: 0;
    display: flex;
    justify-content: space-between;
    & > div:last-child {
      cursor: pointer;
    }
`;

const Table = styled.table`
    font-weight: 300;
    border-collapse: collapse;
    margin-top: 2rem;
    align-self: flex-start;

    th { text-align: left }
    th, td {
        white-space: nowrap;
        padding-right: 1.5rem;
        max-width: 50vw;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    tbody tr:hover {
        cursor: pointer;
        color: #fff;
        background: var(--tk-color-electricity-50);
    }
`;

const ActivityDetail = styled.div`
    border: 1px solid #808080;
    overflow-y: auto;
    overflow-x: auto;
    background: #000000;
    font-size: 12px;
    color: #4caf50;
`;

const InstanceMetrics = ({ instances }) => {
    const statuses = [ 'Pending', 'Completed', 'Failed' ];
    const countInstances = (status) => instances.filter((i) => i.status === status.toUpperCase()).length;
    return (
        <InstanceMetricPanel>
            <InstanceMetricItem>
                <InstanceMetricItemTitle>Total</InstanceMetricItemTitle>
                <InstanceMetricItemNumber>{instances.length}</InstanceMetricItemNumber>
            </InstanceMetricItem>
            { statuses.map((status) => (
                <InstanceMetricItem key={status}>
                    <InstanceMetricItemTitle>{status}</InstanceMetricItemTitle>
                    <InstanceMetricItemNumber>{countInstances(status)}</InstanceMetricItemNumber>
                </InstanceMetricItem>
            ))}
        </InstanceMetricPanel>
    );
};

const ActivityList = ({ activityData, setExpandActivityModal, setActivityDetails }) => {
    const [ currentVariables, setCurrentVariables ] = useState();
    const regexType = /(.*)(_)/gm;

    useEffect(() => {
        setCurrentVariables(activityData?.variables.pop());
    }, [ activityData ]);

    const showActivityDetails = (outputs) => {
        setActivityDetails(outputs);
        setExpandActivityModal({show: true});
    };

    const isNear = (targetDate, endDate) => {
        const diff = new Date(targetDate).getTime() - new Date(endDate).getTime();
        return diff > 0 && diff < 20;
    };

    const loadVariables = (endDate) => {
        const filtered = activityData?.variables.filter(v => isNear(v.updateTime, endDate));
        setCurrentVariables(filtered[0] || activityData?.variables[0]);
    };

    const formatVariable = (variable) => {
        if (typeof variable === 'object') {
            // console.log(JSON.stringify(variable)); // todo pop dialog
        }
        return variable.toString();
    }

    return (
        <>
            <DetailPlane>
                <TableTitle>Activities</TableTitle>
                <Table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Type</th>
                            <th>Start</th>
                            <th>End</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {activityData?.activities?.nodes?.map((row, i) => (
                            <tr key={i} onClick={() => loadVariables(row.endDate)}>
                                <td>{row.nodeId.replace(regexType, '')}</td>
                                <td>{row.type}</td>
                                <td>{(new Date(row.startDate)).toLocaleString()}</td>
                                <td>{(new Date(row.endDate)).toLocaleString()}</td>
                                <td onClick={() => showActivityDetails(row.outputs) }>...</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </DetailPlane>
            <DetailPlane>
                <TableTitle>Variables</TableTitle>
                <Table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Value</th>
                            <th>Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentVariables && Object.keys(currentVariables.outputs).map((key, i) => (
                            <tr key={i}>
                                <td>{key}</td>
                                <td>{formatVariable(currentVariables.outputs[key])}</td>
                                <td>{(new Date(currentVariables.updateTime)).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </DetailPlane>
        </>
    );
};

const ExpandActivityModal = ({ expandActivityModal, setExpandActivityModal, activityDetails }) => (
    <Modal size="large" show={expandActivityModal.show}>
        <ModalTitle>Activity Payload</ModalTitle>
        <ModalBody>
            <ActivityDetail>
                <pre>
                    <code>
                        {JSON.stringify(activityDetails, null, 2)}
                    </code>
                </pre>
            </ActivityDetail>
        </ModalBody>
        <ModalFooter style={{ gap: '.5rem' }}>
            <Button
                variant="secondary"
                onClick={() => setExpandActivityModal({ show: false })}
                disabled={expandActivityModal.loading}
            >
                Close
            </Button>
        </ModalFooter>
    </Modal>
);

const Monitor = () => {
    const currentWorkflow = useRecoilState(atoms.currentWorkflow)[0];
    const [ selectedInstance, setSelectedInstance ] = useRecoilState(atoms.selectedInstance);
    const [ instances, setInstances ] = useState([]);
    const [ activityData, setActivityData ] = useState();
    const [ activityDetails, setActivityDetails ] = useState();
    const [ expandActivityModal, setExpandActivityModal ] = useState({ show: false });
    const { getInstanceData, listWorkflowInstances } = api();

    const loadInstances = () => listWorkflowInstances(currentWorkflow.value, (r) => setInstances(r.reverse()));

    useEffect(() => loadInstances(), []);

    useEffect(() => {
        if (selectedInstance) {
            getInstanceData(currentWorkflow.value, selectedInstance.instanceId, (r) => setActivityData(r));
        }
    }, [ selectedInstance ]);

    const Instances = () => {
        const InstanceList = () => {
            const formatDuration = (duration) => duration?.toString()
                .substring(2)
                .replaceAll(/([\d\.]+)(\w)/g, "$1$2 ")
                .replaceAll(/([\d]+)\.(\d)([\d]+)/g, "$1.$2")
                .toLowerCase();

            const getStyle = (instanceId, status) => {
                const style = {};

                if (status === 'PENDING') {
                    style.color = 'var(--tk-color-green-30)';
                } else if (status === 'FAILED') {
                    style.color = 'var(--tk-color-error, #ee3d3d)';
                }
                if (instanceId === selectedInstance?.instanceId) {
                    style.background = 'var(--tk-color-electricity-40)';
                    style.color = '#fff';
                }
                return style;
            };

            return (
                <DetailPlane>
                    <TableTitle>
                        <div>Instances</div>
                        <div onClick={loadInstances}>&#8634;</div>
                    </TableTitle>
                    <Table>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Duration</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {instances.map((row, i) => (
                                <tr key={i} className="selectable" style={getStyle(row.instanceId, row.status)} onClick={() => setSelectedInstance(row)}>
                                    <td>{row.instanceId===selectedInstance?.instanceId ? '>' : ' '}</td>
                                    <td>{(new Date(row.startDate)).toLocaleString()}</td>
                                    <td>{row.endDate? (new Date(row.endDate)).toLocaleString() : 'Running...'}</td>
                                    <td>{formatDuration(row.duration)}</td>
                                    <td>{row.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </DetailPlane>
            )
        };
        return (!instances || instances.length === 0) ? 'No instances yet' : <InstanceList/>;
    };

    return (
        <MonitorRoot className="tk-text-color">
            <InstanceMetrics {...{ instances }} />
            <TriPlane>
                <Instances />
                <ActivityList {...{ activityData, setExpandActivityModal, setActivityDetails }} />
                <ExpandActivityModal {...{ expandActivityModal, setExpandActivityModal, activityDetails }} />
            </TriPlane>
        </MonitorRoot>
    )
};
export default Monitor;
