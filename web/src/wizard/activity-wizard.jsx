import React from 'react';
import SendMessageForm from './activities/send-message-form';
import UpdateMessageForm from './activities/update-message-form';
import { Items, Item } from './styles';

const ComingSoon = () => "Coming Soon..";

const ActivityWizard = ({ setCodeSnippet, eventCodeSnippet, selectedForm, setSelectedForm }) => {
    const formProps = {...{ setCodeSnippet, eventCodeSnippet }};

    const forms = [
        { label: 'Send a message', component: <SendMessageForm {...formProps} /> },
        { label: 'Update a message', component: <UpdateMessageForm {...formProps} /> },
        { label: 'Create a room', component: <ComingSoon {...formProps} /> },
        { label: 'Call an API', component: <ComingSoon {...formProps} /> },
        { label: 'Execute a script', component: <ComingSoon {...formProps} /> },
    ];

    const Menu = () => (
        <>
            Select a type of activity to execute
            <Items>
                { forms.map((form) => (
                    <Item key={form.label} onClick={() => setSelectedForm(form)}>
                        { form.label }
                    </Item>
                )) }
            </Items>
        </>
    );
    return !selectedForm ? <Menu /> : selectedForm.component;
};
export default ActivityWizard;
