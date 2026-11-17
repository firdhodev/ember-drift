// Small deterministic generator so showcase runs can be reproduced.
export function seededRandom(seed = 1) {
  let state = seed >>> 0;
  return function random() {
    state += 0x6D2B79F5;
    let t = state; t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
