/** Pool simples de objetos: evita alocações constantes (projéteis, partículas, textos). */
export class Pool<T> {
  items: T[] = [];
  private spare: T[] = [];
  constructor(
    private create: () => T,
    private max = Infinity,
  ) {}

  /** Retorna um objeto reciclado (o chamador deve inicializar todos os campos) ou null se cheio. */
  spawn(): T | null {
    if (this.items.length >= this.max) return null;
    const o = this.spare.pop() ?? this.create();
    this.items.push(o);
    return o;
  }

  /** Remove por troca (seguro ao iterar de trás para frente). */
  removeAt(i: number) {
    const o = this.items[i];
    const last = this.items.pop()!;
    if (i < this.items.length) this.items[i] = last;
    this.spare.push(o);
  }

  clear() {
    while (this.items.length) this.spare.push(this.items.pop()!);
  }
}
