import { atoms } from './atoms';
import {
    Button, Loader, Modal, ModalBody, ModalFooter, ModalTitle,
} from '@symphony-ui/uitoolkit-components/components';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api';
import { useRecoilState } from 'recoil';
import { useState } from 'react';
import api from './api';
import Diagram from './diagram';
import styled from 'styled-components';
import WizardButton from './wizard/wizard-button';
import DiscardButton from './discard-button';
import DeleteButton from './delete-button';

const Root = styled.div`
    display: flex;
    gap: .5rem;
    justify-content: space-between;
`;

const Section = styled.div`
    display: flex;
    gap: .5rem;
`;

const DiagramModal = ({ diagramModal, setDiagramModal }) => (
    <Modal size="full-width" show={diagramModal.show}>
        <ModalTitle>Diagram</ModalTitle>
        <ModalBody>
            <Diagram />
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

const ActionBar = ({ showConsole, setShowConsole, markers }) => {
    const currentWorkflow = useRecoilState(atoms.currentWorkflow)[0];
    const setSelectedInstance = useRecoilState(atoms.selectedInstance)[1];
    const setContents = useRecoilState(atoms.contents)[1];
    const [ editMode, setEditMode ] = useRecoilState(atoms.editMode);
    const [ isContentChanged, setIsContentChanged ] = useRecoilState(atoms.isContentChanged);
    const [ diagramModal, setDiagramModal ] = useState({ show: false });
    const { addWorkflow, showStatus } = api();
    const [ loading, setLoading ] = useRecoilState(atoms.loading);

    const saveWorkflow = (swadl, description) => {
        setLoading(true);
        addWorkflow({ swadl, description }, () => {
            setLoading(false);
            setIsContentChanged('original');
            setContents(swadl);
            showStatus(false, 'Workflow saved');
        });
    };

    const openHelp = () => window.open('//github.com/finos/symphony-wdk/blob/master/docs/reference.md', '_blank', false);

    return (
        <Root>
            <Section>
                <Button
                    variant="primary"
                    disabled={loading || markers.length > 0 || isContentChanged !== 'modified'}
                    onClick={() => saveWorkflow(editor.getModels()[0].getValue(), "Description")}
                >
                    { loading ? <Loader /> : 'Save' }
                </Button>
                <DiscardButton />
                <WizardButton />
            </Section>
            <Section>
                <Button
                    variant="secondary"
                    disabled={!currentWorkflow || markers.length > 0}
                    onClick={() => {
                        setEditMode(!editMode);
                        setSelectedInstance(null);
                    }}
                >
                    {editMode ? 'Monitor' : 'Edit'}
                </Button>
                <Button
                    variant="secondary"
                    disabled={!currentWorkflow || markers.length > 0}
                    onClick={() => setDiagramModal({ show: true })}
                >
                    Diagram
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => setShowConsole((old) => !old)}
                >
                    {showConsole ? 'Hide' : 'Show'} Console
                </Button>
                <DeleteButton />
                <Button
                    variant="secondary"
                    onClick={() => openHelp()}
                >
                    Help
                </Button>
            </Section>
            <DiagramModal {...{ diagramModal, setDiagramModal }} />
        </Root>
    );
};
export default ActionBar;
