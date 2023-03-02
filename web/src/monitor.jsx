import { atoms } from './atoms';
import { useRecoilState } from 'recoil';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from './api';
import { Button, Modal, ModalBody, ModalFooter, ModalTitle } from "@symphony-ui/uitoolkit-components/components";

const InstanceMetricPanel = styled.div`
    display: flex;
    margin-top: 20px;
    margin-bottom: 20px;
    justify-content: center;
`;

const InstanceMetricItem = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border: 1px var(--tk-color-electricity-20) solid;
    padding: 3px;
    width: 150px;
    height: 80px;
    margin: 2px;
    text-align: center;
    &:last-child {
        border: 1px var(--tk-color-error) solid;
        color: var(--tk-color-error);
    }
`;

const InstanceMetricItemTitle = styled.div`
    font-weight: 300;
`;

const InstanceMetricItemNumber = styled.div`
    font-weight: 300;
    font-size: 2rem;
`;

const TableTitle = styled.div`
    font-weight: 400;
    background: var(--tk-table-hover-color);
    padding: 4px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    & > div:last-child {
      cursor: pointer;
    }
`;

const Table = styled.div`
    height: calc((100vh - 24em) / 3);
    padding: .4rem;
    margin-bottom: .4rem;

    table {
        border-collapse: collapse;
        display: flex;
        flex-flow: column;
        height: 100%;
        width: 100%;

        thead {
            flex: 0 0 auto;
            width: calc(100% - 0.9em);
            th { text-align: left; font-weight: 400 }
        }
        tbody {
            flex: 1 1 auto;
            display: block;
            overflow-y: scroll;
            td { color: var(tk-text-color); font-weight: 300 }
        }
        tbody tr {
            width: 100%;
            &:hover {
                color: #fff !important;
                background: var(--tk-color-electricity-50) !important;
            }
        }
        thead, tbody tr {
            display: table;
            table-layout: fixed;
            th:last-child, td:last-child { padding-right: 1rem }
        }
        .icon { width: 1rem; text-align: center }
        .date { width: 12rem }
        .selectable:hover { cursor: pointer }
        .autosizable { width: auto }
        .identifier { width: 8rem }
    }

`;

const ActivityDetail = styled.div`
    border: 1px solid #808080;
    max-height: calc(100vh - 220px);
    overflow-y: auto;
    overflow-x: auto;
    background: #000000;
    font-size: 12px;
    color: #4caf50;
