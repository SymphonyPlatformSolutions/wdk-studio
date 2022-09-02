import styled from "styled-components";
import { useState, useEffect } from "react";
import { Loader } from "@symphony-ui/uitoolkit-components";
import { api } from "./api";

const Root = styled.div`
    min-height: 18rem;
    display: flex;
`;

const TemplatesRoot = styled.div`
    flex-grow: 1;
`;

const TemplatesGrid = styled.div`
    display: grid;
    grid-template-columns: 50% 50%;
    gap: .5rem;
    margin-bottom: 1rem;
    flex-grow: 1;
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
    gap: .5rem;
    cursor: pointer;
    &:hover {
        background: var(--tk-color-electricity-10);
    }
`;

const LoadingRoot = styled.div`
    padding: 1rem;
    font-size: 2rem;
    height: 100%;
    display: flex;
    flex-grow: 1;
    justify-content: center;
    align-self: center;
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

const Templates = ({
    items, setItems, stage, setStage, setPageLoading, category, setCategory, setSwadlTemplate, templateLoading, setTemplateLoading,
}) => {
    const [ selectedIndex, setSelectedIndex ] = useState(0);

    useEffect(() => {
        const selection = items[selectedIndex];
        if (selection === empty) {
            setSwadlTemplate(defaultTemplate);
            return;
        }
        if (stage === 0 && selection === gallery) {
            setPageLoading(true);
            api.listGalleryCategories((categories) => {
                setItems([ empty, ...categories]);
                setStage(1);
                setPageLoading(false);
            });
        } else if (stage === 1) {
            setPageLoading(true);
            api.listGalleryWorkflows(selection, (workflows) => {
                setItems([ empty, ...workflows]);
                setStage(2);
                setCategory(selection);
                setPageLoading(false);
            });
        } else if (stage === 2) {
            api.readGalleryWorkflow(category, selection, (contents) => {
                setSwadlTemplate(contents);
                setTemplateLoading(false);
            });
        }
    }, [ selectedIndex ]);

    const select = (index) => {
        setSelectedIndex(index);
        if (index > 0 && stage === 2) {
            setTemplateLoading(true);
        }
    };

    return (
        <TemplatesRoot>
            <TemplatesGrid>
                {items.map((item, index) => {
                    const label = item.replace(/_/g, " ").replace(/-/g, " ").replace(/\.swadl\.yaml/g, "");
                    return (
                        <Template
                            key={index}
                            isSelected={index === selectedIndex}
                            onClick={() => select(index)}
                        >
                            { label }
                            { templateLoading && index === selectedIndex && <Loader /> }
                        </Template>
                    );
                })}
            </TemplatesGrid>
        </TemplatesRoot>
    );
};

const empty = "Empty Workflow";
const gallery = "Select from WDK Gallery";

const TemplateSelector = ({ setSwadlTemplate, pageLoading, setPageLoading, templateLoading, setTemplateLoading }) => {
    const [ stage, setStage ] = useState(0);
    const [ items, setItems ] = useState([ empty, gallery ]);
    const [ category, setCategory ] = useState();

    const content = pageLoading ? getLoader() :
        <Templates {...{ items, setItems, stage, setStage, setPageLoading, category, setCategory, setSwadlTemplate, templateLoading, setTemplateLoading }} />;
    return <Root>{content}</Root>;
};
export default TemplateSelector;
