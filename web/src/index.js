import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '@symphony-ui/uitoolkit-styles/dist/css/uitoolkit.css';
import styled from "styled-components";
import { editor } from 'monaco-editor';
import Editor from './editor';
import Console from './console';
import Api from './api';
import WorkflowSelector from './selector';
import ActionBar from './action-bar';
import FadeToast from './fade-toast';

const Root = styled.div`
    display: flex;
    gap: .5rem;
    font-family: SymphonyLato, serif;
    font-size: 1rem;
    flex-direction: column;
    height: 100%;
`;

const App = () => {
    const [ workflows, setWorkflows ] = useState([]);
    const [ currentWorkflow, setCurrentWorkflow ] = useState();
    const [ showConsole, setShowConsole ] = useState(true);
    const [ contents, setContents ] = useState();
    const [ logs, setLogs ] = useState('');
    const [ markers, setMarkers ] = useState([]);
    const [ toast, setToast ] = useState({ show: false });

    useEffect(() => {
        if (!currentWorkflow) {
            return;
        }
        const request = { workflow: currentWorkflow?.value };
        Api('read-workflow', request, ({ contents }) => setContents(contents));
    }, [ currentWorkflow, setContents ]);

    return (
        <Root>
            <WorkflowSelector {...{ workflows, setWorkflows, currentWorkflow, setCurrentWorkflow, setToast }} />
            <ActionBar {...{ editor, currentWorkflow, showConsole, setShowConsole, markers, setToast, setWorkflows }} />
            <Editor {...{ editor, contents, markers, setMarkers }} />
            { showConsole && <Console {...{ logs, setLogs }} /> }
            <FadeToast {...{ toast }} />
        </Root>
    );
};
ReactDOM.createRoot(document.querySelector('#root')).render(<App />);
