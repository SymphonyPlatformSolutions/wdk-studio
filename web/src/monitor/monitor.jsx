import { atoms } from '../core/atoms';
import { useRecoilState } from 'recoil';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../core/api';
import InstanceMetrics from './metrics';
import InstanceList from './instance-list';
import ActivityList from './activity-list';
import VariablesList from './variables-list';
import Spinner from '../core/spinner';
import Inspector from './inspector';

const MonitorRoot = styled.div`
    flex: 1 1 1px;
    display: flex;
    flex-direction: column;
`;

const TriPlane = styled.div`
    flex: 1 1 1px;
    overflow: auto;
    display: grid;
    grid-template-rows: repeat(3, 1fr);
    gap: .5rem;
`;

const Center = styled.div`
    font-weight: 600;
    font-size: 1.5rem;
    margin: auto;
`;

const Monitor = () => {
    const currentWorkflow = useRecoilState(atoms.currentWorkflow)[0];
    const [ selectedInstance, setSelectedInstance ] = useRecoilState(atoms.selectedInstance);
    const [ instances, setInstances ] = useState();
    const { listWorkflowInstances } = api();
    const [ loading, setLoading ] = useRecoilState(atoms.loading);
    const [ showInspector, setShowInspector ] = useState(false);
    const [ inspectorPayload, setInspectorPayload ] = useState();

    const loadInstances = () => {
        setLoading(true);
        listWorkflowInstances(currentWorkflow.value, (r) => {
            setInstances(r.reverse());
            setLoading(false);
        });
    };

    useEffect(loadInstances, []);

    useEffect(() => {
        if (instances && instances.length > 0 && !selectedInstance) {
            setSelectedInstance(instances[0]);
        }
    }, [ instances ]);

    const Empty = () => <Center>No instances yet</Center>;

    useEffect(() => {
        if (inspectorPayload) {
            setShowInspector(true);
        }
    }, [ inspectorPayload ]);

    useEffect(() => {
        if (!showInspector) {
            setInspectorPayload(undefined);
        }
    }, [ showInspector ]);

    return (
        <MonitorRoot>
            { !instances ? <Spinner /> : instances.length === 0 ? <Empty /> : (
                <>
                    <InstanceMetrics {...{ instances }} />
                    <TriPlane>
                        <InstanceList {...{ instances, selectedInstance, setSelectedInstance, loadInstances, loading }} />
                        <ActivityList {...{ selectedInstance, setInspectorPayload }} />
                        <VariablesList {...{ selectedInstance, setInspectorPayload }} />
                    </TriPlane>
                    { showInspector && <Inspector setShow={setShowInspector} payload={inspectorPayload} /> }
                </>
            )}
        </MonitorRoot>
    )
};
export default Monitor;
