import { atoms } from './core/atoms';
import { RecoilRoot, useRecoilState } from 'recoil';
import api from './core/api';
import Console from './console/console';
import FadeToast from './core/fade-toast';
import React, { Suspense, useState, useEffect, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import Spinner from './core/spinner';
import './index.css';

const Editor = lazy(() => import('./editor/editor'));
const WorkflowSelector = lazy(() => import('./create-workflow/workflow-selector'));
const ActionBar = lazy(() => import('./action-bar/action-bar'));
const Monitor = lazy(() => import('./monitor/monitor'));

const App = () => {
    const [ thisEditor, setThisEditor ] = useState();
    const [ showConsole, setShowConsole ] = useState(false);
    const editMode = useRecoilState(atoms.editMode)[0];
    const setTheme = useRecoilState(atoms.theme)[1];
    const [ session, setSession ] = useRecoilState(atoms.session);
    const [ uiService, setUiService ] = useState();
    const { parseJwt, getProfile } = api();

    const initSymphony = (appId) => window.SYMPHONY.remote.hello().then((data) => {
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
            [ 'modules', 'applications-nav', 'extended-user-info', 'ui' ],
            [ `${appId}:app` ],
        ).then(() => {
            const existingSession = JSON.parse(window.localStorage.getItem('session'));
            if (existingSession && new Date().getTime() < (existingSession.exp * 1000)) {
                setSession(existingSession);
            }
            const userInfoService = SYMPHONY.services.subscribe('extended-user-info');
            if (userInfoService) {
                userInfoService.getJwt().then((token) => {
                    if (token) {
                        getProfile(token, (response) => {
                            const jwt = parseJwt(token);
                            const newSession = { token, ...jwt, ...response };
                            setSession(newSession);
                            window.localStorage.setItem('session', JSON.stringify(newSession));
                        });
                    }
                });
            }
            setUiService(SYMPHONY.services.subscribe('ui'));
        }, (e) => console.error(e));
    });

    useEffect(() => {
        const isDev = window.location.hostname === 'localhost';
        const appId = isDev ? 'localhost-10443' : 'wdk-studio';

        if (window.SYMPHONY) {
            initSymphony(appId);
        } else {
            setSession({ isDev });
        }
    }, []);

    return !session ? 'Loading'
        : (!window.SYMPHONY && !session.isDev) ? 'Please launch Symphony to use WDK Studio' : (
        <Suspense fallback={<Spinner />}>
            <WorkflowSelector {...{ uiService }} />
            <ActionBar {...{ showConsole, setShowConsole, thisEditor }} />
            <Editor show={editMode} {...{ thisEditor, setThisEditor }} />
            { !editMode && <Monitor /> }
            <Console show={editMode && showConsole} />
            <FadeToast />
        </Suspense>
    );
};
ReactDOM.createRoot(document.querySelector('#root')).render(<RecoilRoot><App /></RecoilRoot>);
