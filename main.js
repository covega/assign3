
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

//TODO: this doesn't seem responsive
// Add an svg element to the DOM
var svg = d3.select("#map").append("svg")
	//.attr("width", width)
	//.attr("height", height);
	.attr("preserveAspectRatio", "xMidYMid")
  	.attr("viewBox", "0 0 " + width + " " + height);

// Add svg map at correct size
var sfsvg = svg.append("image")
          .attr("width", width)
          .attr("height", height)
          .attr("xlink:href", "sf-map.svg");
          

//END MAP SETUP



//BEGIN DATA IMPORT

var displayData = {};
var data = {};
var category_groups = {};
var resolution_groups = {};
//user quiers stored here?
var queries;

var pointOneLoc;
var pointTwoLoc;
var currScale = 1;
var g = svg.append('g');
var marks;

// var zoom = d3.behavior.zoom()
// 	.scaleExtent([1, 10])
// 	.on("zoom", function() {
// 		currScale = d3.event.scale;
// 		g.attr("transform", "translate("+
// 			d3.event.translate.join(",")+")scale("+d3.event.scale+")");
// 		sfsvg.attr("transform", "translate("+
// 			d3.event.translate.join(",")+")scale("+d3.event.scale+")");
// 		points.attr("transform", "translate("+
// 			d3.event.translate.join(",")+")scale("+d3.event.scale+")");
// 		outlines.attr("transform", "translate("+
// 			d3.event.translate.join(",")+")scale("+d3.event.scale+")");
// 	});

var zoom = d3.behavior.zoom()
	.scaleExtent([1, 10])
	.on("zoom", zoomer)

// LIMITS PANNING
function zoomer() {
  var t = d3.event.translate,
      s = d3.event.scale;
  t[0] = Math.min(0, Math.max(-width*s + width, t[0]));
  t[1] = Math.min(0, Math.max(-height*s + height, t[1]));
  zoom.translate(t);
  g.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");
  sfsvg.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");
  points.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");
  outlines.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");
}


var dragDataA = [{x: 200, y:400}];
var dragDataRadiusA = [{x: 200, y:400}];
var dragDataB = [{x:400, y:400}];
var dragDataRadiusB = [{x:400, y:400}];


var dragA = d3.behavior.drag()
	.origin(function(d) {return d;})
	.on("dragstart", dragstarted)
	.on("drag", draggedA)

var dragB = d3.behavior.drag()
	.origin(function(d) {return d;})
	.on("dragstart", dragstarted)
	.on("drag", draggedB)

function dragstarted(d){
  d3.event.sourceEvent.stopPropagation();
}

function draggedA(d){
	d3.select(this)
		.attr("cx", d.x = d3.event.x)
		.attr("cy", d.y = d3.event.y);
	dragDataRadiusA[0].x = d3.event.x;
	dragDataRadiusA[0].y = d3.event.y;		
	var out = d3.select(".outline.A").select("circle")
		.attr("cx", function(d) {return dragDataRadiusA[0].x; })
		.attr("cy", function(d) {return dragDataRadiusA[0].y; })	
	query();	
}

function draggedB(d){
	d3.select(this)
		.attr("cx", d.x = d3.event.x)
		.attr("cy", d.y = d3.event.y);
	dragDataRadiusB[0].x = d3.event.x;
	dragDataRadiusB[0].y = d3.event.y;		
	var out = d3.select(".outline.B").select("circle")
		.attr("cx", function(d) {return dragDataRadiusB[0].x; })
		.attr("cy", function(d) {return dragDataRadiusB[0].y; })	
	query();	
}

//outline of
svg.append("g")
		.attr("class", "outline A")
	.selectAll("circle")
		.data(dragDataRadiusA)
	.enter().append("circle")
		.attr("r", function(d){
			return sliderARadius*10;
		})
		.attr("cx", function(d) {return dragDataRadiusA[0].x; })
		.attr("cy", function(d) {return dragDataRadiusA[0].y; })	


svg.append("g")
		.attr("class", "outline B")
	.selectAll("circle")
		.data(dragDataRadiusB)
	.enter().append("circle")
		.attr("r", function(d){
			return sliderBRadius*10;
		})
		.attr("cx", function(d) {return dragDataRadiusB[0].x; })
		.attr("cy", function(d) {return dragDataRadiusB[0].y; })

