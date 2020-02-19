export default async function otp() {
  let secret;

  // Try to read the secret from the file when on the server
  try {
    const module = await import('./secret.js');
    secret = module.default;
  }
  // Fall back and try to read the secret from local storage when on the client
  catch (error) {
    secret = window.localStorage.getItem('secret');
  }

  if (!secret) {
    throw new Error('The OTP secret was not found in the local storage.');
  }

  return totp(secret);
}

void async function () {
  console.log(await hotp('12345678901234567890', 0)); // 755224
  console.log(await hotp('12345678901234567890', 1)); // 287082
  console.log(await hotp('12345678901234567890', 2)); // 359152
  console.log(await hotp('12345678901234567890', 3)); // 969429

  window.setInterval(async function () {
    console.log(await totp(secret));
  }, 1000);
}//()

// https://khovansky.me/demos/web-otp
async function hotp(secret, counter) {
  const key = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder('utf-8').encode(secret),
    { name: 'HMAC', hash: { name: 'SHA-1' } },
    false,
    ['sign']
  );

  const counterArrayBuffer = new ArrayBuffer(8);
  const counterDataView = new DataView(counterArrayBuffer);
  const byteString = '0'.repeat(64); // 8 bytes
  const bCounter = (byteString + counter.toString(2)).slice(-64);

  for (let byte = 0; byte < 64; byte += 8) {
    const byteValue = parseInt(bCounter.slice(byte, byte + 8), 2);
    counterDataView.setUint8(byte / 8, byteValue);
  }

  const hs = new Uint8Array(await window.crypto.subtle.sign('HMAC', key, counterArrayBuffer));
  const offset = hs[19] & 0b1111;
  const P = ((hs[offset] & 0x7f) << 24) | (hs[offset + 1] << 16) | (hs[offset + 2] << 8) | hs[offset + 3]
  const Sbits = P.toString(2);
  const Snum = parseInt(Sbits, 2);
  const padded = ('000000' + (Snum % (10 ** 6))).slice(-6);
  return padded;
}

// https://khovansky.me/demos/web-otp
async function totp(secret) {
  const stepWindow = 30 * 1000;
  const time = Date.now();
  const timeStep = Math.floor(time / stepWindow);
  const timeSinceStep = Date.now() - timeStep * stepWindow;
  const timeLeft = Math.ceil((stepWindow - timeSinceStep) / 1000);
  const code = await hotp(secret, timeStep);
  return { timeLeft, code };
}
