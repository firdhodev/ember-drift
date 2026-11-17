import { ARENA } from './config.js';
import { makeShip, makeBullet, makeEmber, burst, moveShip, updateEnemies, updatePickups, updateParticles } from './entities.js';
import { makeDirector, updateDirector } from './waves.js';
import { seededRandom } from './random.js';
import { sfx } from './audio.js';

export function createWorld(width=1280,height=720,seed=1307){
  const rng=seededRandom(seed);return {w:width,h:height,ship:makeShip(width,height),enemies:[],bullets:[],embers:[],particles:[],director:makeDirector(rng),score:0,best:readBest(),combo:1,comboTimer:0,time:0,shake:0,flash:0,screen:'title',rng,events:{}};
}
function readBest(){try{return Number(localStorage.getItem('ember-drift-best'))||0;}catch{return 0;}}
function saveBest(score){try{localStorage.setItem('ember-drift-best',String(score));}catch{}}
export function startWorld(world,screen='play'){
  const fresh=createWorld(world.w,world.h,Math.floor(world.rng()*0xffffffff));Object.assign(world,fresh,{screen});return world;
}
export function resizeWorld(world,w,h){const ox=world.w,oy=world.h;world.w=w;world.h=h;world.ship.x=world.ship.x/ox*w;world.ship.y=world.ship.y/oy*h;for(const group of [world.enemies,world.bullets,world.embers,world.particles])for(const e of group){e.x=e.x/ox*w;e.y=e.y/oy*h;}}
export function step(world,input,dt){
  dt=Math.min(Math.max(dt,0),ARENA.maxDt);const events={pickup:0,newWave:0,playerHit:false,dash:false,enemyDown:false};world.events=events;if(world.screen!=='play')return events;
  world.time+=dt;world.flash=Math.max(0,world.flash-dt);world.shake=Math.max(0,world.shake-dt*22);const ship=world.ship;
  moveShip(ship,input,dt,world.w,world.h,events);ship.fire-=dt;
  if(input.fire&&ship.fire<=0){const a=ship.facing;world.bullets.push(makeBullet(ship.x+Math.cos(a)*14,ship.y+Math.sin(a)*14,Math.cos(a)*ARENA.bulletSpeed,Math.sin(a)*ARENA.bulletSpeed));ship.fire=ARENA.fireRate;sfx('shoot');}
  updateDirector(world.director,world.enemies,dt,world.w,world.h,events);
  for(let i=world.bullets.length-1;i>=0;i--){const b=world.bullets[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(b.life<=0||b.x<0||b.y<0||b.x>world.w||b.y>world.h)world.bullets.splice(i,1);}
  updateEnemies(world.enemies,ship,dt,world.time,world.bullets,world.embers,world.particles,world.rng,events);updatePickups(world.embers,ship,dt,world.particles,world.rng,events);updateParticles(world.particles,dt);
  if(events.pickup){world.combo=world.comboTimer>0?Math.min(ARENA.comboMax,world.combo+events.pickup):1;world.comboTimer=ARENA.comboWindow;world.score+=events.pickup*world.combo;}
  else{world.comboTimer=Math.max(0,world.comboTimer-dt);if(world.comboTimer===0)world.combo=1;}
  if(events.playerHit){world.combo=1;world.comboTimer=0;world.shake=.35;world.flash=.13;sfx('hit');}if(events.dash)sfx('dash');if(events.pickup)sfx('pickup');
  if(ship.hp<=0){world.screen='over';world.best=Math.max(world.best,world.score);saveBest(world.best);sfx('gameover');}return events;
}
export function seedShowcase(world){
  startWorld(world,'play');world.director.clock=44;world.director.wave=3;world.time=44;const cx=world.w/2,cy=world.h/2;
  for(let i=0;i<15;i++){const a=i*2.399,r=125+(i%3)*58,kind=i%5===0?'splitter':i%3===0?'dart':'wisp';world.enemies.push({kind,x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r,vx:0,vy:0,hp:kind==='splitter'?3:1,radius:kind==='splitter'?17:kind==='dart'?9:12,speed:62+i%4*18,phase:i,flash:0});}
  for(let i=0;i<9;i++)world.embers.push(makeEmber(cx-180+i*42,cy+155+(i%2)*18,1,world.rng));world.score=84;world.combo=4;world.comboTimer=1.7;world.ship.hp=3;world.ship.x=cx;world.ship.y=cy;world.ship.facing=-.3;return world;
}
