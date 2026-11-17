import { ARENA } from './config.js';
import { makeEnemy } from './entities.js';
const pickKind=(wave,rng)=>{const r=rng();if(wave<2)return 'wisp';if(wave<4)return r<.64?'wisp':'dart';if(r<.43)return 'wisp';if(r<.72)return 'dart';return 'splitter';};
export function makeDirector(rng){return {wave:1,clock:0,spawn:1.1,serial:0,rng};}
export function updateDirector(director,enemies,dt,w,h,events){
  director.clock+=dt;const next=1+Math.floor(director.clock/ARENA.waveSeconds);if(next>director.wave){director.wave=next;events.newWave=next;}
  director.spawn-=dt;const period=Math.max(.31,ARENA.enemyBase-director.wave*.19);
  if(director.spawn<=0){director.spawn=period*(.72+director.rng()*.62);const n=1+(director.wave>=3&&director.rng()<.38?1:0);
    for(let i=0;i<n;i++){const side=Math.floor(director.rng()*4),pad=26;let x,y;if(side===0){x=pad;y=director.rng()*h;}else if(side===1){x=w-pad;y=director.rng()*h;}else if(side===2){x=director.rng()*w;y=pad;}else{x=director.rng()*w;y=h-pad;}enemies.push(makeEnemy(pickKind(director.wave,director.rng),x,y,director.wave,director.serial++));}
  }
}
