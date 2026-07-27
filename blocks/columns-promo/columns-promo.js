/**
 * columns-promo — promo feature card (left) + blog widget (right).
 * Tags each cell and its parts with semantic classes so the CSS can style
 * the dark-green header bars, feature/thumbnail images, and CTA button
 * without brittle positional selectors.
 * @param {Element} block
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  const cells = row ? [...row.children] : [];
  block.classList.add(`columns-promo-${cells.length}-cols`);

  const [feature, widget] = cells;

  // Left: promo feature card
  if (feature) {
    feature.classList.add('columns-promo-feature');
    const parts = [...feature.children];
    parts.forEach((el) => {
      if (el.querySelector('picture')) {
        el.classList.add('columns-promo-feature-image');
      } else if (el.querySelector('a') && !el.classList.contains('columns-promo-feature-desc')) {
        el.classList.add('columns-promo-feature-title');
      } else {
        el.classList.add('columns-promo-feature-desc');
      }
    });
  }

  // Right: blog widget
  if (widget) {
    widget.classList.add('columns-promo-widget');
    [...widget.children].forEach((el) => {
      const tag = el.tagName;
      if (tag === 'H2') {
        el.classList.add('columns-promo-widget-title');
      } else if (tag === 'H3') {
        el.classList.add('columns-promo-post-title');
      } else if (el.querySelector('picture')) {
        el.classList.add('columns-promo-thumb');
      } else if (el.matches(':last-child') && el.querySelector('a')) {
        el.classList.add('columns-promo-cta');
      } else {
        el.classList.add('columns-promo-excerpt');
      }
    });
  }
}
