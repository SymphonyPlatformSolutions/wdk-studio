import { useEffect, useState } from 'react';
import {
    Button, Dropdown, Loader,
    Modal, ModalTitle, ModalBody, ModalFooter,
} from "@symphony-ui/uitoolkit-components/components";
import styled from "styled-components";
import Api from './api';

const Root = styled.div`
    display: grid;
    grid-template-columns: 4fr 1fr;
    align-items: flex-end;
    gap: .5rem;
`;

const WorkflowDropdown = ({ currentWorkflow, setCurrentWorkflow }) => {
    const [ workflows, setWorkflows ] = useState([]);

    useEffect(() => {
        Api('list-workflows', null, (res) => {
            const values = res.map(workflow => ({label: workflow, value: workflow}));
            setWorkflows(values);
            if (values.length > 0) {
                setCurrentWorkflow(values[0]);
            }
        });
    }, [ setCurrentWorkflow ]);

    return (
        <Dropdown
            blurInputOnSelect
            label="Select Workflow"
            options={workflows}
            onChange={(event) => setCurrentWorkflow(event.target.value)}
            value={currentWorkflow}
        />
    );
};

const WorkflowSelector = ({ currentWorkflow, setCurrentWorkflow }) => {
    const [ deleteModal, setDeleteModal ] = useState({ show: false });

    return (
        <Root>
            <WorkflowDropdown {...{ currentWorkflow, setCurrentWorkflow }} />
            <Button
                variant="secondary-destructive"
                onClick={() => setDeleteModal({ show: true })}
            >
                Delete Workflow
            </Button>
            <Modal size="small" show={deleteModal.show}>
                <ModalTitle>Confirm Delete</ModalTitle>
                <ModalBody>This will delete the workflow permanently. Are you sure?</ModalBody>
                <ModalFooter style={{ gap: '.5rem' }}>
                    <Button
                        variant="primary-destructive"
                        onClick={() => setDeleteModal({ show: true, loading: true })}
                        disabled={deleteModal.loading}
                    >
                        { deleteModal.loading ? <Loader /> : 'Delete' }
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => setDeleteModal({ show: false })}
                        disabled={deleteModal.loading}
                    >
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>
        </Root>
    );
};
export default WorkflowSelector;
