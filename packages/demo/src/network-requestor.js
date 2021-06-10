export function networkRequestor(uri, requestVerb, headers, body) {
  const endpoint = 'https://services.odata.org/v4/TripPinServiceRW';
  const requestUrl = `${endpoint}${uri}`;

  return fetch(requestUrl, {
    method: requestVerb,
    headers,
    body: JSON.stringify(body),
  }).then(response => response.json());
}
