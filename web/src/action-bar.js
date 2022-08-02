import { Button } from "@symphony-ui/uitoolkit-components/components";
import styled from "styled-components";
import Api from './api';

const Root = styled.div`
    display: flex;
    gap: .5rem;
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
        <Root>
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
        </Root>
    );
};
export default ActionBar;