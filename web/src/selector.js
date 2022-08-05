import { useEffect, useState, useRef } from 'react';
import {
    Button, Dropdown, Loader, TextField,
    Modal, ModalTitle, ModalBody, ModalFooter,
} from "@symphony-ui/uitoolkit-components/components";
import styled from "styled-components";
import Api from './api';

const Root = styled.div`
    display: grid;
    grid-template-columns: 4fr 0.5fr;
    align-items: flex-end;
    gap: .5rem;
`;

const CreateModal = ({ createModal, setCreateModal, setToast, setWorkflows, setCurrentWorkflow }) => {
    const [ newName, setNewName ] = useState('');

    const showToast = (msg, error = 'false') => {
        setToast({ show: true, content: msg, error });
        setTimeout(() => {
            setToast({ show: false });
        }, 2000);
        setCreateModal((old) => ({ ...old, loading: false }));
    };

    const createWorkflow = () => {
        if (newName.indexOf(' ') > -1) {
            showToast(`Workflow name cannot contain spaces`, 'true');
            return;
        }
        setCreateModal({ show: true, loading: true });
        Api('add-workflow', { workflow: newName }, (res) => {
            showToast('New workflow added', 'false');
            setCreateModal({ show: false });
            const newWorkflow = { label: res.workflow, value: res.workflow };
            setWorkflows((old) => ([
                ...old.slice(0, -1),
                newWorkflow
            ]));
            setCurrentWorkflow(newWorkflow);
        }, () => {
            showToast(`Workflow named ${newName} already exists`, 'true');
        });
    };

    const nameRef = useRef();
    useEffect(() => {
        if (nameRef.current) {
            nameRef?.current?.focus();
        }
    }, [ createModal?.show ]);

    return (
        <Modal size="small" show={createModal.show}>
            <ModalTitle>Create Workflow</ModalTitle>
            <ModalBody>
                <TextField
                    ref={nameRef}
                    label="Name"
                    placeholder="some-process-abc"
                    value={newName}
                    disabled={createModal.loading}
                    onChange={({ target }) => setNewName(target.value)}
                />
            </ModalBody>
            <ModalFooter style={{ gap: '.5rem' }}>
                <Button
                    onClick={createWorkflow}
                    disabled={createModal.loading}
                >
                    { createModal.loading ? <Loader /> : 'Create' }
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => setCreateModal({ show: false })}
                    disabled={createModal.loading}
                >
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};

const WorkflowDropdown = ({ currentWorkflow, setCurrentWorkflow, setToast, refreshDate }) => {
    const [ workflows, setWorkflows ] = useState([]);

    useEffect(() => {
        Api('list-workflows', null, (res) => {
            const values = res.map(workflow => ({ label: workflow, value: workflow }));
            setWorkflows([
                ...values
            ]);
        });
    }, [ setCurrentWorkflow, refreshDate ]);

    useEffect(() => {
        if (workflows.length > 1) {
            setCurrentWorkflow(workflows[0]);
        }
    }, [ workflows, setCurrentWorkflow ]);

    const handleChange = ({ target }) => {
        setCurrentWorkflow(target.value);
    };

    return (
        <>
            <Dropdown
                blurInputOnSelect
                label="Select Workflow"
                options={workflows}
                onChange={handleChange}
                value={currentWorkflow}
            />
        </>
    );
};

const WorkflowSelector = ({ currentWorkflow, setCurrentWorkflow, setToast }) => {
    const [ refreshDate, setRefreshDate ] = useState(new Date());
    const [ workflows, setWorkflows ] = useState([]);
    const [ createModal, setCreateModal ] = useState({ show: false });

    return (
        <Root>
            <WorkflowDropdown {...{ currentWorkflow, setCurrentWorkflow, setToast, refreshDate }} />
            <Button
                variant="primary"
                onClick={() => setCreateModal({ show: true })}
            >
                <i className="fa-solid fa-plus"></i> Workflow
            </Button>
            <CreateModal {...{ createModal, setCreateModal, setToast, setWorkflows, setCurrentWorkflow }} />
        </Root>
    );
};
export default WorkflowSelector;
