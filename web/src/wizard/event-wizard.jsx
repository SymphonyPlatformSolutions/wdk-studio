import { useEffect, useState } from 'react';
import { Dropdown, TextField } from "@symphony-ui/uitoolkit-components/components";

const EventWizard = ({ setEventCodeSnippet, conditionCodeSnippet }) => {
    const events = [
        { label: 'message-received', value: 1, field: 'content', fieldLabel: 'Content' },
        { label: 'form-replied', value: 2, field: 'form-id', fieldLabel: 'Form ID' },
        { label: 'activity-completed', value: 3, field: 'activity-id', fieldLabel: 'Activity ID' },
        { label: 'activity-expired', value: 4, field: 'activity-id', fieldLabel: 'Activity ID' }
    ];

    const [ selectedEvent, setSelectedEvent ] = useState(events[0]);
    const [ fieldData, setFieldData ] = useState('');

    useEffect(() => {
        setEventCodeSnippet(`on:
        ${selectedEvent.label}:
          ${selectedEvent.field}: ${fieldData}
      ${conditionCodeSnippet && ('if: ${' + conditionCodeSnippet + '}')}`.trim());
    }, [ selectedEvent, conditionCodeSnippet, fieldData ]);

    return (
        <>
            Define the event that will trigger the activity
            <Dropdown label="Select an event" options={events} value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)} />
            <TextField label={selectedEvent.fieldLabel} value={fieldData} onChange={({ target }) => setFieldData(target.value)} />
        </>
    );
};
export default EventWizard;
