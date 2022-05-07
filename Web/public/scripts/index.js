
function epochToJsDate(epochTime){
    return new Date(epochTime*1000);
  }
  

  function epochToDateTime(epochTime){
    var epochDate = new Date(epochToJsDate(epochTime));
    var dateTime = epochDate.getFullYear() + "/" +
      ("00" + (epochDate.getMonth() + 1)).slice(-2) + "/" +
      ("00" + epochDate.getDate()).slice(-2) + " " +
      ("00" + epochDate.getHours()).slice(-2) + ":" +
      ("00" + epochDate.getMinutes()).slice(-2) + ":" +
      ("00" + epochDate.getSeconds()).slice(-2);
  
    return dateTime;
  }
  
 
  function plotValues(chart, timestamp, value){
    var x = epochToJsDate(timestamp).getTime();
    var y = Number (value);
    if(chart.series[0].data.length > 40) {
      chart.series[0].addPoint([x, y], true, true, true);
    } else {
      chart.series[0].addPoint([x, y], true, false, true);
    }
  }
  

  const loginElement = document.querySelector('#login-form');
  const contentElement = document.querySelector("#content-sign-in");
  const userDetailsElement = document.querySelector('#user-details');
  const authBarElement = document.querySelector('#authentication-bar');
  const deleteButtonElement = document.getElementById('delete-button');
  const deleteModalElement = document.getElementById('delete-modal');
  const deleteDataFormElement = document.querySelector('#delete-data-form');
  const viewDataButtonElement = document.getElementById('view-data-button');
  const hideDataButtonElement = document.getElementById('hide-data-button');
  const tableContainerElement = document.querySelector('#table-container');
  const chartsRangeInputElement = document.getElementById('charts-range');
  const loadDataButtonElement = document.getElementById('load-data');
  const cardsCheckboxElement = document.querySelector('input[name=cards-checkbox]');
  const gaugesCheckboxElement = document.querySelector('input[name=gauges-checkbox]');
  const chartsCheckboxElement = document.querySelector('input[name=charts-checkbox]');
  
 
  const cardsReadingsElement = document.querySelector("#cards-div");
  const gaugesReadingsElement = document.querySelector("#gauges-div");
  const chartsDivElement = document.querySelector('#charts-div');
  const tempElement = document.getElementById("temp");
  const humElement = document.getElementById("hum");
  const presElement = document.getElementById("pres");
  const updateElement = document.getElementById("lastUpdate")
  

  const setupUI = (user) => {
    if (user) {
      
      loginElement.style.display = 'none';
      contentElement.style.display = 'block';
      authBarElement.style.display ='block';
      userDetailsElement.style.display ='block';
      userDetailsElement.innerHTML = user.email;

      var uid = user.uid;
      console.log(uid);
  
     
      var dbPath = 'UsersData/' + uid.toString() + '/readings';
      var chartPath = 'UsersData/' + uid.toString() + '/charts/range';
  
      
      var dbRef = firebase.database().ref(dbPath);
      var chartRef = firebase.database().ref(chartPath);
  

      var chartRange = 0;
      
      chartRef.on('value', snapshot =>{
        chartRange = Number(snapshot.val());
        console.log(chartRange);
       
        chartH.destroy();
        chartP.destroy();
       
        chartT = createTemperatureChart();
        chartH = createHumidityChart();
        chartP = createPressureChart();

        dbRef.orderByKey().limitToLast(chartRange).on('child_added', snapshot =>{
          var jsonData = snapshot.toJSON(); 
          var temperature = jsonData.temperature;
          var humidity = jsonData.humidity;
          var pressure = jsonData.pressure;
          var timestamp = jsonData.timestamp;
         
          plotValues(chartT, timestamp, temperature);
          plotValues(chartH, timestamp, humidity);
          plotValues(chartP, timestamp, pressure);
        });
      });
  

      chartsRangeInputElement.onchange = () =>{
        chartRef.set(chartsRangeInputElement.value);
      };
  
      
      cardsCheckboxElement.addEventListener('change', (e) =>{
        if (cardsCheckboxElement.checked) {
          cardsReadingsElement.style.display = 'block';
        }
        else{
          cardsReadingsElement.style.display = 'none';
        }
      });

      gaugesCheckboxElement.addEventListener('change', (e) =>{
        if (gaugesCheckboxElement.checked) {
          gaugesReadingsElement.style.display = 'block';
        }
        else{
          gaugesReadingsElement.style.display = 'none';
        }
      });
     
      chartsCheckboxElement.addEventListener('change', (e) =>{
        if (chartsCheckboxElement.checked) {
          chartsDivElement.style.display = 'block';
        }
        else{
          chartsDivElement.style.display = 'none';
        }
      });
  
     
      dbRef.orderByKey().limitToLast(1).on('child_added', snapshot =>{
        var jsonData = snapshot.toJSON(); 
        var temperature = jsonData.temperature;
        var humidity = jsonData.humidity;
        var pressure = jsonData.pressure;
        var timestamp = jsonData.timestamp;
      
        tempElement.innerHTML = temperature;
        humElement.innerHTML = humidity;
        presElement.innerHTML = pressure;
        updateElement.innerHTML = epochToDateTime(timestamp);
      });
  
    

      dbRef.orderByKey().limitToLast(1).on('child_added', snapshot =>{
        var jsonData = snapshot.toJSON(); 
        var temperature = jsonData.temperature;
        var humidity = jsonData.humidity;
        var pressure = jsonData.pressure;
        var timestamp = jsonData.timestamp;

        var gaugeT = createTemperatureGauge();
        var gaugeH = createHumidityGauge();
        gaugeT.draw();
        gaugeH.draw();
        gaugeT.value = temperature;
        gaugeH.value = humidity;
        updateElement.innerHTML = epochToDateTime(timestamp);
      });
  
     
      deleteButtonElement.addEventListener('click', e =>{
        console.log("Remove data");
        e.preventDefault;
        deleteModalElement.style.display="block";
      });
  
      
      deleteDataFormElement.addEventListener('submit', (e) => {

        dbRef.remove();
      });
  

      var lastReadingTimestamp; 
     
      function createTable(){

        var firstRun = true;
        dbRef.orderByKey().limitToLast(100).on('child_added', function(snapshot) {
          if (snapshot.exists()) {
            var jsonData = snapshot.toJSON();
            console.log(jsonData);
            var temperature = jsonData.temperature;
            var humidity = jsonData.humidity;
            var pressure = jsonData.pressure;
            var timestamp = jsonData.timestamp;
            var content = '';
            content += '<tr>';
            content += '<td>' + epochToDateTime(timestamp) + '</td>';
            content += '<td>' + temperature + '</td>';
            content += '<td>' + humidity + '</td>';
            content += '<td>' + pressure + '</td>';
            content += '</tr>';
            $('#tbody').prepend(content);
            
            if (firstRun){
              lastReadingTimestamp = timestamp;
              firstRun=false;
              console.log(lastReadingTimestamp);
            }
          }
        });
      };
  
      
      function appendToTable(){
        var dataList = []; 
        var reversedList = []; 
        console.log("APEND");
        dbRef.orderByKey().limitToLast(100).endAt(lastReadingTimestamp).once('value', function(snapshot) {
 
          if (snapshot.exists()) {
            snapshot.forEach(element => {
              var jsonData = element.toJSON();
              dataList.push(jsonData);
            });
            lastReadingTimestamp = dataList[0].timestamp; 
            reversedList = dataList.reverse(); 
  
            var firstTime = true;

            reversedList.forEach(element =>{
              if (firstTime){ 
                firstTime = false;
              }
              else{
                var temperature = element.temperature;
                var humidity = element.humidity;
                var pressure = element.pressure;
                var timestamp = element.timestamp;
                var content = '';
                content += '<tr>';
                content += '<td>' + epochToDateTime(timestamp) + '</td>';
                content += '<td>' + temperature + '</td>';
                content += '<td>' + humidity + '</td>';
                content += '<td>' + pressure + '</td>';
                content += '</tr>';
                $('#tbody').append(content);
              }
            });
          }
        });
      }
  
      viewDataButtonElement.addEventListener('click', (e) =>{

        tableContainerElement.style.display = 'block';
        viewDataButtonElement.style.display ='none';
        hideDataButtonElement.style.display ='inline-block';
        loadDataButtonElement.style.display = 'inline-block'
        createTable();
      });
  
      loadDataButtonElement.addEventListener('click', (e) => {
        appendToTable();
      });
  
      hideDataButtonElement.addEventListener('click', (e) => {
        tableContainerElement.style.display = 'none';
        viewDataButtonElement.style.display = 'inline-block';
        hideDataButtonElement.style.display = 'none';
      });
  

    } else{

      loginElement.style.display = 'block';
      authBarElement.style.display ='none';
      userDetailsElement.style.display ='none';
      contentElement.style.display = 'none';
    }
  }