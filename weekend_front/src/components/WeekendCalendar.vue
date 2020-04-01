<template>
    <v-container>
        <v-row no-gutters>
            <v-col>
                <v-date-picker
                    class="elevation-0"
                    v-model="weekendCalendarProp.wkCalendarDates"
                    :picker-date.sync="pickerDate1"
                    multiple
                    first-day-of-week=1
                    no-title
                    next-icon=""
                ></v-date-picker>
            </v-col>
            <v-col>
                <v-date-picker
                    class="elevation-0"
                    v-model="weekendCalendarProp.wkCalendarDates"
                    :picker-date.sync="pickerDate2"
                    multiple
                    first-day-of-week=1
                    no-title
                    next-icon=""
                    prev-icon=""
                ></v-date-picker>
            </v-col>
            <v-col>
                <v-date-picker
                    class="elevation-0"
                    v-model="weekendCalendarProp.wkCalendarDates"
                    :picker-date.sync="pickerDate3"
                    multiple
                    first-day-of-week=1
                    no-title
                    prev-icon=""
                ></v-date-picker>
            </v-col>
        </v-row>
    </v-container>
</template>


<script lang="ts">
import { Component, Prop, Vue, Watch} from 'vue-property-decorator';
import moment from 'moment';
import weekendDate from 'src/model/weekendDate';
import WeekendCalendarProp from 'src/model/WeekendCalendarProp';

@Component
export default class WeekendCalendar extends Vue{
    //Входные/выходные параметры через объект
    @Prop({required: true})
    public weekendCalendarProp!: WeekendCalendarProp;

    private pickerDate1!: string;
    private pickerDate2!: string;
    private pickerDate3!: string;

    private lastPickerDate1: string="";
    private lastPickerDate3: string="";

    constructor(){
        super();

        this.pickerDate1 = moment(this.weekendCalendarProp.selectMonths[0]).format("YYYY-MM");
        this.pickerDate2 = moment(this.weekendCalendarProp.selectMonths[1]).format("YYYY-MM");
        this.pickerDate3 = moment(this.weekendCalendarProp.selectMonths[2]).format("YYYY-MM");
    }


    @Watch('pickerDate1')
    onpickerDate1Changed(value: string, oldValue: string){
        //Предотвращаем зацикливания
        if(this.lastPickerDate1 === value)return;

        //value сдвинулся на 1 месяц влево, сдвигаем еще на 2, чтобы получился квартал
        let curMonth: Date = new Date(value);
        curMonth.setMonth(curMonth.getMonth() - 2, 1);
        this.weekendCalendarProp.selectMonths[0].setTime(curMonth.getTime());
        this.pickerDate1 = moment(curMonth).format("YYYY-MM");
        this.lastPickerDate1 = this.pickerDate1;

        curMonth.setMonth(curMonth.getMonth() + 1, 1);
        this.weekendCalendarProp.selectMonths[1].setTime(curMonth.getTime());
        this.pickerDate2 = moment(curMonth).format("YYYY-MM");

        curMonth.setMonth(curMonth.getMonth() + 1, 1);
        this.weekendCalendarProp.selectMonths[2].setTime(curMonth.getTime());
        this.pickerDate3 = moment(curMonth).format("YYYY-MM");
        this.lastPickerDate3 = this.pickerDate3;

        //Событие на обновление данных
        this.$emit('updateData');
    }
    @Watch('pickerDate3')
    onpickerDate3Changed(value: string, oldValue: string){
        //Предотвращаем зацикливания
        if(this.lastPickerDate3 === value)return;

        //value сдвинулся на 1 месяц вправо, сдвигаем еще на 2, чтобы получился квартал
        let curMonth: Date = new Date(value);
        curMonth.setMonth(curMonth.getMonth() + 2, 1);
        this.weekendCalendarProp.selectMonths[2].setTime(curMonth.getTime());
        this.pickerDate3 = moment(curMonth).format("YYYY-MM");
        this.lastPickerDate3 = this.pickerDate3;

        curMonth.setMonth(curMonth.getMonth() - 1, 1);
        this.weekendCalendarProp.selectMonths[1].setTime(curMonth.getTime());
        this.pickerDate2 = moment(curMonth).format("YYYY-MM");

        curMonth.setMonth(curMonth.getMonth() - 1, 1);
        this.weekendCalendarProp.selectMonths[0].setTime(curMonth.getTime());
        this.pickerDate1 = moment(curMonth).format("YYYY-MM");
        this.lastPickerDate1 = this.pickerDate1;

        //Событие на обновление данных
        this.$emit('updateData');
    }

}


</script>