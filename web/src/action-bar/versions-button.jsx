import {
    Button, Modal, ModalBody, ModalFooter, ModalTitle,
} from '@symphony-ui/uitoolkit-components/components';
import { atoms } from '../core/atoms';
import { useRecoilState } from 'recoil';
import { useState } from 'react';
import VersionsExplorer from '../versions/versions';
import api from '../core/api';

const VersionsButton = () => {
    const currentWorkflow = useRecoilState(atoms.currentWorkflow)[0];
    const [ show, setShow ] = useState(false);
    const [ loading, setLoading ] = useRecoilState(atoms.loading);
    const [ versions, setVersions ] = useState([]);
    const [ activeVersion, setActiveVersion ] = useRecoilState(atoms.activeVersion);
    const [ selectedVersion, setSelectedVersion ] = useState();

    const { rollbackWorkflow, showStatus } = api();

    const getLabel = (version) => versions.filter(v => v.version === version)[0]?.i;

    const submitRevert = () => {
        setLoading(true);
        rollbackWorkflow(currentWorkflow.value, selectedVersion, () => {
            setShow(false);
            setLoading(false);
            setActiveVersion(selectedVersion);
            showStatus(false, `Workflow ${currentWorkflow.value} reverted to v${getLabel(selectedVersion)}`);
        });
    };

    return (
        <>
            <Button variant="secondary" onClick={() => setShow(true)}>
                Versions
            </Button>
            <Modal size="full-width" show={show} closeButton onClose={() => setShow(false)}>
                <ModalTitle>Versions Explorer</ModalTitle>
                <ModalBody style={{ display: 'flex' }}>
                    <VersionsExplorer {...{
                        versions,
                        setVersions,
                        currentWorkflow,
                        selectedVersion,
                        setSelectedVersion,
                        activeVersion,
                        getLabel,
                    }} />
                </ModalBody>
                <ModalFooter style={{ gap: '.5rem' }}>
                    <Button
                        disabled={activeVersion === selectedVersion}
                        onClick={submitRevert}
                        loading={loading}
                    >
                        Revert to this version
                    </Button>
                    <Button variant="secondary" onClick={() => setShow(false)}>
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
};
export default VersionsButton;
