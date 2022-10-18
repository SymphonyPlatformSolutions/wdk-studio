import styled from "styled-components";
import { useState, useEffect } from "react";
import { Loader, Icon, Button } from "@symphony-ui/uitoolkit-components";
import { api } from "./api";
import ReactMarkdown from 'react-markdown'

const Root = styled.div`
    min-height: 18rem;
    display: flex;
`;

const TemplatesRoot = styled.div`
    flex-grow: 1;
    margin-top: 1rem;
`;

const TemplatesGrid = styled.div`
    display: grid;
    grid-template-columns: 50% 50%;
    gap: .5rem;
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
    user-select: none;
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
    items,
    setItems,
    stage,
    setStage,
    setPageLoading,
    category,
    setCategory,
    setSwadlTemplate,
    templateLoading,
    setTemplateLoading,
    description,
    setDescription,
}) => {
    const [ selectedIndex, setSelectedIndex ] = useState(0);

    const loadCategories = () => {
        setPageLoading(true);
        api.listGalleryCategories((c) => {
            setItems([ empty, ...c]);
            setStage(1);
            setPageLoading(false);
        });
    };

    useEffect(() => {
        const selection = items[selectedIndex];
        if (selection === empty) {
            setSwadlTemplate(defaultTemplate);
            setDescription('');
            return;
        }
        if (stage === 0 && selection === gallery) {
            loadCategories();
        } else if (stage === 1) {
            setPageLoading(true);
            api.listGalleryWorkflows(selection, (workflows) => {
                setItems([ empty, ...workflows]);
                setStage(2);
                setCategory(selection);
                setPageLoading(false);
            });
            api.getReadme(selection, (contents) => setDescription(contents));
        } else if (stage === 2) {
            api.readGalleryWorkflow(category, selection, (contents) => {
                setSwadlTemplate(contents);
                setTemplateLoading(false);
            });
            api.getReadme(category + '/' + selection.replace(/\/.*/g, ''), (contents) => setDescription(contents));
        }
    }, [ selectedIndex ]);

    const select = (index) => {
        setSelectedIndex(index);
        if (index > 0 && stage === 2) {
            setTemplateLoading(true);
        }
    };

    const BackButton = () => (
        <Button
            variant="tertiary-accent"
            iconLeft={<Icon iconName="reply" />}
            className="tk-mb-2"
            onClick={loadCategories}
        >
            Back
        </Button>
    );

    return (
        <TemplatesRoot>
            { stage > 1 && <BackButton /> }
            <TemplatesGrid>
                {items.map((item, index) => {
                    const label = item
                        .replaceAll(/\/.*/g, '')
                        .replaceAll(/_/g, " ")
                        .replaceAll(/-/g, " ")
                        .replaceAll(/\.swadl\.yaml/g, "");
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
            <ReactMarkdown>
                { description }
            </ReactMarkdown>
        </TemplatesRoot>
    );
};

const empty = "Empty Workflow";
const gallery = "Select from WDK Gallery";

const TemplateSelector = ({ setSwadlTemplate, pageLoading, setPageLoading, templateLoading, setTemplateLoading }) => {
    const [ stage, setStage ] = useState(0);
    const [ items, setItems ] = useState([ empty, gallery ]);
    const [ category, setCategory ] = useState();
    const [ description, setDescription ] = useState();

    const content = pageLoading ? getLoader() :
        <Templates {...{
            items,
            setItems,
            stage,
            setStage,
            setPageLoading,
            category,
            setCategory,
            setSwadlTemplate,
            templateLoading,
            setTemplateLoading,
            description,
            setDescription,
        }} />;
    return <Root>{content}</Root>;
};
export default TemplateSelector;
