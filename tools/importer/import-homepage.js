/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsNewsParser from './parsers/cards-news.js';
import columnsPromoParser from './parsers/columns-promo.js';
import heroQuicklinksParser from './parsers/hero-quicklinks.js';

// TRANSFORMER IMPORTS
import docCleanupTransformer from './transformers/doc-cleanup.js';
import docSectionsTransformer from './transformers/doc-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Site homepage: full-width hero image with overlay title and quick-link buttons, followed by a promo/blog two-column panel and multi-column card grids for featured content and media releases.',
  urls: [
    'https://www.doc.govt.nz/',
  ],
  blocks: [
    {
      name: 'hero-quicklinks',
      instances: [
        'section.doc-main-layout__hero',
        '.hero.group.has-image',
      ],
    },
    {
      name: 'columns-promo',
      instances: [
        '.doc-homepage-layout__content_top',
      ],
    },
    {
      name: 'cards-news',
      instances: [
        '.doc-homepage-layout__content_bottom > div.widget.group',
        '.doc-homepage-layout__content_bottom .widget',
      ],
    },
  ],
  sections: [
    {
      id: 'hero',
      name: 'hero',
      selector: ['section.doc-main-layout__hero'],
      style: null,
      blocks: ['hero-quicklinks'],
      defaultContent: [],
    },
    {
      id: 'content-top',
      name: 'content-top',
      selector: ['.doc-homepage-layout__content_top'],
      style: null,
      blocks: ['columns-promo'],
      defaultContent: [],
    },
    {
      id: 'content-bottom',
      name: 'content-bottom',
      selector: ['.doc-homepage-layout__content_bottom'],
      style: null,
      blocks: ['cards-news'],
      defaultContent: [],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  'hero-quicklinks': heroQuicklinksParser,
  'columns-promo': columnsPromoParser,
  'cards-news': cardsNewsParser,
};

// TRANSFORMER REGISTRY - section transformer runs after cleanup
const transformers = [
  docCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [docSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 * De-duplicates elements matched by multiple selectors for the same block.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    const seen = new Set();
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block; skip elements already replaced/detached
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path. Root ("/") collapses to an empty string, which breaks
    // downstream path resolution — map it to the document index instead.
    const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath || '/index');

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