`;

const InstanceMetrics = ({instances}) => {
    const activeInstances = instances.filter(function (element, index, array) {
        return (element.status === 'PENDING');
    })
    const completedInstances = instances.filter(function (element, index, array) {
        return (element.status === 'COMPLETED');
    })
    return (
        <InstanceMetricPanel>
            <InstanceMetricItem>
                <InstanceMetricItemTitle>Total</InstanceMetricItemTitle>
                <InstanceMetricItemNumber>{instances.length}</InstanceMetricItemNumber>
            </InstanceMetricItem>
            <InstanceMetricItem>
                <InstanceMetricItemTitle>Pending</InstanceMetricItemTitle>
                <InstanceMetricItemNumber>{activeInstances.length}</InstanceMetricItemNumber>
            </InstanceMetricItem>
            <InstanceMetricItem>
                <InstanceMetricItemTitle>Completed</InstanceMetricItemTitle>
                <InstanceMetricItemNumber>{completedInstances.length}</InstanceMetricItemNumber>
            </InstanceMetricItem>
            <InstanceMetricItem>
                <InstanceMetricItemTitle>Failed</InstanceMetricItemTitle>
                <InstanceMetricItemNumber>0</InstanceMetricItemNumber>
            </InstanceMetricItem>
        </InstanceMetricPanel>
    )
}

const ActivityList = ({ activityData, setExpandActivityModal, setActivityDetails }) => {
    const [ currentVariables, setCurrentVariables ] = useState();
    const regexType = /(.*)(_)/gm;

    useEffect(() => {
        setCurrentVariables(activityData?.variables[activityData.variables.length - 1]);
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

    return (
        <>
            <TableTitle>Activities</TableTitle>
            <Table>
                <table>
                    <thead>
                        <tr>
                            <th className="identifier">ID</th>
                            <th className="date">Type</th>
                            <th className="date">Start</th>
                            <th className="date">End</th>
                            <th className="autosizable"></th>
                        </tr>
                    </thead>
                    <tbody>
                    {activityData?.activities?.nodes?.map((row, i) => (
                        <tr key={i} className="selectable" onClick={() => loadVariables(row.endDate)}>
                            <td className="identifier">{row.nodeId.replace(regexType, '')}</td>
                            <td className="date">{row.type}</td>
                            <td className="date">{(new Date(row.startDate)).toLocaleString()}</td>
                            <td className="date">{(new Date(row.endDate)).toLocaleString()}</td>
                            <td className="autosizable" onClick={() => showActivityDetails(row.outputs) }>...</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </Table>

            <TableTitle>
                Variables
            </TableTitle>
            <Table>
                <table>
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Value</th>
                        <th className="date">Updated</th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentVariables && Object.keys(currentVariables.outputs).map((key, i) => (
                        <tr key={i}>
                            <td>{key}</td>
                            <td>{currentVariables.outputs[key]}</td>
                            <td className="date">{(new Date(currentVariables.updateTime)).toLocaleString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </Table>
        </>
    );
};

const ExpandActivityModal = ({ expandActivityModal, setExpandActivityModal, activityDetails }) => {

    return (
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
};

const Monitor = () => {
    const currentWorkflow = useRecoilState(atoms.currentWorkflow)[0];
    const setSelectedInstance = useRecoilState(atoms.selectedInstance)[1];
    const [ instances, setInstances ] = useState([]);
    const [ selectedInstanceId, setSelectedInstanceId ] = useState();
    const [ activityData, setActivityData ] = useState();
    const [ activityDetails, setActivityDetails ] = useState();
    const [ expandActivityModal, setExpandActivityModal ] = useState({ show: false });
    const { getInstanceData, listWorkflowInstances } = api();

    const loadInstances = () => listWorkflowInstances(currentWorkflow.value, (r) => setInstances(r.reverse()));

    useEffect(() => loadInstances(), []);

    useEffect(() => {
        if (selectedInstanceId) {
            getInstanceData(currentWorkflow.value, selectedInstanceId, (r) => setActivityData(r));
        }
    }, [ selectedInstanceId ]);

    const Instances = () => {
        const getInstanceActivities = (row) => {
            setSelectedInstanceId(row.instanceId);
            setSelectedInstance(row);
        }

        const InstanceList = () => {
            const formatDuration = (duration) => duration?.toString()
                .substring(2)
                .replaceAll(/([\d\.]+)(\w)/g, "$1$2 ")
                .replaceAll(/([\d]+)\.(\d)([\d]+)/g, "$1.$2")
                .toLowerCase();

            const getStyle = (instanceId, status) => {
                const style = {  };

                if (status === 'PENDING') {
                    style.color = 'var(--tk-color-green-30)';
                }
                if (instanceId === selectedInstanceId) {
                    style.background = 'var(--tk-color-electricity-40)';
                    style.color = '#fff';
                }
                return style;
            };

            return (
                <>
                    <TableTitle>
                        <div>Instances</div>
                        <div onClick={loadInstances}>&#8634;</div>
                    </TableTitle>
                    <Table>
                        <table>
                            <thead>
                                <tr>
                                    <th className="icon"></th>
                                    <th className="date">Start</th>
                                    <th className="date">End</th>
                                    <th className="date">Duration</th>
                                    <th className="autosizable">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {instances.map((row, i) => (
                                    <tr key={i} className="selectable" style={getStyle(row.instanceId, row.status)} onClick={() => getInstanceActivities(row)}>
                                        <td className="icon">{row.instanceId===selectedInstanceId ? '>' : ''}</td>
                                        <td className="date">{(new Date(row.startDate)).toLocaleString()}</td>
                                        <td className="date">{row.endDate? (new Date(row.endDate)).toLocaleString() : 'Running...'}</td>
                                        <td className="date">{formatDuration(row.duration)}</td>
                                        <td className="autosizable">{row.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Table>
                </>
            )
        };
        return (!instances || instances.length === 0) ? 'No instances yet' : <InstanceList/>;
    };

    return (
        <div className="tk-text-color">
            <InstanceMetrics {...{ instances }} />
            <Instances />
            <ActivityList {...{ activityData, setExpandActivityModal, setActivityDetails }} />
            <ExpandActivityModal {...{ expandActivityModal, setExpandActivityModal, activityDetails }} />
        </div>
    )
};
export default Monitor;
