export namespace LogEmitter {
  export interface IEvent {
    event: string;
    date: Date;
  }

  export class Event implements IEvent {
    event: string;
    date: Date;

    constructor(event: string, date: Date) {
      this.event = event;
      this.date = date;
    };
  }
}
