var treeSelect = function(){
	var Aindex = 1;
	var Bindex = 0;
	var SelectTree = {};	
	ObserverManager.changeListener(SelectTree,1);
	var svgWidth = $("#innerTopLeft").width();
	var svgHeight = $("#innerTopLeft").height() * 19/20;
	var compareArray = [0, 1];
	var statData = dataCenter.stats;
	var propotionArray = [];
	var timeSortArray = []
	var dataList = timeSortArray;
	var sortMode = "time";
	var svg = d3.select("#innerTopLeft")
		.append("svg")
		.attr("id", "mainTimeline")
		.attr("width", svgWidth)
		.attr("height", svgHeight);
	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.html(function(d, i) {
			var time = d.time;
			var aTime = time.replace("XX.csv","");
			var aValue = d.value;
			return "<span style='font-size:12px;  '>date:" + aTime +"&nbsp;&nbsp;Values:" + d3.format(".3s")(aValue) + "bytes" + d.index +"</span>";
		});
	var hisWidth = 0;
	var changeA = true;
	var margin = {top: 20, right: 40, bottom: 20, left: 40},
    		width = svgWidth - margin.left - margin.right,
    		height = svgHeight - margin.top - margin.bottom;
    var chart;
	var scrollWidth = $("#srocllDiv").width();
	var topWrapperWidth = $("#topWrapper").width();
	var widthPercentage = Math.round(scrollWidth * 2 / topWrapperWidth * 100);
	processStatData();
	drawHistogram(timeSortArray);
	// click on sort buttons
	$("#sort-div .sort-btn").click(function() {
		$("#sort-div .sort-btn").removeClass("active");
		$(this).addClass("active");
		radialexpandmarkA = [];
		radialexpandmarkB = [];
		currentradialdepthA = 5;
		currentradialdepthB = 5;
		sortMode = $(this).attr("sort-type");
		if (sortMode == "time") {
			drawHistogram(timeSortArray);
		} else if (sortMode == "size") {
			drawHistogram(propotionArray);
		}
	});
	$("#switch-selection-div .data-btn").click(function() {
		radialexpandmarkA = [];
		radialexpandmarkB = [];		
		currentradialdepthA = 5;
		currentradialdepthB = 5;
		var command = $(this).attr("data-type");
		if (command == "switch") {
			if(changeA){
				changeA = false;
			}else{
				changeA = true;
			}
		}
		if (sortMode == "time") {
			drawHistogram(timeSortArray);
		} else if (sortMode == "size") {
			drawHistogram(propotionArray);
		}
	});
	//click the other part in the histogram view to cancel selection
	$('.background-control-highlight, .remove-highlight').mouseout(function(d,i){
		svg.selectAll('.bar')
	    .classed('opacity-unhighlight', false);
	    svg.selectAll('.bar')
	    .classed('opacity-highlight', false);
	    d3.selectAll('.hover').remove();
	});

	var viewWidth = +(d3.select("#srocllDiv").style("width").replace("px",""));
	var fontSize = Math.round(viewWidth / 18);
	$("#innerTopRight").css("font-size", 12 + "px");  
	function processStatData() {
		for (var i = 0; i < statData.length; i++) {
		 	timeSortArray[i] = new Object();
		 	timeSortArray[i].value = + statData[i].sumProportion;
		 	timeSortArray[i].time = statData[i].file.replace("XX.csv","");
		 	timeSortArray[i].index = i;
		 	timeSortArray[i].position = i;

		 	propotionArray[i] = new Object();
		 	propotionArray[i].value =+ statData[i].sumProportion;
		 	propotionArray[i].time = statData[i].file.replace("XX.csv","");
		 	propotionArray[i].index = i;		 	
		}
	 	propotionArray.sort(function(a, b) {
	 		return a.value - b.value;
	 	})
	 	for (var i = 0; i < propotionArray.length; i++) {
	 		propotionArray[i].position = i;
	 	}
	}
	function drawHistogram(dataArray){
		svg.selectAll("*").remove();
		chart = svg.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
				.attr("id","append-rect");
		var maxNum = _.max(dataArray, function(d) {return d.value}).value;
		// var minNum = _.min(dataArray, function(d) {return d.value}).value;
		var minNum = 0;
		// draw x-axis
		var xAxisScale = d3.scale.identity()
			.range([0, width]);

		var xAxis = d3.svg.axis()
			.scale(xAxisScale)
			.orient("bottom")
			.ticks(0)
		var xAxisGroup = chart.append("g")
		   .attr("class","x axis")
		   .attr("transform","translate(" + 0 + "," + height + ")")
		   .call(xAxis);

		xAxisGroup.append("text")
		   .attr("class","label")
		   .attr("x",width)
		   .attr("y",15)
		   .style("text-anchor","end")
		   .text("Date");
		// draw y-axis
		var yAxisMin = 0;
		var yAxisMax = Math.round(Math.log(1899375543148));
		var yAxisScale = d3.scale.linear()
			.domain([yAxisMax, yAxisMin])
			.range([0, height]);
		var yAxisTicks = [];
		yAxisTicks[0] = 0;
		for(var i = 1; ; i = i + 1){
			yAxisTicks[i] = yAxisTicks[i-1] + 3;
			if(yAxisTicks[i] > yAxisMax - 3){
				break;
			}
		}
		var yAxis = d3.svg.axis()
			.scale(yAxisScale)
			.orient("left")
			.tickValues(yAxisTicks);
		chart.append("rect")
			.attr('class','background-control-highlight')
			.attr('x',-10)
			.attr('y',-10)
			.attr('width',width + 20)
			.attr('height', height + 20)
			.attr('fill', 'white')
			.style('opacity', 0);
		chart.append("g")
			.attr("class","y axis")
			.call(yAxis)
			.append("text")
			.attr("transform","rotate(-90)")
			//.attr("transform","translate(" + -10 + "," + 0 + ")")
			.attr("class","label")
			.attr("x",10)
			.attr("y",-25)
			.style("text-anchor","end")
			.text("log(Number\n(bytes))");

		//draw chart bars

		var xScale = d3.scale.linear()
					.domain([0, dataArray.length])
					.range([0, width]);
		var yScale = d3.scale.linear()
					.domain([0, Math.log(maxNum)])
					.range([height, 0]);

		hisWidth = xScale(1) - 1;
		tip.offset(function(d,i){
			var tmpy = -yScale(Math.log(d.value));
			var tmpx = 0;
			if(i < 10){
				tmpx = (10 - i) * xScale(1);
			}
			else if(i > 76){
				tmpx = (76 - i) * xScale(1);
			}
			return [tmpy,tmpx];
		});
		svg.call(tip);
		var rectg = chart.selectAll(".bar")
	 		.data(dataArray)
	 		.enter()
	 		.append("g")
	 		.on("mouseover",function(d,i){
	 			$("#polygon"+i).attr("opacity",0.6);
	 		})
	 		.on("mouseout",function(d,i){
	 			$("#polygon"+i).attr("opacity",0);
	 		});
	 	rectg.append("rect")
	 		.attr("id",function(d, i){
				return "his-" + d.index;
			})
			.attr("index", function(d, i) {
				return d.index;
			})
			.attr("class", function(d, i) {
				var className = "bar bar-add-arc node" + d.time;
				var selectIndex = compareArray.indexOf(d.index);
				if(changeA){
					if (selectIndex == 1){
						className += " previous";
					}
					else if (selectIndex == 0){
						className += " current";
					}
				}else{
					if (selectIndex == 0){
						className += " change-previous";
					}
					else if (selectIndex == 1){
						className += " change-current";
					}
				}
				return className;
			})
			.attr("width", function(d,i) {
				return xScale(1) - 1.75;
			})
			.attr("height",function(d,i){
				return height - yScale(Math.log(d.value)) - 1;
			})
			.attr("y",function(d){
				return yScale(Math.log(d.value));
			})
			.attr("x",function(d,i){ 
				return xScale(i) + 2;
			})
			.on("mouseover",function(d,i){
				d3.selectAll('.bar')
	    		.classed('opacity-unhighlight', true);
	    		d3.selectAll('.bar')
	    		.classed('opacity-highlight', false);
	    		d3.select(this)
	    		.classed('opacity-highlight', true);
	    		var element = 'node' + d.time.replace("XX.csv","");
	    		//add arc
	    		var id = d3.select(this).attr('id');
	    		if(dataCenter.global_variable.hover_show_arc){
	    			add_arc(i, id, 'hover');
	    			//d3.selectAll('.default').classed('opacity-remove', true);
	    		}
	    		ObserverManager.post("similarity-node-array", [element]);
				tip.show(d);
			})
			.on("mouseout",function(d,i){
				/*svg.selectAll('.bar')
	    		.classed('opacity-unhighlight', false);
	    		svg.selectAll('.bar')
	    		.classed('opacity-highlight', false);*/
	    		//add arc
	    		d3.selectAll('.default').classed('opacity-remove', false);
	   			d3.selectAll('.arc-path hover').remove();
	   			ObserverManager.post("similarity-node-array", []);
				tip.hide(d);
			})
			.on('click',function(d,i){
				var this_node = d3.select(this);
				var id = d3.select(this).attr('id');
				var selectionArray = dataCenter.global_variable.selection_array;
				var currentId = dataCenter.global_variable.current_id;
				var currentNodeIdBefore = dataCenter.global_variable.current_nodeid_before;
				if(selectionArray.indexOf(id) == -1){
					selectionArray.push(id);
					d3.select(this).classed('selection', true);
					append_current_circle(this_node);
					currentNodeIdBefore.push(id);
				}else{
					append_current_circle(this_node);
					if(currentId == id){
						d3.select(this).classed('selection', false);
						selectionArray.splice(selectionArray.indexOf(id), 1);
						for(var j = 0;j < currentNodeIdBefore.length;j++){
							if(currentNodeIdBefore[j] == id){
								currentNodeIdBefore.splice(j, 1);
							}
						}
						append_current_circle(d3.select('#' + currentNodeIdBefore[(currentNodeIdBefore.length - 1)]));
					}
				}
				/*var selectedID = +d.index;
				if(changeA == true) Aindex = selectedID;
				else Bindex = selectedID;
				if (compareArray.indexOf(selectedID) < 0){
					//compareArray[0] = compareArray[1];
					if(changeA){
						compareArray[1] = selectedID; 
					}else{
						compareArray[0] = selectedID; 
					}
				} 
				else {
					var index = compareArray.indexOf(selectId);
					compareArray.splice(index,1);
				}
				radialexpandmarkA = [];
				radialexpandmarkB = [];

				$("#radial-depth-controller .level-btn").addClass("active");	
				activeA = 4;
				activeB = 4;
				changeComparedData();
				d3.select("#append-rect").select("#percen-rect").remove();*/
			})

		rectg.append("polygon")
			.attr("points",function(d,i){
				var updotx = xScale(d.position)+xScale(1)/2;
				var updoty = yScale(Math.log(d.value));
				var leftx = xScale(d.position)+xScale(1)/2 - 5;
				var lefty = yScale(Math.log(d.value))-10;
				var rightx = xScale(d.position)+xScale(1)/2 + 5;
				var righty = yScale(Math.log(d.value))-10;
				return ""+updotx+","+updoty+" "+leftx+","+lefty+" "+rightx+","+righty+"";	
			})
			.attr("id",function(d,i){
				return "polygon" + i;
			})
			.attr("fill","#000000")
			.attr("opacity",0);

		// draw x-axis ticks
		if (sortMode == "time") {
			var xBegin = 0;
			for (var i = 0; i < dataArray.length; i++) {
				if (dataArray[i].time.substring(0, 4) != xBegin) {
					xBegin = dataArray[i].time.substring(0, 4);
					xAxisGroup.append("text")
						.attr("class", "tick-label")
						.attr("y", 15)
						.attr("x", chart.select("#his-" + i).attr("x"))
						.text(xBegin);	
				}
			}			
		}
		function append_current_circle(this_node){
			d3.selectAll('.append-current-circle').remove();
			var radius = +dataCenter.GLOBAL_STATIC.radius;
			var x = +this_node.attr('x') + margin.left;
			var y = +this_node.attr('y') + margin.top;
			var width = +this_node.attr('width');
			var height = +this_node.attr('height');
			var centerX = x + width/2;
			var centerY = y + height + 3 * radius;
			d3.select('#mainTimeline').append('circle')
				.attr('class', 'append-current-circle')
				.attr('cx', centerX)
				.attr('cy', centerY)
				.attr('r', radius);
			dataCenter.global_variable.current_id = this_node.attr('id');
		}
		changeComparedData();
		function changeComparedData() {
			/*chart.selectAll(".previous").classed("previous", false);
			chart.selectAll(".current").classed("current", false);
			chart.selectAll(".change-previous").classed("change-previous", false);
			chart.selectAll(".change-current").classed("change-current", false);
			if(changeA){
				chart.select("#his-" + compareArray[0]).classed("previous", true);
				chart.select("#his-" + compareArray[1]).classed("current", true);
			}else{
				chart.select("#his-" + compareArray[0]).classed("change-previous", true);
				chart.select("#his-" + compareArray[1]).classed("change-current", true);
			}
			chart.selectAll(".labelAB").remove();

			for(var l = 0; l < compareArray.length; l++){
				var id = compareArray[l];
				var x = chart.select("#his-" + id).attr("x");
				var y = chart.select("#his-" + id).attr("y") - 3;
				chart
					.append("text")
					.attr("class","labelAB")
					.attr("x", x)
					.attr("y", y)
					.text(function() {
						return l == 0 ? "B" : "A";
					});
			}

			$("#innerTopRight #label-A .date_description").html(function() {
				if (compareArray.length > 0) 
					var timeArray = dataList[compareArray[1]].time.split("-");
					return timeArray[0];
				return "";
			});
			$("#innerTopRight #label-B .date_description").html(function() {
				if (compareArray.length > 1) 
					var timeArray = dataList[compareArray[0]].time.split("-");
					return timeArray[0];
				return "";
			});

			$("#innerTopRight #label-A .value_description").text(function() {
				if (compareArray.length > 0)  
					return  d3.format(".3s")(dataList[compareArray[1]].value) + "bytes" ;
				return "";
			});
			$("#innerTopRight #label-B .value_description").text(function() {
				if (compareArray.length > 1) 
					return d3.format(".3s")(dataList[compareArray[0]].value) + "bytes";
				return "";
			});*/
			ObserverManager.post("changeData", compareArray);
		}
	}
	function add_arc_to_all(){
		d3.selectAll('.bar-add-arc').each(function(d,i){
			var id = d3.select(this).attr('id');
			add_arc(i, id, 'default');
		})
	}
	function remove_arc_to_all(){
		d3.selectAll('.default').remove();
	}
	/*
	* @parameter: index用来在similarityMatrix中寻找当前哪一列是用来绘制的相似度数组 
	* 			  thisID用来寻找rect的位置
	* 			  arcNum表示当前是标记默认绘制arc连接的数量 
	*/
	function add_arc(index, thisId, type){
		var similarityObj = dataCenter.similarityMatrix[index];
		var similarityObjArray = new Array();
		for(var i = 0;i < dataCenter.similarityMatrix.length;i++){
			similarityObjArray[i] = new Object();
			similarityObjArray[i].fileName = dataCenter.similarityMatrix[i].fileName.replace('.csv','').replace('XX','');
			similarityObjArray[i].similarityValue = +similarityObj['attr' + i];
		}
		similarityObjArray.sort(function(a,b){
			return b.similarityValue - a.similarityValue;
		});
		var thisEle = d3.select('#' + thisId);
		var thisEleX = +thisEle.attr('x');
		var thisEleY = +thisEle.attr('y');
		var thisEleWidth = +thisEle.attr('width');
		var thisEleHeight = +thisEle.attr('height');
		var originX = thisEleX + thisEleWidth / 2;
		var originY = thisEleY + thisEleHeight;
		var highlightNodeArray = [];
		var arcNum = dataCenter.GLOBAL_STATIC.DEFAULT_ARC_LINK_NUM;
		var addClass = 'default';
		if(type == 'hover'){
			arcNum = dataCenter.global_variable.hover_arc_link_num;
			addClass = 'hover';
		}
		d3.selectAll('.hover').remove();
		var opacityScale = d3.scale.linear()
			.domain([0, arcNum])
			.range([0,1]);
		var dark = d3.rgb(200,200,200);
		var bright = d3.rgb(50,50,50);
		var compute = d3.interpolate(bright,dark);  

		for(var i = 0;i < arcNum;i++){
			var fileName = similarityObjArray[i].fileName;
			var selectClassName = 'node' + fileName;
			var element = d3.select('.' + selectClassName);
			highlightNodeArray.push(selectClassName);
			d3.select('.node' + fileName)
				.classed('opacity-highlight',true);
			d3.select('.node' + fileName)
				.attr('fill', compute(opacityScale(i)));
			console.log(compute(opacityScale(i)));
			var rectX = +element.attr('x');
			var rectY = +element.attr('y');
			var rectWidth = +element.attr('width');
			var rectHeight = +element.attr('height');
			targetX = rectX + rectWidth / 2;
			targetY = rectY + rectHeight;
			centerX = (originX + targetX) / 2;
			centerY = targetY;
			radius = Math.abs(originX - targetX) / 2;
			draw_arc(radius, centerX, centerY, addClass);
		}
		ObserverManager.post("similarity-node-array", highlightNodeArray);
	}
	function draw_arc(radius, center_x, center_y, add_class){
		var beginRadians = Math.PI / 2,
			endRadians = Math.PI * 3 / 2,
			points = 50;
		var angle = d3.scale.linear()
		 	.domain([0, points - 1])
			.range([beginRadians, endRadians]);
		var line = d3.svg.line.radial()
			.interpolate("basis")
	   		.tension(0)
	   		.radius(radius)
	   		.angle(function(d, i) { return angle(i); });
		svg.append("path").datum(d3.range(points))
	       .attr("class", function(d,i){
	       	  return 'arc-path ' + add_class;
	       })
		   .attr("d", line)
		   .attr("transform", "translate(" + (margin.left + center_x) + ", " + (margin.top + center_y) + ")");
	}
	function changePercentage(percentage){
		var rectX = + chart.select("#his-" + compareArray[1]).attr("x");
		var rectY = + chart.select("#his-" + compareArray[1]).attr("y");
		var rectWidth = + chart.select("#his-" + compareArray[1]).attr("width");
		var rectHeight = + chart.select("#his-" + compareArray[1]).attr("height");
		var newY = rectY + rectHeight * (1 - percentage);
		d3.select("#append-rect").select("#percen-rect").remove();
		d3.select("#append-rect")
		.append("rect")
		.attr("id","percen-rect")
		.attr("x",rectX)
		.attr("y",(newY))
		.attr("height",rectHeight * percentage)
		.attr("width",hisWidth)
		// .attr("fill","#b2df8a");
		.classed("highlight", true);
	}
	changeLabelC("-", 0, 0, 0, 0);
	function changeLabelC(dataset, nodeID, levelText, flowLevel, treeNodeNum, sumNodeNum){
		$("#innerTopRight #label-C #node-type").text(dataset)
		$("#innerTopRight #label-C #node-type").removeClass("background-A");
		$("#innerTopRight #label-C #node-type").removeClass("background-B");
		$("#innerTopRight #label-C #node-type").addClass("background-" + dataset);

		$("#innerTopRight #label-C #node-description").html(nodeID);
		$("#innerTopRight #label-C #level-description").html(levelText);
		$("#innerTopRight #label-C #flow-description").text(flowLevel);
		$("#innerTopRight #label-C #tree-num-description").text(treeNodeNum);
		$("#innerTopRight #label-C #sum-num-description").text(sumNodeNum);
	}
	SelectTree.OMListen = function(message, data) {
	    if (message == "percentage") {
			changePercentage(data);
	    }
	    if (message == "show-detail-info") {
	    	var dataset = data.dataset;
	    	var node = data.node;
	    	var nodeID = node.key;
	    	var levelText = node.id.split("-").length-1;
	    	var flowLevel = node.flow;
	    	var treeNodeNum = Array.isArray(node.values) ? node.values.length : 0;
	    	var sumNodeNum = node.allChilldrenCount;
	    	changeLabelC(dataset, nodeID, levelText, flowLevel, treeNodeNum, sumNodeNum)
	    }
	    if(message == 'projection-highlight'){
	    	if(data != null){
	    		svg.selectAll('.bar')
	    		.classed('opacity-unhighlight', true);
	    		svg.select('.' + data)
	    		.classed('opacity-unhighlight', false);
	    		svg.select('.' + data)
	    		.classed('opacity-highlight', true);
	    	}else{
	    		svg.selectAll('.bar')
	    		.classed('opacity-unhighlight', false);
	    		svg.selectAll('.bar')
	    		.classed('opacity-highlight', false);
	    	}
	    }
	    if(message == 'set:show_arc'){
	    	if(dataCenter.global_variable.show_arc){
	    		add_arc_to_all();
	    	}else{
	    		remove_arc_to_all();
	    	}
	    }
    }
	return SelectTree;
}