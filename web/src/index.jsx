import { atoms } from './core/atoms';
import { RecoilRoot, useRecoilState } from 'recoil';
import api from './core/api';
import FadeToast from './core/fade-toast';
import React, { Suspense, useState, useEffect, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import styled from 'styled-components';
import Spinner from './core/spinner';

const Editor = lazy(() => import('./editor/editor'));
const Console = lazy(() => import('./console/console'));
const WorkflowSelector = lazy(() => import('./create-workflow/workflow-selector'));
const ActionBar = lazy(() => import('./action-bar/action-bar'));
const Monitor = lazy(() => import('./monitor/monitor'));

const Root = styled.div`
    display: flex;
    gap: .5rem;
    font-family: SymphonyLato, serif;
    font-size: 1rem;
    flex-direction: column;
    flex: 1 1 1px;
    width: calc(100vw - 1rem);
`;

const App = () => {
    const [ showConsole, setShowConsole ] = useState(true);
    const editMode = useRecoilState(atoms.editMode)[0];
    const setTheme = useRecoilState(atoms.theme)[1];
    const [ session, setSession ] = useRecoilState(atoms.session);
    const [ uiService, setUiService ] = useState();
    const { parseJwt } = api();

    const initSymphony = (appId) => {
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
                [ 'modules', 'applications-nav', 'extended-user-info', 'ui' ],
                [ `${appId}:app` ],
            ).then(() => {
                const token = window.localStorage.getItem('token');
                if (token !== null) {
                    const jwt = parseJwt(token);
                    if (new Date().getTime() < (jwt.exp * 1000)) {
                        setSession({ token, ...jwt });
                    }
                }
                const userInfoService = SYMPHONY.services.subscribe('extended-user-info');
                if (userInfoService) {
                    userInfoService.getJwt().then((token) => {
                        if (token) {
                            const jwt = parseJwt(token);
                            setSession({ token, ...jwt });
                            window.localStorage.setItem('token', token);
                        }
                    });
                }
                setUiService(SYMPHONY.services.subscribe('ui'));
            }, (e) => console.error(e));
        });
    };

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
            <Root>
                <WorkflowSelector {...{ uiService }} />
                <ActionBar {...{ showConsole, setShowConsole }} />
                { editMode && <Editor /> }
                { !editMode && <Monitor /> }
                { editMode && showConsole && <Console /> }
                <FadeToast />
            </Root>
        </Suspense>
    );
};
ReactDOM.createRoot(document.querySelector('#root')).render(<RecoilRoot><App /></RecoilRoot>);
