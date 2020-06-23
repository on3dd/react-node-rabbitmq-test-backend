export namespace LogEmitter {
  export interface IEvent {
    event: string;
    date: Date;
    priority: number;
  }

  export class Event implements IEvent {
    event: string;
    date: Date;
    priority: number;

    constructor(event: string, date: Date, priority: number) {
      this.event = event;
      this.date = date;
      this.priority = priority;
    }
  }
}
