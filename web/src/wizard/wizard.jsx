import ActivityWizard from './activity-wizard';
import EventWizard from './event-wizard';
import ConditionWizard from './condition-wizard';
import {
    WizardRoot, SubWizardRoot, Stepper, Step, StepInner, StepCircle, StepTitle, StepSubtitle,
} from './styles';

const Wizard = ({
    setCodeSnippet,
    eventCodeSnippet,
    setEventCodeSnippet,
    conditionCodeSnippet,
    setConditionCodeSnippet,
    activeStep,
    selectedForm,
    setSelectedForm,
}) => {
    const wizards = [
        <ActivityWizard {...{ setCodeSnippet, eventCodeSnippet, selectedForm, setSelectedForm }} />,
        <EventWizard {...{ setEventCodeSnippet, conditionCodeSnippet }} />,
        <ConditionWizard {...{ setConditionCodeSnippet }} />,
    ];
    return (
        <WizardRoot>
            <Stepper>
                {[ 'Activity', 'Event', 'Condition' ].map((step, index) => (
                    <Step key={index}>
                        <StepInner>
                            <StepCircle step={index + 1} activeStep={activeStep} />
                            <StepTitle>{step}</StepTitle>
                            <StepSubtitle>{index > 0 && 'Optional'}</StepSubtitle>
                        </StepInner>
                    </Step>
                ))}
            </Stepper>
            { wizards.map((wizard, index) => (
                <SubWizardRoot key={index} show={activeStep === (index + 1)}>
                    { wizard }
                </SubWizardRoot>
            ))}
        </WizardRoot>
    );
};
export default Wizard;
