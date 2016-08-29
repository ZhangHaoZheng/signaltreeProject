var projection = {
	name:'projection-view',
	initialize: function(){
		var self = this;
		self._add_to_listener();
		self._bind_view();
		self._render_view();
		return self;
	},
	_add_to_listener: function(){
		var self = this;
		ObserverManager.addListener(self);
	},
	_bind_view: function(){

	},
	_render_view: function(projection_method){
		var self = this;
		var padding  = 10;
		var width = $('#projectionWrapper').width() - padding * 2;
		var height = $('#projectionWrapper').height() - padding * 2;
		var tip = d3.tip()
		  .attr('class', 'd3-tip')
		  .offset([-10, 0])
		  .html(function(d) {
		    return d[2] + "</span>";
		  });
		var svg = d3.select('svg.projection')
		.attr('width', width)
		.attr('height', height);
		svg.call(tip);
		svg.selectAll('*').remove();
		var selectionArray = dataCenter.global_variable.selection_array;
		var mdsByDistance = window["MDS"]["byDistance"];
		var coordinate = mdsByDistance(dataCenter.distanceMatrix);
		var nodeNum = coordinate.length;
		var nodeLocation = new Array(nodeNum);
		self.nodeLocation = nodeLocation;
		for(var i = 0;i < nodeNum;i++){
			nodeLocation[i] = new Array();
			nodeLocation[i][0] = coordinate[i][0] * width * 0.9 + width * 0.05;
			nodeLocation[i][1] = coordinate[i][1] * height * 0.9 + height * 0.05;
			nodeLocation[i][2] = dataCenter.distanceObject[i].fileName.replace('.csv','').replace('XX','')
		}
		if(projection_method == 'center-projection'){
			self.draw_link(nodeLocation);	
		}
		nodeLocation.sort(function(a, b){
			return selectionArray.indexOf(b[2]) - selectionArray.indexOf(a[2]);
		});
		svg.selectAll(".projection-nodes")
	    .data(nodeLocation)
	  	.enter()
	  	.append("circle")
	  	.attr('class', function(d,i){
	  		var className =  'nodes projection-nodes';
	  		var id = dataCenter.distanceObject[i].fileName.replace('.csv','').replace('XX','');
	  		var selectionArray = dataCenter.global_variable.selection_array;
			if(selectionArray.indexOf(id) != -1){
				className = className + ' opacity-click-highlight';
			}
			className = className + ' node' + d[2];
			return className;
	  	})
		.attr('id', function(d,i){
			var idName = 'node' + d[2];
			return idName;
		})
		.attr('cx', function(d,i){
			return d[0];
		})
		.attr('cy', function(d,i){
			return d[1];
		})
	    .on('mouseover', function(d,i){
			//send message, highlight the corresponding histogram
			//tip.show(d);
			self._mouseover_handler(this);
			//dataCenter.set_global_variable('mouse_over_signal_tree', nodeId);
		})
		.on('mouseout', function(d,i){
			//send message, unhighlight the corresponding histogram
			//tip.hide(d);
			/*ObserverManager.post("projection-highlight", null);
			d3.selectAll('.projection-nodes').classed('opacity-unhighlight', false);
			d3.selectAll('.projection-nodes').classed('opacity-highlight', false);
			d3.select(this).classed('focus-highlight', false);*/

			//dataCenter.set_global_variable('mouse_over_signal_tree', null);
			self._mouseout_handler(this);
		})
		.on('click', function(d,i){
			//re-projection according to this node
			/*var thisId = d3.select(this).attr('id');
			var nodeId = thisId.replace('node','');
			if(d3.select(this).classed('opacity-click-highlight')){
				d3.select(this).classed('opacity-click-highlight', false);
				selectionArray.splice(selectionArray.indexOf(nodeId), 1);
			}else{
				d3.select(this).classed('opacity-click-highlight', true);
				selectionArray.push(nodeId);
			}
			console.log('selectionArray', selectionArray);
			ObserverManager.post('changeData', selectionArray);*/
			self._click_handler(this);
		});
		self.putOnTopForSelectionNode(nodeLocation);
		// Returns an attrTween for translating along the specified path element.
		function translateAlong(path) {
		  var l = path.getTotalLength();
		  return function(d, i, a) {
		    return function(t) {
		      var p = path.getPointAtLength(t * l);
		      return "translate(" + p.x + "," + p.y + ")";
		    };
		  };
		}
		self.append_selection_text();
		//
		/*var selectionArray = dataCenter.global_variable.selection_array;
		d3.selectAll('.projection-nodes').classed('opacity-selection-unhighlight', true);
		for(var i = 0;i < selectionArray.length;i++){
			d3.select('#node' + selectionArray[i]).classed('opacity-selection-unhighlight', false);
			d3.select('#node' + selectionArray[i]).classed('opacity-selection-highlight', true);
		}*/
	},
	putOnTopForSelectionNode:function(){
		var self = this;
		var node_location = self.nodeLocation;
		var selectionArray = dataCenter.global_variable.selection_array;
		var selectionNodeArray = [];
		var nodeNum = node_location.length;
		for(var i = 0;i < nodeNum;i++){
			for(var j = 0;j < selectionArray.length;j++){
				if(node_location[i][2] == selectionArray[j]){
					selectionNodeArray.push(node_location[i]);
				} 
			}
		}
		var svg = d3.select('svg.projection');
		svg.selectAll('.opacity-click-highlight').remove();
		svg.selectAll('.opacity-click-highlight')
		.data(selectionNodeArray)
		.enter()
		.append('circle')
		.attr('class', 'projection-nodes opacity-click-highlight')
		.attr('id', function(d,i){
			return 'node' + d[2] 
		})
		.attr('cx', function(d,i){
			return d[0];
		})
		.attr('cy', function(d,i){
			return d[1];
		})
	    .on('mouseover', function(d,i){
			//send message, highlight the corresponding histogram
			//tip.show(d);
			/*var thisId = d3.select(this).attr('id');
			ObserverManager.post("projection-highlight", thisId);
			d3.selectAll('.projection-nodes:not(#' + thisId +')').classed('opacity-unhighlight', true);
			d3.select(this).classed('opacity-highlight', true);
			d3.select(this).classed('focus-highlight', true);
			var nodeId = thisId.replace('node','');*/
			self._mouseover_handler(this);
			//dataCenter.set_global_variable('mouse_over_signal_tree', nodeId);
		})
		.on('mouseout', function(d,i){
			//send message, unhighlight the corresponding histogram
			//tip.hide(d);
			//ObserverManager.post("projection-highlight", null);
			//d3.select(this).classed('focus-highlight', false);
			self._mouseout_handler(this);
			//dataCenter.set_global_variable('mouse_over_signal_tree', null);
		})
		.on('click', function(d,i){
			//re-projection according to this node
			self._click_handler(this);
		});
	},
	_mouseover_handler: function(_this){
		var self = this;
		var svg = d3.select('svg.projection');
		var thisId = d3.select(_this).attr('id');
		ObserverManager.post("projection-highlight", thisId);
		svg.selectAll('.projection-nodes:not(#' + thisId +')').classed('opacity-unhighlight', true);
		d3.select(_this).classed('opacity-highlight', true);
		d3.select(_this).classed('focus-highlight', true);
		var nodeId = thisId.replace('node','');
		dataCenter.set_global_variable('mouse_over_signal_tree', nodeId, self.name);
	},
	_mouseout_handler: function(_this){
		var self = this;
		ObserverManager.post("projection-highlight", null);
		d3.select(_this).classed('opacity-highlight', false);
		d3.select(_this).classed('focus-highlight', false);
		dataCenter.set_global_variable('mouse_over_signal_tree', null, self.name);
	},
	_click_handler: function(_this){
		//re-projection according to this node
		var self = this;
		var thisId = d3.select(_this).attr('id');
		var selectionArray = dataCenter.global_variable.selection_array;
		var nodeId = thisId.replace('node','');
		if(d3.select(_this).classed('opacity-click-highlight')){
			d3.select(_this).classed('opacity-click-highlight', false);
			selectionArray.splice(selectionArray.indexOf(nodeId), 1);
			d3.select(_this).classed('focus-highlight', false);
			dataCenter.set_global_variable('mouse_over_signal_tree', null, self.name);
		}else{
			d3.select(_this).classed('opacity-click-highlight', true);
			selectionArray.push(nodeId);
		}
		ObserverManager.post('changeData', selectionArray);
	},
	highlight_node: function(this_node_id, index){
		var self = this;
		var svg = d3.select('svg.projection');
		if(svg.select('#' + this_node_id) != null){
			self.re_draw_node(svg.select('#' + this_node_id));
		}
		var x = svg.select('#' + this_node_id).attr('cx');
		var y = svg.select('#' + this_node_id).attr('cy');
		//self.add_arc_num_text(this_node_id, index);
		svg.select('#' + this_node_id).classed('opacity-unhighlight', false);
		svg.select('#' + this_node_id).classed('opacity-similarity-highlight', true);
	},
	add_arc_num_text: function(this_node_id, number){
		var svg = d3.select('svg.projection');
		var thisNode = svg.select('#' + this_node_id);
		var thisX = +thisNode.attr('cx');
		var thisY = +thisNode.attr('cy');
		svg.append('text')
			.attr('class', 'arc-num-label')
			.attr('x', thisX)
			.attr('y', thisY)
			.text(number + 1);
	},
	re_draw_node: function(this_node){
		var self = this;
		if(this_node != null){
			var tip = d3.tip()
			  .attr('class', 'd3-tip')
			  .offset([-10, 0])
			  .html(function(d) {
			    return "<strong>Frequency:</strong>" + 'frequency' + "</span>";
			  });
			var svg = d3.select('svg.projection');
			var this_class = this_node.attr('class');
			var this_id = this_node.attr('id');
			//var translate = this_node.attr('transform');
			//var translateArray = translate.replace('translate(','').replace(')','').split(',');
			var this_cx = +this_node.attr('cx');
			var this_cy = +this_node.attr('cy');
			svg.select('#' + this_id).remove();
			svg.append('circle')
				.attr('class', function(d,i){
					return this_class;
				})
				.attr('id', function(d,i){
					return this_id;
				})
				.attr('cx', this_cx)
				.attr('cy', this_cy)
				.on('mouseover', function(d,i){
					var svg = d3.select('svg.projection')
					//send message, highlight the corresponding histogram
					var thisId = d3.select(this).attr('id');
					ObserverManager.post("projection-highlight", thisId);
					svg.selectAll('.projection-nodes').classed('opacity-unhighlight', true);
					d3.select(this).classed('opacity-unhighlight', false);
					d3.select(this).classed('opacity-highlight', true);
					d3.select(this).classed('focus-highlight', true);
					var nodeId = thisId.replace('node','');
					//dataCenter.set_global_variable('mouse_over_signal_tree', nodeId);
					//tip.show(d);
					//self._mouseover_handler(this);
				})
				.on('mouseout', function(d,i){
					//send message, unhighlight the corresponding histogram
					ObserverManager.post("projection-highlight", null);
					svg.selectAll('.projection-nodes').classed('opacity-unhighlight', false);
					svg.selectAll('.projection-nodes').classed('opacity-highlight', false);
					d3.select(this).classed('focus-highlight', false);
					//tip.hide(d);
					//self._mouseout_handler(this);
				})
				.on('click', function(d,i){
					//re-projection according to this node
					var selectionArray = dataCenter.global_variable.selection_array;
					var thisId = d3.select(this).attr('id');
					var nodeId = thisId.replace('node','');
					if(d3.select(this).classed('opacity-click-highlight')){
						d3.select(this).classed('opacity-click-highlight', false);
						selectionArray.splice(selectionArray.indexOf(nodeId), 1);
					}else{
						d3.select(this).classed('opacity-click-highlight', true);
						selectionArray.push(nodeId);
					}
					ObserverManager.post('changeData', selectionArray);
					//self._click_handler(this);
				});
		}
	},
	append_selection_text: function(){
		var svg = d3.select('svg.projection');
		var selectionArray = dataCenter.global_variable.selection_array;
		svg.selectAll('.opacity-click-highlight')
		.each(function(d,i){
			var cx = d3.select(this).attr('cx');
			var cy = d3.select(this).attr('cy');
			var nodeId = d3.select(this).attr('id').replace('node','');
			var nodeIndex = selectionArray.indexOf(nodeId);
			svg.append('text')
			.attr("text-anchor", "middle")
			.attr('x', cx)
			.attr('y', cy - 6)
			.text(nodeIndex);
		})
	},
	draw_link: function(node_location){
		var nodeLocation = _.clone(node_location);
		var similiarNodeArray = new Array();
		for(var i = 0;i < nodeLocation.length;i++){
			var x = nodeLocation[i][0];
			var y = nodeLocation[i][1];
			var findSimiliarNode = false;
			//遍历similiarNodeArray数组，判断是否已经存在临近的节点被存储
			for(var j = 0;j < similiarNodeArray.length;j++){
				var templateX = similiarNodeArray[j].x;
				var templateY = similiarNodeArray[j].y;
				//为什么取10
				if((Math.abs(templateY - y) <= 20) && (Math.abs(templateX - x) <= 20)){
					similiarNodeArray[j].nodeArray.push(nodeLocation[i]);
					similiarNodeArray[j].sumX = similiarNodeArray[j].sumX + x;
					similiarNodeArray[j].sumY = similiarNodeArray[j].sumY + y;
					similiarNodeArray[j].x = Math.round(similiarNodeArray[j].sumX/similiarNodeArray[j].nodeArray.length);
					similiarNodeArray[j].y = Math.round(similiarNodeArray[j].sumY/similiarNodeArray[j].nodeArray.length);
					findSimiliarNode= true;
					break;
				}
			}
			if(findSimiliarNode == false){
				similiarNodeArray[j] = new Object();
				similiarNodeArray[j].nodeArray = [nodeLocation[i]];
				similiarNodeArray[j].sumX = +x;
				similiarNodeArray[j].sumY = +y;
				similiarNodeArray[j].x = Math.round(similiarNodeArray[j].sumX/similiarNodeArray[j].nodeArray.length);
				similiarNodeArray[j].y = Math.round(similiarNodeArray[j].sumY/similiarNodeArray[j].nodeArray.length);
			}
		}
		var ModifyNodeArray = new Array();
		for(i = 0;i < similiarNodeArray.length;i++){
			var templateX = similiarNodeArray[i].x;
			var templateY = similiarNodeArray[i].y;
			var nodeArray = similiarNodeArray[i].nodeArray;
			for(var j = 0;j < nodeArray.length;j++){
				ModifyNodeArray.push([templateX, templateY, nodeArray[j][2]]);
			}
		}
		var svg = d3.select('svg.projection');
		var path = svg.append("path")
			.attr('class', 'projection-node-path')
		    .data([ModifyNodeArray])
		    .attr("d", d3.svg.line()
		    .tension(4) // Catmull–Rom
		    .interpolate("monotone"));//cardinal-open
		    /*
		    linear - 线性插值
			linear-closed - 线性插值，封闭起点和终点形成多边形
			step - 步进插值，曲线只能沿x轴和y轴交替伸展
			step-before - 步进插值，曲线只能沿y轴和x轴交替伸展
			step-after - 同step
			basis - B样条插值
			basis-open - B样条插值，起点终点不相交
			basis-closed - B样条插值，连接起点终点形成多边形
			bundle - 基本等效于basis，除了有额外的tension参数用于拉直样条
			cardinal - Cardina样条插值
			cardinal-open - Cardina样条插值，起点终点不相交
			cardinal-closed - Cardina样条插值，连接起点终点形成多边形
			monotone - 立方插值，保留y方向的单调性
		     */
		   // .interpolate("linear"));
		/*var circle = svg.append("circle")
		    .attr("r", 10)
		    .attr("transform", function(d,i){
		    	return "translate(" + nodeLocation[0] + ")";
		    });
		transition();
		function transition() {
		  circle.transition()
		      .duration(40000)
		      .ease("linear")
		      .attrTween("transform", translateAlong(path.node()))
		      .each("end", transition);
		}*/
		function translateAlong(path) {
		  var l = path.getTotalLength();
		  return function(d, i, a) {
		    return function(t) {
		      var p = path.getPointAtLength(t * l);
		      return "translate(" + p.x + "," + p.y + ")";
		    };
		  };
		}
	},
	OMListen: function(message, data) {
		var self = this;
		var svg = d3.select('svg.projection')
		if (message == "similarity-node-array") {
			svg.selectAll('.projection-nodes').classed('opacity-unhighlight', true);
			if(data.length != 0){
				svg.selectAll('.projection-nodes:not(.opacity-click-highlight)').classed('opacity-similarity-highlight', false);
				svg.selectAll('.projection-nodes:not(.opacity-click-highlight)').classed('opacity-unhighlight', true);
				for(var i = 0;i < data.length;i++){
					self.highlight_node(data[i], i);
				}
				//d3.selectAll('.opacity-click-highlight').classed('opacity-unhighlight', false);
			}else{
				svg.selectAll('.projection-nodes').classed('opacity-unhighlight', false);
				svg.selectAll('.projection-nodes').classed('opacity-highlight', false);
				self.putOnTopForSelectionNode();
			}
		}
		if(message == 'set:projection_method'){
			var projectionMethod = dataCenter.global_variable.projection_method;
			if(projectionMethod == 'original-projection'){
				self._render_view('original-projection');
			}else if(projectionMethod == 'center-projection'){
				self._render_view('center-projection');
			}
		}
		if(message == 'changeData'){
			self._render_view();
		}
		if(message == 'set:mouse_over_signal_tree'){
			var mouseOverSignalTree = dataCenter.global_variable.mouse_over_signal_tree;
			var thisId = 'node' + mouseOverSignalTree;
			if(mouseOverSignalTree != null){
				svg.selectAll('.projection-nodes').classed('opacity-unhighlight', true);
				svg.selectAll('.projection-nodes').classed('focus-highlight', false);
				//svg.selectAll('.projection-nodes:not(.opacity-click-highlight)').classed('opacity-highlight', false);
				//svg.selectAll('.projection-nodes:not(.opacity-click-highlight)').classed('opacity-unhighlight', true);
				self.re_draw_node(svg.select('#' + thisId));
				svg.select('#' + thisId).classed('opacity-unhighlight', false);
				svg.select('#' + thisId).classed('opacity-highlight', true);
				svg.select('#' + thisId).classed('focus-highlight', true);
			}else{
				svg.selectAll('.projection-nodes.focus-highlight').classed('opacity-highlight', false);
				svg.selectAll('.projection-nodes.focus-highlight').classed('opacity-unhighlight', true);
				svg.selectAll('.projection-nodes').classed('focus-highlight', false);
				self.putOnTopForSelectionNode();
			}
		}
    }
}