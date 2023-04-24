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
sls deploy [-f <function name>] --aws-profile <aws profile>
```

If you do global changes (for instance the role permissions), you need to deploy with specifying any function.

## Test the headless browser locally

```
npx @puppeteer/browsers install chromium@latest --path /tmp/localChromium
```
Then, update the local `executablePath` in `browser.ts`.

## Deploy the headless browser on lambda

Use lambda layers as explained: https://github.com/sparticuz/chromium#aws-lambda-layer

Use layers published with their releases: https://github.com/Sparticuz/chromium/releases
