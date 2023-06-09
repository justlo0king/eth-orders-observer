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
4. If you are testing it in development mode - open http://localhost:5173/ in browser.

### Running tests:
```
cd api
yarn test test/modules/1inch-ws.spec.ts # testing 1inch module
yarn test test test/modules/openocean.spec.ts # testing openocean module

yarn test test/modules/openocean.spec.ts # testing openocean module with mock data

SEND_REQUESTS=1 yarn test test/modules/openocean.spec.ts # testing openocean module with real requests
yarn test # running all tests
```

### Constants used in API (can be passed through process environment):
RECALCULATE_TIMEOUT - timeout to recalculate order taking amount (ms), default is 5000
EFFICIENCY_THRESHOLD - percentage of efficiency passed to make order "selected", default is 0

### More info can be found in `api/README.md` and `client/README.md`