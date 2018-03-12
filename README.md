# Text to Image sample on Google Cloud Functions (GCF)

This is the Text to Image sample like [Peing](https://peing.net/ja/) hosting on Google Cloud Functions.

## Installation

Replace `BUCKET_NAME` in `index.js` to your Google Cloud Storage Bucket.

## Deploy

```sh
$ gcloud beta functions deploy imagemagick --trigger-http --source .
```

## Submitting the request

```sh
$ curl -X POST -H "Content-Type:application/json" -d '{"text":"Sample Text"}' YOUR_CLOUD_FUNCTIONS/imagemagick
```

## Fonts / Special Thanks

- [自家製 Rounded M+](http://jikasei.me/font/rounded-mplus/)
