export function networkRequestor(uri, requestVerb, headers, body) {
  const endpoint = 'https://services.odata.org/v4/TripPinServiceRW';
  const requestUrl = `${endpoint}${uri}`;

  return fetch(requestUrl, {
    method: requestVerb,
    headers,
    body: JSON.stringify(body),
  }).then(response => Promise.all([response.ok, response.json(), response]))
    .then(([responseOk, responseJson, response]) => {
      if (responseOk) {
        return responseJson;
      }
      const error = {
        status: response.status,
        responseJson,
      };

      throw error;
    });
}
