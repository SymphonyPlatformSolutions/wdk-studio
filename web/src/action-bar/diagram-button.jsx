import { atoms } from '../core/atoms';
import {
    Button, Modal, ModalBody, ModalFooter, ModalTitle,
} from '@symphony-ui/uitoolkit-components/components';
import { useRecoilState } from 'recoil';
import { useState } from 'react';
import Diagram from '../diagram/diagram';

const DiagramButton = () => {
    const markers = useRecoilState(atoms.markers)[0];
    const currentWorkflow = useRecoilState(atoms.currentWorkflow)[0];
    const [ diagramModal, setDiagramModal ] = useState({ show: false });

    const DiagramModal = () => (
        <Modal size="full-width" show={diagramModal.show}>
            <ModalTitle>Diagram</ModalTitle>
            <ModalBody>
                <Diagram />
            </ModalBody>
            <ModalFooter style={{ gap: '.5rem' }}>
                <Button
                    variant="secondary"
                    onClick={() => setDiagramModal({ show: false })}
                    disabled={diagramModal.loading}
                >
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    );

    return (
        <>
            <Button
                variant="secondary"
                disabled={!currentWorkflow || markers.length > 0}
                onClick={() => setDiagramModal({ show: true })}
            >
                Diagram
            </Button>
            <DiagramModal />
        </>
    );
};
export default DiagramButton;
