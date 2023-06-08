
const startTime = performance.now();

export function tLog(msg: string): void {
  // eslint-disable-next-line no-console
  console.log(`[${Math.round((performance.now() - startTime)/100)/10}s] ${msg}`);
}