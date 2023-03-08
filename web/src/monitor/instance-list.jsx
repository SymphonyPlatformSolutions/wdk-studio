import { DetailPlane, TableTitle, Table } from './styles';

const InstanceList = ({ instances, selectedInstance, setSelectedInstance, loadInstances, loading }) => {
    const formatDuration = (duration) => duration?.toString()
        .substring(2)
        .replaceAll(/([\d\.]+)(\w)/g, "$1$2 ")
        .replaceAll(/([\d]+)\.(\d)([\d]+)/g, "$1.$2")
        .toLowerCase();

    const getStyle = (instanceId, status) => {
        const style = {};

        if (status === 'PENDING') {
            style.color = 'var(--tk-color-green-30)';
        } else if (status === 'FAILED') {
            style.color = 'var(--tk-color-error, #ee3d3d)';
        }
        if (instanceId === selectedInstance?.instanceId) {
            style.background = 'var(--tk-color-electricity-40)';
            style.color = '#fff';
        }
        return style;
    };

    return (!instances || instances.length === 0) ? 'No instances yet' : (
        <DetailPlane>
            <TableTitle>
                <div>Instances</div>
                <div onClick={loadInstances} className={loading ? 'loading' : ''}>&#8634;</div>
            </TableTitle>
            <Table>
                <thead>
                    <tr>
                        <th></th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Duration</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {instances.map((row, i) => (
                        <tr key={i} className="selectable" style={getStyle(row.instanceId, row.status)} onClick={() => setSelectedInstance(row)}>
                            <td>{row.instanceId===selectedInstance?.instanceId ? '>' : ' '}</td>
                            <td>{(new Date(row.startDate)).toLocaleString()}</td>
                            <td>{row.endDate? (new Date(row.endDate)).toLocaleString() : 'Running...'}</td>
                            <td>{formatDuration(row.duration)}</td>
                            <td>{row.status}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </DetailPlane>
    );
};
export default InstanceList;
