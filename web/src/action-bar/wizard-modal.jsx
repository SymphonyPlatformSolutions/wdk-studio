import { atoms } from '../core/atoms';
import {
    Button, Modal, ModalBody, ModalFooter, ModalTitle
} from '@symphony-ui/uitoolkit-components/components';
import { useRecoilState } from 'recoil';
import { useState } from 'react';
import Wizard from '../wizard/wizard';

const WizardModal = ({ setShow }) => {
    const [ codeSnippet, setCodeSnippet ] = useState(null);
    const [ eventCodeSnippet, setEventCodeSnippet ] = useState(null);
    const [ conditionCodeSnippet, setConditionCodeSnippet ] = useState(null);
    const [ activeStep, setActiveStep ] = useState(1);
    const setSnippet = useRecoilState(atoms.snippet)[1];

    const addCodeSnippet = () => {
        setSnippet({ content: codeSnippet, ts: Date.now() });
    };

    return (
        <Modal size="large" show closeButton onClose={() => setShow(false)}>
            <ModalTitle>SWADL Code generation wizard</ModalTitle>
            <ModalBody style={{overflowY: 'hidden'}}>
                <Wizard {...{setCodeSnippet, eventCodeSnippet, setEventCodeSnippet, conditionCodeSnippet, setConditionCodeSnippet, activeStep }} />
            </ModalBody>
            <ModalFooter>
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
                        setShow(false);
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
                        setShow(false);
                        setCodeSnippet(null);
                        setEventCodeSnippet(null);
                        setActiveStep(1);
                    }}
                >
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default WizardModal;
