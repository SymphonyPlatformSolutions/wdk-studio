import { useEffect, useState, useRef } from 'react';
import {
    Button, Dropdown, Loader, TextField,
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
                newWorkflow,
                { label: 'Create New Workflow', value: 'create' }
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

const WorkflowDropdown = ({ currentWorkflow, setCurrentWorkflow, setToast }) => {
    const [ workflows, setWorkflows ] = useState([]);
    const [ createModal, setCreateModal ] = useState({ show: false });

    useEffect(() => {
        Api('list-workflows', null, (res) => {
            const values = res.map(workflow => ({ label: workflow, value: workflow }));
            setWorkflows([
                ...values,
                { label: 'Create New Workflow', value: 'create' }
            ]);
            if (values.length > 1) {
                setCurrentWorkflow(values[0]);
            }
        });
    }, [ setCurrentWorkflow ]);

    const handleChange = ({ target }) => {
        if (target.value.value === 'create') {
            setCreateModal({ show: true });
        } else {
            setCurrentWorkflow(target.value);
        }
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
            <CreateModal {...{ createModal, setCreateModal, setToast, setWorkflows, setCurrentWorkflow }} />
        </>
    );
};

const ConfirmDeleteModal = ({ deleteModal, setDeleteModal }) => {
    const deleteWorkflow = () => {
        setDeleteModal({ show: true, loading: true });
    };

    return (
        <Modal size="small" show={deleteModal.show}>
            <ModalTitle>Confirm Delete</ModalTitle>
            <ModalBody>This will delete the workflow permanently. Are you sure?</ModalBody>
            <ModalFooter style={{ gap: '.5rem' }}>
                <Button
                    variant="primary-destructive"
                    onClick={deleteWorkflow}
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
    );
};

const WorkflowSelector = ({ currentWorkflow, setCurrentWorkflow, setToast }) => {
    const [ deleteModal, setDeleteModal ] = useState({ show: false });

    return (
        <Root>
            <WorkflowDropdown {...{ currentWorkflow, setCurrentWorkflow, setToast }} />
            <Button
                variant="secondary-destructive"
                onClick={() => setDeleteModal({ show: true })}
            >
                Delete Workflow
            </Button>
            <ConfirmDeleteModal {...{ deleteModal, setDeleteModal, currentWorkflow }} />
        </Root>
    );
};
export default WorkflowSelector;
