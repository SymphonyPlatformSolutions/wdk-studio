import { atoms } from './atoms';
import { useRecoilState } from 'recoil';
import { Toast } from "@symphony-ui/uitoolkit-components/components";
import styled, { keyframes } from "styled-components";

const fade = keyframes`
    0%, 100% { opacity: 0 }
    10%, 90% { opacity: 1 }
`;

const Root = styled(Toast)`
    animation: ${fade} 2s linear forwards;
    z-index: 100;
`;

const FadeToast = () => {
    const status = useRecoilState(atoms.status)[0];
    const getBackgroundColor = () => status.error ? 'red' : 'green';

    return (
        <Root
            show={status.show}
            content={status.content || ''}
            leftIcon={status.error ? 'cross' : 'check'}
            placement={{ horizontal: 'center', vertical: 'bottom' }}
            style={{ background: `var(--tk-color-${getBackgroundColor()}-50)` }}
        />
    );
};
export default FadeToast;
