import { atoms } from '../core/atoms';
import { Dropdown, Button } from "@symphony-ui/uitoolkit-components/components";
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import api from '../core/api';
import CreateWorkflowButton from './create-workflow-button';
import styled from 'styled-components';

const Root = styled.div`
    display: grid;
    grid-template-columns: 4fr 1.5fr 0.5fr;
    align-items: flex-end;
    gap: .5rem;
`;

const StyledDropdown = styled(Dropdown)`
    & .tk-select .tk-select__container.tk-select__control .tk-select__value-container:hover { cursor: pointer; }
    input { user-select: none; pointer-events: none }
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
            label={label}
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

const Author = ({ uiService }) => {
    const author = useRecoilState(atoms.author)[0];
    const { getUser } = api();
    const [ authorUser, setAuthorUser ] = useState();

    useEffect(() => {
        if (!author) {
            return;
        }
        getUser(author, (user) => setAuthorUser(user));
    }, [ author ]);

    const launchIM = () => uiService.openIMbyUserIDs([ author ]);

    return (
        <Button variant="secondary" disabled={!author} onClick={launchIM}>
            { !authorUser ? 'Loading..' : `@${authorUser.displayName}` }
        </Button>
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
            <Author {...{ uiService }} />
            <CreateWorkflowButton />
        </Root>
    );
};
export default WorkflowSelector;
