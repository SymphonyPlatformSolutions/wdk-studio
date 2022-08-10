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
    & .monaco-editor-background { background: transparent }

    & .monaco-editor .suggest-widget > .tree {
        background: #ddfcfc;
    }
    & .monaco-editor .suggest-widget .monaco-list .monaco-list-row .suggest-icon.method::before,
    & .monaco-editor .suggest-widget .monaco-list .monaco-list-row .suggest-icon.function::before {
        background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMS42NzA4IDguNjU4MDZDMTEuMzMxOSA4Ljk5MTYgMTEuMDcxNiA5LjM2Mjc4IDEwLjg4ODYgOS43NzE3MkMxMC43MTA1IDEwLjE3OTIgMTAuNjIxIDEwLjYyMTkgMTAuNjIxIDExLjEwMDlWMTIuNzAxMkMxMC42MjEgMTIuODgwNyAxMC41ODcyIDEzLjA1MDMgMTAuNTE4OSAxMy4yMDkxQzEwLjQ1MTMgMTMuMzY2MSAxMC4zNTg2IDEzLjUwMzggMTAuMjQwNyAxMy42MjEzQzEwLjEyMjggMTMuNzM4OCA5Ljk4NDY0IDEzLjgzMTEgOS44MjcyMyAxMy44OTg0QzkuNjY4MDYgMTMuOTY2MyA5LjQ5ODA2IDE0IDkuMzE4MjMgMTRINy43MTIwNUM3LjUzMjIzIDE0IDcuMzYyMjMgMTMuOTY2MyA3LjIwMzA2IDEzLjg5ODRDNy4wNDU2NCAxMy44MzExIDYuOTA3NTMgMTMuNzM4OCA2Ljc4OTYxIDEzLjYyMTNDNi42NzE2OCAxMy41MDM4IDYuNTc4OTUgMTMuMzY2MSA2LjUxMTQxIDEzLjIwOTFDNi40NDMxMSAxMy4wNTAzIDYuNDA5MjcgMTIuODgwNyA2LjQwOTI3IDEyLjcwMTJWMTEuMTAwOUM2LjQwOTI3IDEwLjYyMiA2LjMxNzcyIDEwLjE3OTUgNi4xMzU1MyA5Ljc3MjA5QzUuOTU2ODMgOS4zNjMzNiA1LjY5ODMyIDguOTkxNTYgNS4zNTk1MyA4LjY1ODA2QzQuOTI0NjggOC4yMjkwMyA0LjU4ODk2IDcuNzUwMDMgNC4zNTM2MSA3LjIyMTM0QzQuMTE3NTYgNi42OTEwNyA0IDYuMTE2NzIgNCA1LjQ5OTUzQzQgNS4wODY2NCA0LjA1MzQyIDQuNjg4MDIgNC4xNjA0OCA0LjMwMzk3QzQuMjY3MjggMy45MjA4OSA0LjQxOTA3IDMuNTYyODYgNC42MTU5NSAzLjIzMDE4QzQuODEyNTcgMi44OTM3NyA1LjA0Nzc3IDIuNTg5MTEgNS4zMjE0NiAyLjMxNjQxQzUuNTk1MDMgMi4wNDM4MyA1Ljg5ODU4IDEuODA5NTMgNi4yMzE5NSAxLjYxMzY0QzYuNTY5NzkgMS40MTc2NCA2LjkzMTQ2IDEuMjY2MiA3LjMxNTc4IDEuMTU5ODNDNy43MDEwNiAxLjA1MzIgOC4xMDA5NCAxIDguNTE1MTQgMUM4LjkyOTM0IDEgOS4zMjkyMyAxLjA1MzIgOS43MTQ1MSAxLjE1OTgzQzEwLjA5ODggMS4yNjYyIDEwLjQ1OCAxLjQxNzM5IDEwLjc5MTggMS42MTM1MUMxMS4xMjk0IDEuODA5MzggMTEuNDM1MSAyLjA0MzcgMTEuNzA4OCAyLjMxNjQxQzExLjk4MjUgMi41ODkxIDEyLjIxNzcgMi44OTM3NiAxMi40MTQzIDMuMjMwMTZDMTIuNjExMiAzLjU2Mjg1IDEyLjc2MyAzLjkyMDg4IDEyLjg2OTggNC4zMDM5N0MxMi45NzY5IDQuNjg4MDIgMTMuMDMwMyA1LjA4NjY0IDEzLjAzMDMgNS40OTk1M0MxMy4wMzAzIDYuMTE2NzIgMTIuOTEyNyA2LjY5MTA3IDEyLjY3NjcgNy4yMjEzNEMxMi40NDEzIDcuNzUwMDMgMTIuMTA1NiA4LjIyOTAzIDExLjY3MDggOC42NTgwNlpNOS42MjE2MiAxMC41SDcuNDA4NjdWMTIuNzAxMkM3LjQwODY3IDEyLjc4MjMgNy40MzcyIDEyLjg1MTIgNy40OTg4OCAxMi45MTI3QzcuNTYwNTggMTIuOTc0MSA3LjYzMDA3IDEzLjAwMjggNy43MTIwNSAxMy4wMDI4SDkuMzE4MjNDOS40MDAyMiAxMy4wMDI4IDkuNDY5NzEgMTIuOTc0MSA5LjUzMTQgMTIuOTEyN0M5LjU5MzA5IDEyLjg1MTIgOS42MjE2MiAxMi43ODIzIDkuNjIxNjIgMTIuNzAxMlYxMC41WiIgZmlsbD0iI0ZGQ0MwMCIvPgo8L3N2Zz4K) !important;
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

const Editor = ({ editor, contents, markers, setMarkers }) => {
    const ref = useRef(null);
    const [ thisEditor, setThisEditor ] = useState();

    useEffect(() => {
        if (!contents) {
            return;
        }
        if (thisEditor) {
            thisEditor.setValue(contents);
        } else {
            if (editor.getModels().length > 0) {
                editor.getModels()[0].dispose()
            }
            setThisEditor(editor.create(ref.current, {
                automaticLayout: true,
                value: contents,
                language: 'yaml',
                theme: 'vs-light',
                scrollbar: { vertical: 'hidden' },
            }));
        }
    }, [ contents, editor, thisEditor ]);

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
