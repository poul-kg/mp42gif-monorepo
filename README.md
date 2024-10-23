# Setup
* `git clone git@github.com:poul-kg/mp42gif-monorepo.git`
* `cd mp42gif-monorepo`
* `npm install`

## To serve angular & express locally
* `npm run serve-angular`
* `npm run serve-express`

## Run in docker compose
* `docker-compose build`
* `docker-compose up`

## build services
* `docker build -t angular-app:latest -f apps/angular-app/Dockerfile .`
* `docker build -t express-service:latest -f apps/express-service/Dockerfile .`

## tag & push angular
* `docker tag angular-app:latest pavelkostenko/angular-app:latest`
* `docker push pavelkostenko/angular-app:latest`

## tag & push express
* use your own username instead of `pavelkostenko`
* `docker tag express-service:latest pavelkostenko/express-service:latest`
* `docker push pavelkostenko/express-service:latest`

## create network before deploying stack
* `docker network create --driver overlay frontend-backend`

## Deploy stack in swarm mode
* `docker swarm init` if swarm was not initialized yet
* `docker network create --driver overlay frontend-backend` run this once on first setup
* `docker stack rm mp42gif-stack`
* `docker stack deploy -c docker-compose-swarm.yml mp42gif-stack`
* `npm run cy:run` to run load testing

## Get 9 seconds of the video file
* `ffmpeg -i input.mp4 -t 9 -c copy output.mp4`