import { useEffect, useState, useRef } from 'react';
import styled from "styled-components";
import { Switch, Button } from "@symphony-ui/uitoolkit-components/components";
import api from '../core/api';
import { useRecoilState } from 'recoil';
import { atoms } from '../core/atoms';
import ResizeBar from './resize-bar';

const ConsoleRoot = styled.div`
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    border-top: var(--tk-main-text-color, #525760) 2px solid;
    backdrop-filter: blur(.4rem);
`;

const LogsRoot = styled.div`
    height: ${props => props.height}px;
    overflow: auto;
    font-family: Consolas, "Courier New", monospace;
    font-size: .9rem;
    white-space: pre;
`;

const ActionBar = styled.div`
    display: flex;
    justify-content: space-between;
    margin: .5rem;
`;

const Console = () => {
    const logsRef = useRef();
    const theme = useRecoilState(atoms.theme)[0];
    const [ logs, setLogs ] = useRecoilState(atoms.logs);
    const [ tail, setTail ] = useState(true);

    const [ consoleHeight, setConsoleHeight ] = useState(200);
    const { initLogs } = api();

    useEffect(() => initLogs((event) => event && setLogs((old) => `${old}${event.data}\n`)), []);

    useEffect(() => {
        tail && (logsRef.current.scrollTop = logsRef.current.scrollHeight);
    }, [ logs, tail ]);

    return (
        <ConsoleRoot theme={theme}>
            <ResizeBar {...{ consoleHeight, setConsoleHeight }} />
            <LogsRoot ref={logsRef} height={consoleHeight}>
                {logs}
            </LogsRoot>
            <ActionBar>
                <Switch
                    name="tail"
                    value="tail"
                    label="Tail Logs"
                    status={tail ? 'checked' : 'unchecked'}
                    onChange={() => setTail((old) => !old)}
                />
                <Button
                    variant="secondary"
                    onClick={() => setLogs('')}
                >
                    Clear
                </Button>
            </ActionBar>
        </ConsoleRoot>
    );
};

export default Console;
