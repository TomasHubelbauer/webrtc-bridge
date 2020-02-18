import url from './url.js';

export default async function post(key, value, json = true) {
  await fetch(url + key, { method: 'POST', body: json ? JSON.stringify(value) : value });
}
