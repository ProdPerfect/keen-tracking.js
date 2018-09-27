readonly BETAFILE="keen-tracking_beta.min.js";
readonly DISTRIBUTION_ID="E2VZR8TOC61OQY"

while true; do
    read -p "Have you run test:regression and committed all changes? (Yes/No) " yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) echo "Please do so before continuing"; exit;;
        * ) echo "Please answer yes or no.";;
    esac
done

current_branch=$(git rev-parse --symbolic-full-name --abbrev-ref HEAD)

if [ "$current_branch" == "master" ]
then
  echo "You are currently on master. Please check out a feature branch.";
  exit 1;
fi;

echo "checking for updated package version"
if git diff master package.json | grep version -q;
then
  echo "found updated package version";
else
  echo "Updated package version not found. Please update the package version before continuing.";
  exit 1;
fi;

echo "creating beta file"
cp "./dist/keen-tracking.min.js" "./dist/${BETAFILE}"

if aws --version &> /dev/null
then
  echo "uploading beta file to S3";
  aws s3 cp "./dist/${BETAFILE}" "s3://prodperfect-keen-js/" --region us-east-2 --acl public-read
else
  echo "please install AWS CLI";
  exit 1;
fi;

echo "invalidating beta cloudfront cache";
invalidation_id=$(aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/${BETAFILE}" | egrep Id | awk -F'"' '{ print $4}' )

echo "waiting for cloudfront invalidation to complete..."
aws cloudfront wait invalidation-completed --distribution-id $DISTRIBUTION_ID --id $invalidation_id

echo "force pushing to github"
git push origin HEAD -f

echo "Done! Have a nice day."
