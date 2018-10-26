readonly DISTRIBUTION_ID="E3CL6P6NHSXGR6"
readonly MIN_FILE="keen-tracking.min.js"

while true; do
    read -p "Have you merged your approved pr with tests passing into master? (Yes/No) " yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) echo "Please do so before continuing"; exit;;
        * ) echo "Please answer yes or no.";;
    esac
done

echo "updating local master";
git checkout master
git pull

readonly PACKAGE_VERSION=$(node -pe "require('./package.json').version" | tr '[.]' '_')

if aws --version &> /dev/null
then
  echo "copying current canary min file to last";
  aws s3 cp "s3://wespire-tracking-library/${MIN_FILE}" "s3://wespire-tracking-library/keen-tracking_last.min.js" --region us-east-1 --acl public-read

  echo "upating canary and versioning keen-tracking.min on s3";
  aws s3 cp "./dist/${MIN_FILE}" "s3://prodperfect-keen-js/keen-tracking_$PACKAGE_VERSION.min.js" --region us-east-2 --acl public-read
  aws s3 cp "./dist/${MIN_FILE}" "s3://wespire-tracking-library/${MIN_FILE}" --region us-east-1 --acl public-read
else
  echo "please install AWS CLI";
  exit 1;
fi;

echo "invalidating canary cloudfront cache";
invalidation_id=$(aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/${MIN_FILE}" | egrep Id | awk -F'"' '{ print $4}' )

echo "waiting for cloudfront invalidation to complete...";
aws cloudfront wait invalidation-completed --distribution-id $DISTRIBUTION_ID --id $invalidation_id

echo "Done!";
