var treeSelect = function(){
	var thisViewName = 'tree-select';
	var SelectTree = {name: thisViewName};
	ObserverManager.addListener(SelectTree);
	var svgWidth = $("#innerTopLeft").width();
	var svgHeight = $("#innerTopLeft").height() * 19/20;
	var compareArray = [0, 1];
	var statData = dataCenter.stats;
	//var propotionArray = [];
	//var timeSortArray = [];
	var dataList = timeSortArray;
	var sortMode = dataCenter.global_variable.sort_mode;
	d3.select("#mainTimeline")
		.attr("width", svgWidth)
		.attr("height", svgHeight);
	var svg = d3.select('#mainTimeline');
	var hisWidth = 0;
	var margin = {top: 20, right: 40, bottom: 20, left: 40},
    		width = svgWidth - margin.left - margin.right,
    		height = svgHeight - margin.top - margin.bottom;
    var chart = null;
	var timeSortArray = dataCenter.global_variable.time_sort_array;
	var propotionArray = dataCenter.global_variable.propotion_array;
	//reset_selection(timeSortArray);
	var currentId = dataCenter.global_variable.current_id;
	var selectionArray = dataCenter.global_variable.selection_array;
    var currentNodeIdBefore = dataCenter.global_variable.current_nodeid_before;
	drawHistogram(timeSortArray);
	get_labelA_text_and_change();
	for(var i = 0;i < selectionArray.length;i++){
		d3.selectAll('.node' + selectionArray[i]).classed('selection', true);
	}
	append_current_circle(currentId);
	//click the other part in the histogram view to cancel selection
	$('.background-control-highlight,.toolbar:not(#hover-arc-div, #slider-container, #slider-text),.arc-path').mouseout(function(d,i){
		remove_hover_highlight();
		remove_arc_num_text();
		re_display_halfremove_arc_to_all();
		if(dataCenter.global_variable.current_id != null){
			add_arc(dataCenter.global_variable.current_id, 'click');
		}	
		if(dataCenter.global_variable.show_arc){
			re_display_remove_arc_to_all();
		}else{
			hide_arc_to_all();
		}
		dataCenter.set_global_variable('mouse_over_signal_tree', null, thisViewName);
	});
	$('.remove-highlight').mouseover(function(d,i){
		remove_hover_highlight();
	});
	function remove_hover_highlight(){
		svg.selectAll('.bar')
	  	 	.classed('opacity-unhighlight', false);
	  	svg.selectAll('.bar')
	  		.classed('focus-highlight', false);
	    //svg.selectAll('.bar')
	    //.classed('opacity-highlight', false);
	    d3.selectAll('.hover').remove();
	    d3.selectAll('.bar:not(.opacity-click-highlight)').style('fill','#C0C0C0');
	    //dataCenter.set_global_variable('mouse_over_signal_tree', null);
	    ObserverManager.post("similarity-node-array", []);
	    dataCenter.set_global_variable('mouse_over_signal_tree', null, thisViewName);
	}
	$("#innerTopRight").css("font-size", 12 + "px");  
	function processStatData() {
		var timeSortArray = [];
		var propotionArray = [];
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
	 	return [timeSortArray, propotionArray];
	}
	function drawHistogram(dataArray){
		svg.selectAll("*").remove();
		sortMode = dataCenter.global_variable.sort_mode;
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
		var tip = d3.tip()
			.attr('class', 'd3-tip')
			.html(function(d, i) {
				var time = d.time;
				var aTime = time.replace("XX.csv","");
				var aValue = d.value;
				return "<span style='font-size:12px;  '>date:" + aTime +"&nbsp;&nbsp;Values:" + d3.format(".3s")(aValue) + "bytes" + "</span>";
			});
		tip.offset(function(d){
			var tmpy = - yScale(Math.log(d.value)) + 5;
			var tmpx = 0;
			return [tmpy,tmpx];
			/*if(i < 10){
				tmpx = (10 - i) * xScale(1);
			}
			else if(i > 76){
				tmpx = (76 - i) * xScale(1);
			}*/		
		});
		svg.call(tip);
		hisWidth = xScale(1) - 1;
		console.log(dataArray);
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
	 	var appendRect = rectg.append("rect")
	 		.attr("id",function(d, i){
				return "his-" + i;
			})
			.attr("index", function(d, i) {
				return d.index;
			})
			.attr("class", function(d, i) {
				var className = "bar bar-add-arc node" + d.time;
				var selectionArray = dataCenter.global_variable.selection_array;
				if(selectionArray.indexOf(d.time) != -1){
					className = className + ' selection';
				}
				return className;
			})
			.attr("width", function(d,i) {
				return xScale(1) - 1.75;
			})
			.attr("height",function(d,i){
				var logValue = 0;
				if(d.value != 0){
					logValue = Math.log(d.value);
				}
				return height - yScale(logValue) - 1;
			})
			.attr("y",function(d){
				var logValue = 0;
				if(d.value != 0){
					logValue = Math.log(d.value);
				}
				return yScale(logValue);
			})
			.attr("x",function(d,i){ 
				return xScale(i) + 2;
			})
			.on("mouseover",function(d,i){
				dataCenter.set_global_variable('mouse_over_signal_tree', null, thisViewName);
				if(dataCenter.global_variable.show_arc){
					half_hide_arc_to_all();
				}else{
					hide_arc_to_all();
				}
				remove_arc_num_text();
				d3.selectAll('.bar:not(.opacity-click-highlight)')
	    			.classed('opacity-unhighlight', true);
	    		d3.selectAll('.arc-path:not(.click):not(.default)').remove();
	    		d3.selectAll('.arc-path:not(.default)').remove();
	    		var element = 'node' + d.time.replace("XX.csv","");
	    		//add arc
	    		var id = d3.select(this).attr('id');
	    		if(dataCenter.global_variable.hover_show_arc){
	    			var currentFill = d3.select(this).style('fill');
	    			if(currentFill == 'rgb(192, 192, 192)'){
	    				add_arc(d.time, 'hover');
	    			}else{
	    				add_arc(dataCenter.global_variable.current_id, 'hover');
	    			}
	    		}
	    		//ObserverManager.post("similarity-node-array", [element]);
	    		d3.select(this).classed('opacity-unhighlight', false);
	    		d3.select(this).classed('focus-highlight', true);
	    		if(dataCenter.global_variable.enable_tooltip){
	    			tip.show(d,i);
	    		}
	    		dataCenter.set_global_variable('mouse_over_signal_tree', d.time, thisViewName);
			})
			.on("mouseout",function(d,i){
				/*svg.selectAll('.bar')
	    		.classed('opacity-unhighlight', false);
	    		svg.selectAll('.bar')
	    		.classed('opacity-highlight', false);*/
	    		//add arc
	    		var id = d3.select(this).attr('id');
	    		var selectionArray = dataCenter.global_variable.selection_array;
	    		if(dataCenter.global_variable.enable_tooltip){
	    			tip.hide(d,i);
	    		}
	    		d3.select(this).classed('focus-highlight', false);
			})
			.on('click',function(d,i){
				var this_node = d3.select(this);
				var id = d3.select(this).attr('id');
				var signalTreeTime = d.time;
				var selectionArray = dataCenter.global_variable.selection_array;
				var selectionObjectArray = dataCenter.global_variable.selection_object_array;
				var currentId = dataCenter.global_variable.current_id;
				var currentNodeIdBefore = dataCenter.global_variable.current_nodeid_before;
				if(selectionArray.indexOf(signalTreeTime) == -1){
					var selectionObject = new Object();
					selectionObject.tree_name = signalTreeTime;
					//selectionObject.index = 
					selectionObjectArray.push(selectionObject);
					selectionArray.push(signalTreeTime);
					var thisNode = d3.select(this);
					add_selection_text(selectionArray);		
					ObserverManager.post('changeData', selectionArray);
					d3.select(this).classed('selection', true);
					append_current_circle(signalTreeTime);
					currentNodeIdBefore.push(signalTreeTime);
					//增加节点
					for(var j = 0;j < selectionArray.length;j++){
						if(selectionArray != signalTreeTime){
							add_arc(selectionArray[j], 'unclick');
						}
					}
					add_arc(signalTreeTime, 'click');
				}else{				
					for(var j = 0;j < selectionArray.length;j++){
						if(selectionArray != signalTreeTime){
							add_arc(selectionArray[j], 'unclick');
						}
					}
					if(currentId == signalTreeTime){
						d3.select(this).classed('selection', false);
						add_arc(signalTreeTime, 'unclick');
						selectionArray.splice(selectionArray.indexOf(signalTreeTime), 1);
						add_selection_text(selectionArray);
						for(var j = 0;j < currentNodeIdBefore.length;j++){
							if(currentNodeIdBefore[j] == signalTreeTime){
								currentNodeIdBefore.splice(j, 1);
							}
						}
						if(currentNodeIdBefore.length != 0){
							var formerSignalTreeTime = currentNodeIdBefore[currentNodeIdBefore.length - 1];
							append_current_circle(formerSignalTreeTime);
							for(var j = 0;j < selectionArray.length;j++){
								if(selectionArray != signalTreeTime){
									add_arc(selectionArray[j], 'unclick');
								}
							}
							add_arc(formerSignalTreeTime, 'click');
						}else{
							dataCenter.set_global_variable('current_id', null, thisViewName);
							d3.selectAll('.append-current-circle').remove();
						}
						ObserverManager.post('changeData', selectionArray);
					}else{
						add_arc(signalTreeTime, 'click');
						append_current_circle(signalTreeTime);
						ObserverManager.post('changeData', selectionArray);
					}
				}
			});
		var selectionArray = dataCenter.global_variable.selection_array;
		add_selection_text(selectionArray);

		/*rectg.append("polygon")
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
			.attr("opacity",0);*/

		// draw x-axis ticks
		if (sortMode == "time") {
			var xBegin = -1;
			console.log(dataArray);
			for (var i = 0; i < dataArray.length; i++) {
				if (dataArray[i].time.substring(0, 4) != xBegin) {
					xBegin = dataArray[i].time.substring(0, 4);
					xAxisGroup.append("text")
						.attr("class", "tick-label")
						.attr("y", 15)
						.attr("x", chart.select("#his-" + i).attr("x"))
						.text(xBegin);
				}
				xBegin = dataArray[i].time.substring(0, 4);
			}			
		}
		if(dataCenter.global_variable.show_arc){
			add_arc_to_all();
		}else{
			hide_arc_to_all();
		}
		//changeComparedData();
		//function changeComparedData() {
		//	ObserverManager.post("changeData", selectionArray);
		//}
	}
	function add_selection_text(){
		svg.selectAll('.selection-node').remove();
		var selectionArray = dataCenter.global_variable.selection_array;
        for(var i = 0;i < selectionArray.length;i++){
        	var thisNodeName = selectionArray[i];
        	var thisNode = d3.select('.node' + thisNodeName);
			var label = i;//String.fromCharCode(97 + i).toUpperCase();
			var thisX = +thisNode.attr('x') + margin.left;
			var thisY = +thisNode.attr('y') + margin.top;
			var thisWidth = +thisNode.attr('width');
			var rectY = thisY - thisWidth - 1;
			var centerX = thisX + thisWidth / 2; 
			var centerY = thisY - 3;
			var textNode = svg.append('g')
				.attr('class', 'selection-node');
			/*textNode.append('rect')
				.attr('x', thisX)
				.attr('y', rectY)
				.attr('width', thisWidth)
				.attr('height', thisWidth);*/
			textNode.append('text')
				.attr("text-anchor", "middle")
				.attr('x', centerX)
				.attr('y', centerY)
				.text(label);
        }
	}
	function append_current_circle(signal_tree_time){
		d3.selectAll('.append-current-circle').remove();
		if(signal_tree_time != null){
			var signalTreeTimeRemove = signal_tree_time.replace('XX.csv', '');
			var this_node = d3.select('.node' + signalTreeTimeRemove);
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
			dataCenter.global_variable.current_id = signal_tree_time;
			ObserverManager.post('change-current-data', signal_tree_time);
		}
	}
	function clear_current_circle(){
		d3.selectAll('.append-current-circle').remove();
	}
	function add_arc_to_all(){
		if(d3.selectAll('.arc-path.default')[0].length == 0){
			d3.selectAll('.bar-add-arc').each(function(d,i){
				var id = d3.select(this).attr('id');
				add_arc(d.time, 'default');
			});
		}else{
			re_display_remove_arc_to_all();
		}
	}
	function re_display_remove_arc_to_all(){
		d3.selectAll('.default').classed('opacity-remove', false);
	}
	function re_display_halfremove_arc_to_all(){
		d3.selectAll('.default').classed('half-opacity-remove', false);
	}
	function half_hide_arc_to_all(){
		d3.selectAll('.default').classed('half-opacity-remove', true);
	}
	function hide_arc_to_all(){
		d3.selectAll('.default').classed('opacity-remove', true);
	}
	/*
	* @parameter: index用来在similarityMatrix中寻找当前哪一列是用来绘制的相似度数组 
	* 			  thisID用来寻找rect的位置
	* 			  arcNum表示当前是标记默认绘制arc连接的数量 
	*/
	function add_arc(file_name, type){
		var similarityObj = null;
		//计算与传入节点最相似的节点名称
		for(var i = 0;i < dataCenter.similarityMatrix.length;i++){
			if(dataCenter.similarityMatrix[i].fileName.replace('XX.csv', '') == file_name){
				similarityObj = dataCenter.similarityMatrix[i];
			}
		}
		var similarityObjArray = new Array();
		for(var i = 0;i < dataCenter.similarityMatrix.length;i++){
			var allFileName = dataCenter.similarityMatrix[i].fileName.replace('.csv','').replace('XX','');
			//寻找除自己之外的最相似节点，因此在得到相似节点数组的时候将自己排除在外
			if(allFileName != file_name){
				similarityObjArray[i] = new Object();
				similarityObjArray[i].fileName = dataCenter.similarityMatrix[i].fileName.replace('.csv','').replace('XX','');
				similarityObjArray[i].similarityValue = +similarityObj['attr' + i];
			}
		}
		similarityObjArray.sort(function(a,b){
			return b.similarityValue - a.similarityValue;
		});
		var element = 'node' + file_name.replace("XX.csv","");
		var thisEle = d3.select('.' + element);
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
		}else if(type == 'click' || type == 'unclick'){
			if(dataCenter.global_variable.hover_show_arc){
				arcNum = dataCenter.global_variable.hover_arc_link_num;
			}else{
				arcNum = 0;
			}
			addClass = type;
		}
		var opacityScale = d3.scale.linear()
			.domain([0, arcNum])
			.range([0,1]);
		var dark = d3.rgb(200,200,200);
		var bright = d3.rgb(50,50,50);
		var compute = d3.interpolate(bright,dark); 
		remove_arc_num_text();
		d3.selectAll('.bar:not(.opacity-click-highlight):not(.node' + file_name + ')')
			.classed('opacity-unhighlight', true);
		d3.selectAll('.bar').style('fill', '#C0C0C0')
		d3.selectAll('.bar.opacity-click-highlight')
			.classed('opacity-unhighlight', true)
			.classed('opacity-click-highlight',false);
		d3.selectAll('.bar').classed('opacity-click-highlight', false);
		for(var i = 0;i < arcNum;i++){
			var fileName = similarityObjArray[i].fileName;
			var selectClassName = 'node' + fileName;
			var element = d3.select('.' + selectClassName);
			highlightNodeArray.push(selectClassName);
			if(type == 'hover' || type == 'click'){
				add_arc_num_text(fileName, i);
			}	
			d3.select('.node' + fileName)
				.classed('opacity-unhighlight',false);
			if(type == 'click'){
				d3.select('.node' + fileName)
					.classed('opacity-click-highlight',true);
			}else if(type == 'unclick'){
				d3.select('.node' + fileName)
					.classed('opacity-click-highlight',false);
				d3.select('.node' + fileName)
					.classed('opacity-unhighlight',true);
			}
			if(type == 'hover' || type == 'click'){
				var fillColorRectAndArc = compute(opacityScale(i));
				d3.select('.node' + fileName)
					.style('fill', fillColorRectAndArc);
			}else if(type == 'unclick'){
				d3.select('.node' + fileName)
					.style('fill', '#C0C0C0');
			}
			var rectX = +element.attr('x');
			var rectY = +element.attr('y');
			var rectWidth = +element.attr('width');
			var rectHeight = +element.attr('height');
			targetX = rectX + rectWidth / 2;
			targetY = rectY + rectHeight;
			centerX = (originX + targetX) / 2;
			centerY = targetY;
			radius = Math.abs(originX - targetX) / 2;
			if(type != 'unclick'){
				draw_arc(radius, centerX, centerY, addClass, fillColorRectAndArc, fileName);
			}else{
				d3.selectAll('.path-' + fileName).remove();
			}	
		}
		ObserverManager.post("similarity-node-array", highlightNodeArray);
	}
	function add_arc_num_text(select_class_name, number){
		//防止选中的rect的text与顺序的text冲突
		var selectionArray = dataCenter.global_variable.selection_array;
		if(selectionArray.indexOf(select_class_name) == -1){
			var thisNode = d3.select('.node' + select_class_name);
			var thisX = +thisNode.attr('x');
			var thisY = +thisNode.attr('y');
			var thisWidth = +thisNode.attr('width');
			var centerX = thisX + margin.left; 
			var centerY = thisY + margin.top - 2;
			svg.append('text')
				.attr('class', 'arc-num-label')
				.attr('x', centerX)
				.attr('y', centerY)
				.text(number + 1);
		}
	}
	function remove_arc_num_text(){
		d3.selectAll('.arc-num-label').remove(); 
	}
	function draw_arc(radius, center_x, center_y, add_class, fill_color_rect_and_arc, file_name){
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
	       	  return 'arc-path' + ' path-' + file_name + ' ' + add_class;
	       })
	       .style('stroke', fill_color_rect_and_arc)
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
		.attr("y",newY)
		.attr("height",rectHeight * percentage)
		.attr("width",hisWidth)
		// .attr("fill","#b2df8a");
		.classed("highlight", true);
	}
	changeLabelC("-", 0, 0, 0, 0, 0, 'blue');
	/*if(dataCenter.global_variable.current_bg_color == 'black'){
		_black_handler();
	}else if(dataCenter.global_variable.current_bg_color == 'white'){
		_white_handler();
	}*/
	function changeLabelC(tree_label ,nodeID, levelText, flowLevel, treeNodeNum, sumNodeNum, color){
		$("#innerTopRight #label-C #node-type").text(tree_label);
		if(color == 'blue'){
			change_color_to_blue();
		}else if(color == 'orange'){
			change_color_to_orange();
		}
		$("#innerTopRight #label-C #node-description").html(nodeID);
		$("#innerTopRight #label-C #level-description").html(levelText);
		$("#innerTopRight #label-C #flow-num-description").text(d3.format(".3s")(flowLevel) + 'bytes');
		$("#innerTopRight #label-C #tree-num-description").text(treeNodeNum);
		$("#innerTopRight #label-C #sub-node-description").text(sumNodeNum);
		function change_color_to_blue(){
			$("#innerTopRight #label-C #node-type").removeClass('orange-label');
			$("#innerTopRight #label-C #node-type").addClass('blue-label');
		}
		function change_color_to_orange(){
			$("#innerTopRight #label-C #node-type").removeClass('blue-label');
			$("#innerTopRight #label-C #node-type").addClass('orange-label');
		}
	}
	function changeLabelA(tree_label, date, value, level_num, node_num){
		console.log(tree_label);
		$('#innerTopRightTop #node-type').html(function(){
			return tree_label;
		});
		$("#innerTopRightTop #label-A .date_description").html(function() {
				var timeArray = date.split("-");
				return timeArray[0];
			return "";
		});
		$("#innerTopRightTop #label-A .value_description").html(function() {
				return  d3.format(".3s")(value) + "bytes" ;
			return "";
		});
		$('#innerTopRightTop #label-A .level_description').html(function(){
				return level_num;
			return "";
		});
		$("#innerTopRightTop #label-A .node_num_description").html(function() {
				return  node_num;
			return "";
		});
	}
	function update_selection_and_current(){
		var selectionArray = dataCenter.global_variable.selection_array;
		for(var i = 0;i < selectionArray.length;i++){
			d3.select('.node' + selectionArray[i]).classed('selection', true);
		}
		var currentId = dataCenter.global_variable.current_id;
		append_current_circle(currentId);
	}
	function _black_handler(){
		$('body').css('background-color', '#333');
		$('body').css('color', 'white');
		$('body').css('fill', 'white');
		$('.domain').css('stroke', 'white');
		$('.arc-path').css('stroke','white');
		$('.append-current-circle').css('fill', 'white');
		$('.append-current-circle').css('stroke', 'white');
		//$('span.button').css('border-bottom', '3px solid white');
		//$('span.button.active').css('border-bottom', '3px solid #2060d5');
		//$('#label-C').css('border-top', '1px solid black');
		$('.tick line').css('stroke', 'white');
		$('.button-group div').css('color', 'white');
		$('.button-group.bind div').css('color', 'white');
		$('.structure').css('border-color','black');
		$('.dimension line').css('stroke', 'white');
		$('#divide-line').css('border-top', '1px solid black');
		return;
	}
	function _white_handler(){
		$('body').css('background-color', 'white');
		$('body').css('color', 'black');
		$('body').css('fill', 'black');
		$('.domain').css('stroke', 'black');
		$('.arc-path').css('stroke','black');
		$('.append-current-circle').css('fill', 'black');
		$('.append-current-circle').css('stroke', 'black');
		//$('span.button').css('border-bottom', '3px solid #aaaaaa');
		//$('.active').css('border-bottom', '3px solid #2060d5');
		//$('#label-C').css('border-top', '1px solid gray');
		$('.tick line').css('stroke', 'black');
		$('.button-group div').css('color', '#bbbbbb');
		$('.button-group.bind div').css('color', 'black');
		$('.structure').css('border-color','#a0a0a0');
		$('.dimension line').css('stroke', 'black');
		return;
	}
	function _chinese_handler(){
		$('#title').attr('data-original-title', '关于本系统');
		$('#arc-link').attr('data-original-title', '全部显示连接');
		$('#arc-link-hover').attr('data-original-title', '鼠标悬停显示连接');
		$('#time-sort').attr('data-original-title', '按时间排序');
		$('#size-sort').attr('data-original-title', '按流量大小排序');
		$('#switch-selection').attr('data-original-title', '变换选择');
		$('#click-node-shrink').attr('data-original-title', '收缩选择节点');
		$('#click-other-node-shrink').attr('data-original-title', '收缩兄弟节点');
		$('#clear-all').attr('data-original-title', '清空');
		$('#load-file-name').attr('data-original-title', '加载文件');

		$('#change-color-white').attr('data-original-title', '白色背景');
		$('#change-color-black').attr('data-original-title', '黑色背景');
		$('#change-language-chinese').attr('data-original-title', '中文');
		$('#change-language-english').attr('data-original-title', '英文');

		$('#comparison-title').attr('data-original-title', '多树比较视图');
		$('#all-node-comparison').attr('data-original-title', '比较全部节点');
		$('#same-node-comparison').attr('data-original-title', '比较相同节点');
		$('#all-depth-comparison').attr('data-original-title', '显示全部层级');
		$('#two-depth-comparison').attr('data-original-title', '显示最后两层');
		$('#only-flow-comparison').attr('data-original-title', '显示流量大小');
		$('#shortest-flow-comparison').attr('data-original-title', '动态调整高度');
		$('#level-0').attr('data-original-title', '第1层');
		$('#level-1').attr('data-original-title', '第2层');
		$('#level-2').attr('data-original-title', '第3层');
		$('#level-3').attr('data-original-title', '第4层');
		$('#level-4').attr('data-original-title', '第5层');

		$('#single-tree-title').attr('data-original-title', '单树视图');
		$('#radial-tree').attr('data-original-title', 'radial');
		$('#sunburst-tree').attr('data-original-title', 'sunburst');
		$('#tree-view').attr('data-original-title', '树结构可视化');
		$('#original-projection').attr('data-original-title', '投影视图');
		$('#center-projection').attr('data-original-title', '链接投影视图');
		$('#center-size-glyph').attr('data-original-title', '大小编码投影视图');
		$('#center-subgraph-glyph').attr('data-original-title', '子图编码投影视图');
		$('#center-sunburst-glyph').attr('data-original-title', 'sunburst编码投影视图');

		$('#title-div #title').html('信号树可视化系统');
		$('#title-div #comparison-title').html('多树比较视图');
		$('#title-div #single-tree-title').html('单树视图');
		$('#label-A .date_label').html('<strong>日期:</strong>');
		$('#label-A .value_label').html('<strong>数值:</strong>');
		$('#label-A .level_label').html('<strong>层级:</strong>');
		$('#label-A .node_num_label').html('<strong>节点数量:</strong>');

		$('#label-C #node-label').html('<strong>节点名称:</strong>');
		$('#label-C #level-label').html('<strong>层级:</strong>');
		$('#label-C #flow-num-label').html('<strong>流量大小:</strong>');
		$('#label-C #tree-num-label').html('<strong>编号:</strong>');
		$('#label-C #sub-node-label').html('<strong>子节点数量:</strong>');
		$('#histogram-label-text').html('流量分布柱状图');
		$('.button').tooltip(); 
	}
	function _english_handler(){
		$('#title').attr('data-original-title', 'about this system');
		$('#arc-link').attr('data-original-title', 'draw the whole arc links');
		$('#arc-link-hover').attr('data-original-title', 'draw the arc links when hover');
		$('#time-sort').attr('data-original-title', 'sorting according to time');
		$('#size-sort').attr('data-original-title', 'sorting according to flow size');
		$('#switch-selection').attr('data-original-title', 'switch the selection');
		$('#click-node-shrink').attr('data-original-title', 'shrink the click node');
		$('#click-other-node-shrink').attr('data-original-title', 'shrink the sibling nodes');
		$('#clear-all').attr('data-original-title', 'clear');
		$('#load-file-name').attr('data-original-title', 'load file');

		$('#change-color-white').attr('data-original-title', 'white background');
		$('#change-color-black').attr('data-original-title', 'black background');
		$('#change-language-chinese').attr('data-original-title', 'Chinese');
		$('#change-language-english').attr('data-original-title', 'English');

		$('#comparison-title').attr('data-original-title', 'multi-tree comparison');
		$('#all-node-comparison').attr('data-original-title', 'compare all the nodes');
		$('#same-node-comparison').attr('data-original-title', 'compare the same nodes');
		$('#all-depth-comparison').attr('data-original-title', 'compare the whole levels');
		$('#two-depth-comparison').attr('data-original-title', 'compare the last two levels');
		$('#only-flow-comparison').attr('data-original-title', 'compare the last level(flow size)');
		$('#shortest-flow-comparison').attr('data-original-title', 'switch the selection');
		$('#level-0').attr('data-original-title', 'first-level');
		$('#level-1').attr('data-original-title', 'second-level');
		$('#level-2').attr('data-original-title', 'third-level');
		$('#level-3').attr('data-original-title', 'forth-level');
		$('#level-4').attr('data-original-title', 'fifth-level');

		$('#single-tree-title').attr('data-original-title', 'single tree visualization');
		$('#radial-tree').attr('data-original-title', 'radial');
		$('#sunburst-tree').attr('data-original-title', 'sunburst');
		$('#tree-view').attr('data-original-title', 'tree view');
		$('#original-projection').attr('data-original-title', 'original projection view');
		$('#center-projection').attr('data-original-title', 'linked projection view');
		$('#center-size-glyph').attr('data-original-title', 'sized projection view');
		$('#center-subgraph-glyph').attr('data-original-title', 'subgraph projection view');
		$('#center-sunburst-glyph').attr('data-original-title', 'sunburst projection view');

		$('#label-A .date_label').html('<strong>Date:</strong>');
		$('#label-A .value_label').html('<strong>Values:</strong>');
		$('#label-A .level_label').html('<strong>Level:</strong>');
		$('#label-A .node_num_label').html('<strong>Node Num:</strong>');

		$('#label-C #node-label').html('<strong>Node:</strong>');
		$('#label-C #level-label').html('<strong>Level:</strong>');
		$('#label-C #flow-num-label').html('<strong>FlowNum:</strong>');
		$('#label-C #tree-num-label').html('<strong>TreeNum:</strong>');
		$('#label-C #sub-node-label').html('<strong>SubNode:</strong>');
		$('#histogram-label-text').html('Flow Distribution');
		$('.button').tooltip(); 
	}
	function _projection_highlight(data){
		d3.selectAll('.bar')
		.classed('opacity-highlight', false);
		d3.selectAll('.bar')
		.classed('opacity-unhighlight', true);
		d3.select('.' + data)
		.classed('opacity-unhighlight', false);
		//d3.select('.' + data)
		//.classed('opacity-highlight', true);
	}
	function _projection_unhighlight(){
		d3.selectAll('.bar')
	    .classed('opacity-unhighlight', false);
	    d3.selectAll('.bar')
	    .classed('opacity-highlight', false);
	}
	function get_labelA_text_and_change(){
		var currentId = dataCenter.global_variable.current_id;
		var selectionArray = dataCenter.global_variable.selection_array;
		var tree_label = selectionArray.indexOf(currentId);
        for(var i = 0;i < dataCenter.datasets.length;i++){
        	if(currentId == dataCenter.datasets[i].id){
        		if(dataCenter.datasets[i].processor.result.treeRoot != undefined){
        			var tree_root = dataCenter.datasets[i].processor.result.treeRoot;
        			console.log(tree_root);
	        		var nodeNum = tree_root.allChilldrenCount;
	        		var flowSize = tree_root.flow;
	        		var levelNum = 5;
	        		var date = currentId;
	        		changeLabelA(tree_label, date, flowSize, levelNum, nodeNum);
	        		break;
        		}
        	}
        }
	}
	SelectTree.OMListen = function(message, data) {
		var svg = d3.select('#mainTimeline');
	    if (message == "percentage") {
			changePercentage(data);
	    }
	    if ((message == "show-detail-info") || (message == 'set:mouse_over_signal_node')) {
	    	if(data != null){
	    		var selectionArray = dataCenter.global_variable.selection_array;
		    	var tree_label = data.tree_label;
		    	var tree_index = selectionArray.indexOf(tree_label);
		    	//var tree_letter = String.fromCharCode(97 + tree_index).toUpperCase();;
		    	var node = data.node;		    	
		    	if(node!= null){
		    		var nodeID = node.key;
			    	var levelText = node.id.split("-").length - 1;
			    	var flowLevel = node.flow;
			    	var treeNodeNum = Array.isArray(node.values) ? node.values.length : 0;
			    	var sumNodeNum = node.allChilldrenCount;
			    	changeLabelC(tree_index, nodeID, levelText, flowLevel, treeNodeNum, sumNodeNum);
		    	}
	    	}else{
	    		changeLabelC('-', 0, 0, 0, 0, 0)
	    	}
	    }
	    if(message == 'projection-highlight'){
	    	if(data != null){
	    		_projection_highlight(data);
	    	}else{
	    		_projection_unhighlight();
	    	}
	    }
	    if(message == 'set:show_arc'){
	    	if(dataCenter.global_variable.show_arc){
	    		add_arc_to_all();
	    		$('#arc-link').addClass('active');
	    	}else{
	    		hide_arc_to_all();
	    		$('#arc-link').removeClass('active');
	    	}
	    }
	    if(message == 'set:sort_mode'){
	    	if(dataCenter.global_variable.sort_mode == 'time'){
	    		drawHistogram(timeSortArray);
				if(dataCenter.global_variable.show_arc){
					add_arc_to_all();
				}
				$('#time-sort').addClass('active');
				$('#size-sort').removeClass('active');
	    	}else if(dataCenter.global_variable.sort_mode == 'size'){
	    		drawHistogram(propotionArray);
				if(dataCenter.global_variable.show_arc){
					add_arc_to_all();
				}
				$('#size-sort').addClass('active');
				$('#time-sort').removeClass('active');
	    	}
	    }
	    if(message == 'set:hover_show_arc'){
	    	if(dataCenter.global_variable.hover_show_arc){
	    		$('#arc-link-hover').addClass('active');
	    	}else{
	    		$('#arc-link-hover').removeClass('active');
	    	}
	    }
	    if(message == 'set:click_thisNode_shrink'){
	    	if(dataCenter.global_variable.click_thisNode_shrink){
	    		$('#click-node-shrink').addClass('active');
				$('#click-other-node-shrink').removeClass('active');
	    	}else{
	    		$('#click-other-node-shrink').addClass('active');
				$('#click-node-shrink').removeClass('active');
	    	}
	    }
	    if(message == 'set:current_bg_color'){
	    	if(dataCenter.global_variable.current_bg_color == 'black'){
	    		$('#change-color-black').addClass('active');
	    		$('#change-color-white').removeClass('active');
	    		_black_handler();
	    	}else{
	    		$('#change-color-white').addClass('active');
	    		$('#change-color-black').removeClass('active');
	    		_white_handler();
	    	}
	    }
	    if(message == 'set:current_bg_language'){
	    	if(dataCenter.global_variable.current_bg_language == 'chinese'){
	    		$('#change-language-chinese').addClass('active');
	    		$('#change-language-english').removeClass('active');
	    		_chinese_handler();
	    	}else{
	    		$('#change-language-english').addClass('active');
	    		$('#change-language-chinese').removeClass('active');
	    		_english_handler();
	    	}
	    }
	    if(message == 'update-view'){
	    	update_selection_and_current();
	    	var selectionArray = dataCenter.global_variable.selection_array;
	    	dataCenter.global_variable.current_id = selectionArray[selectionArray.length - 1];
	    	svg.selectAll('.bar').classed('selection', false);
	    	for(var i = 0;i < selectionArray.length;i++){
	    		svg.select('.node' + selectionArray[i]).classed('selection', true);
	    	}
	    	add_selection_text(selectionArray);
	    	if(message == "update-view"){
        		get_labelA_text_and_change();
	        }
	        var currentId = dataCenter.global_variable.current_id;
	        append_current_circle(currentId);
	    }
	    if(message == 'set:selection_array'){
	    	var selectionArray = dataCenter.global_variable.selection_array;
	    	console.log(selectionArray);
	    	svg.selectAll('.bar').classed('selection', false);
	    	for(var i = 0;i < selectionArray.length;i++){
	    		svg.select('.node' + selectionArray[i]).classed('selection', true);
	    	}
	    	add_selection_text(selectionArray);
	    	var currentId = dataCenter.global_variable.current_id
	    	if(selectionArray.indexOf(currentId) == -1){
	    		//目前删除的节点正是当前 focus的节点，则需要更换另一个节点作为当前操作的节点
	    		var currentNodeIdBefore = dataCenter.global_variable.current_nodeid_before;
	    		for(var j = 0;j < currentNodeIdBefore.length;j++){
					if(currentNodeIdBefore[j] == currentId){
						currentNodeIdBefore.splice(j, 1);
					}
				}
				currentId = currentNodeIdBefore[currentNodeIdBefore.length - 1];
	    	}
	    }
	    if(message == 'set:hover_arc_link_num'){
	    	var hoverArcLinkNum = dataCenter.global_variable.hover_arc_link_num;
	    	if(dataCenter.global_variable.hover_show_arc 
	    		&& (dataCenter.global_variable.current_id != null)){
	    		add_arc(dataCenter.global_variable.current_id, 'click');
	    	}
	    }
	    if(message == 'set:mouse_over_signal_tree'){
	    	var mouseOverSignalTree = dataCenter.global_variable.mouse_over_signal_tree;	
	    	if(mouseOverSignalTree != null){
	    		svg.selectAll('.bar').classed('focus-highlight', false);
	    		svg.selectAll('.node' + mouseOverSignalTree).classed('focus-highlight', true);
	    	}else{
	    		svg.selectAll('.bar').classed('focus-highlight', false);
	    	}
	    }
    }
	return SelectTree;
}