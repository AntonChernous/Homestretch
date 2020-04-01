const express = require("express");
const weekend = require("./weekendData");
  
const app = express();
// создаем парсер для данных в формате json
const jsonParser = express.json();

app.use(function(request, response, next){
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Methods', '*');
    response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    next();
});

app.get("/dates", function(request, response){
    let months = request.query.months;
    let monthsArr = months.split(",");
    weekend.ConvertToDate(monthsArr);

    weekend.GetWeekendDataAsJson(monthsArr)
        .then(function(wkData){
            response.json(wkData);
        });
});

app.post("/dates/save", jsonParser, function (request, response) {
    console.log(request.body);
    if(!request.body) return response.sendStatus(400);

    for (let i = 0; i < request.body.length; i++) request.body[i].date = new Date(request.body[i].date);
    weekend.SetWeekendData(request.body)
        .then(function(wkServerData){
            response.json(wkServerData);
        });
});
  
  
app.listen(3000);