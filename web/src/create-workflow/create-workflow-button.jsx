import { useEffect, useState, useRef } from 'react';
import {
    Button, Icon, Loader, TextField, Modal, ModalTitle, ModalBody, ModalFooter,
} from "@symphony-ui/uitoolkit-components/components";
import TemplateSelector from './template-selector';
import api from '../core/api';
import { atoms } from '../core/atoms';
import { useRecoilState } from 'recoil';

const CreateWorkflowModal = ({ createModal, setCreateModal }) => {
    const setWorkflows = useRecoilState(atoms.workflows)[1];
    const setCurrentWorkflow = useRecoilState(atoms.currentWorkflow)[1];
    const [ newName, setNewName ] = useState('');
    const [ swadlTemplate, setSwadlTemplate ] = useState();
    const [ pageLoading, setPageLoading ] = useState(false);
    const [ templateLoading, setTemplateLoading ] = useState(false);
    const { addWorkflow, showStatus } = api();
    const session = useRecoilState(atoms.session)[0];

    const showToast = (error, msg) => {
        showStatus(error, msg);
        setCreateModal((old) => ({ ...old, loading: false }));
    };

    const createWorkflow = () => {
        if (newName.trim().length < 3) {
            showToast(true, 'Workflow name needs to be at least 3 characters long');
            return;
        }
        if (newName.indexOf(' ') > -1) {
            showToast(true, 'Workflow name cannot contain spaces');
            return;
        }
        const id = newName.trim().toLowerCase();
        setCreateModal({ show: true, loading: true });
        const template = swadlTemplate
            .replace(/newId/g, id)
            .replace(/id: ([\w\-]+)/, `id: ${id}`);

        addWorkflow({ swadl: template, author: session.id, description: "New workflow" }, () => {
            showToast(false, 'New workflow added');
            setCreateModal({ show: false });
            setNewName('');
            const newWorkflow = { label: id, value: id };
            setWorkflows((old) => ([ ...old, newWorkflow ].sort((a, b) => (a.value > b.value) ? 1 : -1)));
            setCurrentWorkflow(newWorkflow);
        }, ({ message }) => {
            showToast(true, message);
        });
    };

    const nameRef = useRef();
    useEffect(() => {
        if (nameRef.current) {
            nameRef?.current?.focus();
        }
    }, [ createModal?.show ]);

    return (
        <Modal size="large" show={createModal.show}>
            <ModalTitle>Create Workflow</ModalTitle>
            <ModalBody style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <TextField
                    ref={nameRef}
                    label="Name"
                    showRequired={true}
                    value={newName}
                    disabled={createModal.loading}
                    onChange={({ target }) => setNewName(target.value)}
                />
                <TemplateSelector {...{ setSwadlTemplate, pageLoading, setPageLoading, templateLoading, setTemplateLoading }} />
            </ModalBody>
            <ModalFooter style={{ gap: '.5rem' }}>
                <Button
                    onClick={createWorkflow}
                    disabled={newName==='' || createModal.loading || pageLoading || templateLoading}
                >
                    { createModal.loading ? <Loader /> : 'Create' }
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => setCreateModal({ show: false })}
                    disabled={createModal.loading || pageLoading || templateLoading}
                >
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};

const CreateWorkflowButton = () => {
    const [ createModal, setCreateModal ] = useState({ show: false });
    const editMode = useRecoilState(atoms.editMode)[0];
    const isContentChanged = useRecoilState(atoms.isContentChanged)[0];

    return (
        <>
            <Button
                variant="primary"
                disabled={!editMode || isContentChanged === 'modified'}
                onClick={() => setCreateModal({ show: true })}
                iconLeft={<Icon iconName="plus" />}
            >
                Workflow
            </Button>
            <CreateWorkflowModal {...{ createModal, setCreateModal }} />
        </>
    );
};

export default CreateWorkflowButton;
