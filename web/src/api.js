import { useRecoilState } from 'recoil';
import { atoms } from './atoms';
import { EventSourcePolyfill } from 'event-source-polyfill';

const api = () => {
    const dev = window.location.hostname === 'localhost';
    const backendRoot = dev ? 'https://localhost:10443' : '';
    const wdkRoot = dev ? 'http://localhost:8080' : '';
    const setStatus = useRecoilState(atoms.status)[1];
    const setLoading = useRecoilState(atoms.loading)[1];
    const session = useRecoilState(atoms.session)[0];
    const showStatus = (error, content) => setStatus({ show: true, error, content });

    const process = async (response) => {
        if (response.ok) {
            if (response.headers.get('Content-Length') === '0') {
                return new Promise((r) => r(""));
            }
            const contentType = response.headers.get('Content-type').split(';')[0];
            return contentType === 'text/plain' ? response.text() : response.json();
        } else {
            throw new Error((await response.json()).detail);
        }
    };

    const handleError = ({ message }) => {
        setLoading(false);
        const msg = message.startsWith('NetworkError') || message.startsWith('Failed to fetch')
            ? 'Unable to establish connectivity' : message;
        showStatus(true, msg);
    };

    const apiCall = (method, uri, body, callback) => {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.token}`
        };
        const config = { method, headers };
        if (body) {
            config.body = JSON.stringify(body);
        }
        const promise = fetch(`${backendRoot}/api/${uri}`, config).then(process);
        if (!callback) {
            return promise;
        } else {
            promise.then(callback).catch(handleError);
        }
    };

    const initLogs = (token, callback) => {
        const headers = { 'X-Management-Token': token };
        const es = new EventSourcePolyfill(`${wdkRoot}/wdk/v1/management/workflows/logs`, { headers });
        es.onmessage = callback;
    };

    const [ GET, POST, PUT, DELETE ] = [ 'GET', 'POST', 'PUT', 'DELETE' ];

    const getInstanceData = (workflowId, instanceId, callback) => {
        const uriRoot = `monitoring/${workflowId}/instances/${instanceId}`;
        const activities = apiCall(GET, `${uriRoot}/activities`, null, null);
        const variables = apiCall(GET, `${uriRoot}/variables`, null, null);
        Promise.all([ activities, variables ])
            .then((response) => callback({ activities: response[0], variables: response[1] }))
            .catch(handleError);
    };

    return {
        showStatus,
        getManagementToken: (callback) => apiCall(GET, 'management-token', null, callback),
        listWorkflows: (callback) => apiCall(GET, 'workflows', null, callback),
        addWorkflow: (workflow, callback) => apiCall(POST, 'management/workflow', workflow, callback),
        editWorkflow: (workflow, callback) => apiCall(PUT, 'management/workflow', workflow, callback),
        readWorkflow: (callback) => apiCall(GET, `read-workflow/${workflowId}`, null, callback),
        deleteWorkflow: (callback) => apiCall(DELETE, `management/workflow/${workflowId}`, null, callback),
        listGalleryCategories: (callback) => apiCall(GET, 'gallery/categories', null, callback),
        listGalleryWorkflows: (category, callback) => apiCall(GET, `gallery/${category}/workflows`, null, callback),
        readGalleryWorkflow: (category, workflow, callback) => apiCall(GET, `gallery/${category}/workflows/${workflow}`, null, callback),
        getReadme: (path, callback) => apiCall(GET, `gallery/readme/${path}`, null, callback),
        getWorkflowDefinition: (workflowId, callback) => apiCall(GET, `monitoring/${workflowId}/definitions`, null, callback),
        listWorkflowInstances: (workflowId, callback) => apiCall(GET, `monitoring/${workflowId}/instances`, null, callback),
        getInstanceData,
        initLogs,
    };
};
export default api;
