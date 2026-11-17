let context = null;
let unlocked = false;
const tones = { shoot:[520,.035,'square'], hit:[110,.12,'sawtooth'], pickup:[880,.09,'sine'], dash:[270,.11,'triangle'], gameover:[150,.42,'triangle'] };
export function unlockAudio(){unlocked=true;}
export function sfx(name) {
  try {
    if(!unlocked)return;
    const Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return;
    context ||= new Ctx(); if (context.state === 'suspended') context.resume().catch(()=>{});
    const [freq,duration,type] = tones[name] || tones.shoot;
    const osc = context.createOscillator(), gain = context.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, context.currentTime);
    if (name === 'pickup') osc.frequency.exponentialRampToValueAtTime(freq*1.45, context.currentTime+duration);
    const volume=name==='shoot'?.012:.045;
    gain.gain.setValueAtTime(volume, context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime+duration);
    osc.connect(gain); gain.connect(context.destination); osc.start(); osc.stop(context.currentTime+duration);
  } catch { /* Audio is optional; gameplay never depends on it. */ }
}
