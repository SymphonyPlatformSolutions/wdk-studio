import { useEffect, useState, useRef } from 'react';
import {
    Button, Icon, Loader, TextField, Modal, ModalTitle, ModalBody, ModalFooter,
} from "@symphony-ui/uitoolkit-components/components";
import TemplateSelector from './template-selector';
import api from '../core/api';
import { atoms } from '../core/atoms';
import { useRecoilState } from 'recoil';

const CreateWorkflowModal = ({ setShow }) => {
    const [ loading, setLoading ] = useState(false);
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
        setLoading(false);
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
        setLoading(true);
        const template = swadlTemplate
            .replace(/newId/g, id)
            .replace(/id: ([\w\-]+)/, `id: ${id}`);

        addWorkflow({ swadl: template, createdBy: session.id, description: "New workflow" }).then(() => {
            showToast(false, 'New workflow added');
            setShow(false);
            setNewName('');
            const newWorkflow = { label: id, value: id };
            setWorkflows((old) => ([ ...old, newWorkflow ].sort((a, b) => (a.value > b.value) ? 1 : -1)));
            setCurrentWorkflow(newWorkflow);
            setWorkflows(undefined);
        }, () => showToast(true, 'Conflicting workflow ID. Please choose a different one.'));
    };

    const nameRef = useRef();
    useEffect(() => {
        if (nameRef.current) {
            nameRef?.current?.focus();
        }
    }, []);

    return (
        <Modal size="large" show>
            <ModalTitle>Create Workflow</ModalTitle>
            <ModalBody style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <TextField
                    ref={nameRef}
                    label="Name"
                    showRequired={true}
                    value={newName}
                    disabled={loading}
                    onChange={({ target }) => setNewName(target.value)}
                />
                <TemplateSelector {...{ setSwadlTemplate, pageLoading, setPageLoading, templateLoading, setTemplateLoading }} />
            </ModalBody>
            <ModalFooter>
                <Button
                    onClick={createWorkflow}
                    loading={loading}
                    disabled={newName==='' || loading || pageLoading || templateLoading}
                >
                    Create
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => setShow(false)}
                    disabled={loading || pageLoading || templateLoading}
                >
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};

const CreateWorkflowButton = () => {
    const [ show, setShow ] = useState(false);
    const editMode = useRecoilState(atoms.editMode)[0];
    const isContentChanged = useRecoilState(atoms.isContentChanged)[0];

    return (
        <>
            <Button
                variant="primary"
                disabled={!editMode || isContentChanged === 'modified'}
                onClick={() => setShow(true)}
                iconLeft={<Icon iconName="plus" />}
            >
                Workflow
            </Button>
            { show && <CreateWorkflowModal setShow={setShow} /> }
        </>
    );
};

export default CreateWorkflowButton;
