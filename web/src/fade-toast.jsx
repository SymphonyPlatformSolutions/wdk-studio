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
    background: ${props => (props.error === 'true' ? 'var(--tk-color-red-50)' : 'var(--tk-color-green-50)')};
    z-index: 100;
`;

const FadeToast = () => {
    const status = useRecoilState(atoms.status)[0];

    return (
        <Root
            show={status.show}
            content={status.content || ''}
            leftIcon={status.error === 'true' ? 'cross' : 'check'}
            error={status.error || 'false'}
            placement={{ horizontal: 'center', vertical: 'bottom' }}
        />
    );
};
export default FadeToast;
