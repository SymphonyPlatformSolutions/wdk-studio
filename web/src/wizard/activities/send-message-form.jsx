import {useEffect, useState} from "react";
import styled from "styled-components";
import {
    TextField, TextArea
} from "@symphony-ui/uitoolkit-components/components";
import MessageMLTemplates from "./messageml-templates";

const Root = styled.div`
    height: 400px;
    padding: 10px;
    & * { margin-bottom: 10px }
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

const sendMessageTemplate = `
  - send-message:
      id: _id_
      _event_
      _stream_
      content: |
        _content_
`;

const getStreamTemplate = (streamId) => !streamId ? '' : `
      to:
        stream-id: ${streamId}
`;

const SendMessageForm = ({ setCodeSnippet, eventCodeSnippet }) => {
    const [ identifier, setIdentifier ] = useState();
    const [ streamId, setStreamId ] = useState();
    const [ content, setContent ] = useState();

    useEffect(() => {
        let snippet = null;
        if (identifier && content) {
            snippet = sendMessageTemplate
                .replace(/_id_/, identifier)
                .replace(/_event_/, eventCodeSnippet || '')
                .replace(/_stream_/, getStreamTemplate(streamId))
                .replace(/_content_/, content)
                .replace(/\n\s*\n/g, '\n');
        }
        setCodeSnippet(snippet);
    }, [ identifier, content, eventCodeSnippet ]);

    const handleChangeIdentifier = ({ target }) => setIdentifier(target.value);
    const handleChangeStreamId = ({ target }) => setStreamId(target.value);
    const handleChangeContent = ({ target }) => setContent(target.value);
    const handleCopyFrom = (template) => setContent( content + MessageMLTemplates[template] );

    const links = [ 'simple', 'complex', 'table', 'form', 'card', '@mention' ];

    return (
        <Root>
            <Title>Messages &gt; Send a Message:</Title>
            <Field><TextField label={'Identifier'} showRequired={true} value={identifier} onChange={handleChangeIdentifier} /></Field>
            <Field><TextField label={'StreamId'} showRequired={false} value={streamId} onChange={handleChangeStreamId} /></Field>
            <Field>
                <TextArea label={'Content'} showRequired={true} value={content} onChange={handleChangeContent} />
                <Templates>
                    <span className={'tk-label'}>Copy from:</span>
                    { links.map((link) => <a key={link} className={'tk-label'} href={'#'} onClick={() => handleCopyFrom(link)}>{link}</a>) }
                </Templates>
            </Field>
        </Root>
    );
};
export default SendMessageForm;
