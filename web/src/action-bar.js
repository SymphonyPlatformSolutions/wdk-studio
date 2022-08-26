import {Button, Icon, Loader, Modal, ModalBody, ModalFooter, ModalTitle} from "@symphony-ui/uitoolkit-components/components";
import Wizard from './wizard'
import styled from "styled-components";
import Api from './api';
import {useState} from "react";

const Root = styled.div`
    display: flex;
    gap: .5rem;
    justify-content: space-between;
`;

const SectionLeft = styled.div`
    display: flex;
    gap: .5rem;
    justify-content: start;
`;

const SectionRight = styled.div`
    display: flex;
    gap: .5rem;
    justify-content: end;
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
        }, (e) => {
            setDeleteModal({ show: false });
            showToast('Error deleting workflow', 'true');
        });
    };

    return (
        <Modal size="medium" show={deleteModal.show}>
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

const ConfirmDiscardModal = ({ discardModal, setDiscardModal, editor, contents }) => {

    const discardWorkflow = () => {
        editor.getModels()[0].setValue( contents );
        setDiscardModal( { show: false } );
    }

    return (
        <Modal size="medium" show={discardModal.show}>
            <ModalTitle>Discard your changes</ModalTitle>
            <ModalBody>All changes will be lost. Are you sure?</ModalBody>
            <ModalFooter style={{ gap: '.5rem' }}>
                <Button
                    variant="primary-destructive"
                    onClick={discardWorkflow}
                    disabled={discardModal.loading}
                >
                    { discardModal.loading ? <Loader /> : 'Discard' }
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => setDiscardModal({ show: false })}
                    disabled={discardModal.loading}
                >
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};

const WizardModal = ({ wizardModal, setSnippet, setWizardModal, editor, contents, setToast }) => {
    const [codeSnippet, setCodeSnippet] = useState(null)
    const [eventCodeSnippet, setEventCodeSnippet] = useState(null)
    const [conditionCodeSnippet, setConditionCodeSnippet] = useState(null)
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
            <ModalTitle>SWADL Code generation wizard</ModalTitle>
            <ModalBody style={{overflowY: 'hidden'}}>
                <Wizard setCodeSnippet={setCodeSnippet} eventCodeSnippet={eventCodeSnippet} setEventCodeSnippet={setEventCodeSnippet} conditionCodeSnippet={conditionCodeSnippet} setConditionCodeSnippet={setConditionCodeSnippet} activeStep={activeStep} workflowEditor={editor} contents={contents} />
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

const ActionBar = ({ editor, setSnippet, currentWorkflow, contents, setContents, showConsole, setShowConsole, markers, setToast, setWorkflows, isContentChanged, setIsContentChanged }) => {
    const [ deleteModal, setDeleteModal ] = useState({ show: false });
    const [ discardModal, setDiscardModal ] = useState({ show: false });
    const [ wizardModal, setWizardModal ] = useState({ show: false });

    const saveWorkflow = (workflow, contents) => {
        Api('write-workflow', { workflow, contents }, () => {
            setIsContentChanged('original');
            setContents(contents);
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
            <SectionLeft>
                <Button
                    variant="primary"
                    disabled={markers.length > 0 || isContentChanged != 'modified'}
                    onClick={() => saveWorkflow(currentWorkflow.value, editor.getModels()[0].getValue())}
                >
                    Save
                </Button>
                <Button
                    variant="secondary-destructive"
                    disabled={isContentChanged != 'modified'}
                    onClick={() => setDiscardModal({ show: true })}
                >
                    Cancel
                </Button>
            </SectionLeft>
            <SectionRight>
                <Button
                    variant="secondary"
                    disabled={false}
                    onClick={() => setWizardModal({ show: true })}
                >
                    Wizard
                </Button>
                <Button
                    variant="secondary"
                    disabled={markers.length > 0}
                    onClick={() => alert('coming soon!')}
                >
                    Monitor
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => setShowConsole((old) => !old)}
                >
                    {showConsole ? 'Hide Console' : 'Show Console'}
                </Button>
                <Button
                    variant="primary-destructive"
                    disabled={false}
                    onClick={() => setDeleteModal({ show: true })}
                >
                    Delete
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => openHelp()}
                >
                    Help
                </Button>
            </SectionRight>
            <ConfirmDeleteModal {...{ deleteModal, setDeleteModal, setToast, currentWorkflow, setWorkflows }} />
            <ConfirmDiscardModal {...{ discardModal, setDiscardModal, editor, contents }} />
            <WizardModal {...{ wizardModal, setSnippet, setWizardModal, setToast, editor, contents }} />
        </Root>
    );
};
export default ActionBar;