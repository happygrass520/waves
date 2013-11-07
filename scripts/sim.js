(function(){

    function Slow(){
      cars[0].slowClick();
    }

    function Set(){

    	cars.forEach(function(d,i){
	    		var x = Math.round(i/numCars * numPatches); 
		    	d.x = x;
		    	d.v = startV;
		    	d.a = 0;
		    	d.gap = numPatches / numCars;
		    	d.slow = false;
    	})
    }



    $("#pause").on("click",function(){
	    paused = !paused;

    	if(!paused){
    		$(this).html("Pause");
    		d3.timer(function(elapsed) {
    		  t = (elapsed - last)/dur * tPerm % .5;
    		  last = elapsed;
    		  redraw();
    		  return paused;
    		});
    	}else{
    		$(this).html("Play");
    	};
  		
  		$(this).toggleClass("btn-warning");
  		$(this).toggleClass("btn-success");

    });

    $("#reset").on("click",Set);


//===============PARAMETERS===================
var margin = {top: 0, right: 20, bottom: 0, left: 20},
    width = 700 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom,
    radius = (width-150)/2,
    center = {x: width/2, y: height/2},
    durPerm = 55,
    dur = 55;

	console.log(radius)

var numCars = 30,
		tPerm = 0.5,
    t = .5,
    numPatches = 1000,
    vo = 20,
    startV = 11.2,
    // maxV = 30, 
    sMin = 2,
    L = 10,
    T = 1.8,
    acc = 0.5,
    dec = 3;

//=============DRAWING HELPERS===============

	var format = d3.format(",.3r");

	var color = d3.scale.linear()
	    .domain([0,vo*0.5]) //domain of input data 1 to 38
      .range(["#2980b9", "#ecf0f1"])  //the color range
	    .interpolate(d3.interpolateRgb);

  var colorAcc = d3.scale.pow().exponent(0.5)
  		.domain([-3,1])
      .range(["#e74c3c", "#2ecc71"])  //the color range
      .interpolate(d3.interpolateHcl);

  var toRads = 2*Math.PI;
      
  var y = d3.scale.linear()
  		.domain([-7,1.5])
  		.range([0,radius + 102.5])
  		// .clamp(true);

  var offset = L;    

  var interiorGap = 80;

  var arc = d3.svg.arc()
      .innerRadius(function(d){
      	if(0 > d.a) return y(d.a) - interiorGap;
      	return y(0);
      })
      .outerRadius(function(d){
      	if(d.a > 0) return y(d.a);
      	return y(0) - interiorGap;
      })
      .startAngle(function(d){
      	// return 0;
      	return (-0.5*(d.gap + offset)/numPatches*0.8 + .005) * toRads;
      })
      .endAngle(function(d){
      	return (0.5*(d.gap - offset)/numPatches*0.8 - 0.005) * toRads;
      });


  var arcInner = d3.svg.arc()
      .innerRadius(radius - 25)
      .outerRadius(radius + 25)
      .startAngle(function(d){
      	// return 0;
      	return (-0.5*(d.gap + offset)/numPatches*0.8 + 0.002) * toRads;
      })
      .endAngle(function(d){
      	return (0.5*(d.gap - offset)/numPatches*0.8 - 0.002) * toRads;
      });

//=============DRAW SVG AND ROAD===============

	var sticker = d3.sticker("#car");

	var stickerCone = d3.sticker('#cone');

	var svg = d3.select("#main")
		.append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var road = svg.append("g")
			.attr("class","road");

	road.append('circle')
			.attr({
				r: radius,
				cx: width/2,
				cy: height/2,
				fill: "none",
				stroke: "#293038",
				"stroke-width": "75px"
			});

	road.on('mouseover', function(){
				dur = durPerm * 4
			})
			.on('mouseout', function(){
				dur = durPerm
		});

	road.append("foreignObject")
	    .attr("transform","translate(" + (center.x + - 150/2) +  "," + ( center.y +  - 45/2) + ")" )
	    .attr("width", 200)
	    .attr("height", 200)
	  .append("xhtml:div")
	  	// .attr("class","col-lg-5")
	    .html('<button id="slow" class="btn  btn-info btn-lg">Hit the brakes.</button>'
	    	+ '<p>(start some traffic waves)</p>');
			 

	$("#slow").on("click",function(){
		Slow();
	})

	//=============SET UP ARRAYS===============

	var	cars = d3.range(numCars).map(function(d,i){
			var x = Math.round(i/numCars * numPatches); 
			return new Car(x, i);
		});

	//=============DRAW THE CARS===============

	var gCar = road.append("g")
			.attr('class', 'g-cars')
			.attr("transform","translate(" + center.x + "," + center.y + ")" );

	var car = gCar.selectAll('cars')
		.data(cars)
			.enter()
		.append('g')
			.attr({
				class: function(d){
					return "car " + d.index.toString();
				},
				transform: function(d){
					return "rotate(" + -d.x / numPatches * 360 + ")";
				}
			})
			.on("click", function(d){
				d.slowClick();
			});

	var carArcInner = car.append('path')
		.attr({
			"d": arcInner,
			class: "car-arc-inner",
			opacity: 0.05,
			fill: "#ecf0f1",
			// fill: function(d,i){ return colorAcc(d.a); },
			// stroke: "#666"
		});

	car.append('g')
		.call(sticker)
			.attr({
				class: "g-sticker",
				transform: "translate(0," + (-radius + 5 ) +") scale(.3, 0.4) rotate(180)",
				fill: function(d,i){ return color(d.v); },
				// stroke: 'white'
			})
			.on("click", function(d){
				d.slowClick();
			});


	var carArc = car.append('path')
		.attr({
			"d": arc,
			class: "car-arc",
			opacity: 0.5,
			fill: function(d,i){ return colorAcc(d.a); },
			// stroke: "#666"
		})
		.on("click", function(d){
			d.slowClick();
		});



//=============GET IT GOING===============

// setInterval(redraw, dur);
var paused = false;
var last = 0;
var numLoop = 0;

d3.timer(function(elapsed) {
  t = (elapsed - last)/dur * tPerm % .5;
  // T = 10*t;
  numLoop++
  last = elapsed;
  redraw();

  return paused;
});


//=============FUNCTIONS===============



function redraw(){
	
	cars.forEach(function(d){
		d.choose();
	});

	cars.forEach(function(d){
		d.update();
	});


	carArc.attr("d",arc);

	carArcInner.attr("d",arcInner);

	car.attr("transform", function(d){
				return "rotate(" + d.x / numPatches * 360 + ")";
			});

	d3.selectAll(".g-sticker")
		.attr("fill", function(d) { return color(d.v); });

	carArc.attr("fill", function(d) { return colorAcc(d.a); });

}


//=============CLASSES===============

function Car(xo, index){

	this.index = index;
	this.x = xo;
	this.v = startV;
	this.a = 0;
	this.gap = numPatches / numCars;

	this.slow = false;

	this.getS = function(x){
		var n = cars[(index+1)%numCars];
		var g = (n.x > x) ? (n.x - x) : (n.x - x + numPatches);
		this.s = g-L;
		var p = (cars[(index-1)]) ? cars[(index-1)] : cars[numCars - 1];
		this.gap = (p.x < x) ? (x - p.x) : (x - p.x + numPatches);
		return g - L;
	};

	this.update = function(){

		var a = this.a,
			x = this.x,
			v = this.v;

		vNew = v + a * t;
		xNew = x + v*t + 0.5*a*Math.pow(t,2);

		this.x = xNew % numPatches;
		this.v = d3.min([d3.max([vNew,0]),vo]);
		if(this.v == vo) this.a = 0;

		var n = cars[(index+1)%numCars];
		if(this.x > n.x && (this.x - n.x < numPatches/2)){
			this.x = n.x- L - sMin;
			this.v = 0;
		}


	}

	this.slowClick = function(){
		this.slow =  true;
	}

	this.choose = function(){
		var n = cars[(index+1)%numCars];
		var v = this.v,
			x = this.x,
			s = this.getS(x),
			delV = v - n.v,
			si = v*T + v*delV/(2*Math.pow(acc*dec,0.5)),
			ss = sMin + d3.max([si, 0]),
			a = acc*(1 -  Math.pow((v/vo),4) - Math.pow((ss / s),2) );
	
		if(this.slow) this.v = this.v*0.75;

		this.a = a;

		// this.pedals.unshift(a);
		this.slow = false;

	};

}

})()