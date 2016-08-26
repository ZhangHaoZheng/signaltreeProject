var radial = {
	initialize: function(){
		var self = this;
		self._add_to_listener();
		self._bind_view();
		var treeRoot = dataCenter.datasets[0].processor.result.treeRoot;
		self._render_view(treeRoot);
		return self;
	},
	_add_to_listener: function(){
		var self = this;
		ObserverManager.addListener(self);
	},
	_bind_view: function(){
	},
	_render_view: function(tree_root){
		var self = this;
		var dataProcessor = dataCenter.datasets[0].processor;
		var padding = 10;
		var width = +$("#leftTopLeftWrapper-radial").width();
		var height = +$("#leftTopLeftWrapper-radial").height() - padding;

		var diameter = d3.min([width,height]);
		var eachTypeIdArray = new Array();
		var eachTypeIndexArray = new Array();
		var duration = 750;
		//var rootA = dataCenter.datasets[0].processor.result.treeRoot;
		var rootA = tree_root;
		var tree = self.tree = d3.layout.tree()
			.size([360, diameter / 2 - 20])
			.children(function(d){
				if(Array.isArray(d.values)) return d.values;
				return undefined;
			})
			.separation(function(a, b) { 
				var dis = (a.parent == b.parent ? 1 : 2) / a.depth;
				if(a.depth <= 2 && b.depth <= 2)
					dis = 10;
				if(a.depth == 3 && b.depth == 3)
					dis = 1;
				if(a.parent && b.parent){
	            	return dis;
				}
	            return 1;
			});
		var treeNodeList;
		treeNodeList = tree.nodes(rootA).reverse();
		//dataCenter.global_variable.tree_node_list = treeNodeList;
		dataCenter.set_global_variable('tree_node_list', treeNodeList);
		var index = 0;
		var diagonal = d3.svg.diagonal.radial()
			.projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });
		var svg = d3.select("svg.radial")
			.attr('width', width)
			.attr('height', height)
			.append('g')
			.attr("id","radial")
			.attr('transform', 'translate('+ width/2 + ',' +  height/2 +')');
		self._draw_depth(4, treeNodeList, tree, width, height, rootA);
		self.change_label_text('B');
	},
	_draw_depth: function(hide_depth, tree_node_list, tree, width, height, tree_root){
		var self = this;
		var rootA = tree_root;
		var iterator = 1;

		activeA = hide_depth;
		for(var i = 0;i < tree_node_list.length;i++){
			if(tree_node_list[i].depth < hide_depth){
				if(tree_node_list[i]._values){
					tree_node_list[i].values = tree_node_list[i]._values;
					tree_node_list[i]._values = null;
				}
			}else{
				if(tree_node_list[i].values){
					tree_node_list[i]._values = tree_node_list[i].values;
					tree_node_list[i].values = null;
				}
			}
		}

		_update(tree_node_list);
		function _update(tree_node_list){
			var tip = d3.tip()
			  .attr('class', 'd3-tip')
			  .offset([-10, 0])
			  .html(function(d) {
			  	var flowSize = +d.flow;
			  	var nameArray = d.index.split('-');
			  	var name = nameArray[nameArray.length - 1];
			    return "flowSize:" + d3.format(".3s")(flowSize) + " nodeName:" + name + "</span>";
			  });
			var nodes = tree_node_list,
				links = tree.links(nodes);
			var treeNodeNum = 0;
			var duration = 750;
			for(var i = 0;i < tree_node_list.length;i++){
				if(tree_node_list[i].depth==4){
					treeNodeNum++;
				}
			}
			var svg = d3.select("#radial");
			svg.call(tip);
			var diagonal = d3.svg.diagonal.radial()
				.projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });	
			var node = svg.selectAll(".node")
				.data(nodes, function(d) {return d.id});
			var max_depth = 0;
			var nodeUpdate = node.transition().duration(duration)
			.attr("transform",function(d){
				return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
			})
			var nodeEnter = node.enter().append("g")
				.attr("class", "node")
				.attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y) + ")"; })
				.attr("id", function(d) {
					var id = d.id;
					if(d.id != null){
						id = id.replace(';','');
					}
					return "radial-node-" + id;
				})
				.on("click",function(d,i){
					var this_node = d3.select(this);
					_click(d, i, this_node, tree_root);
				})
				.on("mouseover", function(d) {
					var this_node = d3.select(this);
					ObserverManager.post("mouse-over", [d.id]);
					dataCenter.set_global_variable('mouse_over_signal_node', this_node);
					tip.show(d);
				})
				.on("mouseout", function(d) {
					ObserverManager.post("mouse-out", [d.id]);
					tip.hide(d);
				});
			nodeEnter.attr("fill",function(d,i){
				if(d.values == null){//radialexpandmarkA.indexOf(d.id) != -1
					return "steelblue";
				}
				else{
					return "#EEEEEE";
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

			node.exit()
			.remove();

			var link = svg.selectAll("path.link")
				.data(links,function(d) { return d.target.id; });
			link.enter().insert("path", "g")
			  .attr("id",function(l){
			  	return "radial-link-" + l.target.id;
			  })
			  .attr("class", "link")
			  .attr("d", diagonal);
			link.transition().duration(duration)
				.attr("class", "link")
				.attr("d", diagonal);
			link.exit().remove();
		}
		function _click(d, i, this_node, tree_root) {
			var self = this;
			var width = $("#leftTopLeftWrapper-radial").width();
			var height = $("#leftTopLeftWrapper-radial").height();
			var diameter = d3.min([width,height]);
			var tree = d3.layout.tree()
				.size([360, diameter / 2 - 20])
				.children(function(d){
					if(Array.isArray(d.values)) return d.values;
					return undefined;
				})
				.separation(function(a, b) { 
					var dis = (a.parent == b.parent ? 1 : 2) / a.depth;
					if(a.depth <= 2 && b.depth <= 2)
						dis = 10;
					if(a.depth == 3 && b.depth == 3)
						dis = 1;
					if(a.parent && b.parent){
		            	return dis;
					}
		            return 1;
				});
			var treeNodeList;
			if((+d.flow) == 0)	return null;		
			if (d.values) {
				d._values = d.values;
				d.values = null;
			} else {
				d.values = d._values;
				d._values = null;
			}
			if(d.depth != 4){
				if(d.values == null){
					this_node.attr("fill","steelblue");
				}else{
					this_node.attr("fill","#EEEEEE");
				}
			}
			treeNodeList = tree.nodes(tree_root).reverse();
			_update(treeNodeList);
		}
	},
	_putnodesdepth: function(radialexpandmark, nodesIddepth, hide_depth){
		radialexpandmark = [];
		for(var i = hide_depth; i < 4; i++){
			for(var j = 0; j < nodesIddepth[i].length; j++){
				radialexpandmark.push(nodesIddepth[i][j].id);
			}
		}
		return radialexpandmark;
	},
	_highlight_subtree_and_route_from_root: function(id) {
		var treeNodeList = dataCenter.global_variable.tree_node_list;
		var self = this;
		var highlight_id_list = [];
		var node = null;
		for(var i = 0; i < treeNodeList.length; i++){
			if(treeNodeList[i].id == id) {
				node = treeNodeList[i];
				break;
			}
		}
		if(node == null) return;
		var node1 = node;
		while(node1.parent != undefined){
			if(node1.parent.id.indexOf(";") == -1)
				highlight_id_list.push(node1.parent.id);
			node1 = node1.parent;
		}
		node1 = node;
		self._put_subtree_node_id(node1,highlight_id_list);
		for(var i = 0; i < highlight_id_list.length; i++){
			d3.select("#radial-node-" + highlight_id_list[i]).classed("radial-route-node-inner",true);
			d3.select("#radial-link-" + highlight_id_list[i]).classed("radial-route-link",true);
			d3.select("#radial-link-" + id).classed("radial-route-link",true);
		}
		highlight_id_list.push(id);
		dataCenter.set_global_variable('radial_highlight_id_list', highlight_id_list);
	},
	_unhighlight_subtree_root: function(){
		var highlight_id_list = dataCenter.global_variable.radial_highlight_id_list;
		for(var i = 0; i < highlight_id_list.length; i++){
			d3.select("#radial-node-" + highlight_id_list[i]).classed("radial-route-node-inner",false);
			d3.select("#radial-link-" + highlight_id_list[i]).classed("radial-route-link",false);
			d3.select("#radial-node-" + highlight_id_list[i]).classed("node",true);
			d3.select("#radial-link-" + highlight_id_list[i]).classed("link",true);
		}
		dataCenter.set_global_variable('radial_highlight_id_list', []);
	},
	 _put_subtree_node_id: function(node,list){
	 	var self = this;
		if(node.values == undefined) return;
		for(var i = 0; i < node.values.length; i++){
			if(node.values[i].id.indexOf(";") == -1)
				list.push(node.values[i].id);
			self._put_subtree_node_id(node.values[i],list);
		}
	},
	change_label_color_to_blue: function(){
		$('#leftTopLeftWrapper-radial #node-type').removeClass('orange-label');		
		$('#leftTopLeftWrapper-radial #node-type').addClass('blue-label');
	},
	change_label_color_to_orange: function(){
		$('#leftTopLeftWrapper-radial #node-type').removeClass('blue-label');		
		$('#leftTopLeftWrapper-radial #node-type').addClass('orange-label');
	},
	change_label_text: function(label){
		$('#leftTopLeftWrapper-radial #node-type').html(label);		
	},
	OMListen: function(message, data){
		var idPrefix = "#radial-node-";
		var svg = d3.select('#radial');
		if (message == "highlight") {
			svg.selectAll(".highlight").classed("highlight", false)
			svg.selectAll(".half-highlight").classed("half-highlight", false)
			for (var i = 0; i < data.length; i++) {
				if(data[i] != null){
					data[i] = data[i].replace(';','');
				}
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
        	var self = this;
        	for (var i = 0; i < data.length; i++) {
        		if(data[i] != null){
					data[i] = data[i].replace(';','');
				}
				self._highlight_subtree_and_route_from_root(data[i]);
				svg.select(idPrefix + data[i]).classed("focus-highlight", true);
				if (svg.select(idPrefix + data[i]).data().length > 0) {
					var nodeData = svg.select(idPrefix + data[i]).data()[0];
				}
			}
        }
        if(message == "mouse-out"){
        	var self = this;
        	for(var i = 0; i < data.length; i++) {
        		if(data[i] != null){
					data[i] = data[i].replace(';','');
				}
				self._unhighlight_subtree_root();
				svg.select(idPrefix + data[i]).classed("focus-highlight", false);
			}
        }
        if(message == "depth"){
        	_draw_depth(data);
        }	
        if(message=="changeData"){
        }
        if(message == "update-view"){
        	var self = this;
        	var currentId = dataCenter.global_variable.current_id;
        	if(currentId != null){
        		for(var i = 0;i < dataCenter.datasets.length;i++){
	        		if(currentId == dataCenter.datasets[i].id){
	        			var tree_root = dataCenter.datasets[i].processor.result.treeRoot;
	        			self._render_view(tree_root);
	        			break;
	        		}
	        	}
        	}
        }
        if(message == 'clean-view'){
        	svg.selectAll('*').remove();
        }
        if(message == "set:similar_id_array"){
        	var similarIdArray = dataCenter.global_variable.similar_id_array;
        	svg.selectAll('.node')
        	.classed('node-remove', true);
        	//classed('opacity-non-similar', true);
        	for(var i = 0;i < similarIdArray.length;i++){
        		svg.select('#radial-node-' + similarIdArray[i]).classed('node-remove', false);//style('opacity', '1');
        	}
        }
        if(message == 'show-all'){
        	svg.selectAll('.node')
        	.classed('node-remove', false);
        }
	}
}