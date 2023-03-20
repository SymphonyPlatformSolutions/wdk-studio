import { atoms } from '../core/atoms';
import {
    Button, DropdownMenu, DropdownMenuItem, Modal, ModalTitle, ModalBody, ModalFooter, Dropdown,
} from "@symphony-ui/uitoolkit-components/components";
import { useEffect, useState, useRef } from 'react';
import { useRecoilState } from 'recoil';
import api from '../core/api';
import styled from 'styled-components';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api';

const FloatingMenu = styled(DropdownMenu)`
    position: absolute;
    left: ${props => props.x}px;
    top: ${props => props.y}px;
    width: ${props => props.w}px;
    min-width: 11rem;
`;

const DropdownButton = styled(Button)`
    width: 100%;
    display: flex;
    justify-content: space-between;
    :after {
        font-family: tk-icons !important;
        content: '';
        font-size: 1rem;
        color: var(--tk-main-text-color, #525760);
    }
`;

const ReassignModal = ({ show, setShow }) => {
    const { addWorkflow, searchUser, showStatus } = api();
    const [ loading, setLoading ] = useRecoilState(atoms.loading);
    const [ newOwner, setNewOwner ] = useState();
    const setIsContentChanged = useRecoilState(atoms.isContentChanged)[1];
    const setContents = useRecoilState(atoms.contents)[1];
    const setAuthor = useRecoilState(atoms.author)[1];

    const submitReassign = () => {
        setLoading(true);
        const swadl = editor.getModels()[0].getValue();
        const author = newOwner.value;
        const description = 'Owner changed';
        addWorkflow({ swadl, author, description }).then(() => {
            setLoading(false);
            setShow(false);
            setIsContentChanged('original');
            setAuthor(author);
            setContents(swadl);
            showStatus(false, 'Workflow owner reassigned');
        }, ({ message }) => showToast(true, message));
    };

    const getPeople = async (input) => {
        if (input.length < 2) {
            return;
        }
        const data = (await searchUser(input))
            .map(({ id, displayName }) => ({ label: displayName, value: id }));
        return new Promise((resolve) => resolve(data));
    };

    return (
        <Modal size="small" show={show}>
            <ModalTitle>Reassign Workflow Owner</ModalTitle>
            <ModalBody style={{ minHeight: '17rem' }}>
                <Dropdown
                    blurInputOnSelect
                    label="Select the new owner"
                    asyncOptions={getPeople}
                    onChange={({ target }) => setNewOwner(target.value)}
                    value={newOwner}
                    isDisabled={loading}
                />
            </ModalBody>
            <ModalFooter>
                <Button
                    variant="primary"
                    onClick={submitReassign}
                    disabled={loading || !newOwner}
                    loading={loading}
                >
                    Reassign
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => setShow(false)}
                    disabled={loading}
                >
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};

const AuthorMenu = ({ uiService }) => {
    const session = useRecoilState(atoms.session)[0];
    const author = useRecoilState(atoms.author)[0];
    const { getUser } = api();
    const [ authorUser, setAuthorUser ] = useState();
    const [ showMenu, setShowMenu ] = useState(false);
    const [ showModal, setShowModal ] = useState(false);
    const buttonRef = useRef();

    useEffect(() => {
        if (!author) {
            return;
        }
        setAuthorUser(undefined);
        getUser(author, (user) => setAuthorUser(user));
    }, [ author ]);

    const AuthorButton = () => (
        <div ref={buttonRef}>
            <DropdownButton
                variant="secondary"
                onClick={() => setShowMenu((show) => !show)}
                loading={!authorUser}
            >
                @{authorUser?.displayName}
            </DropdownButton>
        </div>
    );

    const getBottomAnchor = () => {
        const rect = buttonRef.current?.getBoundingClientRect();
        return {
            w: rect?.width,
            x: rect?.left,
            y: !rect ? 0 : (rect.top + rect.height),
        };
    };

    const AuthorMenu = () => buttonRef.current && (
        <FloatingMenu show={showMenu} { ...getBottomAnchor() } onClick={() => setShowMenu(false)}>
            { author !== session.id && <DropdownMenuItem onClick={() => uiService.openIMbyUserIDs([ author ])}>Chat with Author</DropdownMenuItem> }
            { author === session.id && <DropdownMenuItem>You own this workflow</DropdownMenuItem> }
            { session.isAdmin && <DropdownMenuItem onClick={() => setShowModal(true)}>Reassign Owner</DropdownMenuItem> }
        </FloatingMenu>
    );

    return !authorUser ? <Button loading disabled /> : (
        <div style={{ flex: 1 }}>
            <AuthorButton />
            <AuthorMenu />
            <ReassignModal show={showModal} setShow={setShowModal} />
        </div>
    );
};
export default AuthorMenu;
