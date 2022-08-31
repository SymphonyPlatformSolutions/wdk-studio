import { useEffect, useState, useRef } from 'react';
import { Button, Dropdown, Icon } from "@symphony-ui/uitoolkit-components/components";
import styled from "styled-components";
import { api } from './api';
import CreateWorkflowModal from './create-workflow';

const Root = styled.div`
    display: grid;
    grid-template-columns: 4fr 0.5fr;
    align-items: flex-end;
    gap: .5rem;
`;

const WorkflowDropdown = ({ currentWorkflow, setCurrentWorkflow, workflows, setWorkflows, editMode, isContentChanged, setIsContentChanged }) => {
    useEffect(() => {
        api.listWorkflows((res) => {
            const values = res.map(workflow => ({ label: workflow, value: workflow }));
            setWorkflows(values);
        });
    }, [ setCurrentWorkflow, setWorkflows ]);

    return (
        <Dropdown
            blurInputOnSelect
            label="Select Workflow"
            options={workflows}
            isDisabled={!editMode || isContentChanged=='modified'}
            onChange={({ target }) => {
                setCurrentWorkflow(target.value);
                setIsContentChanged( 'original' );
            }}
            value={currentWorkflow}
        />
    );
};

const WorkflowSelector = ({ workflows, setWorkflows, currentWorkflow, setCurrentWorkflow, setToast, editMode, isContentChanged, setIsContentChanged }) => {
    const [ createModal, setCreateModal ] = useState({ show: false });

    const usePrevious = (value) => {
        const ref = useRef();
        useEffect(() => {
            ref.current = value;
        });
        return ref.current;
    };
    const prevWorkflows = usePrevious(workflows);

    useEffect(() => {
        if (!prevWorkflows || prevWorkflows?.length === workflows.length) {
            return;
        } else if ((prevWorkflows?.length === 0 && workflows?.length > 0) || (workflows.length < prevWorkflows?.length)) {
            setCurrentWorkflow(workflows[0]);
        } else {
            const prev = prevWorkflows?.map((w) => w.value);
            const delta = workflows.map((w) => w.value).filter((i) => prev.indexOf(i) === -1)[0];
            setCurrentWorkflow(workflows.filter((w) => w.value === delta)[0]);
        }
    }, [ prevWorkflows, workflows, setCurrentWorkflow ]);

    return (
        <Root>
            <WorkflowDropdown {...{ currentWorkflow, setCurrentWorkflow, setToast, workflows, setWorkflows, editMode, isContentChanged, setIsContentChanged }} />
            <Button
                variant="primary"
                disabled={!editMode || isContentChanged=='modified'}
                onClick={() => setCreateModal({ show: true })}
                iconLeft={<Icon iconName="plus" />}
            >
                Workflow
            </Button>
            <CreateWorkflowModal {...{ createModal, setCreateModal, setToast, setWorkflows }} />
        </Root>
    );
};
export default WorkflowSelector;
