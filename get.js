import url from './url.js';

export default async function get(key, json = true) {
  const response = await fetch(url + key);
  if (json) {
    try {
      return await response.json();
    }
    catch (error) {
      return null;
    }
  }

  return await response.text();
}
