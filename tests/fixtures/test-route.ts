import RouteBuilder from '../../src/structures/RouteBuilder';

export default new RouteBuilder().on('get', async () => {
  return Response.json({
    'message': 'Test route',
    'timestamp': Date.now(),
  });
});
