/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-promo. Base: columns.
 * Source: https://www.doc.govt.nz/ (.doc-homepage-layout__content_top)
 * Generated: 2026-07-27
 *
 * Columns block: 1 header row (block name) + 1 content row with 2 cells.
 * Per hinting rules, Columns blocks use ONLY default content — NO field hints.
 *   Cell 1: promo feature (image + linked heading + description)
 *   Cell 2: "Blog" widget (heading + latest post: date, linked title, thumbnail, excerpt, More link)
 */
export default function parse(element, { document }) {
  // INPUT EXTRACTION — validated against source.html
  // Column 1: the promo card (first .card that is a direct feature, not inside .widget)
  const promoCard = element.querySelector(':scope > .card, :scope > div > .card');
  // Column 2: the Blog widget
  const blogWidget = element.querySelector(':scope > .widget, .widget.group');

  // Empty-block guard
  if (!promoCard && !blogWidget) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // --- Cell 1: promo feature ---
  const col1 = [];
  if (promoCard) {
    const promoImg = promoCard.querySelector('img');
    const promoLink = promoCard.querySelector('a.card_link, a[href]');
    const promoHeading = promoCard.querySelector('h1, h2, h3, .card_header');
    const promoDesc = Array.from(promoCard.querySelectorAll('p'));

    if (promoImg) col1.push(promoImg);
    // Emit a clean linked heading: <h2><a href>Title</a></h2>. The source nests
    // the heading inside the anchor, which markdown converts to a broken "[## Title]";
    // rebuilding it as heading-wraps-anchor avoids that.
    const headingText = (promoHeading && promoHeading.textContent.trim())
      || (promoLink && promoLink.textContent.trim());
    const headingHref = promoLink && promoLink.getAttribute('href');
    if (headingText) {
      const h2 = document.createElement('h2');
      if (headingHref) {
        const a = document.createElement('a');
        a.href = headingHref;
        a.textContent = headingText;
        h2.appendChild(a);
      } else {
        h2.textContent = headingText;
      }
      col1.push(h2);
    }
    promoDesc.forEach((p) => col1.push(p));
  }

  // --- Cell 2: Blog widget ---
  const col2 = [];
  if (blogWidget) {
    // Widget heading (e.g. "Blog")
    const widgetHeading = blogWidget.querySelector('.widget__title h1, .widget__title h2, .widget__title h3');
    if (widgetHeading) col2.push(widgetHeading);

    const content = blogWidget.querySelector('.widget__content') || blogWidget;
    // Linked post title (h3 > a)
    const postTitle = content.querySelector('h3, h2');
    if (postTitle) col2.push(postTitle);
    // Thumbnail image
    const thumb = content.querySelector('img');
    if (thumb) col2.push(thumb);
    // Excerpt paragraph(s)
    Array.from(content.querySelectorAll('p')).forEach((p) => col2.push(p));
    // "More" link in the widget footer
    const moreLink = blogWidget.querySelector('.widget__footer a[href]');
    if (moreLink) {
      // Normalize the button label (source has sr-only span + stray comment)
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = moreLink.getAttribute('href');
      a.textContent = (moreLink.textContent || 'More').replace(/\s+/g, ' ').trim();
      p.appendChild(a);
      col2.push(p);
    }
  }

  const cells = [[col1, col2]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-promo', cells });
  element.replaceWith(block);
}
