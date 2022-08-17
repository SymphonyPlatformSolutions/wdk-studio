import React from 'react';
import { useState, useRef } from 'react';
import styled from "styled-components";
import SendMessageForm from "./activities/send-message-form";
import UpdateMessageForm from "./activities/update-message-form";

const Root = styled.div`
    height: 400px;
    display: flex;
    flex-direction: column;
`;

const Title = styled.div`
    padding: 10px;
`;

const ItemsBody = styled.div`
    padding: 10px;
    margin: 10px;
    display: grid;
    grid-gap: 10px;
`;

const ItemsBodyContent = styled.div`
    padding: 10px;
    padding-right: 0px;
    display: grid;
    line-height: 24px;
    grid-template-columns: 10fr 1fr;
    font-size: 13px;
    grid-gap: 10px;
    border: 1px solid transparent;
    cursor: pointer;
    &:hover {
        border-radius: 15px;
        border: 1px solid #dddddd;
    }
    &: > i {
        line-height: 24px;
    }
`;

const Chevron = styled.i`
    line-height: 24px;
`;

const ActivityWizard = ({setCodeSnippet, eventCodeSnippet}) => {
    const [ selectedType, setSelectedType ] = useState(0);
    const [ selectedActivityForm, setSelectedActivityForm ] = useState({});

    const forms = {
        'SendMessageForm': SendMessageForm,
        'UpdateMessageForm': UpdateMessageForm
    }

    const addForm = (name) => {
        return (selectedActivityForm.name) ? React.createElement( forms[selectedActivityForm.name], {setCodeSnippet: setCodeSnippet, eventCodeSnippet: eventCodeSnippet}, [] ) : null;
    }

    return (
        <Root>
            {!selectedActivityForm.name && selectedType === 0 &&
            <>
                <Title>Select a type of activity to execute:</Title>
                <ItemsBody>
                    <ItemsBodyContent onClick={() => setSelectedType(1)}>
                        <span>Send, update, delete Messages</span>
                        <Chevron className="fa fa-angle-right"></Chevron>
                    </ItemsBodyContent>
                    <ItemsBodyContent>
                        <span>Create et configure Rooms</span>
                        <Chevron className="fa fa-angle-right"></Chevron>
                    </ItemsBodyContent>
                    <ItemsBodyContent>
                        <span>Search and manage Users</span>
                        <Chevron className="fa fa-angle-right"></Chevron>
                    </ItemsBodyContent>
                    <ItemsBodyContent>
                        <span>Call APIs</span>
                        <Chevron className="fa fa-angle-right"></Chevron>
                    </ItemsBodyContent>
                    <ItemsBodyContent>
                        <span>Add scripts</span>
                        <Chevron className="fa fa-angle-right"></Chevron>
                    </ItemsBodyContent>
                </ItemsBody>
            </>
            }
            {!selectedActivityForm.name && selectedType===1 &&
                <>
                    <Title>Select a message based activity:</Title>
                    <ItemsBody>
                        <ItemsBodyContent onClick={() => setSelectedActivityForm({name: 'SendMessageForm'} )}>
                            <span>Send a message</span>
                            <Chevron className="fa fa-angle-right"></Chevron>
                        </ItemsBodyContent>
                        <ItemsBodyContent onClick={() => setSelectedActivityForm({name: 'UpdateMessageForm'} )}>
                            <span>Update a message</span>
                            <Chevron className="fa fa-angle-right"></Chevron>
                        </ItemsBodyContent>
                        <ItemsBodyContent>
                            <span>Delete a message</span>
                            <Chevron className="fa fa-angle-right"></Chevron>
                        </ItemsBodyContent>
                        <ItemsBodyContent onClick={() => setSelectedType(0)}>
                            <span>Back</span>
                            <Chevron className="fa fa-angle-left"></Chevron>
                        </ItemsBodyContent>
                    </ItemsBody>
                </>
            }
            {selectedActivityForm.name &&
                <>
                    {addForm(selectedActivityForm.name)}
                </>
            }
        </Root>
    );
};


export default ActivityWizard;