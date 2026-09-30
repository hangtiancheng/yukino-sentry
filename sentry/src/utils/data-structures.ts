import { MAX_BREADCRUMBS } from "../constants";

/** Bounded FIFO buffer that keeps the most recent `capacity` items. */
export class BoundedList<T> {
  public capacity: number;
  private items: T[] = [];

  constructor(capacity = MAX_BREADCRUMBS) {
    this.capacity = capacity;
  }

  push(item: T): void {
    this.items.push(item);
    if (this.items.length > this.capacity) {
      this.items.splice(0, this.items.length - this.capacity);
    }
  }

  dump(): T[] {
    return [...this.items];
  }

  clear(): void {
    this.items = [];
  }
}

/** Insertion-ordered set that evicts its oldest entry once over capacity. */
export class BoundedSet<T> {
  private map = new Map<T, true>();
  private readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  has(value: T): boolean {
    return this.map.has(value);
  }

  add(value: T): void {
    if (this.map.has(value)) {
      this.map.delete(value);
    }
    this.map.set(value, true);
    if (this.map.size > this.capacity) {
      const oldest = this.map.keys().next().value;
      if (oldest !== undefined) this.map.delete(oldest);
    }
  }

  clear(): void {
    this.map.clear();
  }
}
