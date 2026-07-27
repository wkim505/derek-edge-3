/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: doc.govt.nz section breaks + section metadata.
 *
 * Inserts an <hr> before each section (except the first) and a Section Metadata
 * block for any section that defines a `style`. Section selectors come from the
 * template's `payload.template.sections` (populated in page-templates.json) and
 * were verified against migration-work/cleaned.html:
 *   - section.doc-main-layout__hero        (line 409) hero
 *   - .doc-homepage-layout__content_top    (line 485) content-top
 *   - .doc-homepage-layout__content_bottom (line 541) content-bottom
 *
 * Runs in afterTransform only (block parsing has completed).
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;

  const sections = (payload && payload.template && payload.template.sections) || [];
  if (sections.length < 2) return;

  const doc = element.ownerDocument;

  // Resolve the first matching element for a section from its selector list.
  const findSectionEl = (section) => {
    const selectors = Array.isArray(section.selector)
      ? section.selector
      : [section.selector];
    for (const sel of selectors) {
      if (!sel) continue;
      const el = element.querySelector(sel);
      if (el) return el;
    }
    return null;
  };

  // Process in reverse so inserted nodes don't shift earlier sections.
  for (let i = sections.length - 1; i >= 0; i -= 1) {
    const section = sections[i];
    const sectionEl = findSectionEl(section);
    if (!sectionEl) continue;

    // Section Metadata block for sections that declare a style.
    if (section.style) {
      const metaBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      sectionEl.after(metaBlock);
    }

    // Section break before every non-first section.
    if (i > 0) {
      sectionEl.before(doc.createElement('hr'));
    }
  }
}
