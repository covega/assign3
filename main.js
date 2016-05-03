//CONSTS
var EARTH_RADIUS_MILES = 3959;


var info = d3.select("#map").append("div")
    .attr("id", "info")
    .style("opacity", 0);

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
	.scaleExtent([1, 10])
	.on("zoom", function() {
		currScale = d3.event.scale;
		g.attr("transform", "translate("+
			d3.event.translate.join(",")+")scale("+d3.event.scale+")");
		sfsvg.attr("transform", "translate("+
			d3.event.translate.join(",")+")scale("+d3.event.scale+")");
		points.attr("transform", "translate("+
			d3.event.translate.join(",")+")scale("+d3.event.scale+")");
	});

var dragData = [{x: 200, y:400}, {x:400, y:400}];

var drag = d3.behavior.drag()
	.origin(function(d) {return d;})
	.on("dragstart", dragstarted)
	.on("drag", dragged)
	.on("dragend", dragended);

function dragstarted(d){
  d3.event.sourceEvent.stopPropagation();
}

function dragged(d){
	d3.select(this)
		.attr("cx", d.x = d3.event.x)
		.attr("cy", d.y = d3.event.y);
	query();	
}

function dragended(d){

}

svg.append("g")
		.attr("class", 'point')
	.selectAll("circle")
		.data(dragData)
	.enter().append("circle")
		.attr("r", 10)	
		.attr("cx", function(d) {return d.x; })
		.attr("cy", function(d) {return d.y; })
	.call(drag)


var points = svg.selectAll('.point');


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

}

var filterByTime = function(start, end){
	if(!start || !end) return;
	var toRemove = [];

	for(var i = 0; i < displayData.length; i++){
		if(displayData[attr] !== val){
			toRemove.push(i);
		}
	}	
	removeElements(toRemove);

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
		.on("mouseover", function(d) {
            info.transition()		
                .duration(200)		
                .style("opacity", .9);		
			info.html("Category: " + d.Category + "<br>Date: " + d.Date + 
				"<br>Day: " + d.DayOfWeek + "<br>Time: " + d.Time +
				"<br>Resolution: " + d.Resolution)
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
            })					
        .on("mouseout", function(d) {		
        	info.html(""); 
            info.transition()		
                .duration(500)		
                .style("opacity", 0);	
        })
}


var query = function(){

	displayData = data.slice();
	filterFromPoint(projection.invert([dragData[0].x, dragData[0].y]), sliderARadius);
	filterFromPoint(projection.invert([dragData[1].x, dragData[1].y]), sliderBRadius);
/*	for(var i = 0; i < queries.length; i++){

	}*/
	update();	
}


d3.json('scpd_incidents.json', function(error, scpd_incidents){
	if(error) throw error;	
	data = scpd_incidents.data;

	console.log(data);
	displayData = data.slice();

	query();

	//var Categories = ['NON-CRIMINAL','LARCENY/THEFT','DRUG/NARCOTIC','VEHICLE THEFT','STOLEN TRUCK','BATTERY','BURGLARY','OTHER OFFENSES','ROBBERY','VANDALISM','PROBATION VIOLATION','ASSAULT','MISSING PERSON','FRAUD','STOLEN PROPERTY','WARRANTS','PROSTITUTION','WEAPON LAWS','LIQUOR LAWS','SUSPICIOUS OCC','SECONDARY CODES','SEX OFFENSES, FORCIBLE','SEX OFFENSES, NON FORCIBLE','DRUNKENNESS','TRESPASS','ARSON','DISORDERLY CONDUCT','KIDNAPPING','RUNAWAY','LOITERING','EMBEZZLEMENT','FORGERY/COUNTERFEITING','GAMBLING','DRIVING UNDER THE INFLUENCE','BRIBERY','SUICIDE','EXTORTION','FAMILY OFFENSES'];
	svg.call(zoom)

	//filterByAttr('Category', 'NON-CRIMINAL');
//	filterFromPoint([-122.458220811697,37.7633123961354], 1);
});





