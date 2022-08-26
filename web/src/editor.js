import React, { useEffect, useRef, useState } from 'react';
import { setDiagnosticsOptions } from 'monaco-yaml';
import styled from "styled-components";

window.MonacoEnvironment = {
    getWorker(moduleId, label) {
        return new Worker(new URL('monaco-yaml/yaml.worker', import.meta.url));
    },
};

const modelUri = 'https://raw.githubusercontent.com/finos/symphony-wdk/master/workflow-language/src/main/resources/swadl-schema-1.0.json';
setDiagnosticsOptions({
    validate: true,
    enableSchemaRequest: true,
    format: true,
    hover: true,
    completion: true,
    schemas: [{ uri: modelUri, fileMatch: ['*'] }],
});

const Root = styled.div`
    border: #8f959e 1px solid;
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

const EditorRoot = styled.div`
    height: ${props => (props.large ? '100%' : '80%')};
    & .monaco-editor,
    & .monaco-editor .margin,
    & .monaco-editor-background {
        background: transparent
    }
`;

const ProblemsRoot = styled.div`
    background-color: var(--tk-color-red-20);
    border-top: 1px #8f959e solid;
    overflow-x: auto;
    height: 100px;
    justify-self: flex-end;
`;

const ProblemEntry = styled.div`
    font-size: .9rem;
    padding: .2rem;
    :hover {
        background-color: var(--tk-color-red-30);
        cursor: pointer;
    }
`;

const Editor = ({ editor, snippet, contents, markers, setMarkers, theme, setIsContentChanged }) => {
    const ref = useRef(null);
    const [ thisEditor, setThisEditor ] = useState();

    useEffect(() => {
        if (!snippet.content) {
            return;
        }
        if (thisEditor) {
            let id = { major: 1, minor: 1 };
            let range = thisEditor.getSelection();
            let op = { identifier: id, range: range, text: snippet.content, forceMoveMarkers: true };
            thisEditor.executeEdits("wizard", [op]);
            thisEditor.focus();
        }
    }, [snippet]);

    useEffect(() => {
        if (!contents) {
            return;
        }
        if (thisEditor) {
            thisEditor.setValue(contents);
            thisEditor.onDidChangeModelContent( (e) => {
                const modifiedContents = editor.getModels()[0].getValue();
                if ( modifiedContents != contents && !e.isFlush ) {
                    setIsContentChanged( 'modified' );
                } else {
                    setIsContentChanged( 'pristine' );
                }
            } );
        } else {
            if (editor.getModels().length > 0) {
                editor.getModels()[0].dispose()
            }
            setThisEditor(editor.create(ref.current, {
                automaticLayout: true,
                value: contents,
                language: 'yaml',
                theme: 'vs-' + theme,
                scrollbar: { vertical: 'hidden' },
            }));
        }
    }, [ theme, contents, editor, thisEditor ]);

    editor.onDidChangeMarkers(({ resource }) => setMarkers(editor.getModelMarkers({ resource })));

    const goto = (lineNumber, column) => {
        thisEditor.revealLineInCenter(lineNumber);
        thisEditor.setPosition({ lineNumber, column });
        thisEditor.focus();
    }

    const Problems = ({ markers }) => markers.map(({
        startLineNumber, startColumn, endLineNumber, endColumn, message
    }) => (
        <ProblemEntry
            key={startLineNumber + startColumn + endLineNumber + endColumn}
            onClick={() => goto(startLineNumber, startColumn) }
        >
            {startLineNumber}: {message}
        </ProblemEntry>
    ));

    return (
        <Root>
            <EditorRoot ref={ref} large={markers.length === 0} />
            { markers.length > 0 && <ProblemsRoot><Problems {...{markers}} /></ProblemsRoot> }
        </Root>
    );
};

export default Editor;
