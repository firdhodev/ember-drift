import { createWorld, seedShowcase, startWorld, step } from './world.js';
import { seededRandom } from './random.js';

export function stageShot(name,world){
  const seed=name==='end'?99173:name==='play'?44221:107;world.rng=seededRandom(seed);
  if(name==='start'){startWorld(world,'title');return world;}
  if(name==='end'){startWorld(world,'over');world.score=137;world.best=254;world.director.wave=5;world.ship.hp=0;world.time=93;return world;}
  seedShowcase(world);
  const input={x:world.w*.74,y:world.h*.42,keys:new Set(),dash:false,dashPressed:false,fire:true};
  for(let frame=0;frame<150;frame++){
    const nearest=list=>list.reduce((best,item)=>!best||Math.hypot(item.x-world.ship.x,item.y-world.ship.y)<Math.hypot(best.x-world.ship.x,best.y-world.ship.y)?item:best,null);
    const target=nearest(world.embers)||nearest(world.enemies),danger=nearest(world.enemies);
    if(target){input.x=target.x;input.y=target.y;const threatened=danger&&Math.hypot(danger.x-world.ship.x,danger.y-world.ship.y)<145;input.keys=new Set(threatened?Math.abs(danger.x-world.ship.x)>Math.abs(danger.y-world.ship.y)?[danger.x<world.ship.x?'KeyD':'KeyA']:[danger.y<world.ship.y?'KeyS':'KeyW']:[]);}
    step(world,input,1/60);
  }
  world.screen='play';world.ship.hp=Math.max(2,world.ship.hp);world.score=Math.max(84,world.score);world.combo=Math.max(2,world.combo);return world;
}
