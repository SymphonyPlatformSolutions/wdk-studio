import { useEffect, useState, useRef } from 'react';
import styled from "styled-components";
import { Switch } from "@symphony-ui/uitoolkit-components/components";
import { initLogs } from './api';

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

const Console = ({ logs, setLogs, theme }) => {
    const logsRef = useRef();
    const [ tail, setTail ] = useState('checked');

    useEffect(
        () => initLogs((event) => {
            setLogs((old) => `${old}${event.data}\n`);
        }), [ setLogs ]
    );

    useEffect(() => {
        (tail === 'checked') && (logsRef.current.scrollTop = logsRef.current.scrollHeight);
    }, [ logs, tail ]);

    return (
        <ConsoleRoot {...{ theme }}>
            <LogsRoot ref={logsRef} className="tk-text-color">
                {logs}
            </LogsRoot>
            <Switch
                name="tail"
                value="tail"
                label="Tail Logs"
                status={tail}
                onChange={() => setTail((old) => (old === 'checked') ? 'unchecked' : 'checked')}
            />
        </ConsoleRoot>
    );
};

export default Console;
