/* placeholders for plots */
var pingPlaceholder = $("#pingPlaceholder");
var ping6Placeholder = $("#ping6Placeholder");
var traceroutePlaceholder = $("#traceroutePlaceholder");
var traceroute6Placeholder = $("#traceroute6Placeholder");

/* Fix bug with fast changing of tabs */
var tabsLoading = 0;

/* ping time data object*/
function pData() {
   this.maxValues = 30;		//maximum number of shown values in plot
   this.rows = [];		//array for storing data
   this.count = 0;		//amount of data in array
   this.prevId = 0;		//id of previous ping packet

   this.sum = 0;		//sum of all values in fields
   this.minVal = 0;		//initiate min value
   this.maxVal = 0;		//initiate max value
   this.avrgVal = 0;		//initiate average value
   this.actVal = 0;		//actual value

   this.lost = 0;
   this.avrgs = [];		//array for storing average values
   this.min = [];
   this.max = [];
   //functions
   this.add = function (val) { 
      this.count++;
      
      
      if( val == null)
      {
	 this.actVal = 0;
	 this.rows.push(null);
	 this.lost++;
      }
      else
      {
	 this.actVal = val;
	 this.rows.push([this.count, val]);
	 this.sum += val;
      
	 this.avrgVal = this.sum/this.count;
	 this.minVal = (this.minVal == 0 ? val : ( val < this.minVal ? val : this.minVal));
	 this.maxVal = (this.maxVal == 0 ? val : ( val > this.maxVal ? val : this.maxVal));

	 this.min.push([this.count, this.minVal]);
	 this.max.push([this.count, this.maxVal]);
	 this.avrgs.push([this.count, this.avrgVal]);
      }
      //limit maximum data count in field
      if(this.rows.length > this.maxValues)
      {
	 this.rows.shift();  
      }
      if(this.avrgs.length > this.maxValues)
      {
	 this.avrgs.shift();
	 this.min.shift();  
	 this.max.shift();  
      }
   };
}

/* traceroute data object */
function tData() {
   this.rows = [];		//array for storing data
   this.count = 0;		//amount of data in array

   this.prevId = 0;   
   this.prevData = "";
   this.labels = [];
   //functions
   this.add = function (val, label) {
      this.rows.push( [ this.count, val == null ? this.rows[this.count-1][1] : this.count, val ] );  
      this.count++;
      this.labels.push(label);
      };
//this.average = function () { return ( Math.PI * this.radius * 2 ); };
}

var pingData = new pData();
var ping6Data = new pData();

var traceData = new tData();
var trace6Data = new tData();

/* chart data */
var optionsPing = {
      lines: { show: true},
      legend: { show: true, position: "sw", backgroundOpacity: 0.5 },
      points: { show: true },
      xaxis: { tickDecimals: 0, tickSize: 1 },
      yaxis: { min: 0}
};

var optionsTrace = {
      lines: { show: true },
      legend: { show: true, position: "sw", backgroundOpacity: 0.5 },
      points: { show: true },
      zoom: { interactive: false },
      pan: { interactive: false },
      valueLabels: { show: true },
      legend: { position: "nw" }
};

function repaintPlots() {
   var $tabs = $('#tabs').tabs();
   var selected = $tabs.tabs('option', 'selected');
   if(selected == "0")  /* ping v4 */
   {
      $.plot(pingPlaceholder, 
	    [ { data: pingData.max, label: "Max ["+ pingData.maxVal.toFixed(2) +"ms]", color: "rgba(103, 170, 238, 0.1)", lines: {show: true, fill: 0.1}, points: {show: false}, shadowSize: 0},
	      {	data: pingData.avrgs, label: "Avg ["+ pingData.avrgVal.toFixed(2) +"ms]", color: "rgba(103, 170, 238, 1)", points: {show: false}},
	      { data: pingData.min, label: "Min ["+ pingData.minVal.toFixed(2) +"ms]", color: "rgba(103, 170, 238, 0.3)", lines: {show: true, fill: 0.3}, points: {show: false}, shadowSize: 0},
	      { data: pingData.rows, label: "Curr ["+ pingData.actVal.toFixed(2) +"ms]", color: "#2779AA" }],
	    $.extend(true, {}, optionsPing, {
	       xaxis: { min: pingData.count > 10? pingData.rows[0][0] - 1 : 0, max: pingData.count > 10? pingData.count + 1 : 11}
	       }));
   }
   if(selected == "1")  /* ping v6 */
   {
      $.plot(ping6Placeholder, 
	    [  { data: ping6Data.avrgs, label: "Average [ms]", color: "#67AAEE", points: {show: false} },
	       { data: ping6Data.rows, label: "Latency [ms]", color: "#2779AA" }], 
	    $.extend(true, {}, optionsPing, {
	       xaxis: { min: pingData.count > 10? pingData.rows[0][0] - 1 : 0, max: ping6Data.count > 10? ping6Data.count + 1 : 11}
	       }));      
      /* set values for stats */
      document.getElementById("ping6Min").value = ping6Data.min + " ms";
      document.getElementById("ping6Max").value = ping6Data.max + " ms";
      document.getElementById("ping6Avrg").value = (ping6Data.count == 0 ? 0 : ping6Data.avrgs[ping6Data.avrgs.length-1][1]) + " ms";
   }
   if(selected == "2")  /* traceroute v4 */
      $.plot(traceroutePlaceholder, [{ data: traceData.rows, label: "Position", color: "#2779AA" }], $.extend(true, {}, optionsTrace, {
      xaxis: { tickDecimals: 0, tickSize: 1, min: 0, max: (traceData.rows.length + 2) > 10? (traceData.rows.length + 2) : 10 },
      }));
   if(selected == "3")  /* traceroute v6 */
      $.plot(traceroute6Placeholder, [{ data: trace6Data.rows, label: "Position", color: "#2779AA" }], $.extend(true, {}, optionsTrace, {
      xaxis: { tickDecimals: 0, tickSize: 1, min: 0, max: (trace6Data.rows.length + 2) > 10? (trace6Data.rows.length + 2) : 10 },
      }));
}

