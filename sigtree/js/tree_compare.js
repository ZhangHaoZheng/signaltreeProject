var treeCompare = function(){
	d3.select("#rightComparisonWrapper").style("padding",0);
	var TreeCompare = {};
	ObserverManager.changeListener(TreeCompare,3);
	var datasets = dataCenter.datasets;
	var pre_datasets = datasets;
	var pre_datasets_id = [];
	for(var i = 0; i < datasets.length; i++){
		pre_datasets_id.push(datasets[i].id);
	}
	var duration = 1750;
	var ratio = 1.5;
	var buttonWidth = 15;
	var _width = $("#multitree").width() - buttonWidth;
	var height = $("#rightComparisonWrapper").height() - 50;
	var trend_height = height / 9;
	var min_tree_height = height / 3.5;
	var two_level_height = height / 9;
	var leftPadding = 25;
	var brush_compare = d3.svg.brush();
	var brush_nodes_list = {};
	/*
	 * layout
	 */
	var tree_width = _width - leftPadding - 20;
	var tree = d3.layout.tree()
		.size([tree_width,height])
		.separation(function(a, b) { 
			var dis = (a.parent == b.parent ? 1 : 2) / (a.depth * 2);
			if(a.depth <=2 && b.depth <= 2)
				dis = 3.3;
			if(a.depth==3 && b.depth==3)
				dis = 1;
	        return dis;
		 });
	var diagonal = d3.svg.diagonal();
	var diagonal_ = d3.svg.diagonal().projection(function(d){
		return [d.x, tree_height - d.y]
	});
	var deletefrom = false;
	var nodes;
	var links;
	var bottom_padding = trend_height / 2.5;
	var colors = function(i){
		var three_ = ["red","green","blue"];
		return (function(){return three_[i]})();
	};
	var tip = d3.tip()
	  .attr('class', 'd3-tip')
	  .offset([-10, 0]);
	//add A B sign
	var dts = datasets[0].processor.result.dataList;
	var dts2 = datasets[1].processor.result.dataList;
	var dt_root = datasets[0].processor.result.treeRoot;
	var dt_root2 = datasets[1].processor.result.treeRoot;
	var nodesA;
	var nodesB;
	//mult_tree_smaller对应从上往下树的信息，nodes为tree.nodes(),node为根节点,g为包裹树的g,tree_id如"20120121-R07-75",index放在每个叶节点的has数组中标记当前节点有哪些树共用
	var mult_tree_smaller = [];
	var add_node_list = [dt_root,dt_root2];
	var add_tree_id_list = [datasets[0].id,datasets[1].id];
	var total_root = sigtree.dataProcessor().mergeTwoListAsTree(dts, dts2);
	total_root.x0 = tree_width/2;
	total_root.y0 = 0;
	nodes = tree.nodes(total_root);
	distinguishTree(nodes);
	var id_nodes;
	var Aindex;
	var Bindex;
	var cur_depth = 4;
	var scale = d3.scale.linear().range([0,trend_height]);		
	var max_flow_of_depth = [0,0,0,0,0];
	var flow_of_depth = [];
	flow_of_depth.length = 5;
	for(var i = 0; i < 5; i++){
		flow_of_depth[i] = {};
	}
	var reverse_m = false;
	var draw_all_m = true;
	var count = 0;
	var c_mark = false;
	var xscale = d3.scale.identity()
		.domain([0,$("#multitree").width()]);
	brush_compare.x(xscale)
		.on("brushend",brushedcompare);
	addMultiTree(add_node_list,add_tree_id_list);
	d3.select("#"+mult_tree_smaller[0].divid+" #tree_svg g").call(tip);
	//id_nodes，用id查找结点的位置，同步id_nodes与nodes
	function build_id_nodes(nodes){
		id_nodes = {};
		for(var i = 0; i < nodes.length; i++){
			id_nodes[nodes[i].id] = i;
		}		
	}
	function build_id_values(nodes){
		id_nodes = {};
		for(var i = 0; i < nodes.length; i++){
			id_nodes[nodes[i].id] = i;
			nodes[i].values = nodes[i].children;
		}
	}
	//输入节点，设置每个节点 hasObj1 = boolean, hasObj2 = boolean，表示该节点属于哪棵树
	function distinguishTree(nodes) {
		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].data != null) {
				if (nodes[i].data.obj1 != null)
					nodes[i].obj1 = nodes[i].data.obj1;
				if (nodes[i].data.obj2 != null)
					nodes[i].obj2 = nodes[i].data.obj2;				
			}
		}

		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			var hasObj1 = (node.obj1 != null),
				hasObj2 = (node.obj2 != null);
			node.hasObj1 = hasObj1;
			node.hasObj2 = hasObj2;
			node.has = {};
			if(hasObj1) node.has[2] = true;
			if(hasObj2) node.has[3] = true;
			while (node.parent != null) {
				node = node.parent;
				node.hasObj1 = node.hasObj1 || hasObj1;
				node.hasObj2 = node.hasObj2 || hasObj2;
				node.has = {};
				if(node.hasObj1) node.has[2] = true;
				if(node.hasObj2) node.has[3] = true;
			}
		}
	}

	build_id_values(nodes);
	$("#default").attr("checked",true);

	//仅在draw_depth中调用，封锁深度大于等于depth的节点，展开深度小于depth的节点
	function expand_depth(node,depth){
		if(node.depth < depth) {
			if(node._children){
				node.children = node._children;
				delete node._children;
			}
			if(node.children){
				for(var i = 0; i < node.children.length; i++){
					expand_depth(node.children[i],depth);
				}
			}
		}
		else if(node.depth == depth) {
			if(node.children){
				node._children = node.children;
				delete node.children;
				for(var i = 0; i < node._children.length; i++){
					expand_depth(node._children[i],depth);
				}
			}
		}
		else {
			if(node.children){
				node._children = node.children;
				delete node.children;
				for(var i = 0; i < node._children.length; i++){
					expand_depth(node._children[i],depth);
				}
			}
		}
	}
	function draw_depth(depth){
		cur_depth = depth;
		expand_depth(total_root,depth);
		changeViewForSvg();
	}
	//仅在merge_trees中调用
	function merge_trees_putIndex(root,index){
		root.has = {};
		root.has[index] = true;
		if(root.children == undefined) return;
		for(var i = 0; i < root.children.length; i++){
			merge_trees_putIndex(root.children[i],index);
		}
	}
	//合并两棵树
	function merge_trees(root1,root2,index){
		var idlist = {};
		if(root1.children == undefined) root1.children = [];
		for(var j = 0; j < root1.children.length; j++){
			idlist[root1.children[j].id] = j;
		}
		for(var i = 0; i < root2.children.length; i++){
			var tmp = idlist[root2.children[i].id];
			if(tmp == undefined){
				merge_trees_putIndex(root2.children[i],index);
				root1.children.push(root2.children[i]);
			}
			else {
				root1.children[tmp].has[index] = true;
				if(root2.children[i].children == undefined) continue;
				merge_trees(root1.children[tmp],root2.children[i],index);
			}
		}
	}
	function draw_tree(mark_reversal, mark_draw_all, mult_tree, source, div_i){
		var circle_color;
		if(mark_reversal) circle_color = "#FF7F0E";
		else circle_color = "steelblue";
		if(source != null){
			var mark = false;
			for(var i = 0; i < mult_tree.nodes.length; i++){
				if(mult_tree.nodes[i].id == source.id){
					mark = true;
					break;
				}
			}
			if(mark == false)
				source = null;
		}
		var tree_height = mult_tree.tree_height;
		var depth_height = [];
		if(mark_draw_all){
			if(mark_reversal){
				for(var i = 0; i < cur_depth + 1; i++){
					if(cur_depth == 0) {
						depth_height.push(tree_height - 20);
						break;
					}
					depth_height.push( (cur_depth - i) * (tree_height - 38) / cur_depth + 3 );
				}
			}
			else {
				for(var i = 0; i < cur_depth + 1; i++){
					if(cur_depth == 0) {
						depth_height.push(0);
						break;
					}
					depth_height.push( i * (tree_height - 38) / cur_depth + 35);
				}
			}
		}
		else{
			if(mark_reversal){
				depth_height.push(tree_height - 15)
				depth_height.push(tree_height - 20)
				depth_height.push(tree_height - 25)
				depth_height.push(tree_height - 9);
				depth_height.push(1);
				if(cur_depth == 3){
					depth_height[3] = 5;
				}
			}
			else {
				depth_height.push(15)
				depth_height.push(20)
				depth_height.push(25)
				depth_height.push(6);
				depth_height.push(tree_height - 4);
				if(cur_depth == 3){
					depth_height[3] = tree_height - 5;
				}
			}
		}
		var links_to_draw = tree.links(nodes).filter(function(l){
			if(mark_draw_all == false){
				if(l.source.depth != 3 || l.target.depth != 4)
					return false;
			}
			if(l.source.has[mult_tree.index] == true && l.target.has[mult_tree.index] == true){
				return true;
			}
			return false;
		});
		var treeg = d3.select("#" + mult_tree.divid + " #tree_svg g");
		var links = treeg.selectAll(".link")
			.data(links_to_draw,function(l){return l.target.id;});
		links.enter().insert("path")
			.attr("id",function(l){
				return "link-"+l.target.id;
			})
			.attr("class","link")
			.attr("d",function(l){
				var o;
				if(source) o = {x:source.x, y:source.y};
				else o = {x:tree_width/2,y:tree_height - 10};
				return diagonal({source:o, target:o});
			});
		links.transition().duration(750)
			.attr("d",function(d){
				var sourceX = d.source.x;
				var targetX = d.target.x;
				var sourceY,targetY;
				sourceY = depth_height[d.source.depth];
				targetY = depth_height[d.target.depth];
				var s = {x:sourceX, y:sourceY};
				var t = {x:targetX, y:targetY};
				return diagonal({source:s,target:t});
			});
		links.exit()
			.transition().duration(750)
			.attr("d",function(){
				var o;
				if(source) o = {x:source.x, y:source.y};
				else o = {x:tree_width/2,y:tree_height - 10};
				return diagonal({source:o, target:o});
			})
			.remove();
		var nodes_to_draw = nodes.filter(function(d){
			if(mark_draw_all == false){
				if(d.depth < 3 && cur_depth >= 3) return false;
				if(cur_depth < 3 && d.depth != cur_depth) return false; 
			}
			if(d.has[mult_tree.index]) {
				return true;
			}
			return false;
		});
		var _nodes = treeg.selectAll(".node")
			.data(nodes_to_draw, function(d){return d.id});
		_nodes.enter()
			.append("circle")
			.attr("id", function(d) {
				return "compare-node-" + d.id;
			})
			.attr("cx",function(d){
				var o;
				if(source) o = source.x;
				else o = tree_width/2;
				return o;
			})
			.attr("cy",function(d){
				var o;
				if(source) o = source.y;
				else o = tree_height - 10;
				return o;
			})
			.style("stroke",circle_color)
			.on("mouseover", function(d, i) {
				var tmp = "M" + numoftreecompare;
				var n;
				for(var i = 0; i < mult_tree.nodes.length; i++){
					if(mult_tree.nodes[i].id == d.id){
						n = mult_tree.nodes[i];
						break;
					}
				}
				ObserverManager.post("show-detail-info", { dataset:tmp, node: n });
				tip.html(function() {
					var tmp = n.id.split('-');
					var text = tmp[tmp.length - 1];
					if (Array.isArray(n.values)){
						text += "<br>子节点数:" +  n.values.length;
					}
					text += "<br>流量:" + n.flow;
					return text;
				})
				tip.show()
				ObserverManager.post("mouse-over", [d.id]);
			})
			.on("mouseout", function(d) {
				ObserverManager.post("mouse-out", [d.id]);
				tip.hide();		
			})
			.on("click",function(d){
				build_id_nodes(nodes);
				var tmp = id_nodes[d.id];
				node_click_focus(nodes[tmp]);
			});
		_nodes.attr("class",function(n){
				if(n._children && mark_reversal == false) return "node node-inner";
				if(n._children && mark_reversal == true) return "node reverse-node-inner";
				return "node node-leaf";
			}).attr("r", function(d,i){
				var r;
				if(d.depth == 4){
					r = 1;
				}
				else if(d.depth == 3){
					r = 2.5;
				}
				else r = (4.5 - d.depth) * 2;
				if(brush_nodes_list[d.id] == true) r += 2.5;
				return r;
			})
			.style("stroke",circle_color)
			.transition().duration(750)
			.attr("cx",function(d){
				return d.x;
			})
			.attr("cy",function(d){
				return depth_height[d.depth];
			});
		_nodes.exit()
			.transition().duration(750)
			.attr("cx",function(d){
				var o;
				if(source) o = source.x;
				else o = tree_width/2;
				return o;
			})
			.attr("cy",function(d){
				var o;
				if(source) o = source.y;
				else o = tree_height - 10;
				return o;
			}).remove();
		if(mark_draw_all == false) return;
		var polygon_svg = d3.select("#" + mult_tree.divid + " #tree_svg");
		var filter_nodes = nodes.filter(function(d,i){
				if(d.count == undefined) return false;
				return d.count[div_i];
			});
		polygon_svg.selectAll(".node-text").remove();
		polygon_svg.selectAll(".node-text")
			.data(nodes_to_draw)
			.enter()
			.append("text")
			.attr("class","node-text")
			.attr("x",function(d,i){
				var strArray = d.key.split(" ");
				return d.x - 6 * strArray[0].length/2 + 30;
			})
			.attr("y",function(d){ return depth_height[d.depth] + 18;})
			.text(function(d,i){
				var strArray = d.key.split(" ");
				if(d.depth<2){
					return strArray[0];
				}
			})
		.attr("font-size","12px");
		polygon_svg.selectAll(".node-polygon").remove();
		polygon_svg.selectAll(".node-polygon")
			.data(filter_nodes)
			.enter()
			.append("polygon")
			.attr("class","node-polygon")
			.attr("points",function(d,i){
				var r;
				if(d.depth == 4){
					r = 1;
				}
				else if(d.depth == 3){
					r = 2.5;
				}
				else r = (4.5 - d.depth) * 2;
				var updotx = d.x + 30;
				var leftx = d.x - 6 + 30;
				var rightx = d.x + 6 + 30;
				var updoty,lefty,righty;
				if(mark_reversal == true){
					updoty = depth_height[d.depth] + r;
					lefty = depth_height[d.depth] + r + 7;
					righty = depth_height[d.depth] + r + 7;
				}
				else {
					updoty = depth_height[d.depth] - r;
					lefty = depth_height[d.depth] - r - 7;
					righty = depth_height[d.depth] - r - 7;
				}
				return ""+updotx+","+updoty+" "+leftx+","+lefty+" "+rightx+","+righty+"";
			})
			.attr("fill","#000000");
		polygon_svg.selectAll(".node-count").remove();
		polygon_svg.selectAll(".node-count")
			.data(filter_nodes)
			.enter()
			.append("text")
			.attr("class","node-count")
			.attr("x",function(d,i){
				return d.x - 3 + 30;
			})
			.attr("y",function(d){ 
				var r;
				if(d.depth == 4){
					r = 1;
				}
				else if(d.depth == 3){
					r = 2.5;
				}
				else r = (4.5 - d.depth) * 2;
				if(mark_reversal == false)
					return depth_height[d.depth] - r - 12;
				else return depth_height[d.depth] + r + 17;
			})
			.text(function(d,i){
				if(d.count && d.count[div_i]) return d.count[div_i];
			})
			.attr("font-size","20px");
		if(mark_reversal) mult_tree_smaller[div_i].depth_height = depth_height;
	}
	// draw trend
	// 流量图
	
	function draw_trend(mark_reversal, div_i){
		var rect_color;
		if(mark_reversal) rect_color = "#FF7F0E";
		else rect_color = "steelblue";
		var leaves = mult_tree_smaller[div_i].nodes.filter(function(n){
			if(id_nodes[n.id] == undefined) return false;
			return n.depth == cur_depth;
		});
		var trendg;
		if(mark_reversal) {
			$("#" + mult_tree_smaller[div_i].divid + " #flow_top_svg").height(trend_height);
			$("#" + mult_tree_smaller[div_i].divid + " #flow_top_svg").width($("#multitree").width());
			trendg = d3.select("#" + mult_tree_smaller[div_i].divid + " #flow_top_svg g");
			d3.select("#" + mult_tree_smaller[div_i].divid + " #flow_bottom_svg g")
				.selectAll("g").remove();
			$("#" + mult_tree_smaller[div_i].divid + " #flow_bottom_svg").height(0);
		}
		else{ 
			$("#" + mult_tree_smaller[div_i].divid + " #flow_bottom_svg").height(trend_height);
			$("#" + mult_tree_smaller[div_i].divid + " #flow_bottom_svg").width($("#multitree").width());
			trendg = d3.select("#" + mult_tree_smaller[div_i].divid + " #flow_bottom_svg g");
			d3.select("#" + mult_tree_smaller[div_i].divid + " #flow_top_svg g")
				.selectAll("g").remove();
			$("#" + mult_tree_smaller[div_i].divid + " #flow_top_svg").height(0);
		}
		scale.domain([0,Math.log(max_flow_of_depth[cur_depth])]);
		var bars = trendg.selectAll(".bar")
			.data(leaves,function(d){return d.id;});
		var bars_enter = bars.enter().insert("g").attr("class","bar")
			.attr("fill",rect_color)
			.attr("transform",function(leaf){
					return "translate("+($("#multitree").width() - leftPadding)/2+")";
				})
			.append("rect");
		if(mark_reversal == false){
			bars.selectAll("rect").attr("width",2)
				.attr("height",function(leaf){
					if(leaf.flow < 1) return 0;
					return scale(Math.log(leaf.flow));
				});
		}
		else{
			bars.selectAll("rect").attr("width",2)
				.attr("height",function(leaf){
					if(leaf.flow < 1) return 0;
					return scale(Math.log(leaf.flow));
				}).attr("transform",function(leaf){
					if(leaf.flow < 1) return "translate(0)";
					var t = trend_height - scale(Math.log(leaf.flow));
					return "translate(0,"+t+")";
				});
		}
		bars.transition().duration(750).attr("transform", function(leaf){
			var x = nodes[id_nodes[leaf.id]].x;
			return "translate(" + x + ")";
		});
		bars.exit().remove();
	}
	//流量图的brush操作
	function brushedcompare(){
		var extentX = +d3.select(".extent").attr("x");
		var extentWidth = +d3.select(".extent").attr("width");
		var nodel = nodes.filter(function(n){
			if(n.depth != cur_depth) return false;
			if(n.x < extentX || n.x > extentX + extentWidth) return false;
			return true;
		});
		if(nodel.length < 1) {
			brush_compare.clear();
			changeViewForSvg();
		}
		else nodes_lenses(nodel);
	}
	function nodes_lenses(nodelist){
		brush_nodes_list = {};
		for(var i = 0; i < nodelist.length; i++){
			var tmp = nodelist[i];
			brush_nodes_list[tmp.id] = true;
			if(tmp.parent == undefined) continue;
			while(brush_nodes_list[tmp.parent.id] == undefined || brush_nodes_list[tmp.parent.id] == false){
				brush_nodes_list[tmp.parent.id] = true;
				tmp = tmp.parent;
				if(tmp.parent == undefined) break;
			}
		}
		tree.separation(function(a, b) { 
			var dis = (a.parent == b.parent ? 1 : 2) / (a.depth * 3);
			if(a.depth <=2 && b.depth <= 2)
				dis = 3.3 / 3;
			if(a.depth==3 && b.depth==3)
				dis = 1 / 3;
			if(brush_nodes_list[a.id] == true || brush_nodes_list[b.id] == true)
				dis *= 3;
            return dis;
		 });
		changeViewForSvg();
		brush_nodes_list = {};
		tree.separation(function(a, b) { 
			var dis = (a.parent == b.parent ? 1 : 2) / (a.depth * 2);
			if(a.depth <=2 && b.depth <= 2)
				dis = 3.3;
			if(a.depth==3 && b.depth==3)
				dis = 1;
	        return dis;
		 });
	}
	//点击展开模式和收缩模式
	function node_click_focus(node){
		unhighlight_subtree_root();
		if(dataCenter.global_variable.click_thisNode_shrink == false)
			node_focus(node);
		else node_click(node);
	}
	//收缩
	function node_click(node){
		if(node.children){
			node._children = node.children;
			delete node.children;
		}
		else if(node._children){
			node.children = node._children;
			delete node._children;
			if(node.depth + 1 > cur_depth){
				cur_depth = node.depth + 1;
			}
		}
		nodes = tree.nodes(total_root);
		build_id_nodes(nodes);
		for(var i = 0; i < mult_tree_smaller.length; i++){
			draw_tree(mult_tree_smaller[i].mark_reversal,mult_tree_smaller[i].mark_draw_all,mult_tree_smaller[i],node,i);
			draw_trend(mult_tree_smaller[i].mark_reversal,i);
		}
		draw_dash_line();
	}
	//展开
	function node_focus(node){
		if(node == total_root) {
			draw_depth(4);
			return;
		}
		var tmpnodes = nodes;
		var d = node.depth;
		var markifexpand = [];
		markifexpand.push(node);
		while(node.parent){
			markifexpand.push(node.parent);
			node = node.parent;
		}
		expandchildren(node);
		for(var i = 0; i < tmpnodes.length; i++){
			if(tmpnodes[i].depth == 4) continue;
			if(tmpnodes[i].depth <= d){
			 	if(markifexpand.indexOf(tmpnodes[i]) == -1){
					if(tmpnodes[i].children){
						tmpnodes[i]._children = tmpnodes[i].children;
						delete tmpnodes[i].children;
					}
				}
				else {
					if(tmpnodes[i]._children){
						tmpnodes[i].children = tmpnodes[i]._children;
						delete tmpnodes[i]._children;
					}
				}
			}
		}
		cur_depth = 4;
		nodes = tree.nodes(total_root);
		build_id_nodes(nodes);
		for(var i = 0; i < mult_tree_smaller.length; i++){
			draw_tree(mult_tree_smaller[i].mark_reversal,mult_tree_smaller[i].mark_draw_all,mult_tree_smaller[i],node,i);
			draw_trend(mult_tree_smaller[i].mark_reversal,i);
		}
		draw_dash_line();
	}
	//仅在node_focus中调用
	function expandchildren(node){
		if(node.depth == 4) return;
		if(!node._children && !node.children) return;
		if(node._children){
			node.children = node._children;
			delete node._children;
		}
		for(var i = 0; i < node.children.length; i++){
			expandchildren(node.children[i]);
		}
	}
	function draw_dash_line(){
		d3.selectAll(".dash_line").remove();
		for(var i = 1; i < mult_tree_smaller.length; i++){
			if(mult_tree_smaller[i].mark_reversal && mult_tree_smaller[i].mark_draw_all){
				if(!mult_tree_smaller[i-1].mark_reversal && mult_tree_smaller[i-1].mark_draw_all){
					var coordinate = [];
 					for(var j = 0; j < nodes.length; j++){
						if(nodes[j].depth >= cur_depth) continue;
						var index1 = mult_tree_smaller[i].index;
						var index2 = mult_tree_smaller[i-1].index;
						if(nodes[j].has[index1] && nodes[j].has[index2] && !nodes[j].children){
							var x = nodes[j].x;
							var y = mult_tree_smaller[i].depth_height[nodes[j].depth];
							coordinate.push({x:x, y:y});
						}
					}
					if(coordinate.length > 0) draw_line(coordinate,i);
				}
			}
		}
	}
	function draw_line(coordinate,m_i){
		var line = d3.svg.line()
			.x(function(d){return d.x;})
			.y(function(d){return d.y;});
		for(var i = 0; i < coordinate.length; i++){
			var tree2_d1 = {x:coordinate[i].x, y:coordinate[i].y};
			var tree2_d2 = {x:coordinate[i].x, y:0};
			var trend_d1 = {x:coordinate[i].x, y:0};
			var trend_d2 = {x:coordinate[i].x, y:trend_height};
			var tree1_d1 = {x:coordinate[i].x, y:mult_tree_smaller[m_i].tree_height - coordinate[i].y};
			var tree1_d2 = {x:coordinate[i].x, y:mult_tree_smaller[m_i].tree_height};
			d3.select("#"+mult_tree_smaller[m_i].divid+" #tree_svg g")
				.append("path")
				.attr("stroke-dasharray","2,2")
				.attr("class","dash_line")
				.attr("d",line([tree2_d1,tree2_d2]));
			d3.select("#"+mult_tree_smaller[m_i-1].divid+" #tree_svg g")
				.append("path")
				.attr("stroke-dasharray","2,2")
				.attr("class","dash_line")
				.attr("d",line([tree1_d1,tree1_d2]));
			d3.select("#"+mult_tree_smaller[m_i].divid+" #flow_top_svg g")
				.append("path")
				.attr("stroke-dasharray","2,2")
				.attr("class","dash_line")
				.attr("d",line([trend_d1,trend_d2]));
			d3.select("#"+mult_tree_smaller[m_i-1].divid+" #flow_bottom_svg g")
				.append("path")
				.attr("stroke-dasharray","2,2")
				.attr("class","dash_line")
				.attr("d",line([trend_d1,trend_d2]));
		}
	}
	//显示相似部分
	function completelyShowSimilarPart(){
		if(mult_tree_smaller.length < 2) return;
		var index = mult_tree_smaller[0].index;
		var markifexpand = [];	
		var similar_nodes_id = [];
		for(var i = 0; i < nodes.length; i++){
			if(nodes[i].children){
				nodes[i]._children = nodes[i].children;
				delete nodes[i].children;
			}
			var count_mark = false;
			for(key in nodes[i].has){
				if(parseInt(key) != index){
					count_mark = true;
					break;
				}
			}
			if(nodes[i].has[index] && count_mark){
				markifexpand.push(nodes[i]);
				similar_nodes_id.push(nodes[i].id);
			}
		}
		dataCenter.set_global_variable("similar_id_array",similar_nodes_id);
		cur_depth = 0;
		for(var i = 0; i < markifexpand.length; i++){
			if(markifexpand[i].depth > cur_depth) cur_depth = markifexpand[i].depth;
			var node = markifexpand[i];
			while(node.parent){
				if(node.parent._children){
					node.parent.children = [];
					var all_num_of_nodes = [];
					var drawn_num_of_nodes = [];
					for(var j = 0; j < mult_tree_smaller.length; j++){
						all_num_of_nodes[j] = 0;
						drawn_num_of_nodes[j] = 0;
					}
					for(var j = 0; j < node.parent._children.length; j++){
						var tmp = node.parent._children[j];
						for(var z = 0; z < mult_tree_smaller.length; z++){
							var tmpz = mult_tree_smaller[z].index;
							if(tmp.has[tmpz]) all_num_of_nodes[z]++;
						}
						if(markifexpand.indexOf(tmp) != -1){
							node.parent.children.push(tmp);
							for(var z = 0; z < mult_tree_smaller.length; z++){
								var tmpz = mult_tree_smaller[z].index;
								if(tmp.has[tmpz]) drawn_num_of_nodes[z]++;
							}
						}
					}
					for(var j = 0; j < mult_tree_smaller.length; j++){
						all_num_of_nodes[j] = all_num_of_nodes[j] - drawn_num_of_nodes[j];
					}
					node.parent.count = all_num_of_nodes.slice(0);
					node.parent.originalChildren = node.parent._children;
					delete node.parent._children;
				}
				else break;
				node = node.parent;
			}
		}
		changeViewForSvg();
		for(var i = 0; i < nodes.length; i++){
			if(nodes[i].originalChildren){
				nodes[i].children = nodes[i].originalChildren;
				delete nodes[i].originalChildren;
				if(nodes[i].count) delete nodes[i].count;
			}
		}
	}
	//highlight 节点的子树及到根节点的路径
	var highlight_id_list,has;
	function highlight_subtree_root(node_id){
		highlight_id_list = [];
		var node = nodes[id_nodes[node_id]];
		var node1 = node;
		if(node == undefined) return;
		while(node.parent != undefined){
			if(node.parent.id.indexOf(";") == -1)
				highlight_id_list.push(node.parent.id);
			node = node.parent;
		}
		node = node1;
		put_subtree_node_id(node,highlight_id_list);
		has = node1.has;
		for(key in node1.has){
			key = parseInt(key);
			var i;
			for(i = 0; i < mult_tree_smaller.length; i++){
				if(key == mult_tree_smaller[i].index) break;
			}
			var g = d3.select("#"+mult_tree_smaller[i].divid+" #tree_svg g");
			for(var j = 0; j < highlight_id_list.length; j++){
				g.select("#compare-node-"+highlight_id_list[j]).attr("class","routenode-inner");
				g.select("#link-"+highlight_id_list[j]).attr("class","route-link");
				g.select("#link-"+node.id).attr("class","route-link");
			}
		}
		highlight_id_list.push(node.id);
	}
	function unhighlight_subtree_root(){
		for(key in has){
			key = parseInt(key);
			var i;
			for(i = 0; i < mult_tree_smaller.length; i++){
				if(key == mult_tree_smaller[i].index) break;
			}
			var g = d3.select("#"+mult_tree_smaller[i].divid+" #tree_svg g");
			for(var j = 0; j < highlight_id_list.length; j++){
				g.select("#compare-node-"+highlight_id_list[j]).attr("class",function(d){
					if(mult_tree_smaller[i].mark_reversal){
						if(d._children) return "node reverse-node-inner";
						else return "node node-leaf";
					}
					else{
						if(d._children) return "node node-inner";
						else return "node node-leaf";
					}
				});
				g.select("#link-"+highlight_id_list[j]).attr("class","link");
			}
		}
		highlight_id_list = [];
		has = {};
	}
	function put_subtree_node_id(node,list){
		if(node.children == undefined) return;
		for(var i = 0; i < node.children.length; i++){
			if(node.children[i].id.indexOf(";") == -1)
				list.push(node.children[i].id);
			put_subtree_node_id(node.children[i],list);
		}
	}
	
	//仅在delete_tree中调用，用以删除每个节点的has数组中某棵树的标记，若has长度删除前为1则删除该节点及其子树
	function delete_index_fromroot(root,index){
		if(root.children == undefined) return;
		var deletemark = [];
		for(var i = 0; i < root.children.length; i++){
			var tmp = root.children[i];
			var tmpindex = tmp.has[index];
			if(tmpindex == undefined)
				continue;
			else{
				var l = 0;
				for(key in tmp.has)
					l++;
				if(l == 1){
					deletemark.push(i);
					continue;
				}
				else{
					delete tmp.has[index];
					delete_index_fromroot(tmp,index);
				}
			}
		}
		for(var i = deletemark.length - 1; i >= 0; i--){
			root.children.splice(deletemark[i],1);
		}
	}
	//根据树id如"20120121-R07-75"，删除树
	function delete_tree(tree_id){
		var index;
		var d;
		var alpabet_index;
		for(var i = 0; i < mult_tree_smaller.length; i++){
			if(mult_tree_smaller[i].tree_id == tree_id) {
				d = i;
				alpabet_index = mult_tree_smaller[i].alpabet_index;
				index = mult_tree_smaller[i].index;
				break;
			}
		}
		if(mult_tree_smaller[d].mark_draw_all == false && d != (mult_tree_smaller.length-1)){
			d3.select("#"+mult_tree_smaller[d+1].buttondiv).style("visibility","visible");
		}
		for(var i = 0; i < mult_tree_smaller.length; i++){
			if(mult_tree_smaller[i].alpabet_index > alpabet_index)
				mult_tree_smaller[i].alpabet_index--;
		}
		delete total_root.has[index];
		delete_index_fromroot(total_root,index);
		if(deletefrom){
			for(var i = d + 1; i < mult_tree_smaller.length; i++){
				d3.select("#" + mult_tree_smaller[i].buttondiv).selectAll("span").attr("value",i - 1);
			}
		}
		d3.select("#" + mult_tree_smaller[d].divid).remove();
		max_flow_of_depth = [0,0,0,0,0];
		update_scale_domain_when_delete(mult_tree_smaller[d].nodes);
		mult_tree_smaller.splice(d,1);
		modify_height_svg_treeHeight();
		changeViewForSvg();
		modify_buttondiv_top();
		update_brush_g();
	}
	function update_scale_domain_when_delete(nodes){
		for(var i = 0; i < nodes.length; i++){
			flow_of_depth[nodes[i].depth][parseInt(nodes[i].flow)]--;
			if(flow_of_depth[nodes[i].depth][parseInt(nodes[i].flow)] == 0)
				delete flow_of_depth[nodes[i].depth][parseInt(nodes[i].flow)];
		}
		for(var i = 0; i < 5; i++){
			for(key in flow_of_depth[i]){
				key = parseInt(key);
				if(key > max_flow_of_depth[i] && flow_of_depth[i][key] > 0)
					max_flow_of_depth[i] = key;
			}
		}
	}
	//对换树的位置
	function up_down_tree(value1,value2){
		var tree1 = mult_tree_smaller[value1];
		var tree2 = mult_tree_smaller[value2];
		var tmpnodes1 = tree1.nodes,
			tmpnode1 = tree1.node,
			tmpindex1 = tree1.index,
			tmptree_id = tree1.tree_id,
			tmpalpabet = tree1.alpabet_index,
			tmpmark_draw_all = tree1.mark_draw_all,
			tmpmark_reversal = tree1.mark_reversal,
			tmptree_height = tree1.tree_height;
		tree1.nodes = tree2.nodes;
		tree1.node = tree2.node;
		tree1.index = tree2.index;
		tree1.tree_id = tree2.tree_id;
		tree1.alpabet_index = tree2.alpabet_index;
		tree1.mark_draw_all = tree2.mark_draw_all;
		tree1.mark_reversal = tree2.mark_reversal;
		tree1.tree_height = tree2.tree_height;
		tree2.nodes = tmpnodes1;
		tree2.node = tmpnode1;
		tree2.index = tmpindex1;
		tree2.tree_id = tmptree_id;
		tree2.alpabet_index = tmpalpabet;
		tree2.mark_draw_all = tmpmark_draw_all;
		tree2.mark_reversal = tmpmark_reversal;
		tree2.tree_height = tmptree_height;
		$("#"+mult_tree_smaller[value1].divid).height(mult_tree_smaller[value1].tree_height + trend_height);
		$("#"+mult_tree_smaller[value2].divid).height(mult_tree_smaller[value2].tree_height + trend_height);
		d3.select("#"+mult_tree_smaller[value1].divid+" #tree_svg").attr("height",mult_tree_smaller[value1].tree_height);
		d3.select("#"+mult_tree_smaller[value2].divid+" #tree_svg").attr("height",mult_tree_smaller[value2].tree_height);
		modify_buttondiv_top();
		draw_tree(mult_tree_smaller[value1].mark_reversal,mult_tree_smaller[value1].mark_draw_all,mult_tree_smaller[value1],null,value1);
		draw_trend(mult_tree_smaller[value1].mark_reversal,value1,null)
		draw_tree(mult_tree_smaller[value2].mark_reversal,mult_tree_smaller[value2].mark_draw_all,mult_tree_smaller[value2],null,value2);
		draw_trend(mult_tree_smaller[value2].mark_reversal,value2,null);
		if(value1 == 0 || value2 == 0)
			update_brush_g();
		draw_dash_line();
	}
	////////////////////////////////////////////////////////////////////////////////////////////////
	//删除按钮操作
	function delete_button_click(){
		var value = parseInt(d3.select(this).attr("value"));
		for(var i = value + 1; i < mult_tree_smaller.length; i++){
			d3.select("#" + mult_tree_smaller[i].buttondiv).selectAll("span").attr("value",i - 1);
		}
		var tmp = mult_tree_smaller[value].tree_id;
		if(pre_datasets_id.indexOf(tmp) != -1){
			pre_datasets_id.splice(pre_datasets_id.indexOf(tmp),1);
		}
		var tmp_idlist = pre_datasets_id.slice(0);
		dataCenter.set_global_variable("selection_array",tmp_idlist);
		deletefrom = false;
		delete_tree(tmp);
	}
	//增加多棵树

	function addMultiTree(nodes,idlist){
		for(var i = 0; i < nodes.length; i++){
			if(count == 0){
				reverse_m = false;
				draw_all_m = true;
				count = 1;
			}
			else if(count == 1){
				reverse_m = true;
				draw_all_m = true;
				count = 2;
			}
			else if(count == 2){
				reverse_m = false;
				draw_all_m = false;
				if(mult_tree_smaller.length > 0){
					mult_tree_smaller[0].mark_draw_all = false;
					mult_tree_smaller[0].tree_height = two_level_height;
				}	
				if(mult_tree_smaller.length > 1){
					mult_tree_smaller[1].mark_draw_all = false;
					mult_tree_smaller[1].tree_height = two_level_height;
				}
				c_mark = true;
				count = 3;
			}
			var node = nodes[i];
			var tree_height = addclick();
			var nodes1 = tree.nodes(node);
			for(var j = 0; j < nodes1.length; j++){
				var tmp = flow_of_depth[nodes1[j].depth][parseInt(nodes1[j].flow)];
				if(tmp == undefined) flow_of_depth[nodes1[j].depth][parseInt(nodes1[j].flow)] = 1;
				else flow_of_depth[nodes1[j].depth][parseInt(nodes1[j].flow)]++;
				if(parseInt(nodes1[j].flow) > max_flow_of_depth[nodes1[j].depth]){
					max_flow_of_depth[nodes1[j].depth] = parseInt(nodes1[j].flow);
				}
			}
			mult_tree_smaller.push({
				nodes:nodes1, 
				node:node, 
				tree_id:idlist[i], 
				index:numoftreecompare+2, 
				divid:"treemap"+numoftreecompare,
				buttondiv:"treemap_label_div" + numoftreecompare,
				alpabet_index:mult_tree_smaller.length,
				mark_reversal:reverse_m,
				mark_draw_all:draw_all_m,
				tree_height:tree_height
			});
			total_root.has[numoftreecompare + 2] = true;
			merge_trees(total_root,node,numoftreecompare + 2);
			numoftreecompare++;
		}
		if(c_mark == true){
			c_mark = false;
			modify_height_svg_treeHeight();
		}
		modify_buttondiv_top();
		changeViewForSvg();
		update_brush_g();
	}
	function update_brush_g(){
		if(mult_tree_smaller.length == 0) return;
		d3.selectAll(".created_g_for_brush").remove();
		d3.select("#"+mult_tree_smaller[0].divid).selectAll(".g_for_brush").append("g")
			.attr("class","created_g_for_brush")
			.attr("stroke","#fff")
			.attr("fill-opacity",0.125)
			.call(brush_compare)
			.selectAll("rect")
			.attr("y",0)
			.attr("height",trend_height);
	}
	//改变各div的高度，增加div，返回g
	function addclick(){
		var sum_height = 0,sum_min_tree_height = 0,sum_other_height = 0;
		for(var i = 0; i < mult_tree_smaller.length; i++){
			if(mult_tree_smaller[i].mark_draw_all == false){
				sum_height += trend_height + two_level_height;
				sum_other_height += trend_height + two_level_height;
			}
			else {
				sum_height += trend_height + min_tree_height;
				sum_min_tree_height += min_tree_height;
				sum_other_height += trend_height;
			}
		}
		var tmp_tree_height;
		var customize_height;
		if(count<3) customize_height = min_tree_height;
		else customize_height = two_level_height;
		if(sum_height + trend_height + customize_height <= height){
			sum_height += trend_height + customize_height;
			if(count < 3){
				sum_other_height += trend_height;
				sum_min_tree_height +=min_tree_height;
			}
			else sum_other_height += trend_height + two_level_height;
			var k = (height - sum_other_height) / sum_min_tree_height;
			var tree_height = k * min_tree_height;
			for(var j = 0; j < mult_tree_smaller.length; j++){
				if(mult_tree_smaller[j].mark_draw_all){
					mult_tree_smaller[j].tree_height = k * min_tree_height;
					tree_height = mult_tree_smaller[j].tree_height;
					d3.select("#"+mult_tree_smaller[j].divid+" #tree_svg").attr("height",tree_height);
					$("#"+mult_tree_smaller[j].divid).height(tree_height+trend_height+bottom_padding);
				}
			}
			d3.select("#multitree").append("div").attr("id",function(){
				return "treemap" + numoftreecompare;
			});
			if(count == 3) tree_height = two_level_height;
			$("#treemap"+numoftreecompare).height(tree_height+trend_height+bottom_padding);
			d3.select("#treemap"+numoftreecompare).append("svg").attr("id","flow_top_svg")
				.append("g").attr("transform","translate(30,0)")
				.attr("class","g_for_brush");
			d3.select("#treemap" + numoftreecompare).append("svg").attr("id","tree_svg")
				.attr("width",$("#multitree").width())
				.attr("height",tree_height)
				.attr("value",numoftreecompare)
				.on("dblclick",double_click_draw_all_or_part_tree)
				.append("g").attr("transform","translate(30,0)");
			d3.select("#treemap"+numoftreecompare).append("svg").attr("id","flow_bottom_svg")
				.append("g").attr("transform","translate(30,0)")
				.attr("class","g_for_brush");
			tmp_tree_height = tree_height;
		}
		else{
			for(var i = 0; i < mult_tree_smaller.length; i++){
				if(mult_tree_smaller[i].mark_draw_all){
					mult_tree_smaller[i].tree_height = min_tree_height;
					d3.select("#"+mult_tree_smaller[i].divid+" #tree_svg").attr("height",min_tree_height);
					$("#"+mult_tree_smaller[i].divid).height(min_tree_height+trend_height+bottom_padding);
				}
			}
			d3.select("#multitree").append("div").attr("id",function(){
				return "treemap" + numoftreecompare;
			});
			$("#treemap"+numoftreecompare).height(two_level_height+trend_height+bottom_padding);
			d3.select("#treemap"+numoftreecompare).append("svg").attr("id","flow_top_svg")
				.append("g").attr("transform","translate(30,0)")
				.attr("class","g_for_brush");
			d3.select("#treemap" + numoftreecompare).append("svg").attr("id","tree_svg")
				.attr("width",$("#multitree").width())
				.attr("height",two_level_height)
				.attr("value",numoftreecompare)
				.on("dblclick",double_click_draw_all_or_part_tree)
				.append("g").attr("transform","translate(30,0)");
			d3.select("#treemap"+numoftreecompare).append("svg").attr("id","flow_bottom_svg")
				.append("g").attr("transform","translate(30,0)")
				.attr("class","g_for_brush");
			tmp_tree_height = two_level_height;
		}
		var tmpdiv = d3.select("#treemap" + numoftreecompare).append("div").attr("id","treemap_label_div" + numoftreecompare)
			.style("position","absolute")
			.style("left",0);
		tmpdiv.append("span").attr("id","label_alpabet" +numoftreecompare)
			.attr("value",mult_tree_smaller.length)
			.on("click",function(){
				var tmp = parseInt(d3.select(this).attr("value"));
				var tmp_num = mult_tree_smaller[tmp].buttondiv.slice(17);
				for(var i = 0; i < mult_tree_smaller.length; i++){
					var j = mult_tree_smaller[i].buttondiv.slice(17);
					if(i == tmp) continue;
					if(d3.select("#delete"+j).style("visibility") == "visible"){
						d3.select("#delete"+j).style("visibility","hidden");
						d3.select("#up"+j).style("visibility","hidden");
						d3.select("#down"+j).style("visibility","hidden");
						d3.select("#part_or_all"+j).style("visibility","hidden");
						d3.select("#reverse"+j).style("visibility","hidden");
					}
				}
				if(d3.select("#delete"+tmp_num).style("visibility") == "hidden"){
					d3.select("#delete"+tmp_num).style("visibility","visible");
					d3.select("#up"+tmp_num).style("visibility","visible");
					d3.select("#down"+tmp_num).style("visibility","visible");
					d3.select("#part_or_all"+tmp_num).style("visibility","visible");
					d3.select("#reverse"+tmp_num).style("visibility","visible");
					if(tmp == mult_tree_smaller.length - 1) return;
					var m = mult_tree_smaller[tmp+1];
					if(mult_tree_smaller[tmp].mark_draw_all == false){
						d3.select("#"+m.buttondiv).style("visibility","hidden");
					}
				}
				else {
					d3.select("#delete"+tmp_num).style("visibility","hidden");
					d3.select("#up"+tmp_num).style("visibility","hidden");
					d3.select("#down"+tmp_num).style("visibility","hidden");
					d3.select("#part_or_all"+tmp_num).style("visibility","hidden");
					d3.select("#reverse"+tmp_num).style("visibility","hidden");
					if(tmp == mult_tree_smaller.length - 1) return;
					var m = mult_tree_smaller[tmp+1];
					if(mult_tree_smaller[tmp].mark_draw_all == false){
						d3.select("#"+m.buttondiv).style("visibility","visible");
					}
				}
			})
		tmpdiv.append("br");
		tmpdiv.append("span").attr("id","delete" + numoftreecompare).style("visibility","hidden")
			.attr("class","btn btn-default btn-xs active level-btn toolbar-tree")
			.html("<span class=\"glyphicon glyphicon-remove\"></span>")
			.attr("value",mult_tree_smaller.length)
			.on("click",delete_button_click);
		tmpdiv.append("br");
		tmpdiv.append("span").attr("id","up" + numoftreecompare).style("visibility","hidden")
			.attr("class","btn btn-default btn-xs active level-btn toolbar-tree")
			.html("<span class=\"glyphicon glyphicon-chevron-up\"></span>")
			.attr("value",mult_tree_smaller.length)
			.on("click",function(){
				var value = parseInt(d3.select(this).attr("value"));
				if(value == 0) return;
				up_down_tree(value-1,value);
			});
		tmpdiv.append("br");
		tmpdiv.append("span").attr("id","down" + numoftreecompare).style("visibility","hidden")
			.attr("class","btn btn-default btn-xs active level-btn toolbar-tree")
			.html("<span class=\"glyphicon glyphicon-chevron-down\"></span>")
			.attr("value",mult_tree_smaller.length)
			.on("click",function(){
				var value = parseInt(d3.select(this).attr("value"));
				if(value == mult_tree_smaller.length - 1) return;
				d3.select("#"+mult_tree_smaller[value+1].buttondiv).style("visibility","visible");
				up_down_tree(value,value+1);
			});
		tmpdiv.append("br");
		tmpdiv.append("span").attr("id","part_or_all" + numoftreecompare).style("visibility","hidden")
			.attr("class","btn btn-default btn-xs active level-btn toolbar-tree")
			.html("<span class=\"glyphicon glyphicon-resize-small\"></span>")
			.attr("value",mult_tree_smaller.length)
			.on("click",button_click_draw_all_or_part_tree);
		tmpdiv.append("br");
		tmpdiv.append("span").attr("id","reverse" + numoftreecompare).style("visibility","hidden")
			.attr("class","btn btn-default btn-xs active level-btn toolbar-tree")
			.html("<span class=\"glyphicon glyphicon-text-height\"></span>")
			.attr("value",mult_tree_smaller.length)
			.on("click",reverse_tree_click);
		return tmp_tree_height;
	}
	function draw_all_or_part_tree(value){
		var tmp_tree = mult_tree_smaller[value];
		tmp_tree.mark_draw_all = (tmp_tree.mark_draw_all == false);
		modify_height_svg_treeHeight();
		for(var i = 0; i < mult_tree_smaller.length; i++){
			draw_tree(mult_tree_smaller[i].mark_reversal,mult_tree_smaller[i].mark_draw_all,mult_tree_smaller[i],null,i);
		}
		draw_dash_line();
	}
	function modify_height_svg_treeHeight(){
		var sum_height = 0,sum_min_tree_height = 0,sum_other_height = 0;
		for(var i = 0; i < mult_tree_smaller.length; i++){
			if(mult_tree_smaller[i].mark_draw_all == false){
				sum_height += trend_height + two_level_height;
				sum_other_height += trend_height + two_level_height;
			}
			else {
				sum_height += trend_height + min_tree_height;
				sum_min_tree_height += min_tree_height;
				sum_other_height += trend_height;
			}
		}
		if(sum_height < height){
			var k = (height - sum_other_height) / sum_min_tree_height;
			var tree_height;
			for(var j = 0; j < mult_tree_smaller.length; j++){
				if(mult_tree_smaller[j].mark_draw_all){
					mult_tree_smaller[j].tree_height = k * min_tree_height;
					tree_height = mult_tree_smaller[j].tree_height;
					d3.select("#"+mult_tree_smaller[j].divid+" #tree_svg").attr("height",tree_height);
					$("#"+mult_tree_smaller[j].divid).height(tree_height+trend_height+bottom_padding);
				}
				else{
					mult_tree_smaller[j].tree_height = two_level_height;
					d3.select("#"+mult_tree_smaller[j].divid+" #tree_svg").attr("height",two_level_height);
					$("#"+mult_tree_smaller[j].divid).height(two_level_height+trend_height+bottom_padding);
				}
			}
		}
		else{
			for(var j = 0; j < mult_tree_smaller.length; j++){
				if(mult_tree_smaller[j].mark_draw_all){
					mult_tree_smaller[j].tree_height = min_tree_height;
					tree_height = min_tree_height;
					d3.select("#" + mult_tree_smaller[j].divid +" #tree_svg").attr("height",tree_height);
					$("#"+mult_tree_smaller[j].divid).height(tree_height+trend_height+bottom_padding);
				}
				else{
					mult_tree_smaller[j].tree_height = two_level_height;
					d3.select("#" + mult_tree_smaller[j].divid +" #tree_svg").attr("height",two_level_height);
					$("#"+mult_tree_smaller[j].divid).height(two_level_height+trend_height+bottom_padding);
				}
			}
		}
	}
	function button_click_draw_all_or_part_tree(){
		var value = parseInt(d3.select(this).attr("value"));
		draw_all_or_part_tree(value);
		modify_buttondiv_top();
		if(mult_tree_smaller[value].mark_draw_all == true){
			d3.select(this).html("<span class=\"glyphicon glyphicon-resize-small\"></span>")
			if(value == mult_tree_smaller.length - 1) return;
			d3.select("#"+mult_tree_smaller[value+1].buttondiv)
				.style("visibility","visible");
		}
		else{
			d3.select(this).html("<span class=\"glyphicon glyphicon-resize-full\"></span>")
			if(value == mult_tree_smaller.length - 1) return;
			d3.select("#"+mult_tree_smaller[value+1].buttondiv)
				.style("visibility","hidden");
		}
	}
	function double_click_draw_all_or_part_tree(){
		var n = d3.select(this).attr("value");
		n = parseInt(n);
		var value = d3.select("#part_or_all"+n).attr("value");
		value = parseInt(value);
		draw_all_or_part_tree(value);
		modify_buttondiv_top();
		if(mult_tree_smaller[value].mark_draw_all == true){
			d3.select("#part_or_all"+n)
				.html("<span class=\"glyphicon glyphicon-resize-small\"></span>");
			if(value == mult_tree_smaller.length - 1) return;
			d3.select("#"+mult_tree_smaller[value+1].buttondiv)
				.style("visibility","visible");
		}
		else{
			d3.select("#part_or_all"+n)
				.html("<span class=\"glyphicon glyphicon-resize-full\"></span>");
			if(value == mult_tree_smaller.length - 1) return;
			if(d3.select("#delete"+n).style("visibility") == "hidden") return;
			d3.select("#"+mult_tree_smaller[value+1].buttondiv)
				.style("visibility","hidden");
		}
	}
	//翻转树
	function reverse_tree_click(){
		var value = parseInt(d3.select(this).attr("value"));
		var tmp_tree = mult_tree_smaller[value];
		tmp_tree.mark_reversal = (tmp_tree.mark_reversal == false);
		draw_tree(tmp_tree.mark_reversal,tmp_tree.mark_draw_all,mult_tree_smaller[value],null,value);
		draw_trend(tmp_tree.mark_reversal,value);
		update_brush_g();
		draw_dash_line();
	}
	//树的数目改变时，改变树的布局
	function changeViewForSvg(){
		nodes = tree.nodes(total_root);
		build_id_nodes(nodes);
		for(var i = 0; i < mult_tree_smaller.length; i++){
			draw_tree(mult_tree_smaller[i].mark_reversal,mult_tree_smaller[i].mark_draw_all,mult_tree_smaller[i],null,i);
			draw_trend(mult_tree_smaller[i].mark_reversal,i);
		}
		draw_dash_line();
	}
	//根据树的数目，调整对应操作栏的高度
	function modify_buttondiv_top(){
		if(mult_tree_smaller.length == 0) return;
		var top = 0;
		d3.select("#" + mult_tree_smaller[0].buttondiv).style("top",0);
		for(var i = 0; i < mult_tree_smaller.length - 1; i++){
			var h = $("#" + mult_tree_smaller[i].divid).height();
			top += h;
			d3.select("#" + mult_tree_smaller[i + 1].buttondiv).style("top",top+"px");
			d3.select("#label_alpabet" + mult_tree_smaller[i+1].buttondiv.slice(17))
				.html("<span class=\"span-label\">"
					+mult_tree_smaller[i+1].alpabet_index+"</span>");
		}
		d3.select("#label_alpabet" + mult_tree_smaller[0].buttondiv.slice(17))
				.html("<span class=\"span-label\">"
					+mult_tree_smaller[0].alpabet_index+"</span>");
	}
	//清空视图中的树
	function delete_all_trees(){
		for(var i = mult_tree_smaller.length - 1; i >= 0; i--){
			delete_tree(mult_tree_smaller[i].tree_id);
		}
	}
	//收缩所有树
	function shrink_all_tree(){
		for(var i = 0; i < mult_tree_smaller.length; i++){
			mult_tree_smaller[i].mark_draw_all = false;
			mult_tree_smaller[i].tree_height = two_level_height;
		}
		modify_height_svg_treeHeight();
		modify_buttondiv_top();
		for(var i = 0; i < mult_tree_smaller.length; i++){
			draw_tree(mult_tree_smaller[i].mark_reversal,mult_tree_smaller[i].mark_draw_all,mult_tree_smaller[i],null,i);
			d3.select("#part_or_all" + (mult_tree_smaller[i].index - 2))
				.html("<span class=\"glyphicon glyphicon-resize-full\"></span>");
		}
		draw_dash_line();
	}
	//展开所有树
	function expand_all_tree(){
		for(var i = 0; i < mult_tree_smaller.length; i++){
			mult_tree_smaller[i].mark_draw_all = true;
		}
		modify_height_svg_treeHeight();
		modify_buttondiv_top();
		for(var i = 0; i < mult_tree_smaller.length; i++){
			draw_tree(mult_tree_smaller[i].mark_reversal,mult_tree_smaller[i].mark_draw_all,mult_tree_smaller[i],null,i);
			d3.select("#part_or_all" + (mult_tree_smaller[i].index - 2))
				.html("<span class=\"glyphicon glyphicon-resize-small\"></span>");
		}
		draw_dash_line();
	}
	function modify_style_of_alpabet_label(tree_id){
		for(var i = 0; i < mult_tree_smaller.length; i++){
			var tmp = mult_tree_smaller[i];
			if(tmp.tree_id == tree_id){
				d3.select("#label_alpabet" + mult_tree_smaller[i].buttondiv.slice(17))
					.html("<span class=\"span-label\" style=\"background-color:#B0E0E6\">"
						+mult_tree_smaller[i].alpabet_index+"</span>");
				break;
			}
		}
	}
    TreeCompare.OMListen = function(message, data) {
		var idmulti = "#compare-node-";
		if (message == "highlight") {
			d3.select("#multitree").selectAll(".highlight").classed("highlight", false)
			d3.select("#multitree").selectAll(".half-highlight").classed("half-highlight", false)
			for (var i = 0; i < data.length; i++) {
				d3.select("#multitree").select(idmulti + data[i]).classed("highlight", true);
				d3.select("#multitree").select(idmulti + data[i]).each(function(d) {
					if (d == null) return;
					var node = d.parent;
					while (node != null) {
						d3.select("#multitree").select(idmulti + node.id).classed("half-highlight", true);
						node = node.parent;
					}
				})				
			}
		}
        if(message == "mouse-over"){
        	for (var i = 0; i < data.length; i++) {
        		d3.select("#multitree").selectAll(idmulti + data[i]).classed("focus-highlight",true);
        		highlight_subtree_root(data[i]);
			}
        }
        if(message == "mouse-out"){
        	for (var i = 0; i < data.length; i++) {
        		d3.select("#multitree").selectAll(idmulti + data[i]).classed("focus-highlight",false);
        		unhighlight_subtree_root();
			}
        }
        if(message=="update-view"){
        	var self = this;
        	var currentId = dataCenter.global_variable.current_id;
        	var addlist = [], add_id_list = [];
        	var dataCenter_datasets_idlist = [];
        	for(var i = 0; i < dataCenter.datasets.length; i++){
        		var tmp = dataCenter.datasets[i];
        		dataCenter_datasets_idlist.push(tmp.id);
        		if(pre_datasets_id.indexOf(tmp.id) == -1){
        			addlist.push(tmp.processor.result.treeRoot);
        			pre_datasets_id.push(tmp.id);
        			add_id_list.push(tmp.id);
        		}
        	}
        	var deletelist = [];
        	for(var i = 0; i < pre_datasets_id.length; i++){
        		var tmp = pre_datasets_id[i];
        		if(dataCenter_datasets_idlist.indexOf(tmp) == -1){
        			deletefrom = true;
        			delete_tree(tmp);
        			deletelist.push(i);
        		}
        	}
        	for(var i = deletelist.length - 1; i >= 0; i--){
        		pre_datasets_id.splice(deletelist[i],1);
        	}
        	if(addlist.length > 0) {
        		addMultiTree(addlist,add_id_list);
        	}
        	pre_datasets = dataCenter.datasets;
        }
        if(message == "show-similiar"){
        	completelyShowSimilarPart();
        }
        if(message == "show-all"){
        	draw_depth(dataCenter.GLOBAL_STATIC.MAX_DEPTH);
        }
        if(message == "change-depth"){
        	var depth = +data;
        	draw_depth(depth);
        }
    }
    return TreeCompare;
}