function tripPinNetworkRequestor(uri, requestVerb, headers, body) {
  const endpoint = 'https://services.odata.org/v4/TripPinServiceRW';
  const requestUrl = `${endpoint}${uri}`;

  return fetch(requestUrl, {
    method: requestVerb,
    headers,
    body: JSON.stringify(body),
  }).then(response => Promise.all([response.ok, response.json(), response]))
    .then(([responseOk, responseJSON, response]) => {
      if (responseOk) {
        return responseJSON;
      }
      const error = {
        status: response.status,
        responseJSON,
      };

      throw error;
    });
}

export function networkRequestor(uri, requestVerb, headers, body) {
  if (uri.startsWith('/People')) {
    return tripPinNetworkRequestor(uri, requestVerb, headers, body);
  }

  return new Promise(resolve => {
    console.log('loading data');
    resolve({
      name: 'Princess',
      destination: 'Alaska',
    });
  });
}
