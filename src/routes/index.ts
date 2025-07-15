import logging from '@middleware/logging';
import RouteBuilder from '@structures/RouteBuilder';

export default new RouteBuilder({ 'get': logging }).on('get', async () => {
  return Response.json({ 'message': 'Hello, world!' });
});
