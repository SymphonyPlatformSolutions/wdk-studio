import {useEffect, useState} from "react";
import styled from "styled-components";
import {
    TextField, TextArea
} from "@symphony-ui/uitoolkit-components/components";
import MessageMLTemplates from "./messageml-templates";

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

const Templates = styled.div`
    display: flex;
    flex-direction: row;
    align-items: start;
    & > a {
        margin-left: 3px;
    }
`;

const SendMessageForm = ({ setCodeSnippet, eventCodeSnippet }) => {
    const [identifier, setIdentifier] = useState('');
    const [streamId, setStreamId] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        if (identifier!=='' && content!=='') {
            setCodeSnippet(
`- send-message:
      id: ${identifier}${streamId!=='' ? '\n    to:\n      stream-id: ' + streamId : ''}${eventCodeSnippet!==null ? '\n        ' + eventCodeSnippet : ''}
      content: |
        ${content}`);
        } else {
            setCodeSnippet(null);
        }
    }, [identifier, content, eventCodeSnippet]);

    const handleChangeIdentifier = ({ target }) => {
        setIdentifier(target.value);
    };

    const handleChangeStreamId = ({ target }) => {
        setStreamId(target.value);
    };

    const handleChangeContent = ({ target }) => {
        setContent(target.value);
    };

    const handleCopyFrom = (template) => {
        setContent( content + MessageMLTemplates[template] );
    };

    return (
        <Root>
            <Title>Messages > Send a Message:</Title>
            <Field><TextField label={'Identifier'} showRequired={true} value={identifier} onChange={(target) => handleChangeIdentifier(target)} /></Field>
            <Field><TextField label={'StreamId'} showRequired={false} value={streamId} onChange={(target) => handleChangeStreamId(target)} /></Field>
            <Field>
                <TextArea label={'Content'} showRequired={true} value={content} onChange={(target) => handleChangeContent(target)} />
                <Templates>
                    <span className={'tk-label'}>Copy from:</span>
                    <a className={'tk-label'} href={'#'} onClick={() => handleCopyFrom('simple')}>simple</a>
                    <a className={'tk-label'} href={'#'} onClick={() => handleCopyFrom('simple')}>complex</a>
                    <a className={'tk-label'} href={'#'} onClick={() => handleCopyFrom('table')}>table</a>
                    <a className={'tk-label'} href={'#'} onClick={() => handleCopyFrom('form')}>form</a>
                    <a className={'tk-label'} href={'#'} onClick={() => handleCopyFrom('card')}>card</a>
                    <a className={'tk-label'} href={'#'} onClick={() => handleCopyFrom('simple')}>@mention</a>
                </Templates>
            </Field>
        </Root>
    );
};


export default SendMessageForm;