var treeCompare = function(){
	var TreeCompare = {};
	var markexpand = true;
//	console.log("addListener compare");
//	ObserverManager.addListener(TreeCompare);
	ObserverManager.changeListener(TreeCompare,3);
	var datasets = dataCenter.datasets;

	// var combine1 = sigtree.combinator().by_index(true);
	// var combine2 = sigtree.combinator().compare(function(d1,d2){return d1.key.localeCompare(d2.key)});
	// var merge_tree = sigtree.merge_tree(combine2);

	var duration = 1750;
	var ratio = 1.5;

	var _width = $("#rightWrapper").width() - 40;
	var height = $("#rightWrapper").height() - 50;

	var svg_;
	var svg_2;
	var svg_his;
	var tree_height = (height-120)/2.0;
	var trend_height = 80;

	var svg_size = { width:_width, height:tree_height,
		left:20, right:10, top:20, bottom:0 };
	var svghis_size = { width:_width, height:trend_height,
		left:20, right:10, top:0, bottom:0 };
	var svg2_size = {width:_width, height:tree_height,
		left:20, right:10, top:0, bottom:20 };
/*	var svgg_size = {width:_width, height:50,
		left:20, right:10, top:0, bottom:0 };*/
	var levelTop = new Array();
	var levelBottom = new Array();
	var levelTopY = new Array();
	var levelBottomY = new Array();
	var leftPadding = 25;
	svg_ = initFrame(d3.select("#treemapA").append("svg"),svg_size,false);
	svg_2 = initFrame(d3.select("#treemapB").append("svg"),svg2_size,false);
	svg_his = initFrame(d3.select("#treehis").append("svg"),svghis_size,false);
/*	if(mark11 == false){
		mark11 = true;
		var svg_g1 = initFrame(d3.select("#treemap1").append("svg"),svgg_size,false);
		var svg_g2 = initFrame(d3.select("#treemap2").append("svg"),svgg_size,false);
	
	svg_g1.append("rect")
		.attr("width",_width)
		.attr("height",50)
		.attr("fill","none")
		.attr("stroke","gray")
		.attr("stroke-width","2px");
	svg_g2.append("rect")
		.attr("width",_width)
		.attr("height",50)
		.attr("fill","none")
		.attr("stroke","gray")
		.attr("stroke-width","2px");
	}*/
	var g_first = svg_.append("g")
			.attr("transform", "translate(30,0)")
			.attr("id","g_top"),
			g_second= svg_2.append("g")
			.attr("transform", "translate(30,0)")
			.attr("id","g_bottom"),
			g_trend = svg_his.append("g")
			.attr("transform", "translate(30,0)")
			.attr("id","g_middle");
	/*
	 * layout
	 */
/*	var zoom = d3.behavior.zoom()
		.scaleExtent([1,10])
		.on("zoom",zoomed);
	g_first.call(zoom);
	function zoomed(){  
        g_first.attr("transform","translate("+d3.event.translate+")scale("+d3.event.scale+")");
    } */
	var tree = d3.layout.tree()
		.size([svg_size.width - leftPadding,tree_height])
		.separation(function(a, b) { 
			var dis = (a.parent == b.parent ? 1 : 2) / a.depth;
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
	var root;
	var nodes;
	var links;
	var colors = function(i){
		var three_ = ["red","green","blue"];
		return (function(){return three_[i]})();
	};
	var tip = d3.tip()
	  .attr('class', 'd3-tip')
	  .offset([-10, 0]);
	svg_.call(tip);
	//add A B sign
	var dts = datasets[0].processor.result.dataList;
	var dts2 = datasets[1].processor.result.dataList;
	var dt_root = datasets[0].processor.result.treeRoot;
	var dt_root2 = datasets[1].processor.result.treeRoot;
	// accumulate_flow(dt_root);
	// accumulate_flow(dt_root2);

	// function getChildren() {
	// 	// console.log("get children");
	// 	var h = combine1(dt_root.values, dt_root2.values);
	// 	h.forEach(merge_tree); 
	// 	return h;		
	// }
	// var children = get`();
	// root = {
	// 	key:"root",
	// 	x0: svg_size.width/2,
	// 	y0: 0,
	// 	obj1: dt_root,
	// 	obj2: dt_root2,
	// 	children:children
	// };

	root = sigtree.dataProcessor().mergeTwoListAsTree(dts, dts2);
	root.x0 = svg_size.width/2;
	root.y0 = 0;
	nodes = tree.nodes(root);
	distinguishTree(nodes);
	accumulateFlow(root);
	// console.log("nodes", nodes);

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
			while (node.parent != null) {
				node = node.parent;
				node.hasObj1 = node.hasObj1 || hasObj1;
				node.hasObj2 = node.hasObj2 || hasObj2;
			}
		}
	}

	function accumulateFlow(root){
		if(!Array.isArray(root.values)){
			root.flow1 = (root.obj1 != null ? (+root.obj1.flowSize) : 0);
			root.flow2 = (root.obj2 != null ? (+root.obj2.flowSize) : 0);
			return;
		}
		var flow1 = 0, flow2 = 0;
		root.values.forEach(function(child) {
			accumulateFlow(child);
			flow1 += child.flow1;
			flow2 += child.flow2;
		});
		root.flow1 = flow1;
		root.flow2 = flow2;
		// console.log(root);
	}

	// init	
	g_trend.append("rect").attr("width", svg_size.width - leftPadding)
		.attr("height", trend_height)
		.attr("class","trend");


	var cur_depth = 4;
	var scale = d3.scale.linear().range([0,trend_height]);		

	draw_depth(cur_depth);

	$("#default").attr("checked",true);
	$("#tree-compare-depth-controller").on("click", ".level-btn", function(){
		var dep = $(this).attr("level");
		$("#tree-compare-depth-controller .level-btn").removeClass("active");		
		for (var i = 0; i <= dep; i++)
			$("#tree-compare-depth-controller .level-btn[level=" + i + "]").addClass("active");		
		draw_depth(dep);
	});


	function draw_depth(depth){
		// console.log("depth", depth, nodes.length)
		cur_depth = depth;
		nodes.forEach(function(n){
			if(n.depth < depth && n._children){
				n.children = n._children;
				delete n._children;
			}
			if(n.depth >= depth && n.children){
				n._children = n.children;
				delete n.children;
			}
		});
		var _nodes = tree.nodes(root);
		// console.log("nodes********************",nodes);
		// console.log("_nodes********************",_nodes);
		//var _links = tree.links(_nodes);
		//drawTree(_nodes, _links, svg_);
		//var sep_trees = separate(root);
		draw_separate_tree(_nodes, root);
		draw_trend(_nodes, root);
	}


	function draw_separate_tree(nodes, source){
		// console.log("nodes",nodes);
		var dt_root = datasets[0].processor.result.treeRoot;
		var dt_root2 = datasets[1].processor.result.treeRoot;
		var nodesA = tree.nodes(dt_root);
		var nodesB = tree.nodes(dt_root2);
		var nos = [];
		nos[0] = nodes.filter(function(d){
			return d.hasObj1;
		});
		nos[1] = nodes.filter(function(d){
			return d.hasObj2;
		});
		var maxLevelA = 0;
		var allNodeNumA = nos[0].length;
		var maxLevelB = 0;
		var allNodeNumB = nos[1].length;
		for(var i=0;i<nos[0].length;i++){
			if(nos[0][i].depth>maxLevelA){
				maxLevelA = nos[0][i].depth;
			}
		}
		for(var i=0;i<nos[1].length;i++){
			if(nos[1][i].depth>maxLevelB){
				maxLevelB = nos[1][i].depth;
			}
		}
		$("#innerTopRight #label-A .level_description").text(function() {
			return  maxLevelA;
		});
		$("#innerTopRight #label-B .level_description").text(function() {
			return maxLevelB;
		});
		$("#innerTopRight #label-A .node_num_description").text(function() {
			return  allNodeNumA;
		});
		$("#innerTopRight #label-B .node_num_description").text(function() {
			return allNodeNumB;
		});
		for(var i=0;i<5;i++){
			levelTop[i] = 0;
			levelBottom[i] = 0;	
		}
		levelTopY.splice(0,levelTopY.length);
		levelBottomY.splice(0,levelBottomY.length);
		for(var i=0;i<nos[0].length;i++){
			var innerA = nos[0][i].depth;
			levelTop[innerA] = levelTop[innerA] + 1;
			levelTopY[innerA] = nos[0][i].y;
		}
		for(var i=0;i<nos[1].length;i++){
			var innerA = nos[1][i].depth;
			levelBottom[innerA] = levelBottom[innerA] + 1;
			levelBottomY[innerA] = nos[1][i].y;
		}
		levelTop = _.without(levelTop, 0);
		levelBottom = _.without(levelBottom, 0);
		// console.log("nos0", nos[0])
		// console.log("nos1", nos[1])

		var link = tree.links(nodes).filter(function(l){
			return l.target.hasObj1 && l.source.hasObj1;
		});
		var link1 = tree.links(nodes).filter(function(l){
			return l.target.hasObj2 && l.source.hasObj2;
		});
		var top_links = g_first.selectAll(".link")
			.data(link,function(l){return l.target.id});
		top_links.enter().insert("path")
			.attr("class","link")
			.attr("d",function(l){
				var o = {x:source.x0, y:source.y0};
				return diagonal({source:o, target:o});
			});
		top_links.transition().duration(750).attr("d",function(d){
				return diagonal(d);
			});
		top_links.exit()
			.transition().duration(750)
			.attr("d",function(l){
				var o = {x:source.x0, y:source.y0};
				return diagonal({source:o, target:o});
			}).remove();
		var bottom_links = g_second.selectAll(".link")
			.data(link1,function(l){return l.target.id});
		bottom_links.enter().insert("path")
			.attr("class","link")
			.attr("d",function(l){
				var o = {x:source.x0, y:source.y0};
				return diagonal_({source:o, target:o});
			});
		bottom_links.transition().duration(750)
			.attr("d",function(d){
				return diagonal_(d);
			});
		bottom_links.exit()
			.transition().duration(750)
			.attr("d",function(){
				var o = {x:source.x0, y:source.y0};
				return diagonal_({source:o, target:o});
			})
			.remove();
		// console.log("nos0", nos[0]);
		var top_nodes = g_first.selectAll(".node")
			.data(nos[0], function(d){return d.id});
		top_nodes.enter()
			.append("circle")
			.attr("id", function(d) {
				return "compare-top-node-" + d.id
			})
			.attr("cx",function(n,d){
				return source.x0;
			})
			.attr("cy",function(n){ var x = n; return source.y0})
			.on("mouseover", function(d, i) {
				
				ObserverManager.post("show-detail-info", { dataset:"A", node: nodesA[i] });
				tip.html(function() {
					var text = d.key;
					if (Array.isArray(d.values)){
						var ct = 0;
						for(var j = 0; j < nos[0][i].values.length; j++){
							if(nos[0][i].values[j].hasObj1) ct++;
						}
						text += "<br>子节点数:" +  ct;
					}
					text += "<br>流量:" + nodesA[i].flow;
					return text;
				})
				tip.show()
				ObserverManager.post("mouse-over", [d.id]);
			})
			.on("mouseout", function(d) {
				ObserverManager.post("mouse-out", [d.id]);
				tip.hide();
			});
/*		top_g.append("polygon")
			.attr("points",function(d,i){
				if(d.depth == 4) return null;
				var updotx = d.x;
				var updoty = d.y + 5;
				var leftx = d.x-3;
				var lefty = d.y + 11;
				var rightx = d.x + 3;
				var righty = d.y + 11
				return ""+updotx+","+updoty+" "+leftx+","+lefty+" "+rightx+","+righty+"";
			})
			.attr("id",function(d,i){
				return "toppolygon" + i;
			})
			.attr("fill","steelblue")
			.attr("opacity",1);*/
			top_nodes.attr("class",function(n){
				if(n._children) return "node node-inner";
				return "node node-leaf";
			}).attr("r", function(d,i){
				if(d.depth == 4){
					return 1;
				}
				if(d.depth == 3){
					return 2.5;
				}
				return (4.5 - d.depth) * 2;
			})
			.transition().duration(750)
			.attr("cx",function(d){return d.x})
			.attr("cy",function(d){return d.y});
		top_nodes.on("click",node_click_focus)
		top_nodes.exit()
			.transition().duration(750)
			.attr("cx",function(d){return source.x0})
			.attr("cy",function(d){return source.y0}).remove();
		g_first.selectAll(".node-text-top").remove();
		g_first.selectAll(".node-text-top")
		.data(nos[0])
		.enter()
		.append("text")
		.attr("class","node-text-top")
		.attr("id", function(d) {
			return "text" + d.id
		})
		.attr("x",function(d,i){
			var strArray = d.key.split(" ");
			return d.x - 6 * strArray[0].length/2;
		})
		.attr("y",function(d){ return d.y - 12;})
		.text(function(d,i){
			var strArray = d.key.split(" ");
			if(d.depth<2){
				return strArray[0];
			}
		})
		.attr("font-size","12px");

		svg_.selectAll(".top-node-desc").remove();
/*		svg_.selectAll(".top-node-desc")
		.data(levelTop)
		.enter()
		.append("text")
		.attr("class","top-node-desc")
		.attr("x",function(d,i){
			return -20;
		})
		.attr("y",function(d,i){
			return levelTopY[i];
		})
		.text(function(d,i){
			return "L" + i + ":" + d; 
		})
		.attr("font-size","12px");*/
		var bottom_nodes = g_second.selectAll(".node")
			.data(nos[1], function(d){return d.id});
		bottom_nodes.enter().append("circle")
			.attr("cx",function(n){return source.x0})
			.attr("cy",function(n){return tree_height - source.y0})
			.attr("id", function(d) { return "compare-bottom-node-" + d.id })		
			.on("mouseover", function(d, i) {
				ObserverManager.post("show-detail-info", { dataset:"B", node: nodesB[i] });				
				tip.html(function() {
					var text = d.key;
					if (Array.isArray(d.values)){
						var ct = 0;
						for(var j = 0; j < nos[1][i].values.length; j++){
							if(nos[1][i].values[j].hasObj2) ct++;
						}
						text += "<br>子节点数:" +  ct;
					}
					text += "<br>流量:" + nodesB[i].flow;
					return text;
				});
				tip.show();
				ObserverManager.post("mouse-over", [d.id]);
			})
			.on("mouseout", function(d) {
				ObserverManager.post("mouse-out", [d.id]);
				tip.hide();
			});
		bottom_nodes.attr("class",function(n){
				if(n._children) return "node node-bottominner";
				return "node node-leaf";
			}).attr("r", function(d,i){
				if(d.depth == 4){
					return 1;
				}
				if(d.depth == 3){
					return 2.5;
				}
				return (4.5 - d.depth) * 2;
			})
			.style("stroke","#FF7F0E")
			.transition().duration(750)
			.attr("cx",function(d){return d.x})
			.attr("cy",function(d){return tree_height - d.y})
		bottom_nodes.on("click",node_click_focus);
		bottom_nodes.exit().
			transition().duration(750)
			.attr("cx",function(d){return source.x})
			.attr("cy",function(d){return tree_height-source.y}).remove();
		
		g_second.selectAll(".node-text-bottom").remove();
		g_second.selectAll(".node-text-bottom")
			.data(nos[1])
			.enter()
			.append("text")
			.attr("class","node-text-bottom")
			.attr("id", function(d) {
				return "text" + d.id
			})
			.attr("x",function(d,i){
				var strArray = d.key.split(" ");
				return d.x - 6 * strArray[0].length/2;
			})
			.attr("y",function(d){ return tree_height - d.y + 20;})
			.text(function(d,i){
				var strArray = d.key.split(" ");
				if(d.depth<2){
					return strArray[0];
				}
			})
		.attr("font-size","12px");
/*		svg_.selectAll(".bottom-node-desc").remove();
		svg_.selectAll(".bottom-node-desc")
			.data(levelBottom)
			.enter()
			.append("text")
			.attr("class","bottom-node-desc")
			.attr("x",function(d,i){
				return -20;
			})
			.attr("y",function(d,i){
				return 2 * tree_height + trend_height - levelBottomY[i];
			})
			.text(function(d,i){
				return "L" + i + ":" + d; 
			})
			.attr("font-size","12px");*/
		nodes.forEach(function(n){
			n.x0 = n.x;
			n.y0 = n.y;
		});	

	}


	//
	// draw trend
	//
	function draw_trend(_nodes, source){
		var leaves = _nodes.filter(function(n){
			return !n.children && n.depth == cur_depth;
		});
		var max = d3.max(leaves, function(leaf){
			var sum = +0;
			sum += leaf.flow1 + leaf.flow2;
			return sum;
		});
		scale.domain([0,max*1.1]);
		var index = 0;
		var bars = g_trend.selectAll(".bar")
			.data(leaves);
		var bars_enter = bars.enter().insert("g").attr("class","bar")
			.attr("transform",function(leaf){
					return "translate("+source.x0+")";
				});
		bars_enter.append("rect").attr("class","top_bar");
		bars_enter.append("rect").attr("class","bottom_bar");
		bars.select("rect.top_bar").attr("width",2)
			.attr("height",function(leaf){
				return scale(leaf.flow1);
			})
			.on("mouseover",function(d,i){
				ObserverManager.post("show-detail-info", { dataset:"A", node: d });
			});
		bars.select("rect.bottom_bar").attr("width",2)
			.attr("height",function(leaf){
				return scale(leaf.flow2);
			}).attr("transform",function(leaf){
				if(leaf.flow2 == 0) return "translate(0)";
				var t = trend_height - scale(leaf.flow2);
				return "translate(0,"+t+")";
			})
			.on("mouseover",function(d,i){
				ObserverManager.post("show-detail-info", { dataset:"B", node: d });
			});
		bars.transition().duration(750).attr("transform", function(leaf){
			return "translate(" + leaf.x + ")";
		});
		bars.exit().remove();
	}
	function node_click_focus(node){
		if(dataCenter.globalVariable.clickThisNodeShrink == false)
			node_focus(node);
		else node_click(node);
	}
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
		var _nodes = tree.nodes(root);
		draw_separate_tree(_nodes, node);
		draw_trend(_nodes, node);
	}
	function node_focus(node){
		if(node == root) {
			draw_depth(4);
			return;
		}
		var tmpnodes = tree.nodes(root);
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
		var _nodes = tree.nodes(root);
		draw_separate_tree(_nodes, node);
		draw_trend(_nodes, node);
	}
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
	function showSimilarPart(){
		var nodes = tree.nodes(root);
		var markifexpand = [];		
		for(var i = 0; i < nodes.length; i++){
			if(nodes[i].children){
				nodes[i]._children = nodes[i].children;
				delete nodes[i].children;
			}
			if(nodes[i].hasObj2 && nodes[i].hasObj1)
				markifexpand.push(nodes[i]);
		}
		cur_depth = 0;
		for(var i = 0; i < markifexpand.length; i++){
			if(markifexpand[i].depth > cur_depth) cur_depth = markifexpand[i].depth;
			var node = markifexpand[i];
			while(node.parent){
				if(node.parent._children){
					node.parent.children = node.parent._children;
					delete node.parent._children;
				}
				else break;
				node = node.parent;
			}
		}
		var _nodes = tree.nodes(root);
		draw_separate_tree(_nodes, root);
		draw_trend(_nodes, root);		
	}
	/*
	 *
	 */
	function initFrame(svg, size, noG){
		if (!size)
			size = {width: 600, height: 400};
		["left", "right", "bottom", "top"].forEach(function(attr){
			if(!size[attr]) 
				size[attr] = 0;
		});
		svg.attr("width", size.width + size.left + size.right)
			.attr("height", size.height + size.top + size.bottom);
		if (noG)
			return svg;
		var g = svg.append("g").
			attr("transform", "translate(" + size.left + "," + size.top + ")");
		return g;
	}
	$("#add").on("click",function(){
		addclick();
	});
	$("#showSimilar").on("click",function(){
		showSimilarPart();
	});
	function addclick(){
//		if(numoftreecompare == 4) return;
		numoftreecompare++;
		var svgheightA = $("#treemapA svg").attr("height");
		var svgheighthis = $("#treehis svg").attr("height");
		var svgheightB = $("#treemapB svg").attr("height");
		d3.select("#treemapA svg").attr("height",svgheightA/6*5);
		d3.select("#treehis svg").attr("height",svgheighthis/6*5);
		d3.select("#treemapB svg").attr("height",svgheightB/6*5);
		svgheightA = $("#treemapA svg").attr("height");
		svgheighthis = $("#treehis svg").attr("height");
		svgheightB = $("#treemapB svg").attr("height");
		var remainheight = (height - svgheightA - svgheighthis - svgheightB) / numoftreecompare;
		var new_svg_size = { width:_width, height:remainheight,
		left:20, right:10, top:0, bottom:0 };
		for(var i = 1; i < numoftreecompare; i++){
			d3.select("#treemap" + i + " svg").attr("height",remainheight);
		}
		d3.select("#multitree").append("div").attr("id",function(){
			return "treemap" + numoftreecompare;
		})
		var svg_g = initFrame(d3.select("#treemap" + numoftreecompare).append("svg"),new_svg_size,false);
		changeViewForSvg(svgheightA-20,svgheighthis);
	}
	function changeViewForSvg(height,svgheighthis){
		tree = d3.layout.tree()
		.size([svg_size.width - leftPadding,height])
		.separation(function(a, b) { 
			var dis = (a.parent == b.parent ? 1 : 2) / a.depth;
			if(a.depth <=2 && b.depth <= 2)
				dis = 3.3;
			if(a.depth==3 && b.depth==3)
				dis = 1;
	           return dis;
		 });
		diagonal_ = d3.svg.diagonal().projection(function(d){
			return [d.x, height - d.y];
		});
		nodes = tree.nodes(root);
		var _nodes = tree.nodes(root);
		tree_height = height;
		trend_height = svgheighthis;
		draw_separate_tree(_nodes,root);
		g_trend.select("rect").attr("width", svg_size.width - leftPadding)
			.attr("height", svgheighthis)
			.attr("class","trend");
		scale = d3.scale.linear().range([0,svgheighthis]);
		draw_trend(_nodes,root);
	}
    TreeCompare.OMListen = function(message, data) {
		var idPrefix = "#compare-top-node-";
		var idBottom = "#compare-bottom-node-";
		if (message == "highlight") {
			svg_.selectAll(".highlight").classed("highlight", false)
			svg_.selectAll(".half-highlight").classed("half-highlight", false)
			for (var i = 0; i < data.length; i++) {
				svg_.select(idPrefix + data[i]).classed("highlight", true);
				svg_.select(idPrefix + data[i]).each(function(d) {
					if (d == null) return;
					var node = d.parent;
					while (node != null) {
						svg_.select(idPrefix + node.id).classed("half-highlight", true);
						node = node.parent;
					}
				})				
			}
		}
        if(message == "mouse-over"){
        	for (var i = 0; i < data.length; i++) {
				svg_.select(idPrefix + data[i]).classed("focus-highlight", true);
				svg_.select(idBottom + data[i]).classed("focus-highlight", true);
			}
        }
        if(message == "mouse-out"){
        	for (var i = 0; i < data.length; i++) {
				svg_.select(idPrefix + data[i]).classed("focus-highlight", false);
				svg_.select(idBottom + data[i]).classed("focus-highlight", false);
			}
        }	
    }

    return TreeCompare;

}