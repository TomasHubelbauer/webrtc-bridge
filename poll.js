import get from './get.js';
import wait from './wait.js';

export default async function poll(key) {
  let value = await get(key);
  while (!value) {
    await wait(1000);
    value = await get(key);
  }

  return value;
}
