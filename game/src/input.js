import { unlockAudio } from './audio.js';
export function makeInput(canvas) {
  const keys = new Set();
  const state = { keys, x:innerWidth/2, y:innerHeight/2, dash:false, dashPressed:false, fire:true, pointerDown:false, pointerDashPressed:false };
  const down = e => {
    unlockAudio();
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
    if (!keys.has(e.code) && ['ShiftLeft','ShiftRight','Space'].includes(e.code)) state.dashPressed = true;
    keys.add(e.code);
  };
  window.addEventListener('keydown', down); window.addEventListener('keyup', e => keys.delete(e.code));
  canvas.addEventListener('pointermove', e => { state.x=e.clientX; state.y=e.clientY; });
  canvas.addEventListener('pointerdown', e => { unlockAudio();state.x=e.clientX; state.y=e.clientY; if(e.button===2)state.pointerDashPressed=true;else state.pointerDown=true; });
  window.addEventListener('pointerup', e => { if(e.button!==2)state.pointerDown=false; });
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  state.read = () => { state.dash=keys.has('ShiftLeft')||keys.has('ShiftRight')||keys.has('Space'); const dashPressed=state.dashPressed||state.pointerDashPressed;state.dashPressed=false;state.pointerDashPressed=false;return {x:state.x,y:state.y,keys,dash:state.dash,dashPressed,fire:state.fire}; };
  return state;
}
