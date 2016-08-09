var radial = function(){
	var Radial = {};
	ObserverManager.changeListener(Radial,2);
	var dataProcessor = dataCenter.datasets[0].processor;
	var padding = 10;
	var width = $("#leftTopWrapper").width() - padding * 10;
	var height = $("#leftTopWrapper").height() - padding * 2;
	var diameter = d3.min([width,height]) + 5 * padding;
	var move_x = height + width * 0.1;
	var eachTypeIdArray = new Array();
	var eachTypeIndexArray = new Array();
	var errorChange = 10;
	var moveHeight = height - 4 * padding;
	var duration = 750;

	var rootB = dataCenter.datasets[1].processor.result.treeRoot;
	var rootA = dataCenter.datasets[0].processor.result.treeRoot;

	var tree = d3.layout.tree()
		.size([360, diameter / 2 - 40])
		.children(function(d){
			if(Array.isArray(d.values)) return d.values;
			return undefined;
		})
		.separation(function(a, b) { 
			var dis = (a.parent == b.parent ? 1 : 2) / a.depth;
			if(a.depth <= 2 && b.depth <= 2)
				dis = 10;
			if(a.depth==3 && b.depth==3)
				dis = 1;
			if(a.parent && b.parent){
            	return dis;
			}
            return 1;
		 });
	var treeNodeList;
	if($("#radialcheckbox").attr("mark") == 2) {
		treeNodeList = tree.nodes(rootB).reverse();
	}else{
		treeNodeList = tree.nodes(rootA).reverse();
	}
	var index = 0;
	// treeNodeList.reverse().forEach(function(d) { d.id = index++; })
	var diagonal = d3.svg.diagonal.radial()
		.projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });
	var svg = d3.select("svg.radial")
		.attr("id","radial");	
	var histogramView = svg.append("g")
		.attr("id","histogramView")
		.attr("transform","translate(" + (move_x * 1.1) + ","+ errorChange +")");
	var margin = 60;
	var lineWidth = width - height - margin;
	var lineHeight = height;
	var StatNum = 6;
	var countArray = new Array();
	var objArray = new Array();
	var lineX = d3.scale.linear();
	var lineY = d3.scale.linear()
		.range([moveHeight ,0]);
	var yAxisTicks = new Array();
	var xAxisTicks = new Array();
	var yAxisNum = 6;
	var changScale = 10000000;
	var clickColor = "blue";
	var brush = d3.svg.brush();
	var AllArray = new Array();
	var AllIndexArray = new Array();
	var timeData;
	var tip = d3.tip()
	  .attr('class', 'd3-tip')
	  .offset([-10, 0])
	  .html(function(d,i) {
	    return "<span style='font-size:12px;'>"  + d.key + "</span>";
	  });
	 var his_width = 0;
	 var dataSizeArray = new Array();
	 var originalDataSizeArray = new Array();
	 var timeDataSum = 0;
	 _changeHis();
	 ///////////////////////////////////////////////////////////////////////////////////////////////
	 _changeButtonColor();
	 $("#default").attr("checked",true);
	 $("#radial-depth-controller").on("click", ".level-btn", function(){
		var dep = $(this).attr("level");
		$("#radial-depth-controller .level-btn").removeClass("active");		
		for (var i = 0; i <= dep; i++)
			$("#radial-depth-controller .level-btn[level=" + i + "]").addClass("active");		
		_draw_depth(dep);
	});
	 ///////////////////////////////////////////////////////////////////////////////////////////////
	 function _changeButtonColor(){
	 	if($("#radialcheckbox").attr("mark") == 1){
	 		$("#radial-depth-controller .level-btn").removeClass("active");		
			for (var i = 0; i <= activeA; i++)
				$("#radial-depth-controller .level-btn[level=" + i + "]").addClass("active");		
	 	}
	 	else {
	 		$("#radial-depth-controller .level-btn").removeClass("active");		
			for (var i = 0; i <= activeB; i++)
				$("#radial-depth-controller .level-btn[level=" + i + "]").addClass("active");		 		
	 	}
	 }
	// draw the histogram of the distribution
	function _changeHis(){
		var multi = 4;
		for(var countIndex = 0;countIndex<countArray.length;countIndex++){
			countArray[countIndex] = 0;
		}
		timeData = _.filter(treeNodeList, function(d) {
			return !Array.isArray(d.values);
		});
		for(var i=0;i<timeData.length;i++){
			var eachData = +timeData[i].values;
			timeDataSum = timeDataSum + eachData;
		}
		var count = 0;
		var sumCount = 0;
		var ddata = treeNodeList;
		for(var i = 0; i < timeData.length; i++){
			var d = timeData[i];
			dataSizeArray[i] = + d.values;
			originalDataSizeArray[i] = + d.values;
			if(dataSizeArray[i] != 0){
				dataSizeArray[i] = Math.round(Math.log(dataSizeArray[i]) * multi);
			}
		}
		var maxLogData = d3.max(dataSizeArray);
		for(var i=0;i<=maxLogData;i++){
			countArray[i] = 0;
			eachTypeIdArray[i] = new Array();
			eachTypeIndexArray[i] = new Array();
		}
		for(var i=0;i<dataSizeArray.length;i++){
			countArray[dataSizeArray[i]]++;
			eachTypeIdArray[dataSizeArray[i]].push(timeData[i].id);
			eachTypeIndexArray[dataSizeArray[i]].push(i);
		}
		var sumNode = 0;
		for(var i=0;i<countArray.length;i++){
			sumNode = sumNode + countArray[i];
		}
		for(var i=0;i<countArray.length;i++){
			if(countArray[i] != 0 ){
				countArray[i] = Math.log(countArray[i] + 1);
			}
		}
		lineX.range([0,width - move_x * 1.2]);
		lineX.domain([0,(d3.max(dataSizeArray) + 1)/multi]);
		var xAxis = d3.svg.axis()
		.scale(lineX)
		.orient("bottom");
		brush.x(lineX)
			.on("brushend",_brushed);

		for(var i=0;i<(d3.max(dataSizeArray)+1)/multi;i=i+1){
			xAxisTicks.push(i);
		}
		his_width = (width - 1.2 * move_x)/(d3.max(dataSizeArray) + 1);
		xAxis.tickValues(xAxisTicks);
		lineY.domain(d3.extent(countArray));
		for(var i = 0;i < countArray.length;i++){
			objArray[i] = new Object();
			objArray[i].num = i;
			objArray[i].count = countArray[i];
		}
		var yAxis = d3.svg.axis()
			.scale(lineY)
			.orient("left");
		var line = d3.svg.line()
			.x(function(d){return (lineX(d.num));})
			.y(function(d){return (lineY(d.count));})

		var radialhistogram = d3.select("#histogramView")
			.selectAll(".his")
			.data(objArray)
			.enter()
			.append("rect")
			.attr("id",function(d,i){
				return "his" + i; 
			})
			.attr("class","his")
			.attr("width",his_width * 0.5)
			.attr("height",function(d,i){
				return moveHeight - lineY(objArray[i].count);
			})
			.attr("x",function(d,i){
				return his_width * i;
			})
			.attr("y",function(d,i){
				return lineY(objArray[i].count); 
			})
			.attr("fill","#1F77B4");
		if($("#radialcheckbox").attr("mark") == 2)
			radialhistogram.attr("fill","#FF7F0E");
		d3.select("#histogramView")
		.append("g")
		.attr("class","y axis")
		.attr("transform","translate(" + 0 + ","+ 0 +")")
		.call(yAxis)
		.append("text")
		.attr("transform","rotate(-90)")
		.attr("class","label")
		.attr("x",5)
		.attr("y",16)
		.style("text-anchor","end")
		.text("log(Number)");

		d3.select("#histogramView")
		.append("g")
		.attr("class","x axis")
		.attr("transform","translate(" + 0 + ","+ (moveHeight) +")")
		.call(xAxis)
		.append("text")
		.attr("class","label")
		.attr("x",width - move_x * 1.2 + 30)
		.attr("y",27)
		.style("text-anchor","end")
		.text("log(bytes)");

		d3.select("#histogramView")
		.append("g")
		.attr("class","x brush")
		.call(brush)
		.selectAll("rect")
		.attr("y",0)
		.attr("height",moveHeight);
	}
	_setSvgAttr(svg,width,height)
	function _setSvgAttr(svg,width,height){
	  	svg.attr("width", width + "px");
	  	svg.attr("height", height + "px");
	  	svg.style("transform", "translate(" + padding + "px," + padding + "px)");
	}
	if(!svg){
		svg = d3.select("body").append("svg");
	}
	svg = svg.append("g")
		.attr("transform", "translate(" + diameter / 2 + "," + (diameter / 2 - 3 * padding) + ")");
	svg.call(tip);

	if($("#radialcheckbox").attr("mark") == 1)
		update(rootA);
	else update(rootB);

	function update(source){
		var nodes = treeNodeList;
			links = tree.links(nodes);
		var treeNodeNum = 0;
		for(var i=0;i<treeNodeList.length;i++){
			if(treeNodeList[i].depth==4){
				treeNodeNum++;
			}
		}
		var node = svg.selectAll(".node")
			.data(nodes, function(d) {return d.id});
		var max_depth = 0;
		var nodeEnter = node.enter().append("g")
			.attr("class", "node")
			.attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
			.attr("id", function(d) {
				return "radial-node-" + d.id;
			})
			.on("click",_click)
			.on("mouseover", function(d) {
				ObserverManager.post("mouse-over", [d.id]);
				tip.html(function() {
					var text = d.key;
					if (Array.isArray(d.values))
						text += "<br>子节点数:" +  d.values.length;
					text += "<br>流量:" + d.flow
					return text;
				})
				.show();
			})
			.on("mouseout", function(d) {
				ObserverManager.post("mouse-out", [d.id]);
				tip.hide()
			});
			////////////////////////////////////////////////////////////////////////////////////
		nodeEnter.attr("fill",function(d,i){
				if($("#radialcheckbox").attr("mark") == 1){
					if(radialexpandmarkA.indexOf(d.id) != -1){
						return "steelblue";
					}
					else{
						return "#CCC29C";
					}
				}
				else{
					if(radialexpandmarkB.indexOf(d.id) != -1){
						return "#FF7F0E";
					}
					else{
						return "#CCC29C";
					}
				}

		});
		var nodecircle = nodeEnter.append("circle")
			.attr("r", function(d,i){
				if(d.depth == 4){
					return 1;
				}
				if(d.depth == 3){
					return 2.5;
				}
				return (4.5 - d.depth) * 2;
			});
		if($("#radialcheckbox").attr("mark") == 2)
			nodecircle.attr("class","nodecircle2");
		////////////////////////////////////////////////////////////////////////////
		var nodeUpdate = node.transition().duration(duration)
						.attr("transform",function(d){
							return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
						})
						.attr("fill",function(d,i){
							if($("#radialcheckbox").attr("mark") == 1){
								if(radialexpandmarkA.indexOf(d.id) != -1){
									return "steelblue";
								}
								else{
									return "#CCC29C";
								}
							}
							else{
								if(radialexpandmarkB.indexOf(d.id) != -1){
									return "#FF7F0E";
								}
								else{
									return "#CCC29C";
								}
							}
						})

		node.exit()
			.transition().duration(duration)
			.attr("transform",function(d){
				return "rotate(" + (source.x - 90) + ")translate(" + source.y + ")";
			})
			.remove();
		var link = svg.selectAll("path.link")
			.data(links,function(d) { return d.target.id; });

		link.enter().insert("path", "g")
		  .attr("class", "link")
		  .attr("d", diagonal);

		link.transition().duration(duration)
			.attr("class", "link")
			.attr("d", diagonal);

		link.exit().remove();
	}
	function _brushed() {
	  var extentX = d3.select(".extent").attr("x");
	  var extentWidth = d3.select(".extent").attr("width");
	    if(extentWidth > his_width/3){
	  	  var beginIndexX = Math.floor(extentX / his_width);
		  var includeNum = Math.round(extentWidth / his_width);
		  d3.select("#histogramView").selectAll(".his").classed("highlight", false)
		  for(var i=0;i<=includeNum;i++){
		  	d3.select("#histogramView").select("#his" + (beginIndexX + i)).classed("highlight", true);
		  }
		  AllIndexArray = new Array();
		  AllArray = new Array();
		  for(var i=0;i<=includeNum;i++){
		  	AllIndexArray = AllIndexArray.concat(eachTypeIndexArray[beginIndexX + i]);
		  	AllArray = AllArray.concat(eachTypeIdArray[beginIndexX + i]);
		  }
		  AllArray = _.uniq(AllArray);
		  AllIndexArray = _.uniq(AllIndexArray);
		  var sum = 0;
		  for(var i=0;i<AllIndexArray.length;i++){
		  	if(AllIndexArray[i] < timeData.length){
		  		sum = sum + timeData[AllIndexArray[i]].values;
		  	}
		  }
		  var percentage = sum/timeDataSum;
		  ObserverManager.post("percentage",percentage);
		  console.log("percentage",ObserverManager.getListeners());
		  ObserverManager.post("highlight", _.uniq(AllArray))

		  lineX.domain(brush.empty() ? lineX.domain() : brush.extent());
		}else{
			d3.select("#histogramView").selectAll(".his").classed("highlight", false)
		  	ObserverManager.post("percentage", 0);
			ObserverManager.post("highlight", [])
			lineX.domain(brush.empty() ? lineX.domain() : brush.extent());
		}
	}
	function _click(d, i) {
		if((+d.flow) == 0)	return null;		
		if (d.values) {
			d._values = d.values;
			d.values = null;
		} else {
			d.values = d._values;
			d._values = null;
		}
		if(d.depth!=4){
			if($("#radialcheckbox").attr("mark") == 1){
				if(radialexpandmarkA.indexOf(d.id) != -1){
					radialexpandmarkA.splice(radialexpandmarkA.indexOf(d.id),1);
					d3.select(this).attr("fill","#CCC29C");
				}
				else{
					radialexpandmarkA.push(d.id);
					d3.select(this).attr("fill","steelblue");
				}
			}
			else{
				if(radialexpandmarkB.indexOf(d.id) != -1){
					radialexpandmarkB.splice(radialexpandmarkB.indexOf(d.id),1);
					d3.select(this).attr("fill","#CCC29C");
				}
				else{
					radialexpandmarkB.push(d.id);
					d3.select(this).attr("fill","steelblue");
				}
			}
		}
		if($("#radialcheckbox").attr("mark") == 1)
			treeNodeList = tree.nodes(rootA);
		else treeNodeList = tree.nodes(rootB);
		update(d);
/*		countArray = new Array();
		timeDataSum = 0;
		dataSizeArray = new Array();
		eachTypeIdArray = new Array();
		eachTypeIndexArray = new Array();
		xAxisTicks = new Array();
		objArray = new Array();
		histogramView.selectAll("g").remove();
		$(".his").remove();
		changeHis();*/
	}
	///////////////////////////////////////////////////////////////////////////////
	function _putnodesdepth(radialexpandmark,nodesIddepth,hide_depth){
		radialexpandmark = [];
		for(var i = hide_depth; i < 4; i++){
			for(var j = 0; j < nodesIddepth[i].length; j++){
				radialexpandmark.push(nodesIddepth[i][j].id);
			}
		}
		return radialexpandmark;
	}
	//////////////////////////////////////////////////////////////////////////////////
	function _draw_depth(hide_depth){
		var iterator = 1;
		if($("#radialcheckbox").attr("mark") == 1){
			activeA = hide_depth;
			radialexpandmarkA = _putnodesdepth(radialexpandmarkA,nodesIddepthA,hide_depth);
		}
		else {
			activeB = hide_depth;
			radialexpandmarkB = putnodesdepth(radialexpandmarkB,nodesIddepthB,hide_depth);
		}
		for(var i=0;i<treeNodeList.length;i++){
			if(treeNodeList[i]._values){
				treeNodeList[i].values = treeNodeList[i]._values;
				treeNodeList[i]._values = null;
			}
		}
		if($("#radialcheckbox").attr("mark") == 1)
			treeNodeList = tree.nodes(rootA);
		else treeNodeList = tree.nodes(rootB);
		for(var i=0;i<treeNodeList.length;i++){
			if(treeNodeList[i].depth < hide_depth){
				if(treeNodeList[i]._values){
					treeNodeList[i].values = treeNodeList[i]._values;
					treeNodeList[i]._values = null;
				}
			}else{
				if(treeNodeList[i].values){
					treeNodeList[i]._values = treeNodeList[i].values;
					treeNodeList[i].values = null;
				}
			}
		}
		if($("#radialcheckbox").attr("mark") == 1)
			treeNodeList = tree.nodes(rootA);
		else treeNodeList = tree.nodes(rootB);
		update(treeNodeList);
	}

    Radial.OMListen = function(message, data) {
		var idPrefix = "#radial-node-";
		if (message == "highlight") {
			svg.selectAll(".highlight").classed("highlight", false)
			svg.selectAll(".half-highlight").classed("half-highlight", false)
			for (var i = 0; i < data.length; i++) {
				svg.select(idPrefix + data[i]).classed("highlight", true);
				svg.select(idPrefix + data[i]).each(function(d) {
					if (d == null) return;
					var node = d.parent;
					while (node != null) {
						svg.select(idPrefix + node.id).classed("half-highlight", true);
						node = node.parent;
					}
				})				
			}
		}
        if(message == "mouse-over"){
        	for (var i = 0; i < data.length; i++) {
				svg.select(idPrefix + data[i]).classed("focus-highlight", true);
				if (svg.select(idPrefix + data[i]).data().length > 0) {
					var nodeData = svg.select(idPrefix + data[i]).data()[0];
				}
			}
        }
        if(message == "mouse-out"){
        	for (var i = 0; i < data.length; i++) {
				svg.select(idPrefix + data[i]).classed("focus-highlight", false);
			}
        }
        if(message == "depth"){
        	_draw_depth(data);
        }	
        if(message=="changeData"){
        	console.log("radial",data);
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////////////
    //计算
    if(marknodesdepth == false){
		marknodesdepth = true;
		changenodedepthA();
		changenodedepthB();
	}
    return Radial;
}