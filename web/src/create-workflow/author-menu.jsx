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
        addWorkflow({ swadl, author, description }, () => {
            setLoading(false);
            setShow(false);
            setIsContentChanged('original');
            setAuthor(author);
            setContents(swadl);
            showStatus(false, 'Workflow owner reassigned');
        });
    };

    const getPeople = async (input) => {
        if (input.length < 3) {
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
            <ModalFooter style={{ gap: '.5rem' }}>
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
            <Button
                variant="secondary"
                onClick={() => setShowMenu((show) => !show)}
                loading={!authorUser}
                style={{ width: '100%' }}
            >
                @{authorUser?.displayName}
            </Button>
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

    const launchIM = () => {
        setShowMenu(false);
        uiService.openIMbyUserIDs([ author ]);
    };
    const launchReassign = () => {
        setShowMenu(false);
        setShowModal(true);
    };

    const Menu = () => (
        <FloatingMenu show={showMenu} { ...getBottomAnchor() }>
            { author !== session.id && <DropdownMenuItem onClick={launchIM}>Chat with Author</DropdownMenuItem> }
            { author === session.id && <DropdownMenuItem>You own this workflow</DropdownMenuItem> }
            { session.isAdmin && <DropdownMenuItem onClick={launchReassign}>Reassign Owner</DropdownMenuItem> }
        </FloatingMenu>
    );

    return !authorUser ? <Button loading disabled /> : (
        <div style={{ flex: 1 }}>
            <AuthorButton />
            <Menu />
            <ReassignModal show={showModal} setShow={setShowModal} />
        </div>
    );
};
export default AuthorMenu;
