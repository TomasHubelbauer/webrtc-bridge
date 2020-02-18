export default async function wait(ms) {
  await new Promise(resolve => window.setTimeout(resolve, ms));
}
