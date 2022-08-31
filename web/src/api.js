const apiRoot = window.location.hostname === 'localhost' ? 'https://localhost:10443/' : '';

const apiCall = (uri, body, callback, errorCallback) => {
    const config = body && {
        method: "post",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    };
    fetch(apiRoot + uri, config)
        .then(async (response) => {
            const contentType = response.headers.get('Content-type').split(';')[0];
            if (response.ok) {
                return contentType === 'text/plain' ? response.text() : response.json();
            } else {
                throw await response.json();
            }
        })
        .then(callback)
        .catch(errorCallback || ((response) => console.log(response)));
};

export const api = {
    listWorkflows: (callback, errorCallback) => apiCall('list-workflows', null, callback, errorCallback),
    readWorkflow: (request, callback, errorCallback) => apiCall('read-workflow', request, callback, errorCallback),
    addWorkflow: (request, callback, errorCallback) => apiCall('add-workflow', request, callback, errorCallback),
    writeWorkflow: (request, callback, errorCallback) => apiCall('write-workflow', request, callback, errorCallback),
    deleteWorkflow: (request, callback, errorCallback) => apiCall('delete-workflow', request, callback, errorCallback),
    listGalleryCategories: (callback, errorCallback) => apiCall('gallery/categories', null, callback, errorCallback),
    listGalleryWorkflows: (category, callback, errorCallback) => apiCall(`gallery/${category}/workflows`, null, callback, errorCallback),
    readGalleryWorkflow: (category, workflow, callback, errorCallback) => apiCall(`gallery/${category}/workflows/${workflow}`, null, callback, errorCallback),
};

export const initLogs = (callback) => (new EventSource(apiRoot + "logs")).onmessage = callback;
