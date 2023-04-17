import { useEffect, useState } from 'react';
import { TextField } from "@symphony-ui/uitoolkit-components/components";

const ConditionWizard = ({ setConditionCodeSnippet }) => {
    const [ condition, setCondition ] = useState('');

    useEffect(() => {
        setConditionCodeSnippet(condition);
    }, [ condition ]);

    return (
        <>
            Define the conditional execution of the activity
            <TextField label="Execute the activity only if" value={condition} onChange={({ target }) => setCondition(target.value)} />
        </>
    );
};

export default ConditionWizard;
