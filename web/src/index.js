import React, { useState, useEffect, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import '@symphony-ui/uitoolkit-styles/dist/css/uitoolkit.css';
import styled from 'styled-components';
import { editor } from 'monaco-editor';
import { api } from './api';
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
    const [ ready, setReady ] = useState(false);
    const [ workflows, setWorkflows ] = useState([]);
    const [ currentWorkflow, setCurrentWorkflow ] = useState();
    const [ currentWorkflowId, setCurrentWorkflowId ] = useState();
    const [ selectedInstance, setSelectedInstance ] = useState();
    const [ showConsole, setShowConsole ] = useState(true);
    const [ editMode, setEditMode ] = useState(true);
    const [ contents, setContents ] = useState();
    const [ logs, setLogs ] = useState('');
    const [ markers, setMarkers ] = useState([]);
    const [ toast, setToast ] = useState({ show: false });
    const [ theme, setTheme ] = useState('light');
    const [ snippet, setSnippet ] = useState({});
    const [ isContentChanged, setIsContentChanged ] = useState('original');

    useEffect(() => {
        if (!window.SYMPHONY) {
            return;
        }

        const isDev = window.location.hostname === 'localhost';
        const appId = isDev ? 'localhost-10443' : 'wdk-studio';

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

            SYMPHONY.application.connect(
                appId,
                ['modules', 'applications-nav', 'extended-user-info' ],
                [`${appId}:app`],
            ).then(() => {
                const userInfoService = SYMPHONY.services.subscribe('extended-user-info');
                userInfoService.getJwt().then((jwt) => api.setJwt(jwt));
                setReady(true);
            });
        });
    }, []);

    useEffect(() => {
        if (!currentWorkflow || !ready) {
            return;
        }
        api.readWorkflow({ workflow: currentWorkflow?.value }, (response) => {
            setIsContentChanged('original');
            setContents(response.contents);
            setCurrentWorkflowId(response.contents.match(/id: ([\w\-]+)/)[1]);
        });
    }, [ ready, currentWorkflow, setContents ]);

    return !ready ? 'Loading..' : (
        <Root>
            <WorkflowSelector {...{ workflows, setWorkflows, currentWorkflow, setCurrentWorkflow, setToast, editMode, isContentChanged, setIsContentChanged }} />
            <ActionBar {...{ editor, setSnippet, currentWorkflow, currentWorkflowId, selectedInstance, setSelectedInstance, contents, editMode, setEditMode, setContents, showConsole, setShowConsole, markers, setToast, setWorkflows, isContentChanged, setIsContentChanged }} />
            { editMode && <Editor {...{ editor, snippet, contents, markers, setMarkers, theme, setIsContentChanged }} /> }
            { !editMode && <MonitorX {...{ currentWorkflowId, setSelectedInstance }} /> }
            { showConsole && <Console {...{ logs, setLogs, theme }} /> }
            <FadeToast {...{ toast }} />
        </Root>
    );
};
ReactDOM.createRoot(document.querySelector('#root')).render(<App />);
