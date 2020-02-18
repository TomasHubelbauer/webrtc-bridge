export default function mount(...args) {
  // Stamp the DOM log line
  args.unshift(new Date());
  const logDiv = document.createElement('div');
  logDiv.textContent = JSON.stringify(args);
  document.body.insertAdjacentElement('afterbegin', logDiv);
}
