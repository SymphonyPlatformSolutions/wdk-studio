import { DetailPlane, TableTitle, Table } from './styles';
import { useEffect } from 'react';

const VariablesList = ({ activityData, currentVariables, setCurrentVariables }) => {
    useEffect(() => {
        setCurrentVariables(activityData?.variables.pop());
    }, [ activityData ]);

    const formatVariable = (variable) => {
        if (typeof variable === 'object') {
            // console.log(JSON.stringify(variable)); // todo pop dialog
        }
        return variable.toString();
    };

    return (
        <DetailPlane>
            <TableTitle>Variables</TableTitle>
            <Table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Value</th>
                        <th>Updated</th>
                    </tr>
                </thead>
                <tbody>
                    {currentVariables && Object.keys(currentVariables.outputs).map((key, i) => (
                        <tr key={i}>
                            <td>{key}</td>
                            <td>{formatVariable(currentVariables.outputs[key])}</td>
                            <td>{(new Date(currentVariables.updateTime)).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </DetailPlane>
    );
};
export default VariablesList;
