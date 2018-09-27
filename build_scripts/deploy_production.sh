readonly DISTRIBUTION_ID="E2VZR8TOC61OQY"
readonly MIN_FILE="keen-tracking.min.js"

while true; do
    read -p "Deploying production. Confirm: (Yes/No) " yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) echo "Exiting without deploy..."; exit;;
        * ) echo "Please answer yes or no.";;
    esac
done

if aws --version &> /dev/null
then
  echo "copying current min file to last";
  aws s3 cp "s3://prodperfect-keen-js/${MIN_FILE}" "s3://prodperfect-keen-js/keen-tracking_last.min.js" --region us-east-2 --acl public-read

  echo "copying canary to min";
  aws s3 cp "s3://prodperfect-keen-js/keen-tracking_canary.min.js" "s3://prodperfect-keen-js/${MIN_FILE}" --region us-east-2 --acl public-read
else
  echo "please install AWS CLI";
  exit 1;
fi;

echo "invalidating cloudfront cache";
invalidation_id=$(aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*" | egrep Id | awk -F'"' '{ print $4}' )

echo "waiting for cloudfront invalidation to complete...";
aws cloudfront wait invalidation-completed --distribution-id $DISTRIBUTION_ID --id $invalidation_id

echo "Done!";
