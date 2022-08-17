import {useEffect, useState} from "react";
import styled from "styled-components";
import {
    TextField, TextArea
} from "@symphony-ui/uitoolkit-components/components";

const Root = styled.div`
    height: 400px;
    padding: 10px;
    &: * {
        margin-bottom:10px;
    }
`;

const Field = styled.div`
    margin-top: 10px;
`;

const Title = styled.div`
    margin-bottom: 10px;
`;

const UpdateMessageForm = ({ setCodeSnippet, eventCodeSnippet }) => {
    const [identifier, setIdentifier] = useState('');
    const [messageId, setMessageId] = useState('${ACTIVITY_ID.outputs.message.initialMessageId}');
    const [content, setContent] = useState('');

    useEffect(() => {
        setCodeSnippet(
`- update-message:
        id: ${identifier}${eventCodeSnippet!==null ? '\n    ' + eventCodeSnippet : ''}
        message-id: ${messageId}
        content: \\
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
        <Root>
            <Title>Messages > Update a Message:</Title>
            <Field><TextField label={'Identifier'} showRequired={true} value={identifier} onChange={(target) => handleChangeIdentifier(target)} /></Field>
            <Field><TextField label={'Message ID'} showRequired={true} value={messageId} onChange={(target) => handleChangeMessageId(target)} /></Field>
            <Field><TextArea label={'Content'} showRequired={true} value={content} onChange={(target) => handleChangeContent(target)} /></Field>
        </Root>
    );
};


export default UpdateMessageForm;