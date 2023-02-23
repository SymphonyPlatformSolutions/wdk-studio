import styled from "styled-components";
import ActivityWizard from "./wizard/activity-wizard";
import EventWizard from "./wizard/event-wizard";
import ConditionWizard from "./wizard/condition-wizard";
import {Fragment, useState} from "react";

const WizardRoot = styled.div`
    padding: .5rem;
`;

const Stepper = styled.div`
    display: flex;
    justify-content: space-around;
    padding: 1rem 3rem;
`;

const Step = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const StepCircle = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 600;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    color: #fff;
    background: ${props => props.step === props.activeStep ? 'var(--tk-color-red-40)' : 'var(--tk-color-graphite-40)'};
    margin-bottom: .6rem;
    &:after { content: '${props => props.step}' }
`;

const StepTitle = styled.div`
    font-weight: 600;
`;

const StepSubtitle = styled.div`
    font-size: .8rem;
`;

const StepOne = styled.div`

`;
const StepTwo = styled.div`
    
`;
const StepThree = styled.div`
    
`;

const Spacer = styled.hr`
    width: 25%;
    height: 100%;
    border: 0;
    border-top: var(--tk-color-graphite-30) 1px solid;
    margin: 1rem 0 0 0;
`;

const Wizard = ({
    setCodeSnippet, eventCodeSnippet, setEventCodeSnippet, conditionCodeSnippet, setConditionCodeSnippet, activeStep
}) => {

    return (
        <WizardRoot>
            <Stepper>
                { [ 'Activity', 'Event', 'Condition' ].map((step, index, steps) => (
                    <Fragment key={index}>
                        <Step>
                            <StepCircle step={index + 1} activeStep={activeStep} />
                            <StepTitle>{step}</StepTitle>
                            <StepSubtitle>{index > 0 && 'Optional'}</StepSubtitle>
                        </Step>
                        { (index < steps.length - 1) && <Spacer /> }
                    </Fragment>
                )) }
            </Stepper>
            <StepOne style={{display: (activeStep===1) ? 'block' : 'none'}}>
                <ActivityWizard {...{setCodeSnippet, eventCodeSnippet}} />,
            </StepOne>
            <StepTwo style={{display: (activeStep===2) ? 'block' : 'none'}}>
                <EventWizard {...{setEventCodeSnippet, conditionCodeSnippet}} />,
            </StepTwo>
            <StepThree style={{display: (activeStep===3) ? 'block' : 'none'}}>
                <ConditionWizard {...{setConditionCodeSnippet}} />
            </StepThree>
        </WizardRoot>
    );
};

export default Wizard;
