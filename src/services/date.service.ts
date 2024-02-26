export default class DateService {
    private _date = new Date();
    setDate(date?: number): DateService {
        if (date)
        {
            this._date.setDate(date);
        }
        return this;
    }
    get day() {
        return this._date.getDate().toString().padStart(2,"0");
    }

    get month() {
        return (this._date.getMonth()+1).toString().padStart(2,"0");
    }

    get year() {
        return this._date.getFullYear().toString().padStart(4,"0");
    }

    get hour() {
        return this._date.getHours().toString().padStart(2,"0");
    }

    get minutes() {
        return this._date.getMinutes().toString().padStart(2,"0");
    }

    get time() {
        return `${this.hour}:${this.minutes}`;
    }

    get date() {
        return `${this.day}.${this.month}.${this.year}`;
    }

    get dateTime() {
        return `${this.date} ${this.time}`;
    }
}