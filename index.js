const crypto = require('crypto');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const storage = require('@google-cloud/storage')();

const shasum = crypto.createHash('sha1');
const bucketname = 'BUCKET_NAME';
const filename = 'template.png';

const imagehash = () => {
  shasum.update(Date.now().toString());
  return shasum.digest('hex').slice(0, 8);
};

exports.imagemagick = (req, res) => {
  // Example input: {"text": "Anthony"}
  if (req.body.text === undefined) {
    // This is an error case, as "text" is required.
    res.status(400).send('No text defined!');
    return;
  }

  const file = storage.bucket(bucketname).file(filename);
  const newFilename = `${imagehash()}.png`;
  const tempLocalFilename = `/tmp/${newFilename}`;

  // Download file from bucket.
  return file.download({ destination: tempLocalFilename })
    .catch((err) => {
      console.error('Failed to download file.', err);
      return Promise.reject(err);
    })
    .then(() => {
      console.log(`Image ${file.name} has been downloaded to ${tempLocalFilename}.`);

      return new Promise((resolve, reject) => {
        let convert = spawn('convert', [tempLocalFilename, '-fill', 'black', '-font', './fonts/rounded-mplus-1p-regular.ttf', '-pointsize', '48', '-annotate', '+80+100', req.body.text, tempLocalFilename]);
        convert.stdout.on('close', (code) => {
          if (code !== 0) {
            console.log(`ps process exited with code ${code}`);
          }
          convert.stdin.end();
          resolve();
        });
      });
    })
    .then(() => {
      console.log(`Image ${file.name} has been converted.`);

      return file.bucket.upload(tempLocalFilename, { destination: newFilename })
        .catch((err) => {
          console.error('Failed to upload converted image.', err);
          return Promise.reject(err);
        });
    })
    .then(() => {
      console.log(`Converted image has been uploaded to ${file.name}.`);

      // Delete the temporary file.
      return new Promise((resolve, reject) => {
        fs.unlink(tempLocalFilename, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    })
    .then(() => {
      res.status(200).send('Success: ' + newFilename);
    });
};
