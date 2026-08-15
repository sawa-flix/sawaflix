const { createClient } = require('@sanity/client');
const fs = require('fs');
const https = require('https');

const client = createClient({
  projectId: 'eifjj9rh',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skMjrXRElpwqcw5F33c6xRuaY5ZnPtT1Cmm8NaIwE2HBBDq3S4hM3Zcy9r83e7wcN0NQWwCUcmWd7icQ8',
  useCdn: false
});

const dest = './public/movie.jpg';

uploadToSanity();

async function uploadToSanity() {
  try {
    const imageAsset = await client.assets.upload('image', fs.createReadStream(dest), {
      filename: 'fisherman.jpg'
    });
    console.log('Image uploaded:', imageAsset._id);
  } catch (err) {
    console.error('Error uploading/creating:', err);
  }
}
