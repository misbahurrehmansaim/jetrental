'use strict';
/** Content blocks used by inner pages. */
const { head, btn, linkArrow, esc, icon, img, cfg, money } = require('./ui');

/** Two-column text + photo. */
function split({ kicker, title, paras = [], list, photo, photo2, reverse = false, tone = 'paper', cta, id, waypoint, note }) {
  const hid = id || 'h-' + Math.random().toString(36).slice(2, 7);
  return `<section class="section section--${tone}" data-waypoint="${waypoint || kicker || 'Details'}" aria-labelledby="${hid}">
  <div class="container split${reverse ? ' split--rev' : ''}">
    <div class="split-copy">
      ${head({ kicker, title, id: hid })}
      ${paras.map((p) => `<p data-reveal>${p}</p>`).join('')}
      ${list ? `<ul class="check-list" data-stagger>${list.map((l) => `<li>${icon('check')}<span>${l}</span></li>`).join('')}</ul>` : ''}
      ${note ? `<p class="fine" data-reveal>${note}</p>` : ''}
      ${cta ? `<div class="split-cta" data-reveal>${cta}</div>` : ''}
    </div>
    <div class="split-media" data-reveal="clip">
      <div class="split-frame"><div class="media" data-parallax="0.12">${img(photo, { sizes: '(min-width: 1000px) 45vw, 100vw', widths: [800, 1200, 1800] })}</div></div>
      ${photo2 ? `<div class="split-photo2">${img(photo2, { sizes: '240px', widths: [480, 800] })}</div>` : ''}
    </div>
  </div>
</section>`;
}

/** Grid of icon features. */
function features({ kicker, title, lede, items, cols = 3, tone = 'paper', id, waypoint }) {
  const hid = id || 'f-' + Math.random().toString(36).slice(2, 7);
  return `<section class="section section--${tone}" data-waypoint="${waypoint || kicker || 'Features'}" aria-labelledby="${hid}">
  <div class="container">
    ${head({ kicker, title, lede, id: hid })}
    <div class="grid grid-${cols} features" data-stagger>
      ${items
        .map(
          ([i, t, d, href]) => `<article class="feature" data-tilt><span class="pillar-ico">${icon(i)}</span><h3>${t}</h3><p>${d}</p>${href ? linkArrow(href[0], href[1]) : ''}</article>`
        )
        .join('')}
    </div>
  </div>
</section>`;
}

/** Numbered process list. */
function process({ kicker, title, lede, steps, tone = 'dark', id }) {
  const hid = id || 'p-' + Math.random().toString(36).slice(2, 7);
  return `<section class="section section--${tone}" data-waypoint="${kicker || 'Process'}" aria-labelledby="${hid}">
  <div class="container">
    ${head({ kicker, title, lede, id: hid })}
    <ol class="process" data-stagger>${steps.map(([t, d], i) => `<li><span class="process-n">${String(i + 1).padStart(2, '0')}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol>
  </div>
</section>`;
}

/** Prose wrapper for long-form text. */
function prose(html, { tone = 'paper', waypoint = 'Details' } = {}) {
  return `<section class="section section--${tone}" data-waypoint="${waypoint}"><div class="container container--narrow prose">${html}</div></section>`;
}

/** Generic lead form (contact, operators, jet card enquiry). Handled by app.js [data-lead-form]. */
function leadForm({ title, intro, fields, submit = 'Send message', topic = 'Website enquiry', success = 'Thank you. We will be in touch shortly.' }) {
  const f = (x) => {
    const [type, name, label, opts = {}] = x;
    const req = opts.required ? ' required' : '';
    const wide = opts.wide ? ' field--wide' : '';
    if (type === 'textarea') return `<label class="field${wide}"><span>${label}</span><textarea name="${name}" rows="${opts.rows || 4}"${req} placeholder="${esc(opts.ph || '')}"></textarea></label>`;
    if (type === 'select') return `<label class="field${wide}"><span>${label}</span><select name="${name}"${req}>${opts.options.map((o) => `<option>${esc(o)}</option>`).join('')}</select></label>`;
    return `<label class="field${wide}"><span>${label}</span><input type="${type}" name="${name}"${req}${opts.ph ? ` placeholder="${esc(opts.ph)}"` : ''}${opts.auto ? ` autocomplete="${opts.auto}"` : ''}></label>`;
  };
  return `<form class="lead-form" data-lead-form data-topic="${esc(topic)}" data-success="${esc(success)}" novalidate>
  ${title ? `<h2 class="lead-title">${title}</h2>` : ''}
  ${intro ? `<p class="lead-intro">${intro}</p>` : ''}
  <div class="qf-grid">${fields.map(f).join('')}</div>
  <label class="check check--consent"><input type="checkbox" name="consent" required><span>I agree to be contacted about this request. See the <a href="~/privacy/">privacy policy</a>.</span></label>
  <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
  <button class="btn btn-gold" type="submit"><span>${submit}</span>${icon('arrow-right')}</button>
  <p class="lead-msg" role="status" data-lead-msg hidden></p>
</form>`;
}

/** Contact methods block. */
function contactMethods() {
  const { waLink } = require('./layout');
  return `<ul class="contact-methods">
    <li>${icon('phone')}<div><b>Call the flight desk</b><a href="tel:${cfg.phoneHref}">${cfg.phone}</a><small>${cfg.hours}</small></div></li>
    <li>${icon('chat')}<div><b>WhatsApp</b><a href="${waLink('Hello, I would like a private jet quote.')}" target="_blank" rel="noopener">Message us now</a><small>Fast replies, any time</small></div></li>
    <li>${icon('mail')}<div><b>Email</b><a href="mailto:${cfg.email}">${cfg.email}</a><small>For itineraries and invoices</small></div></li>
  </ul>`;
}

/** Simple data table from rows. */
function table(headers, rows, { cls = '' } = {}) {
  return `<div class="table-wrap"><table class="data-table ${cls}"><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join('')}</tr>`)
    .join('')}</tbody></table></div>`;
}

module.exports = { split, features, process, prose, leadForm, contactMethods, table };
