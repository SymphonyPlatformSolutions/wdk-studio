import { atoms } from '../core/atoms';
import { atom, useRecoilState } from 'recoil';
import {
    Button, DropdownMenu, DropdownMenuItem, Modal, ModalBody, ModalFooter, ModalTitle, TextField,
} from '@symphony-ui/uitoolkit-components/components';
import api from '../core/api';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api';
import styled from 'styled-components';
import { useRef, useState } from 'react';

const SaveButtonRoot = styled.div`
    display: flex;
`;

const LeftButton = styled(Button)`
    border-radius: 1.75rem 0 0 1.75rem;
`;

const RightButton = styled(Button)`
    border-radius: 0 1.75rem 1.75rem 0;
    font-family: tk-icons !important;
    padding: .5rem;
    :before {
        content: ' ';
        border-right: var(--tk-color-electricity-20) 1px solid;
        position: relative;
        left: -.5rem;
    }
`;

const FloatingMenu = styled(DropdownMenu)`
    position: absolute;
    left: ${props => props.x}px;
    top: ${props => props.y}px;
    width: ${props => props.w}px;
`;

const ConfirmDiscardModal = ({ show, setShow }) => {
    const contents = useRecoilState(atoms.contents)[0];

    const discardWorkflow = () => {
        editor.getModels()[0].setValue(contents);
        setShow(false);
    };

    return (
        <Modal size="medium" show={show}>
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
                    onClick={() => setShow(false)}
                >
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};

const SaveWithCommentModal = ({ show, setShow, saveWorkflow, loading }) => {
    const [ comment, setComment ] = useState('');

    return (
        <Modal size="medium" show={show}>
            <ModalTitle>Save Workflow</ModalTitle>
            <ModalBody>
                <TextField
                    label="Save Comment"
                    showRequired={true}
                    value={comment}
                    disabled={loading}
                    onChange={({ target }) => setComment(target.value)}
                />
            </ModalBody>
            <ModalFooter style={{ gap: '.5rem' }}>
                <Button onClick={() => saveWorkflow(comment)} loading={loading}>
                    Save
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => setShow(false)}
                >
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};

const SaveButton = () => {
    const markers = useRecoilState(atoms.markers)[0];
    const [ isContentChanged, setIsContentChanged ] = useRecoilState(atoms.isContentChanged);
    const setContents = useRecoilState(atoms.contents)[1];
    const [ loading, setLoading ] = useRecoilState(atoms.loading);
    const { addWorkflow, showStatus } = api();
    const session = useRecoilState(atoms.session)[0];
    const buttonRef = useRef();
    const [ showMenu, setShowMenu ] = useState(false);
    const [ showDiscardModal, setShowDiscardModal ] = useState(false);
    const [ showSaveModal, setShowSaveModal ] = useState(false);

    const saveWorkflow = (description = "") => {
        const swadl = editor.getModels()[0].getValue();
        setShowMenu(false);
        setLoading(true);
        addWorkflow({ swadl, author: session.id, description }, () => {
            setLoading(false);
            setIsContentChanged('original');
            setContents(swadl);
            showStatus(false, 'Workflow saved');
            setShowSaveModal(false);
        });
    };

    const isDisabled = () => loading || markers.length > 0 || isContentChanged !== 'modified';

    const getBottomAnchor = () => {
        const rect = buttonRef.current?.parentNode.getBoundingClientRect();
        return {
            w: rect?.width * 1.65,
            x: rect?.left,
            y: !rect ? 0 : (rect.top + rect.height),
        };
    };

    const SaveMenu = () => buttonRef.current && (
        <FloatingMenu show={showMenu} { ...getBottomAnchor() } onClick={() => setShowMenu(false)}>
            <DropdownMenuItem onClick={() => setShowSaveModal(true)}>
                Save with comment
            </DropdownMenuItem>
            <DropdownMenuItem
                onClick={() => setShowDiscardModal({ show: true })}
            >
                Discard changes
            </DropdownMenuItem>
        </FloatingMenu>
    );

    return (
        <SaveButtonRoot>
            <LeftButton
                loading={loading}
                disabled={isDisabled()}
                onClick={saveWorkflow}
            >
                Save
            </LeftButton>
            <div ref={buttonRef}>
                <RightButton
                    disabled={isDisabled()}
                    onClick={() => setShowMenu((show) => !show)}
                >
                    
                </RightButton>
            </div>
            <SaveMenu />
            <ConfirmDiscardModal
                show={showDiscardModal}
                setShow={setShowDiscardModal}
            />
            <SaveWithCommentModal
                show={showSaveModal}
                setShow={setShowSaveModal}
                saveWorkflow={saveWorkflow}
                loading={loading}
            />
        </SaveButtonRoot>
    );
};
export default SaveButton;
