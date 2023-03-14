import styled, { keyframes } from "styled-components";

const DetailPlane = styled.div`
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
`;

const rotateAnimation = keyframes`
    0% { transform: rotate(0deg) }
    100% { transform: rotate(-360deg) }
`;

const TableTitle = styled.h3`
    position: fixed;
    width: calc(100vw - 2.6rem);
    font-weight: 800;
    background: var(--tk-table-hover-color, #cfd0d2);
    padding: .3rem;
    margin: 0;
    display: flex;
    justify-content: space-between;
    & > div:last-child { cursor: pointer }
    .loading { animation: ${rotateAnimation} 1.3s linear infinite; }
`;

const Table = styled.table`
    font-weight: 300;
    border-collapse: collapse;
    margin-top: 2rem;
    align-self: flex-start;

    th { text-align: left }
    th, td {
        white-space: nowrap;
        padding-right: 1.5rem;
        max-width: 50vw;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    tbody tr:hover {
        cursor: pointer;
        background: var(--tk-color-electricity-50);
        & td { color: var(--tk-color-electricity-05) }
    }
`;

const Row = styled.tr`
    background-color: ${props => props.selected ? 'var(--tk-color-electricity-40)' : ''};
    td {
        color: ${props => props.status === 'PENDING' ? 'var(--tk-color-green-30)' : ''};
        color: ${props => props.status === 'FAILED' ? 'var(--tk-color-error, #ee3d3d)' : ''};
        color: ${props => props.selected ? 'var(--tk-color-electricity-05)' : ''};

        &.indicator:after {
            color: ${props => props.selected ? 'var(--tk-color-electricity-05)' : 'transparent'};
            font-family: 'tk-icons';
            content: "";
        }
    }
`;

export {
    DetailPlane, Table, TableTitle, Row
};
