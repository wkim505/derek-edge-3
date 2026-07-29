# Spec: Page Feedback block

Status: ready for implementation
Origin: grilling session, 29 Jul 2026
Reference implementation: the "Was this information helpful?" widget on https://www.doc.govt.nz/

## Problem Statement

Content authors have no signal about whether the pages they write are actually useful. A page can rank well, be visited often, and still fail the person reading it, and today nothing on the site captures that. Visitors likewise have no lightweight way to tell us a page missed the mark — the only route is a full contact form, which almost nobody will complete for a passing "this didn't answer my question".

The reference site solves this with a per-page widget in the footer region: a yes/no question, and on "no" a follow-up comment box submitted to a forms backend with spam protection and hidden fields capturing the page name and URL.

## Solution

A `page-feedback` block that an author places on a page. It asks a short question — by default "Was this information helpful?" — and offers Yes and No. Clicking either records the answer and replaces the buttons with a thank-you message appropriate to the answer. That is the whole interaction: one click, immediate acknowledgement, nothing else asked of the visitor.

The answer is recorded as an Adobe RUM checkpoint. There is no free-text comment and no backend, because Edge Delivery gives us no server to receive one and this project has no forms endpoint, analytics tag, or consent mechanism wired up. This is a deliberate reduction of the reference implementation, not an oversight: it delivers the directional signal authors need while the interaction, accessibility, and authoring model are proven, and a comment path can be added later without rewriting any of it.

## User Stories

1. As a visitor, I want to be asked whether a page helped me, so that I can tell the organisation something useful without filling in a form.
2. As a visitor, I want answering to take exactly one click, so that giving feedback costs me almost nothing.
3. As a visitor, I want an immediate acknowledgement after I answer, so that I know my input registered and I do not click again.
4. As a visitor who answered positively, I want a simple thanks, so that the interaction closes cleanly.
5. As a visitor who answered negatively, I want an acknowledgement that recognises the page fell short, so that I do not feel ignored.
6. As a visitor, I want the buttons to disappear after I answer, so that it is obvious the interaction is finished.
7. As a keyboard-only visitor, I want to reach and operate both controls with Tab and Enter/Space, so that I can give feedback without a mouse.
8. As a keyboard-only visitor, I want a clearly visible focus indicator on each control, so that I know what I am about to activate.
9. As a keyboard-only visitor, I want focus to stay where I put it after answering, so that I am not thrown to an unexpected part of the page.
10. As a screen reader user, I want the Yes and No buttons announced together with the question that labels them, so that the controls are not two unexplained buttons at the end of a long page.
11. As a screen reader user, I want the thank-you message announced when it appears, so that I know my answer was accepted without hunting for the change.
12. As a screen reader user navigating by heading, I do not want this widget injecting a heading into the page outline, so that the document structure continues to reflect the page's actual content.
13. As a visitor on a phone, I want the question and buttons stacked and comfortably tappable, so that I can answer without mis-taps.
14. As a visitor on a desktop, I want the buttons laid out beside or beneath the question in a compact band, so that the widget reads as a single unit and does not dominate the page.
15. As a visitor with JavaScript unavailable or broken, I want to see nothing at all rather than stray fragments of text, so that the page never shows me an unexplained "Thanks for your feedback."
16. As a visitor, I do not want my answer stored on my device, so that my browsing does not accumulate a record of my opinions.
17. As an author, I want to insert the block into a section from the Universal Editor component list, so that I can add it to the pages where it makes sense.
18. As an author, I want to choose which pages get the widget, so that it never appears on pages where the question is nonsensical, such as error pages, search results, or confirmation screens.
19. As an author, I want to reword the question, so that it fits the page — a booking page and a species guide warrant different phrasing.
20. As an author, I want to reword both thank-you messages, so that the tone matches the site's voice.
21. As an author, I want the widget to render correctly with sensible default wording if I leave the fields empty, so that a hurried insertion still produces something publishable.
22. As an author, I want the widget to render correctly if a field is missing entirely, so that content authored before a field was added does not break.
23. As an author, I want the Yes/No labels fixed and not editable, so that I cannot accidentally fragment the reporting vocabulary.
24. As an author editing in the Universal Editor, I want my text changes reflected on the page after each edit, so that I can see what I am producing.
25. As an author, I want the widget to look like the rest of the site without any styling work from me, so that it does not read as a bolted-on third-party widget.
26. As a content owner, I want to see how many people answered Yes versus No, broken down by page, so that I can find pages that are underperforming.
27. As a content owner, I want the feedback signal distinguishable from ordinary click telemetry, so that my queries do not require fragile filtering on CSS selectors.
28. As a content owner, I want to understand that the vote counts are sampled and therefore directional, so that I do not over-interpret small numbers.
29. As a developer, I want the page identity attached to each answer automatically, so that no per-page configuration is required to make the data useful.
30. As a developer, I want the block self-contained in its own folder with scoped styles, so that it cannot leak styling into the rest of the site.
31. As a developer, I want the block to tolerate any combination of present, empty, and missing authored fields, so that it never throws on real content.
32. As a privacy-conscious organisation, we want no free-text collected and no client-side storage, so that the feature raises no consent or personal-information obligations.

