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

// Add svg map at correct size
var sfsvg = svg.append("image")
          .attr("width", width)
          .attr("height", height)
          .attr("xlink:href", "sf-map.svg");
          

//END MAP SETUP

var info = d3.select("body").append("div")
    .attr("id", "info");

//BEGIN DATA IMPORT

var displayData = {};
var data = {};
//user quiers stored here?
var queries;

var pointOneLoc;
var pointTwoLoc;
var currScale = 1;
var g = svg.append('g');
var marks;

var zoom = d3.behavior.zoom()
	.on("zoom", function() {
		currScale = d3.event.scale;
		g.attr("transform", "translate("+
			d3.event.translate.join(",")+")scale("+d3.event.scale+")");
		sfsvg.attr("transform", "translate("+
			d3.event.translate.join(",")+")scale("+d3.event.scale+")");
		points.attr("transform", "translate("+
			d3.event.translate.join(",")+")scale("+d3.event.scale+")");
		console.log(d3.event.translate);
	});


var dragOne = d3.behavior.drag()
	.on("drag", function(d, i){
		d.x += d3.event.dx*currScale;
		d.y += d3.event.dy*currScale;
		d3.select(this).attr("transform", function(d, i){
			return "translate(" + [ d.x,d.y ] + ")scale("+currScale+")";
		});
		pointOneLoc = projection.invert([d.x*currScale, d.y*currScale]);
		query();
	});

var dragTwo = d3.behavior.drag()
	.on("drag", function(d, i){
		d.x += d3.event.dx*currScale;
		d.y += d3.event.dy*currScale;
		d3.select(this).attr("transform", function(d, i){
			return "translate(" + [ d.x,d.y ] + ")scale("+currScale+")";
		});
		pointTwoLoc = projection.invert([d.x*currScale, d.y*currScale]);
		query();
		//filterFromPoint(this.point, 1);
		//get function 
	});	

var pointOne = svg.append("circle")
	.attr("class", 'point')
	.attr("r", 10)
	.data([{"x": 0, "y":0}])
	.call(dragOne)

var pointTwo = svg.append("circle")
	.attr("class", 'point')
	.attr("r", 10)
	.data([{"x": 0, "y":0}])
	.call(dragTwo)

var points = svg.selectAll('circle');

var label = function(d){
	info.html("Category: " + d.Category + "<br>Date: " + d.Date + "<br>Day: " + d.DayOfWeek + "<br>Location: " + d.Location);
}

var removeElements = function(toRemove){
	for(var i = toRemove.length-1; i >=0; i--){
		displayData.splice(toRemove[i], 1);
	}	
}

//test
var filterFromPoint = function(point, radius){
	if(!point || !radius) return;

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
	if(!attr || !val) return;
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
	marks = g.selectAll(".mark")
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

	filterFromPoint(pointOneLoc, 1);
	filterFromPoint(pointTwoLoc, 1);
/*	for(var i = 0; i < queries.length; i++){

	}*/
}


d3.json('scpd_incidents.json', function(error, scpd_incidents){
	if(error) throw error;	
	data = scpd_incidents.data;


	displayData = data.slice();

	update();

	var Categories = ['NON-CRIMINAL','LARCENY/THEFT','DRUG/NARCOTIC','VEHICLE THEFT','STOLEN TRUCK','BATTERY','BURGLARY','OTHER OFFENSES','ROBBERY','VANDALISM','PROBATION VIOLATION','ASSAULT','MISSING PERSON','FRAUD','STOLEN PROPERTY','WARRANTS','PROSTITUTION','WEAPON LAWS','LIQUOR LAWS','SUSPICIOUS OCC','SECONDARY CODES','SEX OFFENSES, FORCIBLE','SEX OFFENSES, NON FORCIBLE','DRUNKENNESS','TRESPASS','ARSON','DISORDERLY CONDUCT','KIDNAPPING','RUNAWAY','LOITERING','EMBEZZLEMENT','FORGERY/COUNTERFEITING','GAMBLING','DRIVING UNDER THE INFLUENCE','BRIBERY','SUICIDE','EXTORTION','FAMILY OFFENSES'];
	svg.call(zoom)
	    .on("mousedown.zoom", null)
    	.on("touchstart.zoom", null)
    	.on("touchmove.zoom", null)
    	.on("touchend.zoom", null);


	//filterByAttr('Category', 'NON-CRIMINAL');
//	filterFromPoint([-122.458220811697,37.7633123961354], 1);
});





