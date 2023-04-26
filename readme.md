## WDK Studio
WDK Studio is an extension app that brings the workflow orchestration capabilities
of Symphony's Workflow Developer Kit right into the Symphony interface.

### Pre-requisites
1. Create RSA key pairs for the service account and extension app
2. In the Admin Portal, create a service account with a respective public key
3. In the Admin Portal, create an extension app with a respective public key
   - Permissions required: Business User Identity, Trusted application

### Docker-based Deployment
1. Create a deployment configuration file `application-yaml`
    - The service account username and app id need to match the entries created above
    - The `monitoring-token` and `management-token` values should be random strings
    - The `github-token` can be created on [GitHub](https://github.com/settings/tokens) using `Tokens (classic)` and the `public_repo` scope
    - The `admins` field is a comma-separated list of Symphony User IDs who will be granted rights within WDK Studio to reassign workflow ownership
   ```yaml
   bdk:
     host: develop2.symphony.com
     bot:
       username: my-bot-username
       privateKey.path: privatekey.pem
     app:
       appId: my-app-id
       privateKey.path: privatekey.pem
   wdk:
     properties:
       monitoring-token: random_string
       management-token: random_string
     studio:
       github-token: github_token
       admins: 349026222343926
   ```
       
2. Save the private keys in the same directory and an empty `data` directory
3. Launch docker and mount the files as appropriate
    ```shell
    docker run --rm \
        --name wdk-studio \
        -p 8080:8080 \
        --mount type=bind,source="$(pwd)"/application-prod.yaml,target=/data/symphony/application-prod.yaml,readonly \
        --mount type=bind,source="$(pwd)"/privatekey.pem,target=/data/symphony/privatekey.pem,readonly \
        -v $(pwd)/data:/data/symphony/data \
        ghcr.io/symphonyplatformsolutions/wdk-studio:2.1.3
    ```
4. This command exposes the deployment on the current host on port `8080`,
which then needs to be fronted with an ingress controller or load balancer
with a trusted TLS certificate. The resulting URL then needs to be defined in
the extension app entry in the Admin portal.
