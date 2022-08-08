import {Button, Loader, Modal, ModalBody, ModalFooter, ModalTitle} from "@symphony-ui/uitoolkit-components/components";
import styled from "styled-components";
import Api from './api';
import {useState} from "react";

const Root = styled.div`
    display: flex;
    gap: .5rem;
    justify-content: start;
`;

const ConfirmDeleteModal = ({ deleteModal, setDeleteModal, currentWorkflow, setToast, setRefreshDate }) => {
    const showToast = (msg, error = 'false') => {
        setToast({ show: true, content: msg, error });
        setTimeout(() => {
            setToast({ show: false });
        }, 2000);
    };

    const deleteWorkflow = () => {
        setDeleteModal({ show: true, loading: true });
        Api('delete-workflow', { workflow: currentWorkflow.value }, () => {
            setDeleteModal({ show: false });
            showToast('Workflow deleted');
            setRefreshDate(new Date());
        }, () => {
            setDeleteModal({ show: false });
            showToast('Error deleting workflow', 'true');
        });
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


const ActionBar = ({ editor, currentWorkflow, showConsole, setShowConsole, markers, setToast, setRefreshDate }) => {
    const [ deleteModal, setDeleteModal ] = useState({ show: false });

    const saveWorkflow = (workflow, contents) => {
        Api('write-workflow', { workflow, contents }, () => {
            setToast({ show: true, content: 'Saved!'});
            setTimeout(() => {
                setToast({ show: false });
            }, 2000);
        });
    }

    const openHelp = () => {
        window.open( 'https://github.com/finos/symphony-wdk/blob/master/docs/reference.md', '_blank', false);
    };

    return (
        <Root>
            <Button
                variant="secondary"
                disabled={markers.length > 0}
                onClick={() => saveWorkflow(currentWorkflow.value, editor.getModels()[0].getValue())}
            >
                <i className="fa-regular fa-floppy-disk"></i> Save
            </Button>
            <Button
                variant="secondary"
                disabled={markers.length > 0}
                onClick={() => alert('coming soon!')}
            >
                <i className="fa-solid fa-upload"></i> Publish
            </Button>
            <Button
                variant="secondary"
                disabled={markers.length > 0}
                onClick={() => alert('coming soon!')}
            >
                <i className="fa-solid fa-wand-sparkles"></i> Wizard
            </Button>
            <Button
                variant="secondary"
                onClick={() => setShowConsole((old) => !old)}
            >
                { showConsole ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i> } Console
            </Button>
            <Button
                variant="secondary"
                onClick={() => alert('coming soon!')}
            >
                <i className="fa-solid fa-comment-dots"></i> Chat
            </Button>
            <Button
                variant="secondary-destructive"
                disabled={markers.length > 0}
                onClick={() => setDeleteModal({ show: true })}
            >
                <i className="fa-solid fa-trash"></i> Delete
            </Button>
            <Button
                variant="secondary"
                onClick={() => openHelp()}
            >
                <i className="fa-solid fa-info"></i> Help
            </Button>
            <ConfirmDeleteModal {...{ deleteModal, setDeleteModal, setToast, currentWorkflow, setRefreshDate }} />
        </Root>
    );
};
export default ActionBar;