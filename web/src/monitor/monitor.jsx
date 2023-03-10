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
    const [ selectedInstance, setSelectedInstance ]= useRecoilState(atoms.selectedInstance);
    const [ currentVariables, setCurrentVariables ] = useState();
    const [ instances, setInstances ] = useState([]);
    const [ activityData, setActivityData ] = useState();
    const { getInstanceData, listWorkflowInstances } = api();
    const [ loading, setLoading ] = useRecoilState(atoms.loading);

    const loadInstances = () => {
        setLoading(true);
        listWorkflowInstances(currentWorkflow.value, (r) => {
            setInstances(r.reverse());
            setLoading(false);
        });
    };

    useEffect(loadInstances, []);

    useEffect(() => {
        if (selectedInstance) {
            getInstanceData(currentWorkflow.value, selectedInstance.instanceId, (r) => setActivityData(r));
        }
    }, [ selectedInstance ]);

    const Empty = () => <Center>No instances yet</Center>;

    return (
        <MonitorRoot>
            { !instances ? <Spinner /> : instances.length === 0 ? <Empty /> : (
                <>
                    <InstanceMetrics {...{ instances }} />
                    <TriPlane>
                        <InstanceList {...{ instances, selectedInstance, setSelectedInstance, loadInstances, loading }} />
                        <ActivityList {...{ activityData, setCurrentVariables }} />
                        <VariablesList {...{ activityData, currentVariables, setCurrentVariables }} />
                    </TriPlane>
                </>
            )}
        </MonitorRoot>
    )
};
export default Monitor;
