import { atoms } from '../core/atoms';
import { Button } from '@symphony-ui/uitoolkit-components/components';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';
import WizardButton from './wizard-button';
import DiscardButton from './discard-button';
import DeleteButton from './delete-button';
import DiagramButton from './diagram-button';
import SaveButton from './save-button';

const Root = styled.div`
    display: flex;
    gap: .5rem;
    justify-content: space-between;
`;

const Section = styled.div`
    display: flex;
    gap: .5rem;
`;

const ActionButton = (props) => (
    <Button variant="secondary" {...props}>
        {props.label}
    </Button>
);

const ActionBar = ({ showConsole, setShowConsole }) => {
    const markers = useRecoilState(atoms.markers)[0];
    const currentWorkflow = useRecoilState(atoms.currentWorkflow)[0];
    const setSelectedInstance = useRecoilState(atoms.selectedInstance)[1];
    const [ editMode, setEditMode ] = useRecoilState(atoms.editMode);

    const toggleEditMode = () => {
        setEditMode(!editMode);
        setSelectedInstance(null);
    };

    const openHelp = () => window.open('//github.com/finos/symphony-wdk/blob/master/docs/reference.md', '_blank', false);

    return (
        <Root>
            <Section>
                <SaveButton />
                <DiscardButton />
                <WizardButton />
            </Section>
            <Section>
                <ActionButton
                    label={ editMode ? 'Monitor' : 'Edit' }
                    disabled={!currentWorkflow || markers.length > 0}
                    onClick={toggleEditMode}
                />
                <DiagramButton />
                <ActionButton
                    label={`${showConsole ? 'Hide' : 'Show'} Console`}
                    onClick={() => setShowConsole((old) => !old)}
                    disabled={!editMode}
                />
                <DeleteButton />
                <ActionButton label="Help" onClick={() => openHelp()} />
            </Section>
        </Root>
    );
};
export default ActionBar;
