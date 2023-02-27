import { atoms } from './atoms';
import Loader from '@symphony-ui/uitoolkit-components/components/loader';
import { RecoilRoot, useRecoilState } from 'recoil';
import api from './api';
import FadeToast from './fade-toast';
import React, { Suspense, useState, useEffect, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import styled from 'styled-components';

const Editor = lazy(() => import('./editor'));
const Console = lazy(() => import('./console'));
const WorkflowSelector = lazy(() => import('./selector'));
const ActionBar = lazy(() => import('./action-bar'));
const MonitorX = lazy(() => import('./monitor-x'));

const Root = styled.div`
    display: flex;
    gap: .5rem;
    font-family: SymphonyLato, serif;
    font-size: 1rem;
    flex-direction: column;
    height: 100%;
`;

const App = () => {
    const currentWorkflow = useRecoilState(atoms.currentWorkflow)[0];
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
        const isDev = window.location.hostname === 'localhost';
        const appId = isDev ? 'localhost-10443' : 'wdk-studio';

        if (!window.SYMPHONY) {
            setSession({ isDev });
            return;
        }

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
                if (userInfoService) {
                    userInfoService.getJwt().then((token) => {
                        if (token) {
                            setSession({ token });
                            window.localStorage.setItem('token', token);
                        }
                    });
                }
            });
        });
    }, []);

    useEffect(() => {
        if (!session) {
            return;
        }
        if (!currentWorkflow) {
            setContents(undefined);
            return;
        }
        readWorkflow(currentWorkflow?.value, (response) => {
            setIsContentChanged('original');
            const current = response.filter(i => i.active)[0];
            setContents(current.swadl);
        });
    }, [ session, currentWorkflow ]);

    return !session ? 'Loading..' : (!window.SYMPHONY && !session.isDev) ? 'This app only works in Symphony' : (
        <Root>
            <Suspense fallback={<Loader variant="primary" />}>
                <WorkflowSelector {...{ editMode, isContentChanged, setIsContentChanged }} />
                <ActionBar {...{ setSnippet, selectedInstance, setSelectedInstance, contents, editMode, setEditMode, setContents, showConsole, setShowConsole, markers, isContentChanged, setIsContentChanged }} />
                { editMode && <Editor {...{ snippet, contents, markers, setMarkers, theme, setIsContentChanged }} /> }
                { !editMode && <MonitorX {...{ setSelectedInstance }} /> }
                { showConsole && <Console {...{ logs, setLogs, theme }} /> }
                <FadeToast />
            </Suspense>
        </Root>
    );
};
ReactDOM.createRoot(document.querySelector('#root')).render(<RecoilRoot><App /></RecoilRoot>);
