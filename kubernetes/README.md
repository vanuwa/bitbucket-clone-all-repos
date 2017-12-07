# Kubernetes 101

## How to deploy my service to Kubernetes cluster

There's a pre-configured universal script that allows you to build new
Docker image, upload it to Google Container Registry, create a new
Replication controller or update an existing RC with the new version
of an app image.

To run the script use the following line:

```
./rolling_update.sh
```

Before you run this script you may have to change some project-specific
variables inside these files:

```
Dockerfile.template
rc.template.yaml
../package.json
```

## Adding secrets

1) To create a kubernetes secret from file(s) you can use the following:

```
kubectl create secret generic <SECRET_FOLDER> --from-file=<FILENAME>
```

In this case new secret name would be equal to selected file name and
its value will be equal to file contents.

2) To create a kubernetes secret from literal(s) you can use the following:

```
kubectl create secret generic <SECRET_FOLDER> --from-literal=<SECRET_NAME=SECRET_VALUE>
```

## Adding config maps

1) To create a kubernetes config map from file(s) you can use the following:

```
kubectl create configmap <CONFIGMAP_FOLDER> --from-file=<FILENAME>
```

2) To create a kubernetes config map from literal(s) you can use the following:

```
kubectl create configmap <CONFIGMAP_FOLDER> --from-literal=<CONFIG_NAME="VALUE">
```
