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

var svg = svg.append('g')

var visualize = function(scpd_incidents){
	var circle = svg.selectAll("circle")
			.data(scpd_incidents.data)
		.enter().append("circle")
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

var radiusA = 1000;
var radiusB = 1000;

var label = function(d){
	info.html("Category: " + d.Category + "<br>Date: " + d.Date + "<br>Day: " + d.DayOfWeek + "<br>Location: " + d.Location);
}

//test
var filterRange = function(A, B){
	var toRemove = [];
	for(var i = 0; i < display_data.length; i++){
		if(d3.geo.distance(A, display_data[i]) < radiusA || d3.geo.distance(A, display_data[i]) < radiusB){
			toRemove.push(i);
		}
	}
	for(var r = 0; r < toRemove.length; r++){
		display_data.splice(r, 1);
	}
}

var update = function(){
	var circle = svg.selectAll("circle");
	circle.exit().remove();
}

d3.json('scpd_incidents.json', function(error, scpd_incidents){
	if(error) throw error;
	console.log(scpd_incidents);
	data = scpd_incidents;
	displayData = data;
	visualize(displayData);
});




