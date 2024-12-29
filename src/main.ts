// import { invoke } from "@tauri-apps/api/tauri";
import { GameEngine, DemoRenderer, MeshTest } from './game';
import { Engine } from './types';

// let greetInputEl: HTMLInputElement | null;
// let greetMsgEl: HTMLElement | null;

// async function greet() {
//   if (greetMsgEl && greetInputEl) {
//     // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
//     greetMsgEl.textContent = await invoke("greet", {
//       name: greetInputEl.value,
//     });
//   }
// }

var app: Engine | null = null;
window.addEventListener("DOMContentLoaded", () => {
  switch(window.location.pathname) {
    case '/demo':
      app = new DemoRenderer();
      app.start();
      break;
    case '/test':
      app = new MeshTest();
      app.start();
      break;
    case '/':
    default:
      app = new GameEngine();
      app.start();
      break;
  }
});