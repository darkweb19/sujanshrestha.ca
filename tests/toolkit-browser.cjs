/* The public/owner SQLite flow replaces the old browser-local acceptance contract.
 * Keep the historical invocation working; this runs real current E2E assertions.
 * Provide LAB_TEST_PASSWORD privately against a configured localhost dev server
 * for owner checks. Public-only runs explicitly report the omitted owner checks.
 */
require('./redesign-browser.cjs');
