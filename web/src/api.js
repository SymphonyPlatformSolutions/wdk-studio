const apiRoot = window.location.hostname === 'localhost' ? 'https://localhost:10443/' : '';

const api = (uri, body, callback, errorCallback) => {
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
}

export default api;
