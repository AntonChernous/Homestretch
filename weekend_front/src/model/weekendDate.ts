//Выходная дата
export default class weekendDate{
    wkDate: Date;
    isWeekend: boolean;

    constructor(wkDate: Date, isWeekend: boolean){
        this.wkDate = wkDate;
        this.isWeekend = isWeekend;
    }
}