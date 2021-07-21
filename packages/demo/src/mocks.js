import fetchMock from 'fetch-mock';

export default function setupMocks() {
  fetchMock.mock('*', new Response(
    '{"value":[{"Code":"BadRequest"}]}', {
      status: 400,
    },
  ));
}
