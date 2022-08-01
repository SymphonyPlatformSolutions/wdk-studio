import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import '@symphony-ui/uitoolkit-styles/dist/css/uitoolkit.css';
import {
    Button,
    Dropdown,
} from "@symphony-ui/uitoolkit-components/components";
import styled from "styled-components";
import { editor } from 'monaco-editor';
import Editor from './editor';
import Console from './console';
import Api from './api';

const FlexBar = styled.div`
    display: flex;
    gap: .5rem;
`;
const Root = styled(FlexBar)`
    font-family: SymphonyLato, serif;
    font-size: 1rem;
    flex-direction: column;
`;
const TopBar = styled.div`
    display: grid;
    grid-template-columns: 4fr 1fr;
    align-items: flex-end;
    gap: .5rem;
`;

const WorkflowSelector = ({ currentWorkflow, setCurrentWorkflow, setContents }) => {
    const [ workflows, setWorkflows ] = useState([]);

    useEffect(() => {
        Api('list-workflows', null, (res) => {
            const values = res.map(workflow => ({label: workflow, value: workflow}));
            setWorkflows(values);
            if (values.length > 0) {
                setCurrentWorkflow(values[0]);
            }
        });
    }, []);

    useEffect(() => {
        currentWorkflow && Api('read-workflow', { workflow: currentWorkflow.value }, (res) => setContents(res.contents));
    }, [ currentWorkflow ]);

    return (
        <Dropdown
            blurInputOnSelect
            label="Select Workflow"
            menuPortalStyles={{ width: '100%' }}
            options={workflows}
            onChange={(event) => setCurrentWorkflow(event.target.value)}
            value={currentWorkflow}
        />
    );
}

const ActionBar = ({ editor, currentWorkflow, showConsole, setShowConsole, markers }) => {
    const ActionBarRoot = styled(FlexBar)`
        justify-content: space-between;
    `;
    const ActionBarMain = styled(FlexBar)`
        align-items: center;
        font-weight: bold;
        color: green;
    `;

    const [ status, setStatus ] = useState('');

    const saveWorkflow = (workflow, contents) => {
        Api('write-workflow', { workflow, contents }, () => {
            setStatus('Saved!');
            setTimeout(() => {
                setStatus('');
            }, 2000);
        });
    }

    return (
        <ActionBarRoot>
            <ActionBarMain>
                <Button
                    disabled={markers.length > 0}
                    onClick={() => saveWorkflow(currentWorkflow.value, editor.getModels()[0].getValue())}
                >
                    Save Workflow
                </Button>
                <div>{status}</div>
            </ActionBarMain>
            <Button
                variant="secondary"
                onClick={() => setShowConsole((old) => !old)}
            >
                { showConsole ? 'Hide' : 'Show' } Console
            </Button>
        </ActionBarRoot>
    );
};

const App = () => {
    const [ currentWorkflow, setCurrentWorkflow ] = useState();
    const [ showConsole, setShowConsole ] = useState(true);
    const [ contents, setContents ] = useState();
    const [ logs, setLogs ] = useState('');
    const [ markers, setMarkers ] = useState([]);

    return (
        <Root>
            <TopBar>
                <WorkflowSelector {...{ currentWorkflow, setCurrentWorkflow, setContents }} />
                <Button
                    disabled
                    variant="secondary-destructive"
                >
                    Delete Workflow
                </Button>
            </TopBar>
            <Editor {...{ editor, contents, markers, setMarkers }} />
            <ActionBar {...{ editor, currentWorkflow, showConsole, setShowConsole, markers }} />
            { showConsole && <Console {...{ logs, setLogs }} /> }
        </Root>
    );
}

ReactDOM.createRoot(document.querySelector('#root')).render(<App />);
