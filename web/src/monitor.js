import {useState} from "react";
import styled from "styled-components";
import GaugeChart from 'react-gauge-chart';
import { VictoryChart, VictoryLine } from 'victory';
import DarkTheme from "./chart/darktheme";

const MonitorRoot = styled.div`
    padding: .5rem;
    overflow-y: hidden;
`;

const WorkflowGrid = styled.div`
    padding: .5rem;
    display: flex;
    flex-direction: row;
    flex-wrap: no-wrap;
    justify-content: space-between;
`;

const WorkflowItem = styled.div`
    display: flex;
    flex-direction: column;
    background: #474747;
    box-shadow: 0 10px 16px 0 rgb(0 0 0 / 20%), 0 6px 20px 0 rgb(0 0 0 / 19%) !important;
    margin: 10px 0 0 2%;
    flex-grow: 1;
    width: calc(50% - 10px - 1px);
`;

const WorkflowTitle = styled.div`
    color: #ffffff;
    padding: 10px;
    background: #686868;
    font-size: 16px;
    text-align: center;
    margin-bottom: 10px;
`;

const WorkflowBody = styled.div`
    display: flex;
    flex-direction: row;
    align-items: start;
    justify-content: space-between;
    min-height: 250px;
    height: 250px;
`;

const Gauge = styled.div`
    width: 200px;
    height: 100px;
`;

const GaugeValue = styled.div`
    color: #ffffff;
    font-size: 14px;
    text-align: center;
`;

const Chart = styled.div`
    height: 200px;
`;

const Table = styled.table`
    width: 100%;
    padding: 10px;
    & > thead > tr > th {
        border-bottom: 1px #41c3ff solid;
        text-align: left;
    };
    & > thead > tr > th {
        color: #ffffff;
        font-weight: 400;
    };
    & > tbody > tr:hover {
        background: #41c3ff !important;
        cursor: pointer;
    };
    & > tbody > tr > td {
        color: #ffffff;
        font-weight: 200;
    };
`;


const Monitor = () => {
    const [selectedInstance, setSelectedInstance] = useState(null);
    const [selectedActivity, setSelectedActivity] = useState(null);

    return (
        <MonitorRoot>
            <WorkflowGrid>
                <WorkflowItem style={{maxWidth: '500px'}}>
                    <WorkflowTitle>
                        Metrics
                    </WorkflowTitle>
                    <WorkflowBody>
                        <Gauge>
                            <GaugeChart id="gauge-chart3"
                                        nrOfLevels={30}
                                        colors={["#2cec01", "#ee3d3d"]}
                                        arcWidth={0.3}
                                        percent={0.37}
                                        textColor={"#ffffff"}
                                        needleColor={"#dddddd"}
                                        needleBaseColor={"#dddddd"}
                                        hideText={ true }
                            />
                            <GaugeValue>4 active instances</GaugeValue>
                            <GaugeChart id="gauge-chart3"
                                        nrOfLevels={30}
                                        colors={["#2cec01", "#ee3d3d"]}
                                        arcWidth={0.3}
                                        percent={0.80}
                                        textColor={"#ffffff"}
                                        needleColor={"#dddddd"}
                                        needleBaseColor={"#dddddd"}
                                        hideText={ true }
                            />
                            <GaugeValue>80 completed instances</GaugeValue>
                        </Gauge>
                        <Chart>
                            <VictoryChart theme={DarkTheme}>
                                <VictoryLine
                                    style={{
                                        data: { stroke: "#ffffff" },
                                        labels: { fill: "#ffffff" },
                                        axis: {
                                            style: {
                                                axisLabel: { fill: "#ffffff" },
                                            }
                                        },
                                        parent: { border: "1px solid #fff"}
                                    }}
                                    data={[
                                        { x: '08/07', y: 2 },
                                        { x: '08/08', y: 3 },
                                        { x: '08/09', y: 5 },
                                        { x: '08/10', y: 4 },
                                        { x: '08/11', y: 7 }
                                    ]}
                                />
                            </VictoryChart>
                        </Chart>
                    </WorkflowBody>
                </WorkflowItem>
                <WorkflowItem>
                    <WorkflowTitle>
                        Instances
                    </WorkflowTitle>
                    <WorkflowBody>
                        <Table>
                            <thead>
                                <tr><th>Id</th><th>Status</th><th>Start</th><th>End</th></tr>
                            </thead>
                            <tbody>
                                <tr style={{background: (selectedInstance==23565642 ? '#1b99d4' : 'transparent' )}} onClick={() => setSelectedInstance(23565642)}>
                                    <td>23565642</td><td>completed</td><td>08/07/22 10:00</td><td>08/07/22 10:06</td>
                                </tr>
                                <tr style={{background: (selectedInstance==43232432 ? '#1b99d4' : 'transparent' )}} onClick={() => setSelectedInstance(43232432)}>
                                    <td>43232432</td><td>completed</td><td>08/07/22 09:00</td><td>08/07/22 09:12</td>
                                </tr>
                            </tbody>
                        </Table>
                    </WorkflowBody>
                </WorkflowItem>
            </WorkflowGrid>
            <WorkflowGrid>
                <WorkflowItem>
                    <WorkflowTitle>
                        Activities
                    </WorkflowTitle>
                    <WorkflowBody>
                        <Table>
                            <thead>
                            <tr><th>#</th><th>Name</th><th>Start</th><th>End</th></tr>
                            </thead>
                            {selectedInstance != null &&
                            <tbody>
                                <tr style={{background: (selectedActivity==1 ? '#1b99d4' : 'transparent' )}} onClick={() => setSelectedActivity(1)}>
                                    <td>1</td>
                                    <td>create-room</td>
                                    <td>08/07/22 10:00</td>
                                    <td>08/07/22 10:02</td>
                                </tr>
                                <tr style={{background: (selectedActivity==2 ? '#1b99d4' : 'transparent' )}} onClick={() => setSelectedActivity(2)}>
                                    <td>2</td>
                                    <td>send-message</td>
                                    <td>08/07/22 10:02</td>
                                    <td>08/07/22 10:03</td>
                                </tr>
                                <tr style={{background: (selectedActivity==3 ? '#1b99d4' : 'transparent' )}} onClick={() => setSelectedActivity(3)}>
                                    <td>3</td>
                                    <td>pin-message</td>
                                    <td>08/07/22 10:04</td>
                                    <td>08/07/22 10:05</td>
                                </tr>
                            </tbody>
                            }
                            {selectedInstance == null &&
                            <tbody>
                                <tr>
                                    <td colspan={"4"}>Select an instance</td>
                                </tr>
                            </tbody>
                            }
                        </Table>
                    </WorkflowBody>
                </WorkflowItem>
                <WorkflowItem>
                    <WorkflowTitle>
                        Variables
                    </WorkflowTitle>
                    <WorkflowBody>
                        <Table>
                            <thead>
                            <tr><th>Name</th><th>Value</th><th>Modified</th></tr>
                            </thead>
                            {selectedActivity &&
                            <tbody>
                            <tr>
                                <td>Price</td>
                                <td>124</td>
                                <td>08/07/22 10:02</td>
                            </tr>
                            <tr>
                                <td>Ticker</td>
                                <td>GOOG</td>
                                <td>08/07/22 10:02</td>
                            </tr>
                            </tbody>
                            }
                            {selectedActivity == null &&
                            <tbody>
                            <tr>
                                <td colspan={3}>Select an activity</td>
                            </tr>
                            </tbody>
                            }
                        </Table>
                    </WorkflowBody>
                </WorkflowItem>
            </WorkflowGrid>
        </MonitorRoot>
    );
};

export default Monitor;
