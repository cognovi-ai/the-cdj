/**
 * @jest-environment node
 */
import router from '../../../src/routes/access/access';

describe('access router', () => {
  const routes = [
    { path: '/journal/:journalId', method: 'put' },
    { path: '/login', method: 'post' },
    { path: '/token-login', method: 'post' },
    { path: '/forgot-password', method: 'post' },
    { path: '/reset-password', method: 'post' },
    { path: '/logout', method: 'get' },
    { path: '/register', method: 'post' },
    { path: '/verify-email', method: 'post' },
    { path: '/beta-approval', method: 'get' },
    { path: '/beta-denial', method: 'get' },
  ];

  it.each(routes)('should have all routes defined in access.ts', (route) => {
    // single line arrow functions without braces implicitly return
    expect(router.stack.some((s) => s.route.path === route.path)).toBe(true);
    expect(router.stack.some((s) => Object.keys(s.route.methods).includes(route.method))).toBe(true);
  });
});