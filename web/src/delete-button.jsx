import { atoms } from './atoms';
import {
    Button, Modal, ModalBody, ModalFooter, ModalTitle, Loader,
} from '@symphony-ui/uitoolkit-components/components';
import { useRecoilState } from 'recoil';
import { useState } from 'react';
import api from './api';

const DeleteButton = () => {
    const editMode = useRecoilState(atoms.editMode)[0];
    const [ deleteModal, setDeleteModal ] = useState({ show: false });
    const currentWorkflow = useRecoilState(atoms.currentWorkflow)[0];

    const ConfirmDeleteModal = () => {
        const setWorkflows = useRecoilState(atoms.workflows)[1];
        const currentWorkflow = useRecoilState(atoms.currentWorkflow)[0];
        const { deleteWorkflow, showStatus } = api();

        const submitDeleteWorkflow = () => {
            setDeleteModal({ show: true, loading: true });
            deleteWorkflow(currentWorkflow.value, () => {
                setDeleteModal({ show: false });
                showStatus(false, 'Workflow deleted');
                setWorkflows((old) => old.filter((w) => w.value !== currentWorkflow.value));
            }, (e) => {
                setDeleteModal({ show: false });
                showStatus(true, 'Error deleting workflow');
            });
        };

        return (
            <Modal size="medium" show={deleteModal.show}>
                <ModalTitle>Confirm Delete</ModalTitle>
                <ModalBody>This will delete the workflow permanently. Are you sure?</ModalBody>
                <ModalFooter style={{ gap: '.5rem' }}>
                    <Button
                        variant="primary-destructive"
                        onClick={submitDeleteWorkflow}
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

    return (
        <>
            <Button
                variant="primary-destructive"
                disabled={!currentWorkflow || !editMode}
                onClick={() => setDeleteModal({ show: true })}
            >
                Delete
            </Button>
            <ConfirmDeleteModal />
        </>
    );
};
export default DeleteButton;
