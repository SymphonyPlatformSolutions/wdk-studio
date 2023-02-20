import '@symphony-ui/uitoolkit-styles/dist/css/uitoolkit.css';
import { atoms } from './atoms';
import { editor } from 'monaco-editor';
import { RecoilRoot, useRecoilState } from 'recoil';
import ActionBar from './action-bar';
import api from './api';
import Console from './console';
import Editor from './editor';
import FadeToast from './fade-toast';
import MonitorX from './monitor-x';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import styled from 'styled-components';
import WorkflowSelector from './selector';

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
    const [ selectedInstance, setSelectedInstance ] = useState();
    const [ showConsole, setShowConsole ] = useState(true);
    const [ editMode, setEditMode ] = useState(true);
    const [ contents, setContents ] = useState();
    const [ logs, setLogs ] = useState('');
    const [ markers, setMarkers ] = useState([]);
    const [ theme, setTheme ] = useState('light');
    const [ snippet, setSnippet ] = useState({});
    const [ isContentChanged, setIsContentChanged ] = useState('original');
    const [ session, setSession ] = useRecoilState(atoms.session);
    const { parseJwt, readWorkflow } = api();

    useEffect(() => {
        if (!window.SYMPHONY) {
            setSession(true);
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
                const token = window.localStorage.getItem('token');
                if (token !== null) {
                    const jwt = parseJwt(token);
                    if (new Date().getTime() < (jwt.exp * 1000)) {
                        setSession({ token });
                    }
                }
                const userInfoService = SYMPHONY.services.subscribe('extended-user-info');
                userInfoService.getJwt().then((token) => {
                    if (token) {
                        setSession({ token });
                        window.localStorage.setItem('token', token);
                    }
                });
            });
        });
    }, []);

    useEffect(() => {
        if (!(currentWorkflow && session)) {
            return;
        }
        readWorkflow(currentWorkflow?.value, (response) => {
            setIsContentChanged('original');
            const current = response.filter(i => i.active)[0];
            setContents(current.swadl);
            setCurrentWorkflowId(current.swadl.match(/id: ([\w\-]+)/)[1]);
        });
    }, [ session, currentWorkflow ]);

    return !session ? 'Loading..' : !window.SYMPHONY ? 'This app only works in Symphony' : (
        <Root>
            <WorkflowSelector {...{ workflows, setWorkflows, currentWorkflow, setCurrentWorkflow, editMode, isContentChanged, setIsContentChanged }} />
            <ActionBar {...{ editor, setSnippet, currentWorkflow, currentWorkflowId, selectedInstance, setSelectedInstance, contents, editMode, setEditMode, setContents, showConsole, setShowConsole, markers, setWorkflows, isContentChanged, setIsContentChanged }} />
            { editMode && <Editor {...{ editor, snippet, contents, markers, setMarkers, theme, setIsContentChanged }} /> }
            { !editMode && <MonitorX {...{ currentWorkflowId, setSelectedInstance }} /> }
            { showConsole && <Console {...{ logs, setLogs, theme }} /> }
            <FadeToast />
        </Root>
    );
};
ReactDOM.createRoot(document.querySelector('#root')).render(<RecoilRoot><App /></RecoilRoot>);
