const isDev = window.location.hostname === 'localhost';
const appId = isDev ? 'localhost-10443' : 'wdk-studio';
const appUri = isDev ? 'http://localhost:3000' : window.location.origin;

const auth = () => fetch('/bdk/v1/app/auth', { method: 'POST' });

const register = ({ appToken }) => SYMPHONY.application.register(
    { appId: appId, tokenA: appToken },
    [ 'modules', 'applications-nav', 'extended-user-info' ],
    [ 'app:controller' ]
);

const bootstrap = () => {
    let modulesService = SYMPHONY.services.subscribe("modules");
    let navService = SYMPHONY.services.subscribe("applications-nav");

    const title = (isDev ? '[DEV] ' : '') + 'WDK Studio';
    const meta = { title, icon: appUri + '/icon-16.png' };

    navService.add('app', meta, 'app:controller');
    controller.implement({
        select: id => {
            if (id === 'app') {
                modulesService.show("test-app", meta, "app:controller", appUri)
            }
        }
    });
};

let controller = SYMPHONY.services.register("app:controller");
SYMPHONY.remote.hello().then(auth).then(register).then(bootstrap);
