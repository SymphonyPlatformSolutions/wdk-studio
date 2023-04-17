import {useEffect, useState} from 'react';
import styled from 'styled-components';
import {
    TextField, TextArea
} from '@symphony-ui/uitoolkit-components/components';
import MessageMLTemplates from './messageml-templates';

const Templates = styled.div`
    display: flex;
    gap: .3rem;
    font-size: .9rem;
`;

const Template = styled.div`
    :hover {
        cursor: pointer;
        text-decoration: underline;
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
    const [ identifier, setIdentifier ] = useState('');
    const [ streamId, setStreamId ] = useState('');
    const [ content, setContent ] = useState('');

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
    const handleCopyFrom = (template) => setContent((c) => `${c}\n${MessageMLTemplates[template]}`.trim());

    const links = [ 'simple', 'table', 'form', 'card', 'mention' ];

    return (
        <>
            Messages &gt; Send a Message:
            <TextField label="Identifier" showRequired value={identifier} onChange={handleChangeIdentifier} />
            <TextField label="StreamId" value={streamId} onChange={handleChangeStreamId} />
            <TextArea label="Content" showRequired value={content} onChange={handleChangeContent} />
            <Templates>
                Copy from:
                { links.map((link) => <Template key={link} onClick={() => handleCopyFrom(link)}>{link}</Template>) }
            </Templates>
        </>
    );
};
export default SendMessageForm;
