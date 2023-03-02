import { atoms } from '../atoms';
import {
    Button, Modal, ModalBody, ModalFooter, ModalTitle
} from '@symphony-ui/uitoolkit-components/components';
import { useRecoilState } from 'recoil';
import { useState } from 'react';
import Wizard from './wizard';

const WizardButton = () => {
    const editMode = useRecoilState(atoms.editMode)[0];
    const currentWorkflow = useRecoilState(atoms.currentWorkflow)[0];
    const [ wizardModal, setWizardModal ] = useState({ show: false });

    const WizardModal = () => {
        const [ codeSnippet, setCodeSnippet ] = useState(null);
        const [ eventCodeSnippet, setEventCodeSnippet ] = useState(null);
        const [ conditionCodeSnippet, setConditionCodeSnippet ] = useState(null);
        const [ activeStep, setActiveStep ] = useState(1);
        const setSnippet = useRecoilState(atoms.snippet)[1];

        const addCodeSnippet = () => {
            setSnippet({ content: codeSnippet, ts: Date.now() });
        };

        return (
            <Modal size="large" show={wizardModal.show}>
                <ModalTitle>SWADL Code generation wizard</ModalTitle>
                <ModalBody style={{overflowY: 'hidden'}}>
                    <Wizard {...{setCodeSnippet, eventCodeSnippet, setEventCodeSnippet, conditionCodeSnippet, setConditionCodeSnippet, activeStep }} />
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

    return (
        <>
            <Button
                variant="secondary"
                disabled={!currentWorkflow || !editMode}
                onClick={() => setWizardModal({ show: true })}
            >
                Wizard
            </Button>
            <WizardModal />
        </>
    );
};
export default WizardButton;
