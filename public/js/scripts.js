const MODAL_ANIMATION_MS = 220;
const FOCUS_ANIMATION_MS = 300;

let playersCache = [];
let activeCard = null;

function isNearBlack(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lum = (r + g + b) / 3;
  return lum < 36 && (max - min) < 24;
}

function removeBorderBackground(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const visited = new Uint8Array(width * height);
  const queue = [];

  function idx(x, y) {
    return y * width + x;
  }

  function pushIfMask(x, y) {
    const i = idx(x, y);
    if (visited[i]) return;
    const p = i * 4;
    if (!isNearBlack(data[p], data[p + 1], data[p + 2])) return;
    visited[i] = 1;
    queue.push(i);
  }

  for (let x = 0; x < width; x += 1) {
    pushIfMask(x, 0);
    pushIfMask(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    pushIfMask(0, y);
    pushIfMask(width - 1, y);
  }

  while (queue.length > 0) {
    const i = queue.shift();
    const x = i % width;
    const y = Math.floor(i / width);
    const neighbors = [
      [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      pushIfMask(nx, ny);
    }
  }

  for (let i = 0; i < visited.length; i += 1) {
    if (!visited[i]) continue;
    const p = i * 4;
    data[p + 3] = 0;
  }

  ctx.putImageData(imageData, 0, 0);
}

function maskImageBackground(img) {
  if (!(img instanceof HTMLImageElement)) return;
  if (img.dataset.bgMasked === 'true') return;

  const source = img.currentSrc || img.src;
  if (!source) return;

  const worker = new Image();
  worker.crossOrigin = 'anonymous';
  worker.referrerPolicy = 'no-referrer';
  worker.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = worker.naturalWidth;
      canvas.height = worker.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(worker, 0, 0);
      removeBorderBackground(ctx, canvas.width, canvas.height);
      img.src = canvas.toDataURL('image/png');
      img.dataset.bgMasked = 'true';
    } catch (error) {
      console.warn('Image background mask skipped:', error);
    }
  };
  worker.onerror = () => {
    // If cross-origin canvas is blocked, keep original image.
  };
  worker.src = source;
}

