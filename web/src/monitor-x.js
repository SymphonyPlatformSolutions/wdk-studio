import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { api } from './api';
import Prism from 'prismjs';
import 'prismjs/themes/prism.min.css';
import {Button, Loader, Modal, ModalBody, ModalFooter, ModalTitle} from "@symphony-ui/uitoolkit-components/components";

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
        border: 1px var(--tk-label-required-color) solid;
        color: var(--tk-label-required-color);
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

const Table = styled.table`
    width: 100%;
    padding: 10px;
    margin-bottom: 20px;
    table-layout: fixed;
    border-collapse: collapse;
    & > thead > tr {
        display:block;
    };
    & > thead > tr > th {
        text-align: left;
        color: #ffffff;
        font-weight: 400;
    };
    & > tbody {
        display:block;
        overflow:auto;
        height: calc((100vh/3) - 145px);
        width:100%;
        border-bottom: 1px solid var(--tk-table-hover-color);
    };
    & > tbody > tr:hover {
        background: #41c3ff !important;
        cursor: pointer;
    };
    & > tbody > tr > td {
        font-weight: 300;
    };
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

const InstanceList = ({data, loadInstances, selectedInstanceId, callback}) => {

    const formatDuration = (duration) => {
        return duration?.toString()
            .substring(2)
            .replaceAll("(\\d[HMS])(?!$)", "$1 ")
            .toLowerCase();
    };

    return (
        <>
            <TableTitle>
                <div>Instances</div>
                <div onClick={() => loadInstances()}>&#8634;</div>
            </TableTitle>
            <Table>
                <thead>
                    <tr>
                        <th style={{width: '20px'}}></th>
                        <th style={{width: '200px'}}>Start</th>
                        <th style={{width: '200px'}}>End</th>
                        <th style={{width: '100px'}}>Duration</th>
                        <th style={{width: '150px'}}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr style={{background: row.instanceId===selectedInstanceId ? '#808080' : '', color: row.status==='PENDING' ? 'var(--tk-color-green-30)' : '#ffffff'}} onClick={() => callback(row)}>
                            <td style={{width: '20px', textAlign: 'center'}}>{row.instanceId===selectedInstanceId ? '>' : ''}</td>
                            <td style={{width: '200px'}}>{(new Date(row.startDate)).toLocaleString()}</td>
                            <td style={{width: '200px'}}>{row.endDate? (new Date(row.endDate)).toLocaleString() : 'running...'}</td>
                            <td style={{width: '100px'}}>{formatDuration(row.duration)}</td>
                            <td style={{width: '150px'}}>{row.status}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    )
};

const ActivityList = ({ activities, setExpandActivityModal, setActivityDetails }) => {
    const showActivityDetails = (outputs) => {
        setActivityDetails(outputs);
        setExpandActivityModal({show: true});
    };

    return (
        <>
            <TableTitle>Activities</TableTitle>
            <Table>
                <thead>
                    <tr>
                        <th style={{width: '110px'}}>Id</th>
                        <th style={{width: '200px'}}>Type</th>
                        <th style={{width: '200px'}}>Start</th>
                        <th style={{width: '200px'}}>End</th>
                        <th style={{width: '50px'}}></th>
                    </tr>
                </thead>
                <tbody>
                {activities.activities.map((row, i) => (
                    <tr>
                        <td style={{width: '110px', maxWidth: '110px'}}>{row.activityId}</td>
                        <td style={{width: '200px'}}>{row.type?.substr(0, row.type.length-9)}</td>
                        <td style={{width: '200px'}}>{(new Date(row.startDate)).toLocaleString()}</td>
                        <td style={{width: '200px'}}>{(new Date(row.endDate)).toLocaleString()}</td>
                        <td style={{width: '50px'}} onClick={() => showActivityDetails(row.outputs) }>...</td>
                    </tr>
                ))}
                </tbody>
            </Table>
            { activities.globalVariables && (
                <>
                    <TableTitle>Variables</TableTitle>
                    <Table>
                        <thead>
                        <tr>
                            <th style={{width: '200px'}}>Name</th>
                            <th style={{width: '200px'}}>Value</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Object.keys(activities.globalVariables.outputs).map((key, i) => (
                            <tr>
                                <td style={{width: '200px', maxWidth: '200px'}}>{key}</td>
                                <td style={{width: '200px', maxWidth: '200px'}}>{activities.globalVariables.outputs[key]}</td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </>
            ) }
        </>
    );
};

const Instances = ({ instances, loadInstances, selectedInstanceId, setSelectedInstanceId, setActivities }) => {
    const getInstanceActivities = ({ id, instanceId }) => {
        setSelectedInstanceId( instanceId );
        api.listInstanceActivities(id, instanceId, (r) => setActivities(r));
    };
    return (!instances || instances.length === 0) ? 'No instances yet' : (<InstanceList {...{ data: instances, loadInstances, selectedInstanceId, callback: getInstanceActivities }} />);
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

const MonitorX = ({ currentWorkflowId }) => {
    const [ instances, setInstances ] = useState([]);
    const [ selectedInstanceId, setSelectedInstanceId ] = useState();
    const [ activities, setActivities ] = useState();
    const [ activityDetails, setActivityDetails ] = useState();
    const [ expandActivityModal, setExpandActivityModal ] = useState({ show: false });

    useEffect(() => {
        loadInstances();
    }, []);

    const loadInstances = () => {
        api.listWorkflowInstances(currentWorkflowId, (r) => setInstances(r.reverse()));
        if (selectedInstanceId) {
            api.listInstanceActivities(currentWorkflowId, selectedInstanceId, (r) => setActivities(r));
        }
    }

    return (
        <div className="tk-text-color">
            <InstanceMetrics {...{ instances }} />
            <Instances {...{ instances, loadInstances, selectedInstanceId, setSelectedInstanceId, setActivities }} />
            { activities && <ActivityList {...{ activities, setExpandActivityModal, setActivityDetails }} /> }
            <ExpandActivityModal {...{ expandActivityModal, setExpandActivityModal, activityDetails }} />
        </div>
    )
};
export default MonitorX;
