import { atoms } from '../core/atoms';
import {
    Button, Modal, ModalBody, ModalFooter, ModalTitle
} from '@symphony-ui/uitoolkit-components/components';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api';
import { useRecoilState } from 'recoil';
import { useState } from 'react';

const DiscardButton = () => {
    const [ discardModal, setDiscardModal ] = useState({ show: false });
    const isContentChanged = useRecoilState(atoms.isContentChanged)[0];

    const ConfirmDiscardModal = () => {
        const contents = useRecoilState(atoms.contents)[0];

        const discardWorkflow = () => {
            editor.getModels()[0].setValue(contents);
            setDiscardModal({ show: false });
        };

        return (
            <Modal size="medium" show={discardModal.show}>
                <ModalTitle>Discard your changes</ModalTitle>
                <ModalBody>All changes will be lost. Are you sure?</ModalBody>
                <ModalFooter style={{ gap: '.5rem' }}>
                    <Button
                        variant="primary-destructive"
                        onClick={discardWorkflow}
                    >
                        Discard
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => setDiscardModal({ show: false })}
                    >
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>
        );
    };

    return (
        <>
            <Button
                variant="secondary-destructive"
                disabled={isContentChanged !== 'modified'}
                onClick={() => setDiscardModal({ show: true })}
            >
                Cancel
            </Button>
            <ConfirmDiscardModal />
        </>
    );
};
export default DiscardButton;
