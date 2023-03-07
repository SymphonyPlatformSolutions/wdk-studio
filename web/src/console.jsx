import { useEffect, useState, useRef } from 'react';
import styled from "styled-components";
import { Switch, Button } from "@symphony-ui/uitoolkit-components/components";
import api from './core/api';
import { useRecoilState } from 'recoil';
import { atoms } from './core/atoms';

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

const ResizeBar = styled.div`
    position: fixed;
    left: 0;
    bottom: ${props => props.height + 50 - 40}px;
    width: 100%;
    height: 80px;
    z-index: 99;
    user-select: none;
    :hover { cursor: ns-resize }
`;

const Console = () => {
    const logsRef = useRef();
    const theme = useRecoilState(atoms.theme)[0];
    const [ logs, setLogs ] = useRecoilState(atoms.logs);
    const [ tail, setTail ] = useState(true);
    const [ resize, setResize ] = useState({ drag: false });
    const [ consoleHeight, setConsoleHeight ] = useState(200);
    const { initLogs } = api();

    useEffect(() => initLogs((event) => event && setLogs((old) => `${old}${event.data}\n`)), []);

    useEffect(() => {
        tail && (logsRef.current.scrollTop = logsRef.current.scrollHeight);
    }, [ logs, tail ]);

    const handleResizeStart = ({ nativeEvent }) =>
        setResize({ drag: true, x: nativeEvent.offsetX, y: nativeEvent.offsetY });

    const handleResizeMove = ({ nativeEvent }) => {
        if (resize.drag) {
            setConsoleHeight(old => old + resize.y - nativeEvent.offsetY);
        }
    };

    const handleResizeEnd = () => setResize({ drag: false });

    return (
        <ConsoleRoot theme={theme}>
            <ResizeBar
                height={consoleHeight}
                onMouseDown={handleResizeStart}
                onMouseMove={handleResizeMove}
                onMouseUp={handleResizeEnd}
                onMouseLeave={handleResizeEnd}
            />
            <LogsRoot ref={logsRef} height={consoleHeight} className="tk-text-color">
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
