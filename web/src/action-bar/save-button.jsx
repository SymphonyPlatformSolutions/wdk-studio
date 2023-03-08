import { atoms } from '../core/atoms';
import { useRecoilState } from 'recoil';
import { Button, Loader } from '@symphony-ui/uitoolkit-components/components';
import api from '../core/api';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api';

const SaveButton = () => {
    const markers = useRecoilState(atoms.markers)[0];
    const [ isContentChanged, setIsContentChanged ] = useRecoilState(atoms.isContentChanged);
    const setContents = useRecoilState(atoms.contents)[1];
    const [ loading, setLoading ] = useRecoilState(atoms.loading);
    const { addWorkflow, showStatus } = api();
    const session = useRecoilState(atoms.session)[0];

    const saveWorkflow = (swadl, description) => {
        setLoading(true);
        addWorkflow({ swadl, author: session.id, description }, () => {
            setLoading(false);
            setIsContentChanged('original');
            setContents(swadl);
            showStatus(false, 'Workflow saved');
        });
    };

    return (
        <>
            <Button
                variant="primary"
                disabled={loading || markers.length > 0 || isContentChanged !== 'modified'}
                onClick={() => saveWorkflow(editor.getModels()[0].getValue(), "Description")}
            >
                { loading ? <Loader /> : 'Save' }
            </Button>
        </>
    );
};
export default SaveButton;
