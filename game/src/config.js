export const PALETTE = { bg:'#080d19', grid:'#152238', white:'#eaf6ff', muted:'#8296b5', cyan:'#66f3ff', ember:'#ffb34f', coral:'#ff5578', violet:'#b88cff', lime:'#b9ff80', blue:'#5d8bff' };
export const ARENA = { margin:42, playerRadius:11, playerSpeed:250, bulletSpeed:620, fireRate:.145, dashSpeed:650, dashTime:.16, dashCooldown:1.05, invulnerable:.8, maxHp:4, pickupRadius:25, comboWindow:3.05, comboMax:8, enemyBase:3.15, waveSeconds:19, maxDt:.04 };
export const ENEMIES = {
  wisp:{ radius:12, hp:1, speed:78, damage:1, color:PALETTE.coral, score:1 },
  dart:{ radius:9, hp:1, speed:137, damage:1, color:PALETTE.violet, score:2 },
  splitter:{ radius:17, hp:4, speed:49, damage:1, color:PALETTE.ember, score:3 },
  spark:{ radius:7, hp:1, speed:102, damage:1, color:PALETTE.lime, score:1 }
};
