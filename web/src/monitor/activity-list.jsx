import { atoms } from '../core/atoms';
import { useRecoilState } from 'recoil';
import { DetailPlane, TableTitle, Table, Row } from './styles';
import {
    Button, Modal, ModalBody, ModalFooter, ModalTitle,
} from '@symphony-ui/uitoolkit-components/components';
import { useState, useEffect } from 'react';
import Spinner from '../core/spinner';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import a11yLight from 'react-syntax-highlighter/dist/esm/styles/hljs/a11y-light';
import a11yDark from 'react-syntax-highlighter/dist/esm/styles/hljs/a11y-dark';

SyntaxHighlighter.registerLanguage('json', json);

const ExpandActivityModal = ({ expandActivityModal, setExpandActivityModal, activityDetails }) => {
    const theme = useRecoilState(atoms.theme)[0];
    return (
        <Modal size="full-width" show={expandActivityModal.show}>
            <ModalTitle>Activity Payload</ModalTitle>
            <ModalBody>
                <SyntaxHighlighter
                    showLineNumbers
                    children={JSON.stringify(activityDetails, null, 2)}
                    language="json"
                    style={theme === 'light' ? a11yLight : a11yDark}
                    customStyle={{ height: 'calc(100vh - 17rem)' }}
                />
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
};

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

    const setSelected = (row, i) => {
        setSelectedRow(i);
        const filtered = activityData?.variables.filter(v => isNear(v.updateTime, row.endDate));
        setCurrentVariables(filtered[0] || activityData?.variables[0]);
    };

    const Content = () => (
        <>
            <Table>
                <thead>
                    <Row>
                        <th></th>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Inspect</th>
                    </Row>
                </thead>
                <tbody>
                    {activityData?.activities?.nodes?.map((row, i) => (
                        <Row key={i} selected={i === selectedRow} onClick={() => setSelected(row, i)}>
                            <td className="indicator"></td>
                            <td>{row.nodeId.replace(regexType, '')}</td>
                            <td>{row.type}</td>
                            <td>{(new Date(row.startDate)).toLocaleString()}</td>
                            <td>{row.endDate ? (new Date(row.endDate)).toLocaleString() : ""}</td>
                            <td>
                                <Button
                                    size="small"
                                    variant="secondary"
                                    onClick={() => showActivityDetails(row.outputs) }
                                >
                                    Inspect
                                </Button>
                            </td>
                        </Row>
                    ))}
                </tbody>
            </Table>
            <ExpandActivityModal {...{ expandActivityModal, setExpandActivityModal, activityDetails }} />
        </>
    );

    return (
        <DetailPlane>
            <TableTitle>Activities</TableTitle>
            { !activityData ? <Spinner /> : <Content /> }
        </DetailPlane>
    );
};
export default ActivityList;
