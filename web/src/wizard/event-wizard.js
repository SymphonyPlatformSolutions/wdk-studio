import { useEffect, useState, useRef } from 'react';
import {
    Button, Dropdown, TextField,
} from "@symphony-ui/uitoolkit-components/components";
import styled from "styled-components";

const Root = styled.div`
    height: 400px;
`;

const Title = styled.div`
    padding: 10px;
`;

const Field = styled.div`
    margin-top: 10px;
`;

const EventWizard = ({setEventCodeSnippet, conditionCodeSnippet}) => {
    const events = [
        {label:'message-received', value: 1, content: true},
        {label:'form-replied', value: 2, formId: true},
        {label:'activity-completed', value: 3, activityId: true},
        {label:'activity-expired', value: 4, activityId: true}
    ];

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [content, setContent] = useState('');
    const [formId, setFormId] = useState('');
    const [activityId, setActivityId] = useState('');
    const [tOut, setTOut] = useState(null);

    useEffect(() => {
        if (selectedEvent!==null) {
            setEventCodeSnippet(
                `on:
          ${selectedEvent.label}:
            ${content !== '' ? 'content: ' + content : ''}${formId!=='' ? 'form-id: ' + formId : ''}${activityId!=='' ? 'activity-id: ' + activityId : ''}${conditionCodeSnippet !== '' ? '\n        if: ' + conditionCodeSnippet : ''}`)
        } else {
            setEventCodeSnippet(null);
        }
    }, [selectedEvent, content, formId, activityId, conditionCodeSnippet]);

    const handleChangeContent = ({ target }) => {
        setContent( target.value );
    };

    const handleChangeFormId = ({ target }) => {
        setFormId( target.value );
    };

    const handleChangeActivityId = ({ target }) => {
        setActivityId( target.value );
    };

    return (
        <Root>
            <Title>Define the event that will trigger the activity</Title>
            <Field><Dropdown label={'Select an event'} options={events} onChange={(e) => setSelectedEvent(e.target.value)} /></Field>
            <Field style={{display: (selectedEvent?.content) ? 'block' : 'none'}}><TextField label={'Content'} onChange={(target) => handleChangeContent(target)} /></Field>
            <Field style={{display: (selectedEvent?.formId) ? 'block' : 'none'}}><TextField label={'Form Id'} onChange={(target) => handleChangeFormId(target)} /></Field>
            <Field style={{display: (selectedEvent?.activityId) ? 'block' : 'none'}}><TextField label={'Activity Id'} onChange={(target) => handleChangeActivityId(target)} /></Field>
            <Field><TextField label={'Timeout'} /></Field>
        </Root>
    );
};


export default EventWizard;