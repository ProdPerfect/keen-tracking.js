#!/bin/bash

readonly DISTRIBUTION_ID="E3CL6P6NHSXGR6"
readonly PACKAGE_VERSION=$(node -pe "require('./package.json').version" | tr '[.]' '_')
readonly FILE_NAME="keen-tracking"
readonly MINIFIED_FILE="${FILE_NAME}.min.js"
readonly NO_OP_MINIFIED_FILE="${FILE_NAME}.no_op.min.js"
readonly S3_BUCKET="wespire-tracking-library"

for arg in "$@"
do
    if [ "$arg" == "--force" ] || [ "$arg" == "-f" ]
    then
        FORCE_DEPLOY="yes"
        echo "Using --force option. Will not check if PR has been approved (non-interactive mode)."
    fi
done

if [ "$FORCE_DEPLOY" != "yes" ]
then
  while true; do
      read -p "ARE YOU SURE YOU WANT TO DEPLOY THE NO-OP VERSION OF THE TRACKING LIBRARY? (Yes/No) " yn
      case $yn in
          [Yy]* ) break;;
          [Nn]* ) echo "Please do so before continuing"; exit;;
          * ) echo "Please answer yes or no.";;
      esac
  done
fi

echo "getting latest master branch";
git checkout master || { echo 'git checkout master failed!' ; exit 1; }
git pull origin master || { echo 'git pull origin master failed!' ; exit 1; }

if aws --version &> /dev/null
then
  echo "Uploading **NO OP*** build of '${MINIFIED_FILE}'."  
  # aws s3 cp "./dist/${NO_OP_MINIFIED_FILE}" "s3://${S3_BUCKET}/${MINIFIED_FILE}" --region us-east-1 --acl public-read

  echo "Invalidating canary Cloudfront cache for 's3://${S3_BUCKET}/${MINIFIED_FILE}'...";
  # INVALIDATION_ID=$(aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths /\* | egrep Id | awk -F'"' '{ print $4}' )
  echo "Cloudfront invalidation command executed. Invalidation ID: '${INVALIDATION_ID}'. Waiting for Cloudfront invalidation to complete...";
  # aws cloudfront wait invalidation-completed --distribution-id $DISTRIBUTION_ID --id $INVALIDATION_ID
  echo "Invalidation finished."
else
  echo "please install AWS CLI";
  exit 1;
fi;
echo "Deploy Complete!";
