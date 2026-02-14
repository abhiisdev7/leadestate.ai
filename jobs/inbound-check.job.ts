export default async function inBoundCheckJob() {
  console.log("Hello from inbound job...");
  await new Promise((r) => setTimeout(r, 10_000));
}