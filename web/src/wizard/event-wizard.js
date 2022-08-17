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

const EventWizard = ({setEventCodeSnippet}) => {
    const events = [
        {label:'message-received', value: 1, content: true},
        {label:'form-replied', value: 2},
        {label:'activity-expired', value: 3}
    ];

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [content, setContent] = useState('');
    const [tOut, setTOut] = useState(null);

    useEffect(() => {
        if (selectedEvent!==null) {
            setEventCodeSnippet(
                `on:
          ${selectedEvent.label}:
            ${content!=='' ? 'content: ' + content : ''}`)
            } else {
                setEventCodeSnippet(null);
            }
    }, [selectedEvent, content]);

    const handleChangeContent = ({ target }) => {
        setContent(target.value);
    };

    return (
        <Root>
            <Title>Event </Title>
            <Field><Dropdown label={'Select an event'} options={events} onChange={(e) => setSelectedEvent(e.target.value)} /></Field>
            <Field style={{display: (selectedEvent?.content) ? 'block' : 'none'}}><TextField label={'Content'} onChange={(target) => handleChangeContent(target)} /></Field>
            <Field><TextField label={'Timeout'} /></Field>
        </Root>
    );
};


export default EventWizard;