## Implementation Decisions

**Naming.** The block is `page-feedback`, titled "Page Feedback" in the Universal Editor. The name describes purpose rather than current wording, because the question text is author-editable and a name like `was-this-helpful` would become inaccurate the moment it is reworded. The name is also the reporting identifier, so it is a long-lived contract and is not to be changed casually. `feedback` was rejected as too generic against a future site-wide feedback form or survey.

**Placement.** Author-placed per page. Rejected alternatives: placing it in the footer fragment, which would couple an interactive widget to a late-loading shared fragment and put it on pages where the question is wrong; and programmatic injection on every page, which cannot be turned off per page without inventing a metadata opt-out convention. Author placement is also the only option that yields a Universal Editor model and per-page wording, which this project's authoring setup exists to provide.

**Authoring model.** Four authored plain-text fields: the question, the positive thank-you, and the negative thank-you. Every field has a default supplied in code, so an empty or partially authored block renders correctly. Defaults follow the reference implementation's tone: the question defaults to "Was this information helpful?", the negative acknowledgement carries the apology.

Fields are plain text, not rich text, despite rich text precedent elsewhere in the project. Rich text would let an author inject a heading (breaking the document outline), a list, or a link — and a link inside the accessible group label is unreachable. Plain text also means the decoration can set text content directly and never reason about arriving markup.

The Yes and No labels are hardcoded and not authorable. They are the semantic values reported to analytics; allowing per-page labels would produce multiple vote vocabularies and force the block's own logic to guess which label means positive.

**Block registration.** The block ships its own component definition, model, and filter partial alongside its code, following the established per-block convention, and the aggregated configuration files are regenerated from the partials. The block must also be added to the section allow-list, or it will not appear in the Universal Editor's insert list. This is a real trap in this codebase: three existing blocks are already missing from that allow-list and consequently cannot be inserted at all. Fixing those three is out of scope here but should be raised separately.

**Rendered structure.** Decoration replaces the authored rows with:

- the question as a paragraph carrying a unique id;
- a group element labelled by that paragraph, containing the two buttons;
- an empty polite live region, rendered during decoration.

Each control is a genuine button element of type `button`, reusing the project's global button classes in their lower-emphasis variant. Reusing the global classes inherits the existing hover, disabled, and focus-visible treatments and keeps them in sync with the rest of the site; focus-visible styling is the detail most often forgotten in bespoke buttons. The lower-emphasis variant is chosen so the widget does not compete with the page's real call to action.

No heading element is emitted. The block is author-placed and may land anywhere in a document, so emitting a heading risks corrupting the page's heading hierarchy; the group label already provides the association a screen reader needs.

**Interaction.** On activation of either control, the block reports the answer, then removes the controls and writes the corresponding thank-you into the live region. Focus is not moved — the user chose where focus was, and relocating it after a confirmation is disorienting.

The live region must exist in the DOM from decoration time, empty, rather than being created at click time. A live region inserted at the moment of the change is not reliably announced, and this is the single most common way this pattern silently fails for screen reader users.

**State and persistence.** No persistence of any kind — no storage, no cookie. The answer is remembered only for the current page view; reloading re-asks, and a determined visitor can vote repeatedly. Storing per-page opinions would create a behavioural record and pull the feature into consent and personal-information territory, for which this project has no mechanism, in exchange for protection against ballot-stuffing that client-side storage does not actually provide. Given the sampled data, exactness was not worth the privacy cost.

**Reporting.** A custom RUM checkpoint named `feedback`, with the source set to the block name and the target set to the answer. The platform records the page URL, so no page identity needs to be sent — this is where the reference implementation needs hidden page-name and page-URL fields and we do not.

A dedicated checkpoint rather than the built-in click checkpoint: reusing click would bury votes among all site clicks and force every query to filter on a selector string, which breaks whenever the markup changes. Note that the RUM enhancer is expected to auto-instrument these button clicks as well, producing generic click events in addition to ours; reporting should read the `feedback` checkpoint, and this should be confirmed in the RUM explorer after launch.

