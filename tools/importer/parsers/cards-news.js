/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-news. Base: cards.
 * Source: https://www.doc.govt.nz/
 *   (.doc-homepage-layout__content_bottom > div.widget.group / .widget)
 * Generated: 2026-07-27
 *
 * Cards is a container block: 1 header row (block name) + one row per card.
 * Card model (blocks/cards/_cards.json):
 *   - image (reference) + imageAlt (collapsed into <img alt>) -> cell 1 (field:image)
 *   - text (richtext: linked heading + description)           -> cell 2 (field:text)
 * Each row has exactly 2 cells; an empty image cell is still included.
 * The widget heading (.widget__title) and "More" footer link are NOT part of the
 * cards block — they are handled as default content / section chrome by the transformer.
 */
export default function parse(element, { document }) {
  // INPUT EXTRACTION — validated against source.html / source-2.html
  const content = element.querySelector('.widget__content') || element;
  const cardEls = Array.from(content.querySelectorAll(':scope > .card'));

  // Empty-block guard
  if (cardEls.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  cardEls.forEach((card) => {
    // Image cell (field:image) — imageAlt collapses into <img alt>
    const img = card.querySelector('img');
    let imageCell;
    if (img) {
      imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(img);
    } else {
      imageCell = ''; // empty cell, still included; no field hint per hinting rules
    }

    // Text cell (field:text) — linked heading + description as richtext
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));

    const heading = card.querySelector('h1, h2, h3, .card_header');
    if (heading) textCell.appendChild(heading);

    // Description paragraph(s)
    Array.from(card.querySelectorAll('p')).forEach((p) => textCell.appendChild(p));

    cells.push([imageCell, textCell]);
  });

  // Preserve the widget title (e.g. "Featured", "Media releases") as a
  // default-content heading placed immediately before the cards block.
  const widgetTitle = element.querySelector('.widget__title h1, .widget__title h2, .widget__title h3');
  const titleText = widgetTitle && widgetTitle.textContent.trim();

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news', cells });
  element.replaceWith(block);

  if (titleText) {
    const heading = document.createElement('h2');
    heading.textContent = titleText;
    block.before(heading);
  }
}
