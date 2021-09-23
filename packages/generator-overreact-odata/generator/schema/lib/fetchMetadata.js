const xml2js = require('xml2js');
const fetch = require('node-fetch');

async function fetchMetadata(endpoint) {
  const doc = await fetch(`${endpoint}/$metadata`);
  const docText = await doc.text();

  return xml2js.parseStringPromise(docText);
}

exports.fetchMetadata = fetchMetadata;
