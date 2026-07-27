/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/cards-news.js
  function parse(element, { document }) {
    const content = element.querySelector(".widget__content") || element;
    const cardEls = Array.from(content.querySelectorAll(":scope > .card"));
    if (cardEls.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cardEls.forEach((card) => {
      const img = card.querySelector("img");
      let imageCell;
      if (img) {
        imageCell = document.createDocumentFragment();
        imageCell.appendChild(document.createComment(" field:image "));
        imageCell.appendChild(img);
      } else {
        imageCell = "";
      }
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      const heading = card.querySelector("h1, h2, h3, .card_header");
      if (heading) textCell.appendChild(heading);
      Array.from(card.querySelectorAll("p")).forEach((p) => textCell.appendChild(p));
      cells.push([imageCell, textCell]);
    });
    const widgetTitle = element.querySelector(".widget__title h1, .widget__title h2, .widget__title h3");
    const titleText = widgetTitle && widgetTitle.textContent.trim();
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-news", cells });
    element.replaceWith(block);
    if (titleText) {
      const heading = document.createElement("h2");
      heading.textContent = titleText;
      block.before(heading);
    }
  }

  // tools/importer/parsers/columns-promo.js
  function parse2(element, { document }) {
    const promoCard = element.querySelector(":scope > .card, :scope > div > .card");
    const blogWidget = element.querySelector(":scope > .widget, .widget.group");
    if (!promoCard && !blogWidget) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const col1 = [];
    if (promoCard) {
      const promoImg = promoCard.querySelector("img");
      const promoLink = promoCard.querySelector("a.card_link, a[href]");
      const promoHeading = promoCard.querySelector("h1, h2, h3, .card_header");
      const promoDesc = Array.from(promoCard.querySelectorAll("p"));
      if (promoImg) col1.push(promoImg);
      const headingText = promoHeading && promoHeading.textContent.trim() || promoLink && promoLink.textContent.trim();
      const headingHref = promoLink && promoLink.getAttribute("href");
      if (headingText) {
        const h2 = document.createElement("h2");
        if (headingHref) {
          const a = document.createElement("a");
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
    const col2 = [];
    if (blogWidget) {
      const widgetHeading = blogWidget.querySelector(".widget__title h1, .widget__title h2, .widget__title h3");
      if (widgetHeading) col2.push(widgetHeading);
      const content = blogWidget.querySelector(".widget__content") || blogWidget;
      const postTitle = content.querySelector("h3, h2");
      if (postTitle) col2.push(postTitle);
      const thumb = content.querySelector("img");
      if (thumb) col2.push(thumb);
      Array.from(content.querySelectorAll("p")).forEach((p) => col2.push(p));
      const moreLink = blogWidget.querySelector(".widget__footer a[href]");
      if (moreLink) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = moreLink.getAttribute("href");
        a.textContent = (moreLink.textContent || "More").replace(/\s+/g, " ").trim();
        p.appendChild(a);
        col2.push(p);
      }
    }
    const cells = [[col1, col2]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-quicklinks.js
  function parse3(element, { document }) {
    const bgImage = element.querySelector("img.hero__image, .hero__image-container img, picture img");
    const title = element.querySelector("#main-heading h1, .hero__bottom-left h1, h1");
    const ctaLinks = Array.from(
      element.querySelectorAll(".hero__bottom-left a[href], .hero__bottom-left-slot a[href]")
    ).filter((a) => a.getAttribute("href") && !a.closest(".hero__top"));
    if (!title && !bgImage && ctaLinks.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bgImage) {
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(" field:image "));
      imageCell.appendChild(bgImage);
      cells.push([imageCell]);
    }
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(" field:text "));
    if (title) textCell.appendChild(title);
    ctaLinks.forEach((a) => {
      const p = document.createElement("p");
      p.appendChild(a);
      textCell.appendChild(p);
    });
    cells.push([textCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-quicklinks", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/doc-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#footer-feedback-container",
        // "Was this information helpful?" widget
        ".doc-main-layout__feedback",
        // feedback widget (class variant)
        'button[title="Back to Top"]',
        // floating back-to-top button
        ".grecaptcha-badge"
        // trailing reCAPTCHA portal container
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        // global site header/navigation
        "footer",
        // global site footer
        ".doc-main-layout__breadcrumb",
        // empty breadcrumb strip
        "iframe",
        // reCAPTCHA / embed iframes
        "noscript",
        "link"
      ]);
    }
  }

  // tools/importer/transformers/doc-sections.js
  var TransformHook2 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) return;
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument;
    const findSectionEl = (section) => {
      const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
      for (const sel of selectors) {
        if (!sel) continue;
        const el = element.querySelector(sel);
        if (el) return el;
      }
      return null;
    };
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const sectionEl = findSectionEl(section);
      if (!sectionEl) continue;
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        sectionEl.after(metaBlock);
      }
      if (i > 0) {
        sectionEl.before(doc.createElement("hr"));
      }
    }
  }

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Site homepage: full-width hero image with overlay title and quick-link buttons, followed by a promo/blog two-column panel and multi-column card grids for featured content and media releases.",
    urls: [
      "https://www.doc.govt.nz/"
    ],
    blocks: [
      {
        name: "hero-quicklinks",
        instances: [
          "section.doc-main-layout__hero",
          ".hero.group.has-image"
        ]
      },
      {
        name: "columns-promo",
        instances: [
          ".doc-homepage-layout__content_top"
        ]
      },
      {
        name: "cards-news",
        instances: [
          ".doc-homepage-layout__content_bottom > div.widget.group",
          ".doc-homepage-layout__content_bottom .widget"
        ]
      }
    ],
    sections: [
      {
        id: "hero",
        name: "hero",
        selector: ["section.doc-main-layout__hero"],
        style: null,
        blocks: ["hero-quicklinks"],
        defaultContent: []
      },
      {
        id: "content-top",
        name: "content-top",
        selector: [".doc-homepage-layout__content_top"],
        style: null,
        blocks: ["columns-promo"],
        defaultContent: []
      },
      {
        id: "content-bottom",
        name: "content-bottom",
        selector: [".doc-homepage-layout__content_bottom"],
        style: null,
        blocks: ["cards-news"],
        defaultContent: []
      }
    ]
  };
  var parsers = {
    "hero-quicklinks": parse3,
    "columns-promo": parse2,
    "cards-news": parse
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      const seen = /* @__PURE__ */ new Set();
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath || "/index");
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
