import styled from "styled-components";
import { useState, useEffect } from "react";
import { Loader } from "@symphony-ui/uitoolkit-components";
import { api } from "./api";

const TemplatesRoot = styled.div`
    display: grid;
    grid-template-columns: 50% 50%;
    gap: .5rem;
    margin-bottom: 1rem;
`;

const Template = styled.div`
    text-transform: capitalize;
    font-size: .9rem;
    padding: .5rem;
    color: ${props => props.isSelected ? 'var(--tk-color-electricity-50)' : 'var(--tk-color-graphite-50)'};
    font-weight: ${props => props.isSelected ? 600 : 400};
    border: ${props => props.isSelected ? 'var(--tk-color-electricity-40) 2px solid' : 'var(--tk-color-graphite-40) 2px solid'};
    border-radius: .3rem;
    display: flex;
    align-items: center;
    cursor: pointer;
    &:hover {
        background: var(--tk-color-electricity-10);
    }
`;

const LoadingRoot = styled.div`
    padding: 1rem;
    display: flex;
    justify-content: center;
    font-size: 2rem;
`;

const getLoader = () => (
    <LoadingRoot>
        <Loader variant="primary" />
    </LoadingRoot>
);

const defaultTemplate =
`id: newId
activities:
- send-message:
    id: newIdInit
    on:
      message-received:
        content: /hello
    content: hello
`;

const Templates = ({ items, setItems, stage, setStage, setLoading, category, setCategory, setSwadlTemplate, }) => {
    const [ selectedIndex, setSelectedIndex ] = useState(0);

    useEffect(() => {
        const selection = items[selectedIndex];
        if (selection === empty) {
            setSwadlTemplate(defaultTemplate);
            return;
        }
        if (stage === 0 && selection === gallery) {
            setLoading(true);
            api.listGalleryCategories((categories) => {
                setItems([ empty, ...categories]);
                setStage(1);
                setLoading(false);
            });
        } else if (stage === 1) {
            setLoading(true);
            api.listGalleryWorkflows(selection, (workflows) => {
                setItems([ empty, ...workflows]);
                setStage(2);
                setCategory(selection);
                setLoading(false);
            });
        } else if (stage === 2) {
            api.readGalleryWorkflow(category, selection, (contents) => {
                setSwadlTemplate(contents);
            });
        }
    }, [ selectedIndex ]);

    return (
        <TemplatesRoot>
            {items.map((item, index) => (
                <Template
                    key={index}
                    isSelected={index === selectedIndex}
                    onClick={() => setSelectedIndex(index)}
                >
                    {item.replace(/_/g, " ").replace(/-/g, " ").replace(/\.swadl\.yaml/g, "")}
                </Template>
            ))}
        </TemplatesRoot>
    );
};

const empty = "Empty Workflow";
const gallery = "Select from WDK Gallery";

const TemplateSelector = ({ setSwadlTemplate }) => {
    const [ stage, setStage ] = useState(0);
    const [ loading, setLoading ] = useState(false);
    const [ items, setItems ] = useState([ empty, gallery ]);
    const [ category, setCategory ] = useState();

    return loading ? getLoader() : <Templates {...{ items, setItems, stage, setStage, setLoading, category, setCategory, setSwadlTemplate }} />;
};
export default TemplateSelector;
