import { useEffect, useState, useRef } from 'react';
import {
    Button, Dropdown, Loader, TextField,
    Modal, ModalTitle, ModalBody, ModalFooter,
} from "@symphony-ui/uitoolkit-components/components";
import styled from "styled-components";

const Root = styled.div`
    height: 400px;
`;


const ConditionWizard = () => {

    return (
        <Root>
            Select a condition to execute:
        </Root>
    );
};


export default ConditionWizard;