import { atoms } from './atoms';
import {
    Button, Loader, Modal, ModalBody, ModalFooter, ModalTitle,
} from '@symphony-ui/uitoolkit-components/components';
import { editor } from 'monaco-editor';
import { useRecoilState } from 'recoil';
import { useState } from 'react';
import api from './api';
import Diagram from './diagram';
import styled from 'styled-components';
import Wizard from './wizard'

const Root = styled.div`
    display: flex;
    gap: .5rem;
    justify-content: space-between;
`;

const Section = styled.div`
    display: flex;
    gap: .5rem;
`;

const ConfirmDeleteModal = ({ deleteModal, setDeleteModal, currentWorkflow, setWorkflows }) => {
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

const ConfirmDiscardModal = ({ discardModal, setDiscardModal, contents }) => {

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

const DiagramModal = ({ diagramModal, setDiagramModal, contents, currentWorkflowId, selectedInstance, setSelectedInstance }) => {

    return (
        <Modal size="full-width" show={diagramModal.show}>
            <ModalTitle>Diagram</ModalTitle>
            <ModalBody>
                <Diagram {...{currentWorkflowId, selectedInstance}} />
            </ModalBody>
            <ModalFooter style={{ gap: '.5rem' }}>
                <Button
                    variant="secondary"
                    onClick={() => setDiagramModal({ show: false })}
                    disabled={diagramModal.loading}
                >
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    );
};

const WizardModal = ({ wizardModal, setSnippet, setWizardModal, contents }) => {
    const [codeSnippet, setCodeSnippet] = useState(null)
    const [eventCodeSnippet, setEventCodeSnippet] = useState(null)
    const [conditionCodeSnippet, setConditionCodeSnippet] = useState(null)
    const [activeStep, setActiveStep] = useState(1)

    const addCodeSnippet = () => {
        setSnippet({ content: codeSnippet, ts: Date.now() });
    }

    return (
        <Modal size="large" show={wizardModal.show}>
            <ModalTitle>SWADL Code generation wizard</ModalTitle>
            <ModalBody style={{overflowY: 'hidden'}}>
                <Wizard {...{setCodeSnippet, eventCodeSnippet, setEventCodeSnippet, conditionCodeSnippet, setConditionCodeSnippet, activeStep, contents}} />
            </ModalBody>
            <ModalFooter style={{ gap: '.5rem' }}>
                <Button
                    variant="secondary"
                    onClick={() => setActiveStep(activeStep-1)}
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

const ActionBar = ({ setSnippet, currentWorkflow, currentWorkflowId, selectedInstance, setSelectedInstance, contents, setContents, editMode, setEditMode, showConsole, setShowConsole, markers, isContentChanged, setIsContentChanged }) => {
    const setWorkflows = useRecoilState(atoms.workflows)[1];
    const [ deleteModal, setDeleteModal ] = useState({ show: false });
    const [ discardModal, setDiscardModal ] = useState({ show: false });
    const [ wizardModal, setWizardModal ] = useState({ show: false });
    const [ diagramModal, setDiagramModal ] = useState({ show: false });
    const { addWorkflow, showStatus } = api();

    const saveWorkflow = (swadl, description) => {
        addWorkflow({ swadl, description }, () => {
            setIsContentChanged('original');
            setContents(contents);
            showStatus(false, 'Workflow saved');
        });
    };

    const openHelp = () => {
        window.open( 'https://github.com/finos/symphony-wdk/blob/master/docs/reference.md', '_blank', false);
    };

    return (
        <Root>
            <Section>
                <Button
                    variant="primary"
                    disabled={markers.length > 0 || isContentChanged != 'modified'}
                    onClick={() => saveWorkflow(editor.getModels()[0].getValue(), "Description")}
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
                <Button
                    variant="secondary"
                    disabled={!editMode}
                    onClick={() => setWizardModal({ show: true })}
                >
                    Wizard
                </Button>
            </Section>
            <Section>
                <Button
                    variant="secondary"
                    disabled={markers.length > 0}
                    onClick={() => {
                        setEditMode(!editMode);
                        setSelectedInstance(null);
                    }}
                >
                    {editMode ? 'Monitor' : 'Edit'}
                </Button>
                <Button
                    variant="secondary"
                    disabled={markers.length > 0}
                    onClick={() => setDiagramModal({ show: true })}
                >
                    Diagram
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => setShowConsole((old) => !old)}
                >
                    {showConsole ? 'Hide Console' : 'Show Console'}
                </Button>
                <Button
                    variant="primary-destructive"
                    disabled={!editMode}
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
            </Section>
            <ConfirmDeleteModal {...{ deleteModal, setDeleteModal, currentWorkflow, setWorkflows }} />
            <ConfirmDiscardModal {...{ discardModal, setDiscardModal, contents }} />
            <WizardModal {...{ wizardModal, setSnippet, setWizardModal, contents }} />
            <DiagramModal {...{ diagramModal, setDiagramModal, contents, currentWorkflowId, selectedInstance, setSelectedInstance }} />
        </Root>
    );
};
export default ActionBar;
