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
    border: grey 1px solid;
    border-radius: .4rem;
    height: 20rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

const EditorRoot = styled.div`
    height: ${props => (props.large ? '100%' : '80%')};
    & .monaco-editor,
    & .monaco-editor .margin,
    & .monaco-editor-background { background: transparent }
    & .decorationsOverviewRuler { border-radius: .4rem; }
`;

const ProblemsRoot = styled.div`
    background-color: var(--tk-color-yellow-20);
    border-radius: 0 0 .4rem .4rem;
    overflow-x: auto;
    height: 20%;
    justify-self: flex-end;
`;

const ProblemEntry = styled.div`
    font-size: .9rem;
    padding: .2rem;
    :hover {
        background-color: var(--tk-color-electricity-30);
        cursor: pointer;
    }
`;

const Editor = ({ editor, contents, markers, setMarkers }) => {
    const ref = useRef(null);
    const [ thisEditor, setThisEditor ] = useState();

    useEffect(() => {
        if (!contents) {
            return;
        }
        if (editor.getModels().length > 0) {
            editor.getModels()[0].dispose();
        }
        setThisEditor(editor.create(ref.current, {
            automaticLayout: true,
            value: contents,
            language: 'yaml',
            theme: 'vs-light',
            scrollbar: { vertical: 'hidden' },
        }));
    }, [ contents, editor ]);

    editor.onDidChangeMarkers(({ resource }) => setMarkers(editor.getModelMarkers({ resource })));

    const goto = (lineNumber, column) => {
        thisEditor.revealLineInCenter(lineNumber);
        thisEditor.setPosition({ lineNumber, column });
        thisEditor.focus();
    }

    const Problems = ({ markers }) => (
        <ProblemsRoot>
            {
                markers.map(({ startLineNumber, startColumn, endLineNumber, endColumn, message }) => (
                    <ProblemEntry
                        key={startLineNumber + startColumn + endLineNumber + endColumn}
                        onClick={() => goto(startLineNumber, startColumn) }
                    >
                        {startLineNumber}: {message}
                    </ProblemEntry>
                ))
            }
        </ProblemsRoot>
    );

    return (
        <Root>
            <EditorRoot ref={ref} large={markers.length === 0} />
            { markers.length > 0 && <Problems {...{markers}} /> }
        </Root>
    );
};

export default Editor;
