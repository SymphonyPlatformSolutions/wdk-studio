import { useEffect, useState, useRef } from 'react';
import {
    Button, Dropdown, Loader, TextField,
    Modal, ModalTitle, ModalBody, ModalFooter,
} from "@symphony-ui/uitoolkit-components/components";
import styled from "styled-components";

const Root = styled.div`
    height: 400px;
`;

const Title = styled.div`
    padding: 10px;
`;

const Field = styled.div`
    margin-top: 10px;
`;

const ConditionWizard = ({setConditionCodeSnippet}) => {
    const [condition, setCondition] = useState('');

    useEffect(() => {
        setConditionCodeSnippet(condition);
    }, [condition]);

    const handleChangeCondition = (target) => {
        setCondition( target.value );
    };

    return (
        <Root>
            <Title>Define the conditional execution of the activity</Title>
            <Field><TextField label={'Execute the activity only if'} onChange={(e) => handleChangeCondition(e.target)} /></Field>
        </Root>
    );
};


export default ConditionWizard;