//BEGIN MAP SETUP


// Set up size
var width = 750,
	height = width;

// Set up projection that map is using
var projection = d3.geo.mercator()
	.center([-122.433701, 37.767683]) // San Francisco, roughly
	.scale(225000)
	.translate([width / 2, height / 2]);
// This is the mapping between <longitude, latitude> position to <x, y> pixel position on the map
// projection([lon, lat]) returns [x, y]

// Add an svg element to the DOM
var svg = d3.select("#map").append("svg")
	.attr("width", width)
	.attr("height", height);

// Add svg map at correct size, assumes map is saved in a subdirectory called "data"
svg.append("image")
          .attr("width", width)
          .attr("height", height)
          .attr("xlink:href", "sf-map.svg");

var info = d3.select("body").append("div")
    .attr("id", "info");
//END MAP SETUP

//BEGIN DATA IMPORT

var displayData = {};
var data = {};



var drag = d3.behavior.drag()
	.on("drag", function(d, i){
		d.x += d3.event.dx;
		d.y += d3.event.dy;
		d3.select(this).attr("transform", function(d, i){
			return "translate(" + [ d.x,d.y ] + ")";
		});
		//get function 
	});

var pointOne = svg.append("circle")
	.attr("class", '.point')
	.attr("r", 10)
	.data([{"x": 0, "y":0}])
	.call(drag)

var svg = svg.append('g')



var pointTwo;
var visualize = function(scpd_incidents){
	var marks = svg.selectAll(".mark")
		.data(scpd_incidents, function(d){ return d.id; });
	marks.enter().append("circle")
		.attr("class", "mark")
		.attr("r", 2)			
			.attr("transform", function(d) {
    		return "translate(" + projection([
      			d.Location[0], //longitude
      			d.Location[1] //latitude
    		]) + ")";
		})
		.on("mouseover", label)
			//.on("mouseout", function() {info.html(""); });
			//TODO: uncomment for mouseout
}


var label = function(d){
	info.html("Category: " + d.Category + "<br>Date: " + d.Date + "<br>Day: " + d.DayOfWeek + "<br>Location: " + d.Location);
}

//test
var filterFromPoint = function(point, radius){
	var toRemove = [];
	for(var i = 0; i < displayData.length; i++){
		if(d3.geo.distance(point, displayData[i].Location) * 3959 > radius){
			toRemove.push(i);
			//console.log(displayData[i]);
			//console.log(d3.geo.distance(point, displayData[i].Location) *3959888);
		}	
	}

	for(var r = toRemove.length - 1; r >= 0; r--){
		displayData.splice(toRemove[r], 1);
	}

	console.log(toRemove.length);
	for(var x = 0; x < toRemove.length; x++){
		for(var y = 0; y < displayData.length; y++){
			if(data[toRemove[x]] === displayData[y]){
				//console.log(d3.geo.distance(point, displayData[y].Location) * 3959);
				console.log('np');
			}
		}
	}

	update();
}

var filterByAttr = function(attr, val){
	var toRemove = [];
	for(var i = 0; i < displayData.length; i++){
		if(displayData[i][attr] == val){
			toRemove.push(i);
		}	
	}

	for(var r = toRemove.length - 1; r >= 0; r--){		
		displayData.splice(toRemove[r], 1);
	}	

	update();	
}

var update = function(){
	var marks = svg.selectAll(".mark").data(displayData);
	marks.exit().remove();
}


d3.json('scpd_incidents.json', function(error, scpd_incidents){
	if(error) throw error;	
	data = scpd_incidents.data;
	//data.splice(10, data.length - 10);
	for(var i = 0; i < data.length; i++){
		data[i].id = '' + i;
		//console.log(data[i].id);
	}
	displayData = data;
	//console.log(displayData);	
	visualize(displayData);	

	var Categories = ['NON-CRIMINAL','LARCENY/THEFT','DRUG/NARCOTIC','VEHICLE THEFT','STOLEN TRUCK','BATTERY','BURGLARY','OTHER OFFENSES','ROBBERY','VANDALISM','PROBATION VIOLATION','ASSAULT','MISSING PERSON','FRAUD','STOLEN PROPERTY','WARRANTS','PROSTITUTION','WEAPON LAWS','LIQUOR LAWS','SUSPICIOUS OCC','SECONDARY CODES','SEX OFFENSES, FORCIBLE','SEX OFFENSES, NON FORCIBLE','DRUNKENNESS','TRESPASS','ARSON','DISORDERLY CONDUCT','KIDNAPPING','RUNAWAY','LOITERING','EMBEZZLEMENT','FORGERY/COUNTERFEITING','GAMBLING','DRIVING UNDER THE INFLUENCE','BRIBERY','SUICIDE','EXTORTION','FAMILY OFFENSES'];

	//filterByAttr('Category', 'NON-CRIMINAL');
//	filterFromPoint([-122.458220811697,37.7633123961354], 1);
});



