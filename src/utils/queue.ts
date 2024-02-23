/* eslint-disable @typescript-eslint/brace-style */
export interface IQueue<T> {
    enqueue(item: T): void;
    dequeue(): T | undefined;
    size(): number;
    clear(): void;
}

export class Queue<T> implements IQueue<T> {
    private container: T[] = [];

    constructor(private capacity: number = Infinity) { }
    
    public enqueue(item: T): void {
        if (this.size() === this.capacity)
            throw Error("Queue has reached max capacity!");
        this.container.push(item);
    }

    public dequeue(): T {
        return this.container.shift();
    }

    public size(): number {
        return this.container.length;
    }

    clear(): void {
        this.container = [];
    }
}