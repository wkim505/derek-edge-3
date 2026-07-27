/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-quicklinks. Base: hero.
 * Source: https://www.doc.govt.nz/ (section.doc-main-layout__hero, .hero.group.has-image)
 * Generated: 2026-07-27
 *
 * Hero model (blocks/hero/_hero.json):
 *   - image (reference) + imageAlt (collapsed into <img alt>)  -> row 2 (background image)
 *   - text (richtext)                                          -> row 3 (title + CTAs)
 * Table: 1 column, up to 3 rows (block name, image, text).
 */
export default function parse(element, { document }) {
  // INPUT EXTRACTION — validated against source.html
  // Background image: <img class="hero__image"> inside .hero__image-container
  const bgImage = element.querySelector('img.hero__image, .hero__image-container img, picture img');

  // Title: overlay heading <h1 class="doc-h1"> inside #main-heading
  const title = element.querySelector('#main-heading h1, .hero__bottom-left h1, h1');

  // Quick-link CTA buttons: anchors in the flex-wrap row (exclude the caption toggle <button>)
  const ctaLinks = Array.from(
    element.querySelectorAll('.hero__bottom-left a[href], .hero__bottom-left-slot a[href]'),
  ).filter((a) => a.getAttribute('href') && !a.closest('.hero__top'));

  // Empty-block guard
  if (!title && !bgImage && ctaLinks.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image (optional) — field:image (imageAlt collapses into <img alt>)
  if (bgImage) {
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    imageCell.appendChild(bgImage);
    cells.push([imageCell]);
  }

  // Row 3: title + CTA links as richtext — field:text
  const textCell = document.createDocumentFragment();
  textCell.appendChild(document.createComment(' field:text '));
  if (title) textCell.appendChild(title);
  ctaLinks.forEach((a) => {
    // Wrap each CTA in a paragraph so it renders as a distinct button/link in richtext.
    const p = document.createElement('p');
    p.appendChild(a);
    textCell.appendChild(p);
  });
  cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-quicklinks', cells });
  element.replaceWith(block);
}
