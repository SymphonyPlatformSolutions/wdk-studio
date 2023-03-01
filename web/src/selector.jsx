import { atoms } from './atoms';
import { Button, Dropdown, Icon } from "@symphony-ui/uitoolkit-components/components";
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import api from './api';
import CreateWorkflowModal from './create-workflow';
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

const WorkflowDropdown = ({ editMode, isContentChanged, setIsContentChanged }) => {
    const [ workflows, setWorkflows ] = useRecoilState(atoms.workflows);
    const [ currentWorkflow, setCurrentWorkflow ] = useRecoilState(atoms.currentWorkflow);
    const { listWorkflows } = api();

    useEffect(() => listWorkflows((response) =>
        setWorkflows(response.map(({ id }) => ({ label: id, value: id })).sort((a, b) => a.label > b.label ? 1 : -1))
    ), [ setCurrentWorkflow, setWorkflows ]);

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

const WorkflowSelector = ({ editMode, isContentChanged, setIsContentChanged }) => {
    const [ createModal, setCreateModal ] = useState({ show: false });
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
            <WorkflowDropdown {...{ editMode, isContentChanged, setIsContentChanged }} />
            <Button
                variant="primary"
                disabled={!editMode || isContentChanged === 'modified'}
                onClick={() => setCreateModal({ show: true })}
                iconLeft={<Icon iconName="plus" />}
            >
                Workflow
            </Button>
            <CreateWorkflowModal {...{ createModal, setCreateModal }} />
        </Root>
    );
};
export default WorkflowSelector;
