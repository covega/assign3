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

//BEGIN DATA IMPORT

var data = {};

var svg = svg.append('g')

var visualize = function(scpd_incidents){
	var circle = svg.selectAll("circle")
			.data(scpd_incidents.data)
		.enter().append("circle")
			.attr("class", "mark")
			.attr("r", 1)
  			.attr("transform", function(d) {
  				//console.log(d.Location);
  				//console.log(projection([d.Location[0], d.Location[1]]))
	    		return "translate(" + projection([
	      			d.Location[0], //longitude
	      			d.Location[1] //latitude
	    		]) + ")";
			});
	//console.log(circle);

	//circle.exit().remove();
}

d3.json('scpd_incidents.json', function(error, scpd_incidents){
	if(error) throw error;
	console.log(scpd_incidents);
	data = scpd_incidents;
	visualize(scpd_incidents);
});




