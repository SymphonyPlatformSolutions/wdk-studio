import {Button, Icon, Loader, Modal, ModalBody, ModalFooter, ModalTitle} from "@symphony-ui/uitoolkit-components/components";
import Wizard from './wizard'
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

const WizardModal = ({ wizardModal, setSnippet, setWizardModal, editor, contents, setToast, setRefreshDate }) => {
    const [codeSnippet, setCodeSnippet] = useState(null)
    const [eventCodeSnippet, setEventCodeSnippet] = useState(null)
    const [activeStep, setActiveStep] = useState(1)

    const showToast = (msg, error = 'false') => {
        setToast({ show: true, content: msg, error });
        setTimeout(() => {
            setToast({ show: false });
        }, 2000);
    };

    const addCodeSnippet = () => {
        setSnippet({ content: codeSnippet, ts: Date.now() });
    }

    return (
        <Modal size="large" show={wizardModal.show}>
            <ModalTitle>Code generation wizard</ModalTitle>
            <ModalBody>
                <Wizard setCodeSnippet={setCodeSnippet} eventCodeSnippet={eventCodeSnippet} setEventCodeSnippet={setEventCodeSnippet} activeStep={activeStep} workflowEditor={editor} contents={contents} />
            </ModalBody>
            <ModalFooter style={{ gap: '.5rem' }}>
                <Button
                    variant="secondary"
                    onClick={() => setActiveStep(activeStep-1 )}
                    disabled={activeStep<2}
                >
                    Back
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => setActiveStep(activeStep+1 )}
                    disabled={!codeSnippet && activeStep<3}
                >
                    Next
                </Button>
                <Button
                    variant="primary"
                    onClick={() => {
                        addCodeSnippet();
                        setWizardModal({ show: false })
                        setCodeSnippet(null);
                        setEventCodeSnippet(null);
                        setActiveStep(1);
                    }}
                    disabled={!codeSnippet}
                >
                    Get Code
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => {
                        setWizardModal({ show: false })
                        setCodeSnippet(null);
                        setEventCodeSnippet(null);
                        setActiveStep(1);
                    }}
                    disabled={wizardModal.loading}
                >
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};

const ActionBar = ({ editor, setSnippet, currentWorkflow, contents, showConsole, setShowConsole, markers, setToast }) => {
    const [ deleteModal, setDeleteModal ] = useState({ show: false });
    const [ wizardModal, setWizardModal ] = useState({ show: false });
    const [ refreshDate, setRefreshDate ] = useState(new Date());

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
                disabled={false}
                onClick={() => setWizardModal({ show: true })}
            >
                <i className="fa-solid fa-wand-sparkles"></i> Wizard
            </Button>
            <Button
                iconLeft={<Icon iconName="voice" />}
                variant="secondary"
                disabled={markers.length > 0}
                onClick={() => alert('coming soon!')}
            >
                <i className="fa-solid fa-chart-line"></i> Monitor
            </Button>
            <Button
                iconLeft={<Icon iconName={showConsole ? 'pop-in' : 'pop-out'} />}
                variant="secondary"
                onClick={() => setShowConsole((old) => !old)}
            >
                Console
            </Button>
            <Button
                variant="secondary-destructive"
                disabled={false}
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
            <ConfirmDeleteModal {...{ deleteModal, setDeleteModal, setToast, currentWorkflow, setRefreshDate }} />
            <WizardModal {...{ wizardModal, setSnippet, setWizardModal, setToast, editor, contents, setRefreshDate }} />
        </Root>
    );
};
export default ActionBar;