/* bind plot functions to tab changing */
$('#tabs').bind('tabsshow', function() {
   repaintPlots();
   tabsLoading = false;
});

$('#tabs').tabs({
   select: function() {
      if(tabsLoading)
	 return false;
      else
	 return (tabsLoading = true);
   }
});


function plotPing(received, type)
{
   if(received == "")
      return;
      
   var pingTime;
   var data = type == 4? pingData : ping6Data;
   
   /* update chart data */
   
   if($.client.os == "Windows") {
      if(received.indexOf("Odpoved") != -1) {
         pingTime= parseFloat(received.substr(received.indexOf("cas=")+4,received.indexOf("ms")-received.indexOf("cas=")+4));
         data.add(pingTime);
      } else if(received.indexOf("Reply") != -1) {
			var nospaces = row.replace(/\s+/g, ' ');	/* remove multiple spaces */
			var fields = nospaces.split(" ");
         pingTime = parseFloat(received.substr(received.indexOf("time=")+5));
         data.add(pingTime);
      } else if(received.indexOf("Vyprsel") != -1 || received.indexOf("neni dostupny") != -1 || received.indexOf("timed out") != -1) {
         data.add(null);
      }
   } else if($.client.os == "Linux") {
      var pingTime = parseFloat(/\d+\.{0,1}\d*\sms/i.exec(received));
      if(pingTime)
      {
	 /* check for lost packets */
	 var actPingId = parseInt((/icmp_seq=\d+/i.exec(received))[0].substr(9)); 
	 while(actPingId > ++data.prevId) 
	    data.add(null);

	 data.add(pingTime);
      }
   } 
   /*update plots*/
   repaintPlots();
}

function addTPlotDataWin(row, type)
{
   var data = type == 4? traceData : trace6Data;
   
   var nospaces = row.replace(/\s+/g, ' ');	/* remove multiple spaces */
   var fields = nospaces.split(" ");
   var step, time, label, first = 0, labelPos = 4;
   
   while(fields[first] == "" && first<fields.length-6)
      first++;
   
   if(!(step = parseInt(fields[first])))
      return;
      
   for( j = first; j < fields.length; j++)
      if(fields[j] == "ms") 
         labelPos++;
         
   time = (time = parseFloat(fields[first+1]))? time : (time = parseFloat(fields[first+2])) ? time : parseFloat(fields[first+3]);
   label = fields[first + labelPos];
   
   data.add(time, label);
}

function addTPlotDataLin(row, type)
{
   var data = type == 4? traceData : trace6Data;
   var step, time, label, first = 0;

   var nospaces = row.replace(/\s+/g, ' ');	/* remove multiple spaces */
   var fields = nospaces.split(" ");
   
   /* find first column */
   while(fields[first] == "" && first<fields.length-3)
      first++;

   var step = parseFloat(fields[first]);
   /* check for not comming packets */
   if(fields[first+1] == "*")
   {
      if(fields[first+2] != "*")
      {
	 label = fields[first+2];
	 time = parseInt(fields[first+4]);
	 data.add(time, label);
      }
      else
      {
	 if(fields[first+3] != "*")
	 {
	    label = fields[first+3];
	    time = parseInt(fields[first+4]);
	    data.add(time, label);
	 }
	 else
	 {
	    data.add(null, "");
	 }
      }
   }
   else
   {
	 label = fields[first+1];
	 time = parseInt(fields[first+3]);
	 data.add(time, label);
   }
}

/* draw plot */
function plotTraceroute(received, type)
{
   if(received == "")
      return;
      
   var data = type == 4? traceData : trace6Data;
   /* connect with previous data */
   data.prevData += received;
   /* prepare data */
   
   if($.client.os == "Windows")
   {
      var npos;
      /* divide input data into lines and add them as data */
      while((npos = data.prevData.indexOf("\n")) != -1)
      {
         addTPlotDataWin(data.prevData.substr(0, npos), type);
         data.prevData = (data.prevData.substr(npos+1));
      }
   }   
   else if($.client.os == "Linux")
   {
      var npos;
      /* divide input data into lines and add them as data */
      while((npos = data.prevData.indexOf("\n")) != -1)
      {
         addTPlotDataLin(data.prevData.substr(0, npos), type);
         data.prevData = (data.prevData.substr(npos+1));
      }
   }
   else
   {
   }

   repaintPlots();
}

function startAnim(id)
{
   document.getElementById(id+"State").style.display = 'block';//visibility = 'visible';
   document.getElementById(id+"TabClose").style.display = 'block';
}

function stopAnim(id)
{
   document.getElementById(id+"State").style.display = 'none';//visibility = 'hidden';
   document.getElementById(id+"TabClose").style.display = 'none';
}