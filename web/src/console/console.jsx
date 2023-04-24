import { useEffect, useState, useRef } from 'react';
import styled from "styled-components";
import { Switch, Button } from "@symphony-ui/uitoolkit-components/components";
import api from '../core/api';
import { useRecoilState } from 'recoil';
import { atoms } from '../core/atoms';
import ResizeBar from './resize-bar';
import { useDropzone } from 'react-dropzone';

const ConsoleRoot = styled.div`
    display: ${props => props.show ? 'block' : 'none'};
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

const ActionBarPart = styled.div`
    display: flex;
    gap: 1.5rem;
`;

const getColor = (props) => {
    if (props.isDragAccept) {
        return 'var(--tk-color-green-50)';
    }
    if (props.isDragReject) {
        return 'var(--tk-color-red-50)';
    }
    if (props.isFocused) {
        return 'var(--tk-color-electricity-50)';
    }
    return 'var(--tk-button-color-secondary-default, #717681)';
};

const ImportZone = styled.div`
    font-size: .75rem;
    text-transform: uppercase;
    color: ${props => getColor(props)};
    width: calc(100% - 2rem - 4px);
    padding: .5rem 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-width: 2px;
    border-style: dashed;
    border-color: ${props => getColor(props)};
    border-radius: 1rem;
    cursor: pointer;
`;

const ImportExport = () => {
    const { exportWorkflows } = api();
    const [ loading, setLoading ] = useState(false);
    const {
        getRootProps,
        getInputProps,
        isFocused,
        isDragAccept,
        isDragReject,
        acceptedFiles
    } = useDropzone({
        accept: {
            'application/zip': ['.zip'],
            'application/x-zip-compressed': ['.zip'],
        }
    });

    useEffect(() => {
        if (!loading && acceptedFiles.length === 1) {
            console.log(acceptedFiles);
        }
    }, [ acceptedFiles ]);

    const performExport = () => {
        setLoading(true);

        exportWorkflows().then((blob) => {
            const href = URL.createObjectURL(blob);
            const a = Object.assign(document.createElement("a"), {
                href,
                style: 'display:none',
                download: `wdk-export-${new Date().getTime()}.zip`,
            });
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(href);
            a.remove();
            setLoading(false);
        });
    };

    return (
        <>
            <Button
                variant="secondary"
                loading={loading}
                onClick={performExport}
            >
                Export Workflows
            </Button>
            <ImportZone {...getRootProps({isFocused, isDragAccept, isDragReject})}>
                <input {...getInputProps()} />
                Import Workflows
            </ImportZone>
        </>
    );
};

const Console = ({ show }) => {
    const logsRef = useRef();
    const theme = useRecoilState(atoms.theme)[0];
    const session = useRecoilState(atoms.session)[0];
    const [ logs, setLogs ] = useRecoilState(atoms.logs);
    const [ tail, setTail ] = useState(true);
    const [ consoleHeight, setConsoleHeight ] = useState(200);
    const { initLogs, showStatus } = api();

    useEffect(() => initLogs(({ lastEventId, data }) => {
        setLogs((old) => `${old}${lastEventId} ${data}\n`);
        const errorMatch = data.match(/Internal server error: \[(.*)\]/);
        if (errorMatch) {
            let errorMsg = errorMatch[1];
            if (errorMsg.indexOf('ENGINE-') === 0) {
                errorMsg = errorMsg.split(':')[1];
            }
            showStatus(true, errorMsg);
        }
    }), []);

    useEffect(() => {
        tail && (logsRef.current.scrollTop = logsRef.current.scrollHeight);
    }, [ logs, tail ]);

    return (
        <ConsoleRoot theme={theme} show={show}>
            <ResizeBar {...{ consoleHeight, setConsoleHeight }} />
            <LogsRoot ref={logsRef} height={consoleHeight}>
                {logs}
            </LogsRoot>
            <ActionBar>
                <ActionBarPart>
                    { session.admin && <ImportExport /> }
                </ActionBarPart>
                <ActionBarPart>
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
                </ActionBarPart>
            </ActionBar>
        </ConsoleRoot>
    );
};

export default Console;
