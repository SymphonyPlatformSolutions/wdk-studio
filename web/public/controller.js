const isDev = window.location.hostname === 'localhost';
const appUri = isDev ? 'http://localhost:3000' : window.location.origin;
const appId = isDev ? 'localhost-10443' : 'wdk-studio';
const controllerId = `${appId}:controller`;

const auth = () => fetch('/bdk/v1/app/auth', { method: 'POST' });

const register = ({ appToken }) => SYMPHONY.application.register(
    { appId, tokenA: appToken },
    [ 'modules', 'applications-nav', 'extended-user-info' ],
    [ controllerId ]
);

const bootstrap = () => {
    let modulesService = SYMPHONY.services.subscribe("modules");
    let navService = SYMPHONY.services.subscribe("applications-nav");

    const title = (isDev ? '[DEV] ' : '') + 'WDK Studio';
    const meta = { title, icon: appUri + '/icon-16.png' };

    navService.add(appId, meta, controllerId);
    controller.implement({
        select: (id) => {
            if (id === appId) {
                modulesService.show(`${appId}-app`, meta, controllerId, appUri);
            }
        },
    });
};

let controller = SYMPHONY.services.register(controllerId);
SYMPHONY.remote.hello().then(auth).then(register).then(bootstrap);
