import { useEffect, useState, useRef } from 'react';
import styled from "styled-components";
import { Checkbox } from "@symphony-ui/uitoolkit-components/components";

const ConsoleRoot = styled.div`
    border: grey 1px solid;
    border-radius: .4rem;
    padding: .5rem;
`;

const LogsRoot = styled.div`
    height: 10rem;
    overflow: auto;
    font-family: Consolas, "Courier New", monospace;
    font-size: .9rem;
    white-space: pre;
`;

export default ({ logs, setLogs }) => {
    const logsRef = useRef();
    const [ tail, setTail ] = useState('checked');
    const apiRoot = window.location.hostname === 'localhost' ? 'https://localhost:10443/' : '';

    useEffect(() => {
        let eventSource = new EventSource(apiRoot + "logs");
        eventSource.onmessage = (event) => {
            setLogs((old) => `${old}${event.data}\n`);
        };
    }, []);

    useEffect(() => {
        (tail === 'checked') && (logsRef.current.scrollTop = logsRef.current.scrollHeight);
    }, [ logs, tail ]);

    return (
        <ConsoleRoot>
            <LogsRoot ref={logsRef}>
                {logs}
            </LogsRoot>
            <Checkbox
                name="tail"
                value="tail"
                label="Tail Logs"
                status={tail}
                onChange={() => setTail((old) => (old === 'checked') ? 'unchecked' : 'checked')}
            />
        </ConsoleRoot>
    );
};
