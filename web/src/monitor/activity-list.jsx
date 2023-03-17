import styled from 'styled-components';
import { DetailPlane, TableTitle, Table, Row } from './styles';
import {
    Button, Modal, ModalBody, ModalFooter, ModalTitle,
} from '@symphony-ui/uitoolkit-components/components';
import { useState, useEffect } from 'react';

const ActivityDetail = styled.div`
    border: 1px solid #808080;
    overflow-y: auto;
    overflow-x: auto;
    background: #000000;
    font-size: 12px;
    color: #4caf50;
`;

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
        <ModalFooter>
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

const ActivityList = ({ activityData, setCurrentVariables }) => {
    const [ activityDetails, setActivityDetails ] = useState();
    const [ selectedRow, setSelectedRow ] = useState();
    const [ expandActivityModal, setExpandActivityModal ] = useState({ show: false });
    const regexType = /(.*)(_)/gm;

    useEffect(() => setSelectedRow(undefined), [ activityData ]);

    const showActivityDetails = (outputs) => {
        setActivityDetails(outputs);
        setExpandActivityModal({show: true});
    };

    const isNear = (targetDate, endDate) => {
        const diff = new Date(targetDate).getTime() - new Date(endDate).getTime();
        return diff > 0 && diff < 20;
    };

    const setSelected = (row) => {
        setSelectedRow(row.nodeId);
        const filtered = activityData?.variables.filter(v => isNear(v.updateTime, row.endDate));
        setCurrentVariables(filtered[0] || activityData?.variables[0]);
    };

    return (
        <DetailPlane>
            <TableTitle>Activities</TableTitle>
            <Table>
                <thead>
                    <Row>
                        <th></th>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Start</th>
                        <th>End</th>
                        <th></th>
                    </Row>
                </thead>
                <tbody>
                    {activityData?.activities?.nodes?.map((row, i) => (
                        <Row key={i} selected={row.nodeId === selectedRow} onClick={() => setSelected(row)}>
                            <td className="indicator"></td>
                            <td>{row.nodeId.replace(regexType, '')}</td>
                            <td>{row.type}</td>
                            <td>{(new Date(row.startDate)).toLocaleString()}</td>
                            <td>{row.endDate ? (new Date(row.endDate)).toLocaleString() : ""}</td>
                            <td onClick={() => showActivityDetails(row.outputs) }>...</td>
                        </Row>
                    ))}
                </tbody>
            </Table>
            <ExpandActivityModal {...{ expandActivityModal, setExpandActivityModal, activityDetails }} />
        </DetailPlane>
    );
};
export default ActivityList;
