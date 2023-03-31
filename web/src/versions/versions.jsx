import styled from 'styled-components';
import { useState, useEffect, useRef, Fragment } from 'react';
import { Badge, Button, Modal, ModalBody, ModalFooter, ModalTitle } from '@symphony-ui/uitoolkit-components';
import api from '../core/api';
import { atoms } from '../core/atoms';
import { useRecoilState } from 'recoil';
import { editor } from 'monaco-editor';
import Spinner from '../core/spinner';

const Root = styled.div`
    display: flex;
    flex: 1 1 1px;
    min-height: calc(100vh - 16rem);
`;

const VersionsPane = styled.div`
    flex: 1 1 1px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: .5rem;
`;

const Version = styled.div`
    display: flex;
    flex-direction: column;
    border: var(--tk-color-graphite-40) 1px solid;
    gap: .3em;
    border-radius: .3rem;
    padding: .5rem;
    margin-right: .5rem;

    background-color: ${props => props.selected ? 'var(--tk-color-electricity-50)' : 'transparent'};
    color: ${props => props.selected ? '#fff' : 'var(--tk-main-text-color, #525760)'};

    :hover {
        cursor: pointer;
        color: #fff;
        background-color: var(--tk-color-electricity-40);
    }
`;

const Divider = styled.hr`
    border-width: 1px 0 0 0;
    border-color: var(--tk-color-graphite-10);
    width: 70%;
    margin: .3rem auto;
`;

const EditorPane = styled.div`
    display: flex;
    flex-direction: column;
    flex: 3 1 1px;
`;

const Editor = styled.div`
    flex: 1 1 1px;
`;

const ContainedBadge = styled(Badge)`
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Labels = styled.div`
    display: flex;
    justify-content: space-around;
    margin-bottom: .5rem;
    padding-right: 2rem;
`;

const VersionsExplorer = ({
    versions, setVersions, currentWorkflow, getLabel,
    selectedVersion, setSelectedVersion, activeVersion, editorMode,
}) => {
    const theme = useRecoilState(atoms.theme)[0];
    const [ authors, setAuthors ] = useState();
    const [ showDeleteModal, setShowDeleteModal ] = useState(false);
    const [ loading, setLoading ] = useRecoilState(atoms.loading);
    const { readWorkflowVersions, deleteWorkflowVersion, showStatus, getUsers } = api();
    const [ thisEditor, setThisEditor ] = useState();
    const contents = useRecoilState(atoms.contents)[0];
    const ref = useRef(null);

    const cleanup = () => {
        if (editor.getModels().length > 1) {
            editor.getModels().forEach((e, i) => {
                if (i > 0) {
                    e.dispose();
                }
            });
            const preserve = editorMode == 'Single' ? 0 : 1;
            while (ref.current?.childNodes.length > preserve) {
                ref.current.removeChild(ref.current.childNodes[0]);
            }
        }
    };

    useEffect(() => readWorkflowVersions(currentWorkflow.value, (response) => {
        const userIds = [ ...new Set(response.map((w) => w.createdBy).filter((u) => u)) ];
        getUsers(userIds, (users) => setAuthors(users));

        const sorted = response.map((v, i) => ({ ...v, i: i+1 }))
            .sort((a, b) => b.version - a.version);
        setVersions([
            ...sorted.filter((v) => v.active),
            ...sorted.filter((v) => !v.active),
        ]);
        setSelectedVersion(activeVersion);
    }), []);

    useEffect(() => {
        if (versions.length === 0) {
            return;
        }
        cleanup();
        const opts = {
            language: 'yaml',
            theme: 'vs-' + theme,
            readOnly: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
        };

        if (editorMode === 'Single') {
            setThisEditor(editor.create(ref.current, opts));
        } else {
            if (ref.current?.childNodes.length > 0) {
                ref.current.removeChild(ref.current.childNodes[0]);
            }
            const o = (editorMode === 'Unified') ? { ...opts, renderSideBySide: false, } : opts;
            setThisEditor(editor.createDiffEditor(ref.current, o));
        }
    }, [ editorMode, versions ])

    useEffect(() => {
        if (!thisEditor || versions.length === 0 || !selectedVersion) {
            return;
        }
        const { swadl } = versions.filter(({ version }) => version === selectedVersion)[0];
        cleanup();
        if (editorMode === 'Single') {
            thisEditor.setModel(editor.createModel(swadl, 'yaml'));
        } else {
            thisEditor.setModel({
                original: editor.createModel(contents, 'yaml'),
                modified: editor.createModel(swadl, 'yaml')
            });
        }
    }, [ thisEditor, selectedVersion ]);

    const getVariant = (active, version) =>
        active ? 'positive' : selectedVersion === version ? 'neutral' : 'default';

    const deleteVersion = () => {
        setLoading(true);
        deleteWorkflowVersion(currentWorkflow.value, selectedVersion, () => {
            setLoading(false);
            setShowDeleteModal(false);
            const newVersions = versions.filter(v => v.version !== selectedVersion);
            setSelectedVersion(newVersions[0].version);
            setVersions(newVersions);
            showStatus(false, "Workflow version deleted");
        });
    };

    const ConfirmDeleteModdal = () => (
        <Modal size="medium" show>
            <ModalTitle>Confirm Delete</ModalTitle>
            <ModalBody>This will delete this version of the workflow permanently. Are you sure?</ModalBody>
            <ModalFooter>
                <Button
                    variant="primary-destructive"
                    onClick={deleteVersion}
                    disabled={loading}
                    loading={loading}
                >
                    Delete
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={loading}
                >
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );

    const VersionsList = () => versions.map(({ active, version, description, createdBy, i }, index) => {
        const variant = getVariant(active, version);
        const isSelected = version === selectedVersion;
        return (
            <Fragment key={version}>
                <Version
                    selected={isSelected}
                    onClick={() => setSelectedVersion(version)}
                >
                    <ContainedBadge variant={variant}>
                        v{i}
                    </ContainedBadge>
                    <ContainedBadge variant={variant}>
                        {(new Date(version / 1000)).toLocaleString()}
                    </ContainedBadge>
                    <ContainedBadge variant={variant} title={!authors ? 'Loading..' : authors[createdBy]}>
                        {!authors ? 'Loading..' : authors[createdBy]}
                    </ContainedBadge>
                    { description === '' ? 'No comment' : description }
                    { !active && isSelected && (
                        <Button
                            size="small"
                            variant="destructive"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            Delete
                        </Button>
                    )}
                </Version>
                { index === 0 && <Divider /> }
            </Fragment>
        );
    });

    return versions.length === 0 ? <Root><Spinner /></Root> : (
        <Root>
            <VersionsPane>
                <VersionsList />
                { showDeleteModal && <ConfirmDeleteModdal /> }
            </VersionsPane>
            <EditorPane>
                <Labels>
                    <ContainedBadge variant="positive">
                        Active Version: v{getLabel(activeVersion)}
                    </ContainedBadge>
                    <ContainedBadge variant="neutral">
                        Selected Version: v{getLabel(selectedVersion)}
                    </ContainedBadge>
                </Labels>
                <Editor ref={ref} />
            </EditorPane>
        </Root>
    );
};
export default VersionsExplorer;
