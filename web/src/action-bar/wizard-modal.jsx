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
    const [ selectedForm, setSelectedForm ] = useState();
    const [ activeStep, setActiveStep ] = useState(1);
    const setSnippet = useRecoilState(atoms.snippet)[1];

    const addCodeSnippet = () => {
        setSnippet({ content: codeSnippet, ts: Date.now() });
        resetWizard();
    };

    const resetWizard = () => {
        setShow(false);
        setCodeSnippet(null);
        setEventCodeSnippet(null);
        setActiveStep(1);
    };

    return (
        <Modal size="large" show closeButton onClose={() => setShow(false)}>
            <ModalTitle>SWADL Generator Wizard</ModalTitle>
            <ModalBody>
                <Wizard {...{
                    setCodeSnippet,
                    eventCodeSnippet,
                    setEventCodeSnippet,
                    conditionCodeSnippet,
                    setConditionCodeSnippet,
                    activeStep,
                    selectedForm,
                    setSelectedForm,
                }} />
            </ModalBody>
            <ModalFooter>
                <Button
                    variant="secondary"
                    onClick={() => activeStep === 1 ? setSelectedForm(undefined) : setActiveStep((a) => a - 1)}
                    disabled={!selectedForm && activeStep < 2}
                >
                    Back
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => setActiveStep((a) => a + 1)}
                    disabled={!codeSnippet || activeStep >= 3}
                >
                    Next
                </Button>
                <Button variant="primary" onClick={addCodeSnippet} disabled={!codeSnippet}>
                    Get Code
                </Button>
                <Button variant="secondary" onClick={resetWizard}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};
export default WizardModal;
