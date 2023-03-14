import styled from 'styled-components';
import { useState, useEffect, useRef } from 'react';
import { Badge } from '@symphony-ui/uitoolkit-components';
import api from '../core/api';
import { atoms } from '../core/atoms';
import { useRecoilState } from 'recoil';
import { editor } from 'monaco-editor';
import Spinner from '../core/spinner';

const Root = styled.div`
    display: flex;
    flex: 1 1 1px;
    height: calc(100vh - 14rem);
`;

const VersionsPane = styled.div`
    flex: 1 1 1px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: .5rem;
`;

const EditorPane = styled.div`
    display: flex;
    flex-direction: column;
    flex: 3 1 1px;
`;

const Editor = styled.div`
    flex: 1 1 1px;
`;

const Labels = styled.div`
    display: flex;
    justify-content: space-around;
    margin-bottom: .5rem;
    padding-right: 2rem;
`;

const Version = styled.div`
    display: flex;
    flex-direction: column;
    border: var(--tk-color-graphite-40) 1px solid;
    gap: .5rem;
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

const VersionsExplorer = ({
    versions, setVersions, currentWorkflow, getLabel,
    selectedVersion, setSelectedVersion, activeVersion,
}) => {
    const theme = useRecoilState(atoms.theme)[0];
    const { readWorkflow } = api();
    const [ thisEditor, setThisEditor ] = useState();
    const contents = useRecoilState(atoms.contents)[0];
    const ref = useRef(null);

    useEffect(() => readWorkflow(currentWorkflow.value, (r) => {
        const processed = r.map((w, i) => ({ ...w, i: i+1 })).sort((a, b) => b.version - a.version);
        setVersions(processed);
        setSelectedVersion(activeVersion);
    }), []);

    useEffect(() => {
        if (versions.length > 0) {
            setThisEditor(editor.createDiffEditor(ref.current, {
                language: 'yaml',
                theme: 'vs-' + theme,
                readOnly: true,
                scrollBeyondLastLine: false,
            }));
        }
    }, [ versions ])

    useEffect(() => {
        if (!thisEditor || versions.length === 0 || !selectedVersion) {
            return;
        }
        const { swadl } = versions.filter(({ version }) => version === selectedVersion)[0];

        if (editor.getModels().length > 1) {
            editor.getModels().forEach((e, i) => {
                if (i > 0) {
                    e.dispose();
                }
            });
            if (ref.current?.childNodes.length > 1) {
                ref.current.removeChild(ref.current.childNodes[0]);
            }
        }
        thisEditor.setModel({
            original: editor.createModel(contents, 'yaml'),
            modified: editor.createModel(swadl, 'yaml')
        });
    }, [ thisEditor, selectedVersion ]);

    const getVariant = (active, version) =>
        active ? 'positive' : selectedVersion === version ? 'neutral' : 'default';

    const VersionsList = () => versions.map(({ active, version, description, i }) => (
        <Version
            key={version}
            selected={version === selectedVersion}
            onClick={() => setSelectedVersion(version)}
        >
            <Badge variant={getVariant(active, version)}>
                v{i}
            </Badge>
            <Badge variant={getVariant(active, version)}>
                {(new Date(version / 1000)).toLocaleString()}
            </Badge>
            {description === '' ? 'No comment' : description}
        </Version>
    ));

    return versions.length === 0 ? <Root><Spinner /></Root> : (
        <Root>
            <VersionsPane>
                <VersionsList />
            </VersionsPane>
            <EditorPane>
                <Labels>
                    <Badge variant="positive">
                        Active Version: v{getLabel(activeVersion)}
                    </Badge>
                    <Badge variant="neutral">
                        Selected Version: v{getLabel(selectedVersion)}
                    </Badge>
                </Labels>
                <Editor ref={ref} />
            </EditorPane>
        </Root>
    );
};
export default VersionsExplorer;