No additional payload dimensions. On a sampled signal, extra dimensions produce cells too small to interpret.

**Progressive enhancement.** The block is hidden until the platform marks it decorated, and is therefore invisible when JavaScript does not run. The authored rows would otherwise be visible as stacked fragments including a thank-you message the visitor has not earned. There is no meaningful no-JS fallback available: a real form fallback needs a server to receive the post, which is precisely what we do not have. Silent absence is the correct failure mode for optional telemetry. The block is expected below the fold, so the layout shift when it appears is accepted rather than reserved against.

**Universal Editor behaviour.** Decoration is destructive: the authored rows are consumed, so their per-field editor instrumentation does not survive and authors edit the strings in the properties rail rather than in place. With four short plain-text fields this is the normal pattern. The project's editor support re-decorates on content events, so edits are reflected after each change.

## Testing Decisions

A good test here asserts what a visitor or author can observe — the rendered structure, the accessible relationships, what happens on activation, and what is reported — and never the internal shape of the decoration code. Nothing should assert on private helpers, intermediate DOM states, or the order of internal operations, because all of those are free to change.

**Seam.** The proposed and preferred seam is a single one: the block's decoration entry point, exercised in a real browser against a page containing the block. Everything this feature does is DOM behaviour, so a browser-level seam covers the decoration, the accessible group and live region, keyboard operation, the post-answer state, and the responsive layout in one place, with no new abstraction introduced anywhere. Reporting is the only outbound dependency, and it is observed at the same seam by capturing the outbound call rather than by injecting a reporter into the block — keeping the block's own interface free of test-shaped parameters.

No unit-level seam is proposed. There is no pure logic worth isolating; splitting the field-defaulting into a separately tested function would create a second seam for a behaviour already fully covered at the first, and this project currently has no unit test infrastructure at all.

**Prior art.** None in this repository — there are no existing tests. The project's testing guidance favours browser testing with Playwright for block behaviour plus the configured linting for code and model correctness, which is the pattern to follow.

**What gets tested.**

- Decoration with all fields authored: correct question, controls present, live region present and empty, no heading emitted.
- Decoration with every field empty, and with fields missing entirely: defaults appear, nothing throws.
- Activating each control: correct thank-you appears, controls are removed, focus has not moved, and the expected checkpoint and payload are reported.
- Keyboard operation of both controls, and a visible focus indicator.
- The accessible name of each control includes the question via the group label.
- The block is not visible before decoration completes.
- Layout at mobile and at the desktop breakpoint.
- Linting for both code and the component model files.

**Validation environments.** Local iteration runs against a static draft page covering the authored, empty, and missing-field cases. That fixture cannot prove anything about the Universal Editor, so a page authored for real in the editor is a hard requirement before merge — it is the only way to confirm the block appears in the insert list, that the fields map to the rows the decoration expects, and that in-place editing survives. A working preview URL for that page is required in the pull request description regardless.

## Out of Scope

- The free-text comment path from the reference implementation, and with it any spam protection, submission endpoint, or moderation workflow.
- Any storage or transmission of visitor-authored text.
- Client-side persistence of the answer, and the consent mechanism that would be its prerequisite.
- Any analytics destination other than the platform's built-in RUM — no data layer, tag manager, or third-party analytics is introduced.
- Site-wide automatic placement, and the per-page opt-out convention it would require.
- Author-editable Yes/No labels, and localisation of them.
- A reporting dashboard or scheduled export of the collected votes.
- Fixing the three existing blocks missing from the section allow-list. Related and worth doing, but a separate change.

## Further Notes

The gap between this and the reference implementation is entirely a consequence of platform: theirs is a server-rendered forms product with a backend, a spam service, and per-submission storage; ours is a static delivery platform whose only ambient telemetry is sampled. Anyone reading the two side by side should not conclude that features were forgotten.

The sampling caveat deserves repeating wherever these numbers get reported. Roughly one in a hundred page views is instrumented by default, so a long-tail page with a few hundred views may record no feedback at all despite people answering. The counts are useful for comparing pages and spotting trends over time, and unsuitable for statements like "twelve people said this page was unhelpful". If complete counts ever become a requirement, that is the trigger to revisit the reporting decision — most likely by adding an unsampled beacon for the vote alone, which is an additive change to a single call site.

Adding the comment path later is likewise additive: it needs a submission destination and a consent position, but no change to the block's authoring model, structure, or accessibility work.
