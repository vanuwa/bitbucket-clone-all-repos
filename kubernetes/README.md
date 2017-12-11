# Kubernetes 101

## How to deploy my service to Kubernetes cluster

### Using Replication Controllers

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

You can manage your Replication controllers using following commands:
```
# get a list of all replication controllers
kubectl get replicationcontrollers

# get info for target replication controller
kubectl get replicationcontroller rc_name

# delete target replication controller
kubect delete replicationcontroller rc_name

# create new replication controller from yaml config file
kubectl create -f ./rc.build.yaml --save-config

# update existing replication controller from yaml config file
kubectl apply -f ./rc.build.yaml
```

You can also view/create/delete/update Replication controllers
from kubernetes UI.

To start the UI server use the following:
```
kubectl proxy
```

### Using Cron Jobs (UPDATED)

You can setup your app to run on Kubernetes as a single Job (if your
application is terminated after job is complete).

Similar as with Replication controller, you can setup your environment
variables and volume mounts inside cron job template file
'./cronjob.template.yaml'.

When you are ready to deploy your app run:
```
./create_cronjob.sh
```

CRON Jobs are currently unavailable inside Kubernetes UI (1.8.4-gke.0).

You can manage your CRON jobs using following commands:
```
# get a list of all cronjobs
kubectl get cronjobs

# get info for target cronjob
kubectl get cronjob cronjob_name

# delete target cronjob
kubectl delete cronjob cronjob_name

# create new cronjob from yaml config file
kubectl create -f ./cronjob.build.yaml --save-config

# update existing cronjob from yaml config file
kubectl apply -f ./cronjob.build.yaml
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
