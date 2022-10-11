const apiRoot = window.location.hostname === 'localhost' ? 'https://localhost:10443/' : '';

const process = async (response) => {
    const contentType = response.headers.get('Content-type').split(';')[0];
    if (response.ok) {
        return contentType === 'text/plain' ? response.text() : response.json();
    } else {
        throw await response.json();
    }
};

const apiCall = (uri, body, callback, errorCallback) => {
    const config = body && {
        method: "post",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    };
    fetch(apiRoot + uri, config)
        .then(process)
        .then(callback)
        .catch(errorCallback || ((response) => console.log(response)));
};

const getInstanceData = (workflowId, instanceId, callback, errorCallback) => {
    const uriRoot = `api/monitoring/${workflowId}/instances/${instanceId}/`;
    const config = { headers: { 'Content-Type': 'application/json' } };
    const activities = fetch(apiRoot + uriRoot + 'activities', config).then(process);
    const variables = fetch(apiRoot + uriRoot + 'variables', config).then(process);
    Promise.all([ activities, variables ]).then((response) => {
        callback({ activities: response[0], variables: response[1] });
    }).catch(errorCallback || ((response) => console.log(response)));
};

export const api = {
    listWorkflows: (callback, errorCallback) => apiCall('api/list-workflows', null, callback, errorCallback),
    readWorkflow: (request, callback, errorCallback) => apiCall('api/read-workflow', request, callback, errorCallback),
    addWorkflow: (request, callback, errorCallback) => apiCall('api/add-workflow', request, callback, errorCallback),
    writeWorkflow: (request, callback, errorCallback) => apiCall('api/write-workflow', request, callback, errorCallback),
    deleteWorkflow: (request, callback, errorCallback) => apiCall('api/delete-workflow', request, callback, errorCallback),
    listGalleryCategories: (callback, errorCallback) => apiCall('api/gallery/categories', null, callback, errorCallback),
    listGalleryWorkflows: (category, callback, errorCallback) => apiCall(`api/gallery/${category}/workflows`, null, callback, errorCallback),
    readGalleryWorkflow: (category, workflow, callback, errorCallback) => apiCall(`api/gallery/${category}/workflows/${workflow}`, null, callback, errorCallback),
    getWorkflowDefinition: (workflowId, callback, errorCallback) => apiCall(`api/monitoring/${workflowId}/definitions`, null, callback, errorCallback),
    listWorkflowInstances: (workflowId, callback, errorCallback) => apiCall(`api/monitoring/${workflowId}/instances`, null, callback, errorCallback),
    getInstanceData,
};

export const initLogs = (callback) => (new EventSource(apiRoot + "api/logs")).onmessage = callback;
