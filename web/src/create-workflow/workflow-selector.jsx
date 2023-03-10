import { atoms } from '../core/atoms';
import { Dropdown } from "@symphony-ui/uitoolkit-components/components";
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import api from '../core/api';
import CreateWorkflowButton from './create-workflow-button';
import styled from 'styled-components';
import AuthorMenu from './author-menu';

const Root = styled.div`
    display: flex;
    align-items: flex-end;
    gap: .5rem;
`;

const StyledDropdown = styled(Dropdown)`
    & .tk-select__value-container:hover { cursor: pointer !important; }
    input { user-select: none; pointer-events: none }
    flex: 3;
`;

const WorkflowDropdown = () => {
    const session = useRecoilState(atoms.session)[0];
    const [ workflows, setWorkflows ] = useRecoilState(atoms.workflows);
    const [ currentWorkflow, setCurrentWorkflow ] = useRecoilState(atoms.currentWorkflow);
    const [ isContentChanged, setIsContentChanged ] = useRecoilState(atoms.isContentChanged);
    const editMode = useRecoilState(atoms.editMode)[0];
    const { listWorkflows } = api();
    const label = `Hello ${session.displayName}. Select a workflow:`;

    useEffect(() => listWorkflows((response) => {
        const values = response
            .map(({ id }) => ({ label: id, value: id }))
            .sort((a, b) => a.label > b.label ? 1 : -1)
        setWorkflows(values);
    }), [ setCurrentWorkflow, setWorkflows ]);

    return (
        <StyledDropdown
            blurInputOnSelect
            isTypeAheadEnabled={false}
            label={label}
            options={workflows}
            placeholder={workflows?.length > 0 ? 'Select a workflow' : 'No workflows yet'}
            isDisabled={!editMode || isContentChanged === 'modified'}
            onChange={({ target }) => {
                setCurrentWorkflow(target.value);
                setIsContentChanged('original');
            }}
            value={currentWorkflow}
        />
    );
};

const WorkflowSelector = ({ uiService }) => {
    const workflows = useRecoilState(atoms.workflows)[0];
    const [ currentWorkflow, setCurrentWorkflow ] = useRecoilState(atoms.currentWorkflow);

    useEffect(() => {
        if (!workflows) {
            return;
        }
        if (
            (!currentWorkflow && workflows.length > 0) ||
            (currentWorkflow && workflows.map((w) => w.value).indexOf(currentWorkflow.value) === -1)
        ) {
            setCurrentWorkflow(workflows[0]);
        }
    }, [ workflows, currentWorkflow, setCurrentWorkflow ]);

    return (
        <Root>
            <WorkflowDropdown />
            { workflows?.length > 0 && <AuthorMenu {...{ uiService }} /> }
            <CreateWorkflowButton />
        </Root>
    );
};
export default WorkflowSelector;
