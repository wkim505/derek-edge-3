/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: doc.govt.nz site-wide cleanup.
 *
 * Removes non-authorable global chrome from the DOC (Department of Conservation
 * New Zealand) React app shell (#doc-app > div.doc-main-layout) so the import
 * contains only page-level authorable content.
 *
 * All selectors below were verified against migration-work/cleaned.html:
 *   - <header>                              (line 10)  global site header/nav
 *   - <footer>                              (line 743) global site footer
 *   - .doc-main-layout__breadcrumb          (line 405) empty breadcrumb strip
 *   - #footer-feedback-container /
 *     .doc-main-layout__feedback            (line 745) "Was this information
 *                                                       helpful?" feedback widget
 *   - button[title="Back to Top"]           (line 896) floating back-to-top button
 *   - .grecaptcha-badge                     (line 909) trailing reCAPTCHA portal
 *                                                       container (iframes)
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove interactive widgets / portals that are not page content and could
    // interfere with block parsing. Verified in cleaned.html.
    WebImporter.DOMUtils.remove(element, [
      '#footer-feedback-container', // "Was this information helpful?" widget
      '.doc-main-layout__feedback', // feedback widget (class variant)
      'button[title="Back to Top"]', // floating back-to-top button
      '.grecaptcha-badge', // trailing reCAPTCHA portal container
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove non-authorable global chrome from the app shell. Verified in
    // cleaned.html. Header/footer are global boilerplate handled by the
    // navigation/footer orchestrators; breadcrumb strip is empty on the homepage.
    WebImporter.DOMUtils.remove(element, [
      'header', // global site header/navigation
      'footer', // global site footer
      '.doc-main-layout__breadcrumb', // empty breadcrumb strip
      'iframe', // reCAPTCHA / embed iframes
      'noscript',
      'link',
    ]);
  }
}
