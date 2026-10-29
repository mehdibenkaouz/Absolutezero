# Feedback experiment: fb_barrier_v1

Launched 2026-10-29. Three random, equal-probability variants per browser session, preserved in sessionStorage. No visitor identifier or location is added. Seven languages follow the browser preferences. The variant persists across manual reopening. Without sessionStorage, assignment lasts for the page only.

Italian copy (translated equivalents are in feedback-experiment.js):

- A: Cosa ti ferma dal provare Flow?
- B: Cosa cercavi che qui non hai trovato?
- C: Cosa dovremmo chiarire su Flow?

All variants have the same four optional radio choices: not_needed, unclear, installation, other. Visitors can select a choice, write up to 800 characters, or do both. Explicit submission is required. Empty replies are rejected. The saved private-board message includes experiment ID, variant, language, selected answer and optional text. Existing messages are not changed.

## Measurement

- flow_feedback_open: modal opening action (existing event, not proof of visibility).
- flow_feedback_impression: modal is open, has nonzero dimensions and intersects the viewport in a visible document, checked after two animation frames. Once per opening. A hidden tab cancels the pending check; returning to the tab rechecks. Closing before rendering cancels it. This establishes rendered exposure, not human attention or comprehension.
- flow_feedback_start: first input or choice in each opening.
- flow_feedback_choice: selected reason code; this may repeat if a person changes the choice.
- flow_feedback_submit: only after the server confirms a matching saved receipt.
- flow_feedback_error / flow_feedback_close: existing events retained.

Each event carries source, experiment_id, variant, language. Choice and successful submission also carry reason. No free text, name, email, request UUID or personal identifier is sent in these added analytics parameters.

Use successful submits / impressions by variant as a descriptive response rate. Reopened popups are additional exposures, not unique people. Compare comparable date windows and language/source segments. Small counts cannot establish a winning variant.

Events use the site's existing flowTrack and GA4 consent handling. Disabled analytics, denied consent or blocking can prevent collection; analytics counts are not a census of visitors. No consent bypass is added. Register event-scoped custom dimensions experiment_id, variant, language and reason in GA4 to use those parameters in standard explorations; this code does not configure the GA4 property. Event names themselves need no custom-dimension registration. Do not mark popup views as acquisition conversions.

Run controller checks: node flow/tests/feedback-experiment.test.cjs
