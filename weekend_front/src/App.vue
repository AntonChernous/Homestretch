<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      Праздничные дни

      <v-spacer></v-spacer>

      <v-progress-linear
        :active="loading"
        :indeterminate="loading"
        absolute
        bottom
        color="deep-purple accent-4"
        height="8"
      ></v-progress-linear>
    </v-app-bar>

    <v-content>
      <v-container>
        <v-row justify="center">
          <v-col cols="10" xl="7">
            <v-row>
              <v-col class="elevation-7">
                <weekend-calendar :weekend-calendar-prop="weekendCalendarProp" @updateData="updateDataOnCalendar" />
              </v-col>
            </v-row>
            <v-row justify="end">
              <v-col cols="2">
                <br/>
                <v-btn small @click="reset()">RESET</v-btn>
                <v-btn small color="primary" @click="save()">SAVE</v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import axios from 'axios';
import moment from 'moment';
import WeekendCalendar from './components/WeekendCalendar.vue';
import weekendDate from './model/weekendDate';
import WeekendCalendarProp from './model/WeekendCalendarProp';

@Component({
  components: {
    WeekendCalendar
  }
})
export default class App extends Vue{
  //Выходные дни
  private wkDates: weekendDate[] = [];

  private weekendCalendarProp: WeekendCalendarProp = new WeekendCalendarProp();

  private loading: boolean = false;

  constructor(){
    super();

    //Устанавливаем 3 месяца
    let curMonth: Date = new Date();
    this.weekendCalendarProp.selectMonths[0] = curMonth;
    
    curMonth = new Date(curMonth);
    curMonth.setMonth(curMonth.getMonth() + 1, 1);
    this.weekendCalendarProp.selectMonths[1] = curMonth;

    curMonth = new Date(curMonth);
    curMonth.setMonth(curMonth.getMonth() + 1, 1);
    this.weekendCalendarProp.selectMonths[2] = curMonth;
  }

  mounted(){
    this.getData();
  }

  //Получить данные от сервера
  private getData(): void{
    this.loading = true;

    this.fetchData()
        .then(response => {
            //Добавляем(а не обнуляем) данные о праздниках в this.wkDates и this.weekendCalendarProp.wkCalendarDates
            //для кеширования при переходе между кварталами

            let objects: object[] = response.data;
            for(const obj of objects){
              this.weekendCalendarProp.wkCalendarDates.push(obj as any);

              let wk: weekendDate = new weekendDate(obj as Date, true);
              this.wkDates.push(wk);
            }
        })
        .catch(e => console.log(e))
        .finally(() => (this.loading = false));

    return;
  }

  //Получить данные пользователей через API сервера
  private fetchData(){
    let monthParam: string = "";
    
    for(let m of this.weekendCalendarProp.selectMonths){
      let parsedDate = moment(m);
      
      if(monthParam != "")monthParam += ","
      monthParam += parsedDate.format("YYYY-MM");
    }

    return axios.get("http://localhost:3000/dates", {
        params: {
            months: monthParam
        }
    });
  }

  //Обновление календаря
  private updateDataOnCalendar(){
    this.getData();
  }

  //Возвращаем в исходное положение дат, которое было при первой загрузке или после последнего сохранения
  private reset(){
    this.weekendCalendarProp.wkCalendarDates = [];
    for (const wkD of this.wkDates) 
      this.weekendCalendarProp.wkCalendarDates.push(moment(wkD.wkDate).format("YYYY-MM-DD"));
    
  }

  //Сохранить
  private save(){
    //let wkDatePost: weekendDate[] = [];

    //Отмечаем в this.wkDates дни, которые уже не праздничные
    for (const wkD of this.wkDates) {
      if(wkD.isWeekend){
        let wkDateString: string = moment(wkD.wkDate).format("YYYY-MM-DD");
        if(!this.weekendCalendarProp.wkCalendarDates.includes(wkDateString))wkD.isWeekend = false;
      }
    }

    //Добавляем в this.wkDates праздничные дни
    for (const wkDString of this.weekendCalendarProp.wkCalendarDates) {
      if(this.wkDates.findIndex((value) => {
        let valueString: string = moment(value.wkDate).format("YYYY-MM-DD");
        return wkDString === valueString;
      }) === -1){
        let wk: weekendDate = new weekendDate(new Date(wkDString), true);
        this.wkDates.push(wk);
      }
    }
    
    let wkDatesServer = [];
    for(let i of this.wkDates){
      let obj: Object = new Object({date: moment(i.wkDate).format("YYYY-MM-DD"), value: i.isWeekend});
      wkDatesServer.push(obj);
    }

    //Отправляем на сервер методом post
    this.loading = true;
    let json = JSON.stringify(wkDatesServer);
    axios.post("http://localhost:3000/dates/save", json, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
    .then(response => console.log(response.data))
    .catch(err => console.log(err))
    .finally(() => (this.loading = false));

  }


}




</script>
