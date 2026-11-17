import { ARENA, ENEMIES, PALETTE } from './config.js';

export function makeShip(w,h) { return { x:w/2,y:h/2,vx:0,vy:0,hp:ARENA.maxHp,fire:0,dash:0,dashCooldown:0,invuln:0,facing:0,r:ARENA.playerRadius }; }
export function makeEnemy(kind,x,y,wave,id) {
  const spec=ENEMIES[kind]; return {kind,x,y,vx:0,vy:0,hp:spec.hp+Math.floor((wave-1)*(kind==='splitter'?.35:.13)),radius:spec.radius,speed:spec.speed*(1+Math.min(wave-1,12)*.035),phase:id*.71,flash:0};
}
export function makeBullet(x,y,vx,vy) { return {x,y,vx,vy,life:1.15,r:3.4}; }
export function makeEmber(x,y,value=1,random=Math.random) { return {x,y,vx:(random()-.5)*100,vy:(random()-.5)*100,value,life:12,r:5}; }
export function burst(list,x,y,color,count=9,random=Math.random) {
  for(let i=0;i<count;i++){const a=random()*Math.PI*2,s=45+random()*190;list.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.25+random()*.48,max:.73,r:1.5+random()*3,color});}
}
export function moveShip(ship,input,dt,w,h,events) {
  const k=input.keys,dx=(k.has('KeyD')||k.has('ArrowRight')?1:0)-(k.has('KeyA')||k.has('ArrowLeft')?1:0),dy=(k.has('KeyS')||k.has('ArrowDown')?1:0)-(k.has('KeyW')||k.has('ArrowUp')?1:0);
  let mx=dx,my=dy,mag=Math.hypot(mx,my);if(mag){mx/=mag;my/=mag;}
  ship.dashCooldown=Math.max(0,ship.dashCooldown-dt);ship.dash=Math.max(0,ship.dash-dt);ship.invuln=Math.max(0,ship.invuln-dt);
  if(input.dashPressed&&ship.dashCooldown===0){if(!mag){const a=Math.atan2(input.y-ship.y,input.x-ship.x);mx=Math.cos(a);my=Math.sin(a);}ship.vx=mx*ARENA.dashSpeed;ship.vy=my*ARENA.dashSpeed;ship.dash=ARENA.dashTime;ship.dashCooldown=ARENA.dashCooldown;ship.invuln=Math.max(ship.invuln,.27);events.dash=true;}
  if(ship.dash>0){ship.x+=ship.vx*dt;ship.y+=ship.vy*dt;}else{const blend=1-Math.exp(-13*dt);ship.vx+=(mx*ARENA.playerSpeed-ship.vx)*blend;ship.vy+=(my*ARENA.playerSpeed-ship.vy)*blend;ship.x+=ship.vx*dt;ship.y+=ship.vy*dt;}
  ship.x=Math.max(ARENA.margin+ship.r,Math.min(w-ARENA.margin-ship.r,ship.x));ship.y=Math.max(ARENA.margin+ship.r,Math.min(h-ARENA.margin-ship.r,ship.y));ship.facing=Math.atan2(input.y-ship.y,input.x-ship.x);
}
export function updateEnemies(enemies,ship,dt,time,bullets,embers,particles,rng,events) {
  for(let i=enemies.length-1;i>=0;i--){
    const e=enemies[i],spec=ENEMIES[e.kind],a=Math.atan2(ship.y-e.y,ship.x-e.x),distance=Math.hypot(ship.x-e.x,ship.y-e.y);let steer=a;
    if(e.kind==='dart'){steer=a+Math.sin(time*6+e.phase)*.48;e.vx+=Math.cos(steer)*e.speed*dt*3;e.vy+=Math.sin(steer)*e.speed*dt*3;const s=Math.hypot(e.vx,e.vy)||1;e.vx=e.vx/s*e.speed;e.vy=e.vy/s*e.speed;}
    else if(e.kind==='spark'){const blend=Math.min(1,dt*2.4);e.vx+=(Math.cos(a)*e.speed-e.vx)*blend;e.vy+=(Math.sin(a)*e.speed-e.vy)*blend;}
    else if(e.kind==='splitter'&&distance<230)steer=a+Math.sin(time*1.5+e.phase)*.82;
    if(e.kind!=='dart'&&e.kind!=='spark'){e.vx=Math.cos(steer)*e.speed;e.vy=Math.sin(steer)*e.speed;}
    e.x+=e.vx*dt;e.y+=e.vy*dt;e.flash=Math.max(0,e.flash-dt);
    let removed=false;
    for(let b=bullets.length-1;b>=0;b--){const shot=bullets[b];if(Math.hypot(shot.x-e.x,shot.y-e.y)<e.radius+shot.r){bullets.splice(b,1);e.hp--;e.flash=.08;events.hitEnemy=true;
      if(e.hp<=0){burst(particles,e.x,e.y,spec.color,e.kind==='splitter'?18:11,rng);embers.push(makeEmber(e.x,e.y,spec.score,rng));
        if(e.kind==='splitter')for(let n=0;n<2;n++){const child=makeEnemy('spark',e.x+(n?10:-10),e.y,1,Math.floor(rng()*9999));child.vx=(n?1:-1)*90;child.vy=(rng()-.5)*180;enemies.push(child);}
        enemies.splice(i,1);events.enemyDown=true;removed=true;break;
      }
    }}
    if(removed)continue;
    if(enemies[i]&&distance<e.radius+ARENA.playerRadius&&ship.invuln<=0){ship.hp--;ship.invuln=ARENA.invulnerable;events.playerHit=true;burst(particles,ship.x,ship.y,PALETTE.coral,16,rng);}
  }
}
export function updatePickups(embers,ship,dt,particles,rng,events) {
  for(let i=embers.length-1;i>=0;i--){const e=embers[i],d=Math.hypot(ship.x-e.x,ship.y-e.y);
    if(d<130){const a=Math.atan2(ship.y-e.y,ship.x-e.x),pull=1-d/170;e.vx+=Math.cos(a)*680*pull*dt;e.vy+=Math.sin(a)*680*pull*dt;}
    e.x+=e.vx*dt;e.y+=e.vy*dt;e.vx*=Math.exp(-2.4*dt);e.vy*=Math.exp(-2.4*dt);e.life-=dt;
    if(d<ARENA.pickupRadius){embers.splice(i,1);events.pickup+=e.value;burst(particles,e.x,e.y,PALETTE.ember,7,rng);}else if(e.life<=0)embers.splice(i,1);
  }
}
export function updateParticles(particles,dt){
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;if(p.life<=0){particles.splice(i,1);continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.exp(-3.8*dt);p.vy*=Math.exp(-3.8*dt);}
}
