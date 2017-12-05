#!/usr/bin/env bash
# templates paths
npm_package_filepath="../package.json"
dockerfile_template_filepath="./Dockerfile.template"
dockerfile_build_filename="../Dockerfile"
rc_template_filepath="./rc.template.yaml"
rc_build_filepath="./rc.build.yaml"

# getting variables from package.json
project_name=$(cat $npm_package_filepath | grep -P '(?<=\"name\": \").+(?=(\"))' -o | head -1)
project_version=$(cat $npm_package_filepath | grep -P '(?<=\"version\": \").+(?=(\"))' -o | head -1)
gc_project_name=$(cat $npm_package_filepath | grep -P '(?<=\"gc\-project\-name\": \").+(?=(\"))' -o | head -1)
gc_cluster_name=$(cat $npm_package_filepath | grep -P '(?<=\"gc\-cluster\-name\": \").+(?=(\"))' -o | head -1)
gc_zone=$(cat $npm_package_filepath | grep -P '(?<=\"gc\-zone\": \").+(?=(\"))' -o | head -1)
node_engine_version=$(cat $npm_package_filepath | grep -P '(?<=\"node\": \").+(?=(\"))' -o | head -1)

# creating full image name
image_name="gcr.io/$gc_project_name/$project_name/$project_version:latest"

# displaying extracted vars
echo $project_name
echo $project_version
echo $gc_project_name
echo $gc_cluster_name
echo $gc_zone
echo $image_name

# creating Dockerfile
sed -e "s;\${node\-version};$node_engine_version;g" $dockerfile_template_filepath > $dockerfile_build_filename

# building service image
docker build -t $image_name ../.

# removing Dockerfile build
rm -rf $dockerfile_build_filename

# connecting to project's kubernetes
gcloud container clusters get-credentials $gc_cluster_name --zone $gc_zone --project $gc_project_name

# check if connection was successful
errorCode=$?
if [[ $errorCode == 0 ]]; then

  # no errors when connecting to container cluster
  # pushing service image
  gcloud docker -- push $image_name

  # building replication controller from template
  sed -e "s;\${rc\-name};$project_name;g" -e "s;\${full\-image\-name};$image_name;g" $rc_template_filepath > $rc_build_filepath

  # creating replication controller in the cloud
  kubectl create -f $rc_build_filepath --save-config

  errorCode=$?
  if [[ $errorCode == 0 ]]; then

    # no errors returned
    # logging
    echo "New replication controller has been created"

  else

    # error creating controller
    # apply modified replication controller
    kubectl apply -f $rc_build_filepath

    # rolling-updating image
    kubectl rolling-update $project_name --image=$image_name --image-pull-policy=Always

    # logging
    echo "New replication controller has been updated"

  fi

  # removing replication controller build locally
  rm -rf $rc_build_filepath

else

  # errors were returned
  # logging
  echo "Error when connecting to Google Cloud's container cluster"

fi

