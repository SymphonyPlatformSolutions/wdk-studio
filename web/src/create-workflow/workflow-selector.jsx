import { atoms } from '../core/atoms';
import { Dropdown } from "@symphony-ui/uitoolkit-components/components";
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import api from '../core/api';
import CreateWorkflowButton from './create-workflow-button';
import styled from 'styled-components';

const Root = styled.div`
    display: grid;
    grid-template-columns: 4fr 0.5fr;
    align-items: flex-end;
    gap: .5rem;
`;

const StyledDropdown = styled(Dropdown)`
    & .tk-select .tk-select__container.tk-select__control .tk-select__value-container:hover { cursor: pointer; }
    input { user-select: none; pointer-events: none }
`;

const WorkflowDropdown = () => {
    const [ workflows, setWorkflows ] = useRecoilState(atoms.workflows);
    const [ currentWorkflow, setCurrentWorkflow ] = useRecoilState(atoms.currentWorkflow);
    const [ isContentChanged, setIsContentChanged ] = useRecoilState(atoms.isContentChanged);
    const editMode = useRecoilState(atoms.editMode)[0];
    const { listWorkflows } = api();

    useEffect(() => listWorkflows((response) => {
        const values = response
            .map(({ id }) => ({ label: id, value: id }))
            .sort((a, b) => a.label > b.label ? 1 : -1)
        setWorkflows(values);
    }), [ setCurrentWorkflow, setWorkflows ]);

    return (
        <StyledDropdown
            blurInputOnSelect
            label="Select Workflow"
            options={workflows}
            isDisabled={!editMode || isContentChanged === 'modified'}
            onChange={({ target }) => {
                setCurrentWorkflow(target.value);
                setIsContentChanged('original');
            }}
            value={currentWorkflow}
        />
    );
};

const WorkflowSelector = () => {
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
            <CreateWorkflowButton />
        </Root>
    );
};
export default WorkflowSelector;
