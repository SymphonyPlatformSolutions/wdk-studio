import { useEffect, useState } from 'react';
import {
    TextField, TextArea
} from '@symphony-ui/uitoolkit-components/components';

const UpdateMessageForm = ({ setCodeSnippet, eventCodeSnippet }) => {
    const [ identifier, setIdentifier ] = useState('');
    const [ messageId, setMessageId ] = useState('${ACTIVITY_ID.outputs.message.initialMessageId}');
    const [ content, setContent ] = useState('');

    useEffect(() => {
        setCodeSnippet(`  - update-message:
      id: ${identifier}${eventCodeSnippet!==null ? '\n      ' + eventCodeSnippet : ''}
      message-id: ${messageId}
      content: |
        ${content}`);
    }, [identifier, messageId, content, eventCodeSnippet]);

    const handleChangeIdentifier = ({ target }) => {
        setIdentifier(target.value);
    };

    const handleChangeMessageId = ({ target }) => {
        setMessageId(target.value);
    };

    const handleChangeContent = ({ target }) => {
        setContent(target.value);
    };

    return (
        <>
            Messages &gt; Update a Message:
            <TextField label={'Identifier'} showRequired value={identifier} onChange={(target) => handleChangeIdentifier(target)} />
            <TextField label={'Message ID'} showRequired value={messageId} onChange={(target) => handleChangeMessageId(target)} />
            <TextArea label={'Content'} showRequired value={content} onChange={(target) => handleChangeContent(target)} />
        </>
    );
};

export default UpdateMessageForm;