function applyBackgroundMask(scope = document) {
  scope.querySelectorAll('.card-image-shell .player-image, .focus-image-shell .player-image')
    .forEach((img) => maskImageBackground(img));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function kv(label, value) {
  return `<p><strong>${label}:</strong> ${escapeHtml(value || 'N/A')}</p>`;
}

function playerCard(player) {
  const image = player.img
    ? `<div class="card-image-shell"><img src="${escapeHtml(player.img)}" alt="${escapeHtml(player.name)}" class="player-image"></div>`
    : '';

  const links = [
    player.bio_url ? `<a href="${escapeHtml(player.bio_url)}" target="_blank" rel="noreferrer">Bio</a>` : '',
    player.stats_url ? `<a href="${escapeHtml(player.stats_url)}" target="_blank" rel="noreferrer">Stats</a>` : ''
  ].filter(Boolean).join(' | ');

  return `
    <article class="card" data-player-id="${player.id}" tabindex="0" role="button" aria-label="Open ${escapeHtml(player.name)} details">
      ${image}
      <h2>${escapeHtml(player.name)}</h2>
      ${kv('#', player.num)}
      ${kv('Position', player.pos)}
      ${links ? `<p class="links">${links}</p>` : ''}
    </article>
  `;
}

function playerDetail(player) {
  const image = player.img
    ? `<img src="${escapeHtml(player.img)}" alt="${escapeHtml(player.name)}" class="player-image">`
    : '';

  const links = [
    player.bio_url ? `<a href="${escapeHtml(player.bio_url)}" target="_blank" rel="noreferrer">Bio</a>` : '',
    player.stats_url ? `<a href="${escapeHtml(player.stats_url)}" target="_blank" rel="noreferrer">Stats</a>` : ''
  ].filter(Boolean).join(' | ');

  return `
    <article class="player player-focus-card">
      <h2 id="player-focus-title">${escapeHtml(player.name)}</h2>
      ${image}
      ${kv('#', player.num)}
      ${kv('Position', player.pos)}
      ${kv('Age', player.age)}
      ${kv('Height', player.height)}
      ${kv('Weight', player.weight)}
      ${kv('Birthplace', player.birthplace)}
      ${links ? `<p class="links">${links}</p>` : ''}
    </article>
  `;
}

function playerFocusDetail(player) {
  const image = player.img
    ? `<div class="card-image-shell focus-image-shell"><img src="${escapeHtml(player.img)}" alt="${escapeHtml(player.name)}" class="player-image focus-image"></div>`
    : '';

  const links = [
    player.bio_url ? `<a href="${escapeHtml(player.bio_url)}" target="_blank" rel="noreferrer">Bio</a>` : '',
    player.stats_url ? `<a href="${escapeHtml(player.stats_url)}" target="_blank" rel="noreferrer">Stats</a>` : ''
  ].filter(Boolean).join(' | ');

  return `
    <article class="player player-focus-card player-focus-compact">
      <h2 id="player-focus-title">${escapeHtml(player.name)}</h2>
      ${image}
      <div class="focus-meta">
        ${kv('#', player.num)}
        ${kv('Position', player.pos)}
        ${kv('Age', player.age)}
        ${kv('Height', player.height)}
        ${kv('Weight', player.weight)}
        ${kv('Birthplace', player.birthplace)}
      </div>
      ${links ? `<p class="links focus-links">${links}</p>` : ''}
    </article>
  `;
}

async function getJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function renderPlayers() {
  const container = document.getElementById('players');
  if (!container) return;

  try {
    const players = await getJson('/players');
    playersCache = players;
    container.innerHTML = players.map(playerCard).join('');
    applyBackgroundMask(container);
  } catch (error) {
    container.innerHTML = '<p class="error">Failed to load roster data.</p>';
    console.error(error);
  }
}

async function renderPlayer() {
  const container = document.getElementById('player');
  if (!container) return;

  const id = container.dataset.playerId;

  try {
    const player = await getJson(`/players/${id}`);
    container.innerHTML = playerDetail(player);
  } catch (error) {
    container.innerHTML = '<p class="error">Failed to load player data.</p>';
    console.error(error);
  }
}

function closeJsonModal(modal) {
  if (modal.classList.contains('hidden') || modal.classList.contains('closing')) return;

  if (modal.contains(document.activeElement) && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  modal.classList.add('closing');
  modal.setAttribute('aria-hidden', 'true');

  window.setTimeout(() => {
    modal.classList.add('hidden');
    modal.classList.remove('closing', 'open');
  }, MODAL_ANIMATION_MS);
}

async function openJsonModal(modal, output) {
  modal.classList.remove('hidden', 'closing');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  output.textContent = 'Loading...';

  try {
    const data = await getJson('/players');
    output.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    output.textContent = 'Failed to load JSON data.';
    console.error(error);
  }
}

function wireJsonModal() {
  const trigger = document.getElementById('view-json');
  const modal = document.getElementById('json-modal');
  const closeButton = document.getElementById('close-json-modal');
  const output = document.getElementById('json-output');

  if (!trigger || !modal || !closeButton || !output) return;

  trigger.addEventListener('click', () => openJsonModal(modal, output));
  closeButton.addEventListener('click', () => closeJsonModal(modal));

  modal.addEventListener('click', (event) => {
    if (event.target instanceof HTMLElement && event.target.dataset.closeModal === 'true') {
      closeJsonModal(modal);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeJsonModal(modal);
    }
  });
}

function playFlipAnimation(panel, fromRect, toRect) {
  const dx = fromRect.left - toRect.left;
  const dy = fromRect.top - toRect.top;
  const sx = fromRect.width / toRect.width;
  const sy = fromRect.height / toRect.height;

  panel.animate([
    { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, opacity: 0.95 },
    { transform: 'translate(0, 0) scale(1, 1)', opacity: 1 }
  ], {
    duration: FOCUS_ANIMATION_MS,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    fill: 'forwards'
  });
}

function openPlayerFocusModal(card) {
  const modal = document.getElementById('player-focus-modal');
  const panel = modal?.querySelector('.focus-panel');
  const content = document.getElementById('player-focus-content');
  if (!modal || !panel || !content) return;
  if (!modal.classList.contains('hidden')) return;

  const playerId = Number(card.dataset.playerId);
  const player = playersCache.find((p) => p.id === playerId);
  if (!player) return;

  activeCard = card;
  content.innerHTML = playerFocusDetail(player);
  applyBackgroundMask(content);

  modal.classList.remove('hidden', 'closing');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  const fromRect = card.getBoundingClientRect();
  const toRect = panel.getBoundingClientRect();
  playFlipAnimation(panel, fromRect, toRect);
}

function closePlayerFocusModal() {
  const modal = document.getElementById('player-focus-modal');
  const panel = modal?.querySelector('.focus-panel');
  if (!modal || !panel || !activeCard) return;
  if (modal.classList.contains('closing') || modal.classList.contains('hidden')) return;

  if (modal.contains(document.activeElement) && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  const fromRect = panel.getBoundingClientRect();
  const toRect = activeCard.getBoundingClientRect();

  modal.classList.remove('open');
  modal.classList.add('closing');
  modal.setAttribute('aria-hidden', 'true');

  playFlipAnimation(panel, toRect, fromRect);

  window.setTimeout(() => {
    modal.classList.add('hidden');
    modal.classList.remove('closing');
    panel.getAnimations().forEach((animation) => animation.cancel());
    panel.style.transform = '';
    document.body.classList.remove('modal-open');
    activeCard = null;
  }, FOCUS_ANIMATION_MS);
}

function wirePlayerFocusModal() {
  const container = document.getElementById('players');
  const modal = document.getElementById('player-focus-modal');
  const closeButton = document.getElementById('close-player-focus');

  if (!container || !modal || !closeButton) return;

  container.addEventListener('click', (event) => {
    if (document.body.classList.contains('modal-open')) return;
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest('.links a')) return;

    const card = target.closest('.card');
    if (!(card instanceof HTMLElement)) return;
    openPlayerFocusModal(card);
  });

  container.addEventListener('keydown', (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    if ((event.key === 'Enter' || event.key === ' ') && event.target.classList.contains('card')) {
      event.preventDefault();
      openPlayerFocusModal(event.target);
    }
  });

  closeButton.addEventListener('click', (event) => {
    event.stopPropagation();
    closePlayerFocusModal();
  });

  modal.addEventListener('click', (event) => {
    if (event.target instanceof HTMLElement && event.target.dataset.closePlayerModal === 'true') {
      event.stopPropagation();
      closePlayerFocusModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
      closePlayerFocusModal();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderPlayers();
  renderPlayer();
  wireJsonModal();
  wirePlayerFocusModal();
});
