#!/bin/bash

readonly DISTRIBUTION_ID="E2HOSVJXGJAZD"
readonly PACKAGE_VERSION=$(node -pe "require('./package.json').version" | tr '[.]' '_')
readonly FILE_NAME="keen-tracking"
readonly MINIFIED_FILE="${FILE_NAME}.min.js"
readonly BACKUP_FILE="${FILE_NAME}_last.min.js"
readonly VERSIONED_FILE="${FILE_NAME}_${PACKAGE_VERSION}.min.js"
readonly NO_OP_MINIFIED_FILE="${FILE_NAME}.no_op.min.js"
readonly S3_BUCKET="canary-t2-tracking-library"

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
      read -p "Have you merged your approved pr with tests passing into master? (Yes/No) " yn
      case $yn in
          [Yy]* ) break;;
          [Nn]* ) echo "Please do so before continuing"; exit;;
          * ) echo "Please answer yes or no.";;
      esac
  done
fi

echo "getting latest canary-tier-2 branch";
git checkout canary-tier-2 || { echo 'git checkout canary-tier-2 failed!' ; exit 1; }
git pull origin canary-tier-2 || { echo 'git pull origin canary-tier-2 failed!' ; exit 1; }

if aws --version &> /dev/null
then
  echo "uploading a versioned build of ${FILE_NAME}.min to s3://${S3_BUCKET}/${VERSIONED_FILE}";
  aws s3 cp "./dist/${MINIFIED_FILE}" "s3://${S3_BUCKET}/${VERSIONED_FILE}" --region us-east-1 --acl public-read

  echo "Making backup of existing '${MINIFIED_FILE}' file.";
  aws s3 cp "s3://${S3_BUCKET}/${MINIFIED_FILE}" "s3://${S3_BUCKET}/${BACKUP_FILE}" --region us-east-1 --acl public-read

  echo "Uploading latest build of '${MINIFIED_FILE}'."  
  aws s3 cp "./dist/${MINIFIED_FILE}" "s3://${S3_BUCKET}/${MINIFIED_FILE}" --region us-east-1 --acl public-read

  echo "Uploading latest build of '${NO_OP_MINIFIED_FILE}'."  
  aws s3 cp "./dist/${NO_OP_MINIFIED_FILE}" "s3://${S3_BUCKET}/${NO_OP_MINIFIED_FILE}" --region us-east-1 --acl public-read

  echo "Invalidating canary Cloudfront cache for 's3://${S3_BUCKET}/${MINIFIED_FILE}'...";
  INVALIDATION_ID=$(aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths /\* | egrep Id | awk -F'"' '{ print $4}' )
  echo "Cloudfront invalidation command executed. Invalidation ID: '${INVALIDATION_ID}'. Waiting for Cloudfront invalidation to complete...";
  aws cloudfront wait invalidation-completed --distribution-id $DISTRIBUTION_ID --id $INVALIDATION_ID
  echo "Invalidation finished."
else
  echo "please install AWS CLI";
  exit 1;
fi;
echo "Deploy Complete!";
