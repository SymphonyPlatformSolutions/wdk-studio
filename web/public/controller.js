const appId = (window.location.hostname === 'localhost') ? 'http://localhost-8080' : 'workflower';
const appUri = (window.location.hostname === 'localhost') ? 'http://localhost:3000' : window.location.origin;

const auth = () => fetch('/bdk/v1/app/auth', { method: 'POST' });

const register = ({ appToken }) => SYMPHONY.application.register(
    { appId: appId, tokenA: appToken },
    [ 'modules', 'applications-nav', 'extended-user-info' ],
    [ 'app:controller' ]
);

const bootstrap = () => {
    let modulesService = SYMPHONY.services.subscribe("modules")
    let navService = SYMPHONY.services.subscribe("applications-nav")
    navService.add('app', 'Workflower', 'app:controller')
    controller.implement({
        select: id => {
            if (id === 'app') {
                modulesService.show("test-app", { title: "Workflower" }, "app:controller", appUri)
            }
        }
    })
};

let controller = SYMPHONY.services.register("app:controller");
SYMPHONY.remote.hello().then(auth).then(register).then(bootstrap);
