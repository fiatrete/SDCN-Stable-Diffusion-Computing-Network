export default function calculateTaskPriority(
  honor: number,
  waitTime: number,
  width: number,
  height: number,
  step: number,
): number {
  const complexity = Math.max(step / 20, 1) * Math.max(2 ^ ((width * height) / (512 * 512)), 1);
  const priority = (2 * honor + 1.2 * waitTime) ^ (2 + 33 * complexity);
  return priority;
}
