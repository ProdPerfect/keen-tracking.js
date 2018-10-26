readonly DISTRIBUTION_ID="E3CL6P6NHSXGR6";
readonly MIN_FILE="keen-tracking.min.js";

while true; do
    read -p "About rollback all changes. Confirm? (Yes/No) " yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) echo "Ok, exiting."; exit;;
        * ) echo "Please answer yes or no.";;
    esac
done

if aws --version &> /dev/null
then
  echo "rolling back canary";
  aws s3 cp "s3://wespire-tracking-library/keen-tracking_last.min.js" "s3://wespire-tracking-library/${MIN_FILE}" --region us-east-2 --acl public-read
else
  echo "please install AWS CLI";
  exit 1;
fi;

echo "invalidating canary cloudfront cache";
invalidation_id=$(aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/${MIN_FILE}" | egrep Id | awk -F'"' '{ print $4}' )

echo "waiting for cloudfront invalidation to complete...";
aws cloudfront wait invalidation-completed --distribution-id $DISTRIBUTION_ID --id $invalidation_id

echo "Done!";
