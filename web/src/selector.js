import { useEffect, useState, useRef } from 'react';
import {
    Button, Dropdown, Loader, TextField, Icon,
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

const CreateModal = ({ createModal, setCreateModal, setToast, setWorkflows }) => {
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
            setWorkflows((old) => ([ ...old, newWorkflow ].sort((a, b) => (a.value > b.value) ? 1 : ((b.value > a.value) ? -1 : 0))));
        }, ({ message }) => {
            showToast(message, 'true');
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

const WorkflowDropdown = ({ currentWorkflow, setCurrentWorkflow, workflows, setWorkflows, isContentChanged, setIsContentChanged }) => {
    useEffect(() => {
        Api('list-workflows', null, (res) => {
            const values = res.map(workflow => ({ label: workflow, value: workflow }));
            setWorkflows(values);
        });
    }, [ setCurrentWorkflow, setWorkflows ]);

    return (
        <Dropdown
            blurInputOnSelect
            label="Select Workflow"
            options={workflows}
            isDisabled={isContentChanged=='modified'}
            onChange={({ target }) => {
                setCurrentWorkflow(target.value);
                setIsContentChanged( 'original' );
            }}
            value={currentWorkflow}
        />
    );
};

const WorkflowSelector = ({ workflows, setWorkflows, currentWorkflow, setCurrentWorkflow, setToast, isContentChanged, setIsContentChanged }) => {
    const [ createModal, setCreateModal ] = useState({ show: false });

    const usePrevious = (value) => {
        const ref = useRef();
        useEffect(() => {
            ref.current = value;
        });
        return ref.current;
    };
    const prevWorkflows = usePrevious(workflows);

    useEffect(() => {
        if (!prevWorkflows || prevWorkflows?.length === workflows.length) {
            return;
        } else if ((prevWorkflows?.length === 0 && workflows?.length > 0) || (workflows.length < prevWorkflows?.length)) {
            setCurrentWorkflow(workflows[0]);
        } else {
            const prev = prevWorkflows?.map((w) => w.value);
            const delta = workflows.map((w) => w.value).filter((i) => prev.indexOf(i) === -1)[0];
            setCurrentWorkflow(workflows.filter((w) => w.value === delta)[0]);
        }
    }, [ prevWorkflows, workflows, setCurrentWorkflow ]);

    return (
        <Root>
            <WorkflowDropdown {...{ currentWorkflow, setCurrentWorkflow, setToast, workflows, setWorkflows, isContentChanged, setIsContentChanged }} />
            <Button
                variant="primary"
                disabled={isContentChanged=='modified'}
                onClick={() => setCreateModal({ show: true })}
                iconLeft={<Icon iconName="plus" />}
            >
                Workflow
            </Button>
            <CreateModal {...{ createModal, setCreateModal, setToast, setWorkflows }} />
        </Root>
    );
};
export default WorkflowSelector;
