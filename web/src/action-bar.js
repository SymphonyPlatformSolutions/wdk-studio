import {
    Button, Loader, Modal, ModalBody, ModalFooter, ModalTitle, Icon,
} from "@symphony-ui/uitoolkit-components/components";
import styled from "styled-components";
import Api from './api';
import {useState} from "react";

const Root = styled.div`
    display: flex;
    gap: .5rem;
    justify-content: start;
`;

const ConfirmDeleteModal = ({ deleteModal, setDeleteModal, setToast, currentWorkflow, setWorkflows }) => {
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
            setWorkflows((old) => old.filter((w) => w.value !== currentWorkflow.value));
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


const ActionBar = ({
    editor, currentWorkflow, showConsole, setShowConsole, markers, setToast, setWorkflows
}) => {
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
                iconLeft={<Icon iconName="enter" />}
                variant="secondary"
                disabled={markers.length > 0}
                onClick={() => saveWorkflow(currentWorkflow.value, editor.getModels()[0].getValue())}
            >
                Save
            </Button>
            <Button
                iconLeft={<Icon iconName="share" />}
                variant="secondary"
                disabled={markers.length > 0}
                onClick={() => alert('coming soon!')}
            >
                Publish
            </Button>
            <Button
                iconLeft={<Icon iconName="voice" />}
                variant="secondary"
                disabled={markers.length > 0}
                onClick={() => alert('coming soon!')}
            >
                Wizard
            </Button>
            <Button
                iconLeft={<Icon iconName={showConsole ? 'pop-in' : 'pop-out'} />}
                variant="secondary"
                onClick={() => setShowConsole((old) => !old)}
            >
                Console
            </Button>
            <Button
                iconLeft={<Icon iconName="message" />}
                variant="secondary"
                onClick={() => alert('coming soon!')}
            >
                Chat
            </Button>
            <Button
                iconLeft={<Icon iconName="delete" />}
                variant="secondary-destructive"
                disabled={markers.length > 0}
                onClick={() => setDeleteModal({ show: true })}
            >
                Delete
            </Button>
            <Button
                iconLeft={<Icon iconName="info-round" />}
                variant="secondary"
                onClick={() => openHelp()}
            >
                Help
            </Button>
            <ConfirmDeleteModal {...{ deleteModal, setDeleteModal, setToast, currentWorkflow, setWorkflows }} />
        </Root>
    );
};
export default ActionBar;