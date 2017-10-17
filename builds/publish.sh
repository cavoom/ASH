rm index.zip
cd lambda
zip -X -r ../index.zip *
aws lambda update-function-code --function-name ASHLambda --zip-file fileb://../index.zip
cd ..