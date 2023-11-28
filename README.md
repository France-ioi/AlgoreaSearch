# AlgoreaSearch

## Installation

```sh
npm ci
```

## Start

```sh
npm start
```


## Test

```sh
npm test
```

## Deploy code on AWS

```sh
sls deploy [-f <function name>] --stage <stage> --aws-profile <aws profile>
```

If you do global changes (for instance the role permissions), you need to deploy with specifying any function.

## Use the headless browser locally

```
npx @puppeteer/browsers install chromium@latest --path /tmp/localChromium
```
Then, update `CHROMIUM_PATH` in `.env.dev` file.

## Invoke scrapping locally

```
serverless invoke local --stage <stage> --function scrape-all
```

## Invoke search locally

```
serverless invoke local --stage <stage> --function search -d '{"queryStringParameters":{"q":"Terminology"}}'
```

## Deploy the headless browser on lambda

Use lambda layers as explained: https://github.com/sparticuz/chromium#aws-lambda-layer

Use layers published with their releases: https://github.com/Sparticuz/chromium/releases

## Release

```sh
npm run release
```