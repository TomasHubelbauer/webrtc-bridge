export default function mount(...args) {
  const logDiv = document.createElement('div');
  logDiv.className = 'log';

  const stampSpan = document.createElement('span');
  stampSpan.className = 'stamp';
  stampSpan.textContent = new Date().toLocaleTimeString();
  logDiv.append(stampSpan);

  for (const arg of args) {
    // Append simple string arguments as text
    if (typeof arg === 'string') {
      logDiv.append(arg + ' ');
      continue;
    }

    const json = JSON.stringify(arg, null, 2);

    // Handle multi-line JSON (non-empty objects/arrays) by emitting a block `pre`
    if (json.includes('\n')) {
      const pre = document.createElement('pre');
      pre.textContent = json;
      logDiv.append(pre);
      continue;
    }

    // Append single-line JSON (empty objects/arrays, numbers, booleans)
    logDiv.append(json + ' ');
  }

  document.body.insertAdjacentElement('afterbegin', logDiv);
}
