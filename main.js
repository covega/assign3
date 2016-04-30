//CONSTS
var EARTH_RADIUS_MILES = 3959;

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


//END MAP SETUP

var info = d3.select("body").append("div")
    .attr("id", "info");

//BEGIN DATA IMPORT

var displayData = {};
var data = {};

/*START draggables*/


/*END draggables*/


var g = svg.append('g');
var marks;

var drag = d3.behavior.drag()
	.on("drag", function(d, i){
		d.x += d3.event.dx;
		d.y += d3.event.dy;
		d3.select(this).attr("transform", function(d, i){
			return "translate(" + [ d.x,d.y ] + ")";
		});
		var point = projection.invert([d.x, d.y]);
		query({});
		filterFromPoint(point, 1);
		//get function 
	});

var pointOne = svg.append("circle")
	.attr("class", 'point')
	.attr("r", 10)
	.data([{"x": 0, "y":0}])
	.call(drag);

var pointTwo = svg.append("circle")
	.attr("class", 'point')
	.attr("r", 10)
	.data([{"x": 0, "y":0}])
	.call(drag);

var svg = g;

var label = function(d){
	info.html("Category: " + d.Category + "<br>Date: " + d.Date + "<br>Day: " + d.DayOfWeek + "<br>Location: " + d.Location);
}

/*on adding/removing data

Users will have queries selected
We have to add and remove from the entire data set each time


*/

var removeElements = function(toRemove){
	for(var i = toRemove.length-1; i >=0; i--){
		displayData.splice(toRemove[i], 1);
	}	
}

//test
var filterFromPoint = function(point, radius){
	var toRemove = [];
	//this is selecting the right data points
	for(var i = 0; i < displayData.length; i++){
		if(d3.geo.distance(point, displayData[i].Location) * EARTH_RADIUS_MILES > radius){
			toRemove.push(i);
		}	
	}

	removeElements(toRemove);
	
	update();
}

var filterByAttr = function(attr, val){
	var toRemove = [];

	for(var i = 0; i < displayData.length; i++){
		if(displayData[attr] !== val){
			toRemove.push(i);
		}
	}	

	removeElements(toRemove);

	update();	
}

var update = function(){	
	marks = svg.selectAll(".mark")
		.data(displayData,function(d){ return d.IncidentNumber; });

	marks.exit().remove();

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
		.on("mouseout", function() {info.html(""); });
}


var query = function(){

	displayData = data.slice();

/*	for(var i = 0; i < queries.length; i++){

	}*/
}


d3.json('scpd_incidents.json', function(error, scpd_incidents){
	if(error) throw error;	
	data = scpd_incidents.data;

	console.log(data);
	displayData = data.slice();

	update();

	var Categories = ['NON-CRIMINAL','LARCENY/THEFT','DRUG/NARCOTIC','VEHICLE THEFT','STOLEN TRUCK','BATTERY','BURGLARY','OTHER OFFENSES','ROBBERY','VANDALISM','PROBATION VIOLATION','ASSAULT','MISSING PERSON','FRAUD','STOLEN PROPERTY','WARRANTS','PROSTITUTION','WEAPON LAWS','LIQUOR LAWS','SUSPICIOUS OCC','SECONDARY CODES','SEX OFFENSES, FORCIBLE','SEX OFFENSES, NON FORCIBLE','DRUNKENNESS','TRESPASS','ARSON','DISORDERLY CONDUCT','KIDNAPPING','RUNAWAY','LOITERING','EMBEZZLEMENT','FORGERY/COUNTERFEITING','GAMBLING','DRIVING UNDER THE INFLUENCE','BRIBERY','SUICIDE','EXTORTION','FAMILY OFFENSES'];

	//filterByAttr('Category', 'NON-CRIMINAL');
//	filterFromPoint([-122.458220811697,37.7633123961354], 1);
});



