const fs = require('fs').promises;
const moment = require('moment');
const fileName = "weekendData.json";

//Загрузить массив данных из файла json, фильтрованный по месяцам monthsArr
module.exports.GetWeekendDataAsJson = async function(monthsArr){
    try {
        let access = await fs.access(fileName, 0);
        //if(!access) return [];
    } catch (error) {
        console.log('file not found: ' + fileName);
        console.log(error);
        return [];
    }

    let data = await fs.readFile(fileName, 'utf8');
    let wkData = JSON.parse(data);
    ConvertToDate(wkData);

    //Фильтруем по месяцам
    let wkDataFiltered = wkData.filter(function(wkElem){
        return monthsArr.findIndex(function (monthElem){
            return (monthElem.getFullYear() === wkElem.getFullYear() && monthElem.getMonth() === wkElem.getMonth());
        }) != -1;
    })
    
    ConvertToStringDate(wkDataFiltered);
    return wkDataFiltered;
}

//Сохранить массив данных в файл json
module.exports.SetWeekendData = async function(wkClientData){
    //Считываем из файла серверные данные и обновляем праздничные дни
    
    //Считываем абсолютно все даты
    let data = await fs.readFile(fileName, 'utf8');
    let wkServerData = JSON.parse(data);
    ConvertToDate(wkServerData);
    let wkNewData = [];
    let retVal = [];

    //Сравниваем даты
    //Удаляем даты, которые уже не праздничные
    wkNewData = wkServerData.filter(function(wkServerElem){
        return wkClientData.findIndex(function(wkClientElem){
            return (wkClientElem.value === false && 
                    wkClientElem.date.getFullYear() === wkServerElem.getFullYear() &&
                    wkClientElem.date.getMonth() === wkServerElem.getMonth() &&
                    wkClientElem.date.getDay() === wkServerElem.getDay());
        }) === -1;
    })

    //Добавляем новые праздничные даты
    for(let wkClientElem of wkClientData)
        if (wkClientElem.value === true){
            retVal.push(wkClientElem.date);

            if(wkServerData.findIndex(function(elem){
                return (wkClientElem.date.getFullYear() === elem.getFullYear() &&
                        wkClientElem.date.getMonth() === elem.getMonth() &&
                        wkClientElem.date.getDay() === elem.getDay())
            }) === -1)
                wkNewData.push(wkClientElem.date);
        }
    
    ConvertToStringDate(wkNewData);
    let json = JSON.stringify(wkNewData);
    await fs.writeFile(fileName, json, 'utf8');

    ConvertToStringDate(retVal);
    return retVal;
}

//Конвертирует строки в даты
function ConvertToDate(strArray){
    for (let i = 0; i < strArray.length; i++) strArray[i] = new Date(strArray[i]);
}
module.exports.ConvertToDate = ConvertToDate;

//Конвертирует даты в строки
function ConvertToStringDate(datesArray){
    for (let i = 0; i < datesArray.length; i++) datesArray[i] = moment(datesArray[i]).format("YYYY-MM-DD");
}
module.exports.ConvertToStringDate = ConvertToStringDate;