import { useEffect, useState, useRef } from 'react';
import styled from "styled-components";
import { Switch } from "@symphony-ui/uitoolkit-components/components";

const ConsoleRoot = styled.div`
    border: #8f959e 1px solid;
    padding: .5rem;
`;

const LogsRoot = styled.div`
    height: 10rem;
    overflow: auto;
    font-family: Consolas, "Courier New", monospace;
    font-size: .9rem;
    white-space: pre;
`;

const Console = ({ logs, setLogs }) => {
    const logsRef = useRef();
    const [ tail, setTail ] = useState('checked');
    const apiRoot = window.location.hostname === 'localhost' ? 'https://localhost:10443/' : '';

    useEffect(() => {
        let eventSource = new EventSource(apiRoot + "logs");
        eventSource.onmessage = (event) => {
            setLogs((old) => `${old}${event.data}\n`);
        };
    }, [ apiRoot, setLogs ]);

    useEffect(() => {
        (tail === 'checked') && (logsRef.current.scrollTop = logsRef.current.scrollHeight);
    }, [ logs, tail ]);

    return (
        <ConsoleRoot>
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
