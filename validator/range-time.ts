class RangeTime {
  private time: number;

  constructor() {
    this.time = Date.now();
  }

  resetTime(timeMs: number | string) {
    this.time = new Date(timeMs).getTime();
  }

  getTimeRange(spaceMs: number): {
    startTime: string;
    endTime: string;
  } {
    return {
      startTime: this.time.toString(),
      endTime: new Date(this.time + spaceMs).getTime().toString(),
    };
  }

  getTime(): number {
    return this.time;
  }
}

export default RangeTime;
