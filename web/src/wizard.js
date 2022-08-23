import styled from "styled-components";
import {useState} from "react";
import ActivityWizard from "./wizard/activity-wizard";
import EventWizard from "./wizard/event-wizard";
import ConditionWizard from "./wizard/condition-wizard";

const WizardRoot = styled.div`
    padding: .5rem;
    overflow-y: hidden;
`;

const Stepper = styled.div`
    display:table;
    width:100%;
    margin:0 auto;
    background-color:#FFFFFF;
    box-shadow: 0 3px 8px -6px rgba(0,0,0,.50);
`;

const Step = styled.div`
    display:table-cell;
    position:relative;
    padding:12px;  
`;

const StepCircle = styled.div`
    width:30px;
    height:30px;
    margin:0 auto;
    background-color: ${props => props.active ? '#f96302' : '#999999'};
    border-radius: 50%;
    text-align: center;
    line-height:30px;
    font-size: 16px;
    font-weight: 600;
    color:#ffffff;
`;

const StepTitle = styled.div`
    margin-top:16px;
    font-size:16px;
    font-weight:600;
    text-align: center;
`;

const StepSubTitle = styled.div`
    font-size:12px;
    color:rgba(0,0,0,.54);
    text-align: center;
`;

const StepBarRight = styled.div`
    position:absolute;
    top:36px;
    height:1px;
    border-top:1px solid #dddddd;
    right:0;
    left:50%;
    margin-left:20px;
`;

const StepBarLeft = styled.div`
    position:absolute;
    top:36px;
    height:1px;
    border-top:1px solid #dddddd;
    left:0;
    right:50%;
    margin-right:20px;
`;

const StepOne = styled.div`

`;
const StepTwo = styled.div`
    
`;
const StepThree = styled.div`
    
`;

const Wizard = ({setCodeSnippet, eventCodeSnippet, setEventCodeSnippet, conditionCodeSnippet, setConditionCodeSnippet, activeStep, workflowEditor, contents}) => {
    return (
        <WizardRoot>
            <Stepper>
                <Step>
                    <StepCircle active={activeStep===1}><span>1</span></StepCircle>
                    <StepTitle>Activity</StepTitle>
                    <StepBarRight />
                </Step>
                <Step>
                    <StepBarLeft />
                    <StepCircle active={activeStep===2}><span>2</span></StepCircle>
                    <StepTitle>Event</StepTitle>
                    <StepSubTitle>Optional</StepSubTitle>
                    <StepBarRight />
                </Step>
                <Step>
                    <StepBarLeft />
                    <StepCircle active={activeStep===3}><span>3</span></StepCircle>
                    <StepTitle>Condition</StepTitle>
                    <StepSubTitle>Optional</StepSubTitle>
                </Step>
            </Stepper>
            <StepOne style={{display: (activeStep===1) ? 'block' : 'none'}}>
                <ActivityWizard setCodeSnippet={setCodeSnippet} eventCodeSnippet={eventCodeSnippet} workflowEditor={workflowEditor} contents={contents} />
            </StepOne>
            <StepTwo style={{display: (activeStep===2) ? 'block' : 'none'}}>
                <EventWizard setEventCodeSnippet={setEventCodeSnippet} conditionCodeSnippet={conditionCodeSnippet} />
            </StepTwo>
            <StepThree style={{display: (activeStep===3) ? 'block' : 'none'}}>
                <ConditionWizard setConditionCodeSnippet={setConditionCodeSnippet} />
            </StepThree>
        </WizardRoot>
    );
};

export default Wizard;