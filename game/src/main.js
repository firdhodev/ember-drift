import { createWorld, resizeWorld, startWorld, step } from './world.js';
import { makeInput } from './input.js';
import { render, SCREEN_TITLE, SCREEN_PLAY, SCREEN_OVER } from './render.js';
import { stageShot } from './shots.js';

const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d',{alpha:false}),input=makeInput(canvas);
let width=innerWidth,height=innerHeight,dpr=1,world=createWorld(width,height),last=0;
function fit(){const oldW=world.w,oldH=world.h;width=innerWidth;height=innerHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.style.width=width+'px';canvas.style.height=height+'px';ctx.setTransform(dpr,0,0,dpr,0,0);if(oldW!==width||oldH!==height)resizeWorld(world,width,height);}
fit();window.addEventListener('resize',fit);
const shot=new URLSearchParams(location.search).get('shot');
if(shot){stageShot(shot,world);render(ctx,world,0);window.__shotReady=true;}
else{
  const begin=()=>{if(world.screen===SCREEN_TITLE||world.screen===SCREEN_OVER){startWorld(world,SCREEN_PLAY);last=performance.now();}};
  window.addEventListener('keydown',e=>{if(e.code==='Enter'){e.preventDefault();begin();}});
  canvas.addEventListener('pointerdown',begin);
  function frame(now){const dt=Math.min((now-last)/1000,.04);last=now;
    if(world.screen===SCREEN_PLAY)step(world,input.read(),dt);
    else{world.time+=dt;input.read();}
    render(ctx,world,dt);requestAnimationFrame(frame);
  }
  last=performance.now();requestAnimationFrame(frame);
}
