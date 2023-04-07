import { createHash } from 'crypto';

function sha256(input: string): string {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

export default { sha256 };
