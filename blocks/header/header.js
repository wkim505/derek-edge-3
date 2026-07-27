import { getMetadata } from '../../scripts/aem.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Fetch the nav fragment. Localhost/aem-up serves /content/nav.plain.html;
 * DA/EDS production serves `${navPath}.plain.html`.
 */
async function fetchNav(navPath) {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch(`${navPath}.plain.html`);
  if (!resp.ok) return null;
  const html = await resp.text();
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp;
}

/** Close every open dropdown in the nav. */
function closeAllDropdowns(nav) {
  nav.querySelectorAll('.nav-drop[aria-expanded="true"]').forEach((li) => {
    li.setAttribute('aria-expanded', 'false');
  });
}

/** Build the inline search form (controls live in JS, not the fragment). */
function buildSearch() {
  const wrapper = document.createElement('div');
  wrapper.className = 'nav-search';
  const form = document.createElement('form');
  form.setAttribute('role', 'search');
  form.action = 'https://www.doc.govt.nz/searchresults/';
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.placeholder = 'Search...';
  input.setAttribute('aria-label', 'Search');
  const button = document.createElement('button');
  button.type = 'submit';
  button.setAttribute('aria-label', 'Submit search');
  button.innerHTML = `<svg class="nav-search-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M16.9,15.5c2.4-3.2,2.2-7.7-0.7-10.6c-3.1-3.1-8.1-3.1-11.3,0c-3.1,3.2-3.1,8.3,0,11.4c2.9,2.9,7.5,3.1,10.6,0.6c0,0.1,0,0.1,0,0.1l4.2,4.2c0.5,0.4,1.1,0.4,1.5,0c0.4-0.4,0.4-1,0-1.4L16.9,15.5C16.9,15.5,16.9,15.5,16.9,15.5L16.9,15.5z M14.8,6.3c2.3,2.3,2.3,6.1,0,8.5c-2.3,2.3-6.1,2.3-8.5,0C4,12.5,4,8.7,6.3,6.3C8.7,4,12.5,4,14.8,6.3z"/>
    </svg>`;
  form.append(input, button);
  wrapper.append(form);
  return wrapper;
}

function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) {
    button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  }
  if (expanded || isDesktop.matches) closeAllDropdowns(nav);
}

/** Wire a single top-level nav item that owns a megamenu panel. */
function wireNavDrop(li, nav) {
  const topLink = li.querySelector(':scope > a');
  const panel = li.querySelector(':scope > .nav-drop-panel');
  if (!panel) return;

  // Desktop: open on hover; close after a short grace period so the cursor can
  // cross the gap between the label and the panel without it snapping shut.
  let closeTimer;
  const cancelClose = () => { clearTimeout(closeTimer); };
  const scheduleClose = () => {
    if (!isDesktop.matches) return;
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => li.setAttribute('aria-expanded', 'false'), 200);
  };
  li.addEventListener('mouseenter', () => {
    if (!isDesktop.matches) return;
    cancelClose();
    closeAllDropdowns(nav);
    li.setAttribute('aria-expanded', 'true');
  });
  li.addEventListener('mouseleave', scheduleClose);
  // Keep the panel open while the cursor is over it, close when it leaves.
  panel.addEventListener('mouseenter', cancelClose);
  panel.addEventListener('mouseleave', scheduleClose);

  const openPanel = (multi = false) => {
    const open = li.getAttribute('aria-expanded') === 'true';
    if (!multi) closeAllDropdowns(nav);
    li.setAttribute('aria-expanded', open ? 'false' : 'true');
  };

  // Toggle button (accessible open on click/tap; used on mobile too).
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-drop-toggle';
  toggle.setAttribute('aria-label', `${topLink ? topLink.textContent.trim() : ''} submenu`);
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    // Mobile allows multiple open sections (accordion, multi-expand); desktop single.
    openPanel(!isDesktop.matches);
  });
  li.insertBefore(toggle, panel);
  li.setAttribute('aria-expanded', 'false');

  // On mobile the top-level label expands the accordion instead of navigating
  // (matches source, where top-level items are expand-only). On desktop the
  // label link navigates to the section as normal.
  if (topLink) {
    topLink.addEventListener('click', (e) => {
      if (!isDesktop.matches) {
        e.preventDefault();
        openPanel(true);
      }
    });
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/content/nav';
  const fragment = await fetchNav(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main Navigation');
  if (fragment) {
    while (fragment.firstElementChild) nav.append(fragment.firstElementChild);
  }

  // Label the three top-level sections: brand, sections, tools.
  ['brand', 'sections', 'tools'].forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // Brand: strip button styling from the logo link.
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    navBrand.querySelectorAll('a').forEach((a) => a.classList.remove('button'));
  }

  // Sections: mark items with a submenu, wrap the two sub-lists into a panel.
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope > ul > li').forEach((li) => {
      const subLists = li.querySelectorAll(':scope > ul');
      if (subLists.length > 0) {
        li.classList.add('nav-drop');
        const panel = document.createElement('div');
        panel.className = 'nav-drop-panel';
        panel.setAttribute('role', 'menu');
        // First sub-list = main links; second (if present) = "Popular".
        subLists.forEach((ul, idx) => {
          const col = document.createElement('div');
          col.className = idx === 0 ? 'nav-drop-main' : 'nav-drop-popular';
          if (idx > 0) {
            const heading = document.createElement('p');
            heading.className = 'nav-drop-heading';
            heading.textContent = 'Popular';
            col.append(heading);
          }
          col.append(ul);
          panel.append(col);
        });
        li.append(panel);
        wireNavDrop(li, nav);
      }
    });
  }

  // Tools: strip button styling; append the search form (built in JS).
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    navTools.querySelectorAll('a').forEach((a) => a.classList.remove('button'));
    navTools.append(buildSearch());
  }

  // Hamburger for mobile.
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // Close dropdowns when clicking outside the nav.
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeAllDropdowns(nav);
  });
  // Close on Escape.
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      closeAllDropdowns(nav);
      if (!isDesktop.matches) toggleMenu(nav, true);
    }
  });

  // Reset state when crossing the desktop/mobile breakpoint.
  isDesktop.addEventListener('change', () => {
    closeAllDropdowns(nav);
    toggleMenu(nav, isDesktop.matches);
    const button = nav.querySelector('.nav-hamburger button');
    if (button) button.setAttribute('aria-label', 'Open navigation');
    document.body.style.overflowY = '';
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
