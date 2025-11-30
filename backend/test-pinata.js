require('dotenv').config();
const FormData = require('form-data');
const axios = require('axios');

const PINATA_JWT = process.env.PINATA_JWT;
console.log('JWT loaded:', !!PINATA_JWT);
console.log('JWT preview:', PINATA_JWT?.slice(0, 50) + '...');

// Test avec une petite image PNG 1x1 pixel
const formData = new FormData();
const testBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
formData.append('file', testBuffer, { filename: 'test.png' });

console.log('Uploading to Pinata...');

axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
  maxBodyLength: Infinity,
  headers: {
    Authorization: 'Bearer ' + PINATA_JWT,
    ...formData.getHeaders()
  }
}).then(res => {
  console.log('\n✅ Success!');
  console.log('CID:', res.data.IpfsHash);
  console.log('IPFS URL:', 'ipfs://' + res.data.IpfsHash);
  console.log('Gateway URL:', 'https://gateway.pinata.cloud/ipfs/' + res.data.IpfsHash);
}).catch(err => {
  console.log('\n❌ Error:', err.response?.data || err.message);
});
