import { Toast } from "@symphony-ui/uitoolkit-components/components";
import styled, { keyframes } from "styled-components";

const fade = keyframes`
    0%, 100% { opacity: 0 }
    10%, 90% { opacity: 1 }
`;

const Root = styled(Toast)`
    animation: ${fade} 2s linear forwards;
    background: var(--tk-color-green-50);
`;

const FadeToast = ({ toast }) => {
    return (
        <Root
            show={toast.show}
            content={toast.content || ''}
            leftIcon={toast.icon || 'check'}
            placement={{ horizontal: 'center', vertical: 'bottom' }}
        />
    );
};
export default FadeToast;
