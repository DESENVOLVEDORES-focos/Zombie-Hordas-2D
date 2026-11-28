import type { Action } from "../config/controls";

/** Entrada: teclado (por ações reconfiguráveis) e mouse. */
export class Input {
  private keys = new Set<string>();
  private pressed = new Set<string>();
  bindings: Record<Action, string>;
  mouseX = 0;
  mouseY = 0;
  mouseDown = false;
  mousePressed = false;
  rightPressed = false;
  wheel = 0;
  private canvas: HTMLCanvasElement | null = null;

  constructor(bindings: Record<Action, string>) {
    this.bindings = bindings;
  }

  /** simulação programática de teclas (testes / futuras entradas remotas) */
  keyDown(code: string) {
    this.keys.add(code);
    this.pressed.add(code);
  }
  keyUp(code: string) {
    this.keys.delete(code);
  }

  isDown(a: Action) {
    return this.keys.has(this.bindings[a]);
  }
  wasPressed(a: Action) {
    return this.pressed.has(this.bindings[a]);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return; // não intercepta atalhos do navegador
    if (e.repeat) {
      if (this.isGameKey(e.code)) e.preventDefault();
      return;
    }
    this.keys.add(e.code);
    this.pressed.add(e.code);
    if (this.isGameKey(e.code)) e.preventDefault();
  };
  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };
  private isGameKey(code: string) {
    return Object.values(this.bindings).includes(code) || code === "Space" || code.startsWith("Arrow");
  }
  private onBlur = () => {
    this.keys.clear();
    this.mouseDown = false;
  };
  private updateMouse(e: MouseEvent) {
    const c = this.canvas;
    if (!c) return;
    const r = c.getBoundingClientRect();
    this.mouseX = ((e.clientX - r.left) * c.width) / Math.max(1, r.width);
    this.mouseY = ((e.clientY - r.top) * c.height) / Math.max(1, r.height);
  }
  private onMouseMove = (e: MouseEvent) => this.updateMouse(e);
  private onMouseDown = (e: MouseEvent) => {
    this.updateMouse(e);
    if (e.button === 0) {
      this.mouseDown = true;
      this.mousePressed = true;
    } else if (e.button === 2) {
      this.rightPressed = true;
    }
  };
  private onMouseUp = (e: MouseEvent) => {
    if (e.button === 0) this.mouseDown = false;
  };
  private onWheel = (e: WheelEvent) => {
    this.wheel += Math.sign(e.deltaY);
    e.preventDefault();
  };
  private onContext = (e: Event) => e.preventDefault();

  attach(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onBlur);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("mousemove", this.onMouseMove);
    canvas.addEventListener("mousedown", this.onMouseDown);
    canvas.addEventListener("wheel", this.onWheel, { passive: false });
    canvas.addEventListener("contextmenu", this.onContext);
  }

  detach() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onBlur);
    window.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("mousemove", this.onMouseMove);
    if (this.canvas) {
      this.canvas.removeEventListener("mousedown", this.onMouseDown);
      this.canvas.removeEventListener("wheel", this.onWheel);
      this.canvas.removeEventListener("contextmenu", this.onContext);
    }
    this.canvas = null;
  }

  /** limpa eventos de "pressionou neste frame" */
  endStep() {
    this.pressed.clear();
    this.mousePressed = false;
    this.rightPressed = false;
    this.wheel = 0;
  }
}