//draggables
svg.append("g")
		.attr("class", 'point A')
	.selectAll("circle")
		.data(dragDataA)
	.enter().append("circle")
		.attr("r", 10)	
		.attr("cx", function(d) {return d.x; })
		.attr("cy", function(d) {return d.y; })
	.call(dragA)


svg.append("g")
		.attr("class", 'point B')
	.selectAll("circle")
		.data(dragDataB)
	.enter().append("circle")
		.attr("r", 10)	
		.attr("cx", function(d) {return d.x; })
		.attr("cy", function(d) {return d.y; })
	.call(dragB);

	


var points = svg.selectAll('.point');
var outlines = svg.selectAll('.outline');

var removeElements = function(toRemove){
	for(var i = toRemove.length-1; i >=0; i--){
		displayData.splice(toRemove[i], 1);
	}	
}

//test
var filterFromPoint = function(point, radius){
	if(!point || !radius) return;

	var toRemove = [];
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

function filterByDays (days){
	var toRemove = [];
	for(var i = 0; i < displayData.length; i++){
		if(!days[displayData[i].DayOfWeek]){
			toRemove.push(i)
		}
	}
	removeElements(toRemove);
}

function dateFormat(time){
	time = time.substring(0, time.indexOf(':')) + time.substring(time.indexOf(':')+1, time.length);
	if(time.length < 6) {
		time = "0" + time;
	}
	if(time.substring(time.length-2, time.length) === 'pm'){
		var hours = time.substring(0, 2);
		hours = parseInt(hours) + 12;
		time = time.substring(2, time.length);
		time = hours + time;
	} else if (time.substring(0, 2) === '12'){
		var hours = time.substring(0, 2);
		hours = '00';
		time = time.substring(2, time.length);
		time = hours + time;		
	}
	return parseInt(time.substring(0, time.length - 2));
}

var filterByTime = function(start, end){
	if(!start || !end) return;
	
	start = dateFormat(start);
	end = dateFormat(end);
	var toRemove = [];

	for(var i = 0; i < displayData.length; i++){
		var time = displayData[i].Time.substring(0, 2) + displayData[i].Time.substring(3, displayData[i].Time.length);
		if(start > end){
			if(time < start && time > end){
				toRemove.push(i);
			}
		} else {
			if(time < start || time > end){
				toRemove.push(i);
			}
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
			info.html("Category: " + d.Category + 
				"<br>Resolution: " + d.Resolution +
				"<br>Day: " + d.DayOfWeek + 
				"<br>Time: " + d.Time )
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


function query(){
	if(!data.length) return;
	displayData = data.slice();
	filterFromPoint(projection.invert([dragDataA[0].x, dragDataA[0].y]), sliderARadius);
	filterFromPoint(projection.invert([dragDataB[0].x, dragDataB[0].y]), sliderBRadius);
	filterByTime(startTime, endTime);	
	filterByDays(days);
	filterByCategories(types)
	filterByResolutions(groups)
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

function filterByCategories (types){
	var toRemove = [];
	var categories = {};
	for(var i = 0; i < category_groups.length; i++){
		if(types[category_groups[i].Type]){
			categories[category_groups[i].Category]=true;
		}
	}
	for(var i = 0; i < displayData.length; i++){
		if(!categories[displayData[i].Category]){
			toRemove.push(i);
		}
	}
	removeElements(toRemove);
}

function filterByResolutions (groups){
	var toRemove = [];
	var resolutions = {};
	for(var i = 0; i < resolution_groups.length; i++){
		if(groups[resolution_groups[i].Type]){
			resolutions[resolution_groups[i].Resolution]=true;
		}
	}
	console.log(resolutions)
	for(var i = 0; i < displayData.length; i++){
		if(!resolutions[displayData[i].Resolution]){
			toRemove.push(i);
		}
	}
	removeElements(toRemove);
}

category_groups = [
            {"Type":"Personal/Violent", "Category":"ASSAULT"},
            {"Type":"Personal/Violent", "Category":"BATTERY"},
            {"Type":"Personal/Violent", "Category":"FAMILY OFFENSES"},
            {"Type":"Personal/Violent", "Category":"KIDNAPPING"},
            {"Type":"Personal/Violent", "Category":"ROBBERY"},
            {"Type":"Personal/Violent", "Category":"SEX OFFENSES, FORCIBLE"},
            {"Type":"Property", "Category":"ARSON"},
            {"Type":"Property", "Category":"BURGLARY"},
            {"Type":"Property", "Category":"LARCENY/THEFT"},
            {"Type":"Property", "Category":"STOLEN PROPERTY"},
            {"Type":"Property", "Category":"STOLEN TRUCK"},
            {"Type":"Property", "Category":"TRESPASS"},
            {"Type":"Property", "Category":"VANDALISM"},
            {"Type":"Property", "Category":"VEHICLE THEFT"},
            {"Type":"White-Collar/Financial", "Category":"BRIBERY"},
            {"Type":"White-Collar/Financial", "Category":"EXTORTION"},
            {"Type":"White-Collar/Financial", "Category":"EMBEZZLEMENT"},
            {"Type":"White-Collar/Financial", "Category":"FORGERY/COUNTERFEITING"},
            {"Type":"White-Collar/Financial", "Category":"FRAUD"},
            {"Type":"Victimless", "Category":"DRUG/NARCOTIC"},
            {"Type":"Victimless", "Category":"DRUNKENNESS"},
            {"Type":"Victimless", "Category":"DRIVING UNDER THE INFLUENCE"},
            {"Type":"Victimless", "Category":"GAMBLING"},
            {"Type":"Victimless", "Category":"LIQUOR LAWS"},
            {"Type":"Victimless", "Category":"PROSTITUTION"},
            {"Type":"Victimless", "Category":"WEAPON LAWS"},
            {"Type":"Other (Non-Criminal/Non-Violent)", "Category":"DISORDERLY CONDUCT"},
            {"Type":"Other (Non-Criminal/Non-Violent)", "Category":"LOITERING"},
            {"Type":"Other (Non-Criminal/Non-Violent)", "Category":"MISSING PERSON"},
            {"Type":"Other (Non-Criminal/Non-Violent)", "Category":"NON-CRIMINAL"},
            {"Type":"Other (Non-Criminal/Non-Violent)", "Category":"OTHER OFFENSES"},
            {"Type":"Other (Non-Criminal/Non-Violent)", "Category":"PROBATION VIOLATION"},
            {"Type":"Other (Non-Criminal/Non-Violent)", "Category":"RUNAWAY"},
            {"Type":"Other (Non-Criminal/Non-Violent)", "Category":"SECONDARY CODES"},
            {"Type":"Other (Non-Criminal/Non-Violent)", "Category":"SEX OFFENSES, NON FORCIBLE"},
            {"Type":"Other (Non-Criminal/Non-Violent)", "Category":"SUICIDE"},
            {"Type":"Other (Non-Criminal/Non-Violent)", "Category":"SUSPICIOUS OCC"},
            {"Type":"Other (Non-Criminal/Non-Violent)", "Category":"WARRANTS"}]

resolution_groups = [
            {"Type":"Arrest", "Resolution":"ARREST, BOOKED"},
            {"Type":"Arrest", "Resolution":"ARREST, CITED"},
            {"Type":"Juvenile Related", "Resolution":"CLEARED-CONTACT JUVENILE FOR MORE INFO"},
            {"Type":"Juvenile Related", "Resolution":"JUVENILE BOOKED"},
            {"Type":"None", "Resolution":"NONE"},
            {"Type":"Not Prosecuted/Unfounded", "Resolution":"NOT PROSECUTED"},
            {"Type":"Not Prosecuted/Unfounded", "Resolution":"UNFOUNDED"},
            {"Type":"Other", "Resolution":"COMPLAINANT REFUSES TO PROSECUTE"},
            {"Type":"Other", "Resolution":"EXCEPTIONAL CLEARANCE"},
            {"Type":"Other", "Resolution":"LOCATED"},
            {"Type":"Other", "Resolution":"PSYCHOPATHIC CASE"}]
