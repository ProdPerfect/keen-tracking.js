#!/bin/bash

readonly DISTRIBUTION_ID="E2HOSVJXGJAZD";
readonly MIN_FILE="keen-tracking.min.js";
readonly S3_BUCKET="canary-t2-tracking-library";

for arg in "$@"
do
    if [ "$arg" == "--force" ] || [ "$arg" == "-f" ]
    then
        FORCE_DEPLOY="yes"
        echo "Using --force option (non-interactive mode)."
    fi
done

if [ "$FORCE_DEPLOY" != "yes" ]
then
  while true; do
      read -p "About to rollback build to previous version. Confirm? (Yes/No) " yn
      case $yn in
          [Yy]* ) break;;
          [Nn]* ) echo "Ok, exiting."; exit;;
          * ) echo "Please answer yes or no.";;
      esac
  done
fi

if aws --version &> /dev/null
then
  echo "rolling back canary";
  aws s3 cp "s3://${S3_BUCKET}/keen-tracking_last.min.js" "s3://${S3_BUCKET}/${MIN_FILE}" --region us-east-2 --acl public-read
else
  echo "please install AWS CLI";
  exit 1;
fi;

echo "invalidating canary cloudfront cache";
invalidation_id=$(aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/${MIN_FILE}" | egrep Id | awk -F'"' '{ print $4}' )

echo "waiting for cloudfront invalidation to complete...";
aws cloudfront wait invalidation-completed --distribution-id $DISTRIBUTION_ID --id $invalidation_id

echo "Done!";
