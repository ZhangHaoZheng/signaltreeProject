var radial = function(){
	var Radial = {};
	ObserverManager.addListener(Radial);	
	var dataProcessor = dataCenter.datasets[0].processor;
	var dataset = dataCenter.datasets[0].processor.result;
	var padding = 10;
	var width = $("#leftTopWrapper").width() - padding * 5;
	var height = $("#leftTopWrapper").height() - padding * 2;
	var diameter = d3.min([width,height]) + 5 * padding;
	var move_x = height + width * 0.1;
	var eachTypeIdArray = new Array();
	var eachTypeIndexArray = new Array();
	var errorChange = 10;
	var moveHeight = height - 4 * padding;
	var duration = 750;

	var root = dataset.treeRoot;
	var tree = d3.layout.tree()
		.size([360, diameter / 2 - 40])
		.children(function(d){
			if(Array.isArray(d.values)) return d.values;
			return undefined;
		})
		.separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });
	var treeNodeList = tree.nodes(root).reverse();
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
	 changeHis();
	 $("#default").attr("checked",true);
	 $("#radial-depth-controller").on("click", ".level-btn", function(){
		// $("#radial-depth-controller .level-btn").removeClass("active");
		var dep = $(this).attr("level");
		$("#radial-depth-controller .level-btn").removeClass("active");		
		for (var i = 0; i <= dep; i++)
			$("#radial-depth-controller .level-btn[level=" + i + "]").addClass("active");		
		// $(this).addClass("active");
		draw_depth(dep);
	});
	// draw the histogram of the distribution
	function changeHis(){
		var multi = 4;
		for(var countIndex = 0;countIndex<countArray.length;countIndex++){
			countArray[countIndex] = 0;
		}
		timeData = _.filter(treeNodeList, function(d) {
			return !Array.isArray(d.values);
		});
		for(var i=0;i<timeData.length;i++){
			var eachData = + timeData[i].values;
			timeDataSum = timeDataSum + eachData;
		}
		// console.log("timeData",timeData);
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
		// console.log("originalDataSizeArray",originalDataSizeArray);
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
			.on("brushend",brushed);

		for(var i=0;i<(d3.max(dataSizeArray)+1)/multi;i=i+1){
			xAxisTicks.push(i);
		}
		his_width = (width - 1.2 * move_x)/(d3.max(dataSizeArray) + 1);
		xAxis.tickValues(xAxisTicks);
		lineY.domain(d3.extent(countArray));
		for(var i=0;i<countArray.length;i++){
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

		d3.select("#histogramView")
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
		.attr("y",14)
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

	function setSvgAttr(svg,width,height){
	  	svg.attr("width", width + "px");
	  	svg.attr("height", height + "px");
	  	svg.style("transform", "translate(" + padding + "px," + padding + "px)");
	}
	setSvgAttr(svg,width,height)

	// svg = svg.append("g")

	if(!svg){
		svg = d3.select("body").append("svg");
	}
	// svg.attr("width", diameter)
	// 	.attr("height", diameter - 40)
	svg = svg.append("g")
		.attr("transform", "translate(" + diameter / 2 + "," + (diameter / 2 - 3 * padding) + ")");

	svg.call(tip);

	update(root);

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
			.attr("fill","#CCC29C")
			.attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
			.attr("id", function(d) {
				return "radial-node-" + d.id;
			})
			.on("click",click)
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

		nodeEnter.append("circle")
			.attr("r", function(d,i){
				if(((d.values)&&(!Array.isArray(d.values)))||
					((d._values)&&(!Array.isArray(d._values)))){
					return 1;
				}
				return (4.5 - d.depth) * 2;
			});

		var nodeUpdate = node.transition().duration(duration)
						.attr("transform",function(d){
							return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
						});

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
	function brushed() {
	  var extentX = d3.select(".extent").attr("x");
	  var extentWidth = d3.select(".extent").attr("width");
	    if(extentWidth > his_width/3){
	  	  var beginIndexX = Math.floor(extentX / his_width);
		  var includeNum = Math.round(extentWidth / his_width);
		  // d3.select("#histogramView").selectAll(".his").attr("fill","steelblue");
		  d3.select("#histogramView").selectAll(".his").classed("highlight", false)
		  for(var i=0;i<=includeNum;i++){
		  	// d3.select("#histogramView").select("#his" + (beginIndexX + i)).attr("fill","#b2df8a");
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
	function click(d, i) {
		if (d.values) {
			d._values = d.values;
			d.values = null;
		} else {
			d.values = d._values;
			d._values = null;
		}
		if(d.depth!=4){
			if(d3.select(this).attr("fill")=="#CCC29C"){
				d3.select(this).attr("fill","steelblue");
			}else if(d3.select(this).attr("fill")=="steelblue"){
				d3.select(this).attr("fill","#CCC29C");
			}
		}
		treeNodeList = tree.nodes(root);
		update(d);
	}
	function draw_depth(hide_depth){
		var iterator = 1;
		for(var i=0;i<treeNodeList.length;i++){
			if(treeNodeList[i]._values){
				treeNodeList[i].values = treeNodeList[i]._values;
				treeNodeList[i]._values = null;
			}
		}
		treeNodeList = tree.nodes(root);
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
		treeNodeList = tree.nodes(root);
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
        	draw_depth(data);
        }	
        if(message=="changeData"){
        	console.log("radial",data);
        }
    }
    return Radial;
}

