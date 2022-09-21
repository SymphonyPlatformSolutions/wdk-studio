import React, {useState, useEffect, lazy} from 'react';
import ReactDOM from 'react-dom/client';
import '@symphony-ui/uitoolkit-styles/dist/css/uitoolkit.css';
import styled from "styled-components";
import { editor } from 'monaco-editor';
import { api } from './api';
import Monitor from './monitor';
import MonitorX from './monitor-x';

const Editor = lazy(() => import('./editor'));
const Console = lazy(() => import('./console'));
const WorkflowSelector = lazy(() => import('./selector'));
const ActionBar = lazy(() => import('./action-bar'));
const FadeToast = lazy(() => import('./fade-toast'));

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
    const [ currentWorkflowId, setCurrentWorkflowId ] = useState();
    const [ showConsole, setShowConsole ] = useState(true);
    const [ editMode, setEditMode ] = useState(true);
    const [ contents, setContents ] = useState();
    const [ logs, setLogs ] = useState('');
    const [ markers, setMarkers ] = useState([]);
    const [ toast, setToast ] = useState({ show: false });
    const [ theme, setTheme ] = useState('light');
    const [snippet, setSnippet] = useState({});
    const [ isContentChanged, setIsContentChanged ] = useState('original');

    useEffect(() => {
        if (window.SYMPHONY) {
            window.SYMPHONY.remote.hello().then((data) => {
                const bodyClasses = []
                if (data.themeV2.name === 'dark') {
                    bodyClasses.push('tk-dark');
                }
                if (data.themeV2.isCondensedMode) {
                    bodyClasses.push('tk-condensed');
                }
                document.querySelector('body').className = bodyClasses.join(' ');
                setTheme(data.themeV2.name);
            });
        }
    }, []);

    useEffect(() => {
        if (!currentWorkflow) {
            return;
        }
        api.readWorkflow({ workflow: currentWorkflow?.value }, (response) => {
            setIsContentChanged('original');
            setContents(response.contents);
            setCurrentWorkflowId(response.contents.match(/id: ([\w\-]+)/)[1]);
        });
    }, [ currentWorkflow, setContents ]);

    return (
        <Root>
            <WorkflowSelector {...{ workflows, setWorkflows, currentWorkflow, setCurrentWorkflow, setToast, editMode, isContentChanged, setIsContentChanged }} />
            <ActionBar {...{ editor, setSnippet, currentWorkflow, contents, editMode, setEditMode, setContents, showConsole, setShowConsole, markers, setToast, setWorkflows, isContentChanged, setIsContentChanged }} />
            { editMode && <Editor {...{ editor, snippet, contents, markers, setMarkers, theme, setIsContentChanged }} /> }
            { !editMode && <MonitorX {...{ currentWorkflowId }} /> }
            { showConsole && <Console {...{ logs, setLogs, theme }} /> }
            <FadeToast {...{ toast }} />
        </Root>
    );
};
ReactDOM.createRoot(document.querySelector('#root')).render(<App />);
