import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import '@symphony-ui/uitoolkit-styles/dist/css/uitoolkit.css';
import {
    Button, Dropdown, Toast, Loader,
    Modal, ModalTitle, ModalBody, ModalFooter,
} from "@symphony-ui/uitoolkit-components/components";
import styled, { keyframes } from "styled-components";
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
const fade = keyframes`
    0%, 100% { opacity: 0 }
    10%, 90% { opacity: 1 }
`;
const FadeToast = styled(Toast)`
    animation: ${fade} 2s linear forwards;
    background: var(--tk-color-green-50);
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
    }, [ setCurrentWorkflow ]);

    useEffect(() => {
        currentWorkflow && Api('read-workflow', { workflow: currentWorkflow.value }, (res) => setContents(res.contents));
    }, [ currentWorkflow, setContents ]);

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

const ActionBarRoot = styled(FlexBar)`
    justify-content: space-between;
`;

const ActionBar = ({ editor, currentWorkflow, showConsole, setShowConsole, markers, setToast }) => {
    const saveWorkflow = (workflow, contents) => {
        Api('write-workflow', { workflow, contents }, () => {
            setToast({ show: true, content: 'Saved!'});
            setTimeout(() => {
                setToast({ show: false });
            }, 2000);
        });
    }

    return (
        <ActionBarRoot>
            <Button
                disabled={markers.length > 0}
                onClick={() => saveWorkflow(currentWorkflow.value, editor.getModels()[0].getValue())}
            >
                Save Workflow
            </Button>
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
    const [ toast, setToast ] = useState({ show: false });
    const [ deleteModal, setDeleteModal ] = useState({ show: false });

    return (
        <Root>
            <TopBar>
                <WorkflowSelector {...{ currentWorkflow, setCurrentWorkflow, setContents }} />
                <Button
                    variant="secondary-destructive"
                    onClick={() => setDeleteModal({ show: true })}
                >
                    Delete Workflow
                </Button>
                <Modal size="small" show={deleteModal.show}>
                    <ModalTitle>Confirm Delete</ModalTitle>
                    <ModalBody>This will delete the workflow permanently. Are you sure?</ModalBody>
                    <ModalFooter style={{ gap: '.5rem' }}>
                        <Button
                            variant="primary-destructive"
                            onClick={() => setDeleteModal({ show: true, loading: true })}
                            disabled={deleteModal.loading}
                        >
                            { deleteModal.loading ? <Loader /> : 'Delete' }
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setDeleteModal({ show: false })}
                            disabled={deleteModal.loading}
                        >
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>
            </TopBar>
            <Editor {...{ editor, contents, markers, setMarkers }} />
            <ActionBar {...{ editor, currentWorkflow, showConsole, setShowConsole, markers, setToast }} />
            { showConsole && <Console {...{ logs, setLogs }} /> }
            <FadeToast
                show={toast.show}
                content={toast.content || ''}
                leftIcon={toast.icon || 'check'}
                placement={{ horizontal: 'center', vertical: 'bottom' }}
            />
        </Root>
    );
}

ReactDOM.createRoot(document.querySelector('#root')).render(<App />);
