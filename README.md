## Monitor and compare cryptocurrency rates

### Running DB:
1. Copy `postgres.env.exaple` to `postgres.env` and review it to set DB credentials.
2. Run PostgresDB using docker-compose:
```
docker-compose up -d
```

### Running API:
1. Copy `api/config/default.json.example` to `api/config/default.json` and review it to set DB credentials (just copy is enough for testing on localhost).
2. Install NPM modules:
```
cd api
yarn install
```
3. Run DB migration
```
yarn migrate
```

4. Start API instance:
```
yarn dev # for development mode
yarn compile # building bundle
yarn start # running bundle
```

### Running frontend:
1. Review `client/src/config/api.json` in order to change API instance location. Skip it for testing on localhost.
2. Install NPM modules:
```
cd client
yarn install
```
3. Run frontend:
```
yarn dev # development mode
yarn bundle:client # creating a bundle
yarn start # running a bundle
```

### More info can be found in `api/README.md` and `client/README.md`