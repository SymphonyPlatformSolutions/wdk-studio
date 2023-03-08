import styled from "styled-components";

const DetailPlane = styled.div`
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
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


    & > div:last-child {

        cursor: pointer;
    }
    @keyframes loading {
        0 { transform: rotate(0deg); }
        100% { transform: rotate(-360deg); }
    };
    .loading { animation: loading 1.3s linear infinite; }
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
        color: #fff;
        background: var(--tk-color-electricity-50);
    }
`;
export {
    DetailPlane, Table, TableTitle,
};
