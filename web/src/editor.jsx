import { Uri } from 'monaco-editor';
import { editor } from 'monaco-editor';
import { setDiagnosticsOptions } from 'monaco-yaml';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import YamlWorker from './yaml-worker?worker';

window.MonacoEnvironment = {
    getWorker(moduleId, label) {
        switch (label) {
            case 'editorWorkerService': return new EditorWorker();
            case 'yaml': return new YamlWorker();
            default: throw new Error(`Unknown label ${label}`);
        }
    },
};
const uri = 'https://raw.githubusercontent.com/finos/symphony-wdk/master/workflow-language/src/main/resources/swadl-schema-1.0.json';
const modelUri = Uri.parse(uri);
setDiagnosticsOptions({
    validate: true,
    enableSchemaRequest: true,
    format: true,
    hover: true,
    completion: true,
    schemas: [{ uri: uri, fileMatch: [String(modelUri)] }],
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

const Editor = ({ snippet, contents, markers, setMarkers, theme, setIsContentChanged }) => {
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
            thisEditor.onDidChangeModelContent((e) => {
                const modifiedContents = editor.getModels()[0].getValue();
                if ( modifiedContents != contents && !e.isFlush ) {
                    setIsContentChanged( 'modified' );
                } else {
                    setIsContentChanged( 'pristine' );
                }
            });
        } else {
            if (editor.getModels().length > 0) {
                editor.getModels()[0].dispose();
            }
            setThisEditor(editor.create(ref.current, {
                automaticLayout: true,
                model: editor.createModel(contents, 'yaml', modelUri),
                theme: 'vs-' + theme,
                scrollbar: { vertical: 'hidden' },
            }));
        }
    }, [ theme, contents, thisEditor ]);

    editor.onDidChangeMarkers(({ resource }) => setMarkers(editor.getModelMarkers({ resource })));

    const goto = (lineNumber, column) => {
        thisEditor.revealLineInCenter(lineNumber);
        thisEditor.setPosition({ lineNumber, column });
        thisEditor.focus();
    }

    const Problems = ({ markers }) => markers.map((
        { startLineNumber, startColumn, message }, index
    ) => (
        <ProblemEntry key={index} onClick={() => goto(startLineNumber, startColumn)}>
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
