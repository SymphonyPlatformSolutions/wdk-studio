import {
    Button, Modal, ModalBody, ModalFooter, ModalTitle,
} from '@symphony-ui/uitoolkit-components/components';
import Diagram from '../diagram/diagram';

const DiagramModal = ({ show, setShow }) => (
    <Modal size="full-width" show={show}>
        <ModalTitle>Diagram</ModalTitle>
        <ModalBody>
            <Diagram />
        </ModalBody>
        <ModalFooter>
            <Button
                variant="secondary"
                onClick={() => setShow(false)}
            >
                Close
            </Button>
        </ModalFooter>
    </Modal>
);

export default DiagramModal;
