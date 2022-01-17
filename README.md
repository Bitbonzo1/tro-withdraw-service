# tro-withdraw-service
TRO withdraw service

## docker build cmd
docker build --build-arg COMMIT=${commitID}  --build-arg BRANCH=${branch} --build-arg NODE_ENV=${NODE_ENV} --build-arg PRIVATE_KEY=${PRIVATE_KEY} --no-cache -f Dockerfile .


## Docker Push Comman

Tag an image for this project:

docker tag SOURCE_IMAGE[:TAG] reg.trodl.com/trodl/tro-withdraw[:TAG]

docker tag SOURCE_IMAGE[:TAG] reg.trodl.com/trodl/tro-withdraw[:TAG]

## Push an image to trodl project:

docker push reg.trodl.com/trodl/tro-withdraw[:TAG]

docker push reg.trodl.com/trodl/tro-withdraw[:TAG]

