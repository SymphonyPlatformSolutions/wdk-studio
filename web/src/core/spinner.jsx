import Loader from '@symphony-ui/uitoolkit-components/components/loader';
import styled from 'styled-components';

const LoadingRoot = styled.div`
    font-size: 6rem;
    display: flex;
    align-self: center;
    justify-content: center;
    width: 100%;
    margin: auto;
`;

const Spinner = () => (
    <LoadingRoot>
        <Loader variant="primary" />
    </LoadingRoot>
);

export default Spinner;
