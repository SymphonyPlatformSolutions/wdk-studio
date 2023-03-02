import { useEffect, useState, useRef } from 'react';
import styled from "styled-components";
import { Switch, Button } from "@symphony-ui/uitoolkit-components/components";
import api from './core/api';
import { useRecoilState } from 'recoil';
import { atoms } from './core/atoms';

const ConsoleRoot = styled.div`
    border: #8f959e 1px solid;
    padding: .5rem;
    background: ${props => props.theme === 'dark' ? '#1e1e1e' : '#fff'};
`;

const LogsRoot = styled.div`
    height: 10rem;
    overflow: auto;
    font-family: Consolas, "Courier New", monospace;
    font-size: .9rem;
    white-space: pre;
`;

const ActionBar = styled.div`
    display: flex;
    justify-content: space-between;
`;

const Console = () => {
    const logsRef = useRef();
    const theme = useRecoilState(atoms.theme)[0];
    const [ logs, setLogs ] = useRecoilState(atoms.logs);
    const [ tail, setTail ] = useState(true);
    const { initLogs } = api();

    useEffect(() => initLogs((event) => event && setLogs((old) => `${old}${event.data}\n`)), []);

    useEffect(() => {
        tail && (logsRef.current.scrollTop = logsRef.current.scrollHeight);
    }, [ logs, tail ]);

    return (
        <ConsoleRoot {...{ theme }}>
            <LogsRoot ref={logsRef} className="tk-text-color">
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
