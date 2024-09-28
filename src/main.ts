// import { invoke } from "@tauri-apps/api/tauri";
import { Renderer } from './game/demo';

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

var app: Renderer | null = null;
window.addEventListener("DOMContentLoaded", () => {
  app = new Renderer();
  app.start();
});