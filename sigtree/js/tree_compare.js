var compareAddSvgMark = false;
var compare_g_first;
var compare_g_second;

var treeCompare = function(){
	var TreeCompare = {};
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
	$("#multitree").width(_width);
	$("#multitree").height(height);
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
	if(justChangeDataA == false || compareAddSvgMark == false) {
		var svg = d3.select("#treemapA").append("svg");
		compare_g_first = initFrame(svg,svg_size,false)
			.append("g")
			.attr("transform", "translate(30,0)")
			.attr("id","g_top");
		var svg_g = svg.append("g")
			.attr("transform","translate(0,0)")
		svg_g.append("rect")
			.attr("id","treemapArect")
			.attr("width", svg.attr("width"))
			.attr("height", svg.attr("height"))
			.attr("fill","none")
			.attr("stroke","gray")
			.attr("stroke-width","2px")
			.attr("opacity",0.5);
/*		svg_g.on("mouseover",function(){
				svg_g.select("rect")
					.attr("opacity",1);
			})
			.on("mouseout",function(){
				svg_g.select("rect")
					.attr("opacity",0);
			});*/
	}
	if(justChangeDataA == true || compareAddSvgMark == false) {
		var svg = d3.select("#treemapB").append("svg");
		compare_g_second = initFrame(svg,svg2_size,false)
			.append("g")
			.attr("transform", "translate(30,0)")
			.attr("id","g_bottom");
		var svg_g = svg.append("g")
			.attr("transform","translate(0,0)")
		svg_g.append("rect")
			.attr("id","treemapBrect")
			.attr("width", svg.attr("width"))
			.attr("height", svg.attr("height"))
			.attr("fill","none")
			.attr("stroke","gray")
			.attr("stroke-width","2px")
			.attr("opacity",0.5);

	}
	var svg_his = initFrame(d3.select("#treehis").append("svg"),svghis_size,false);
	var g_trend = svg_his.append("g")
			.attr("transform", "translate(30,0)")
			.attr("id","g_middle");
	compareAddSvgMark = true;	
	var brush_compare = d3.svg.brush();
	var brush_nodes_list = {};
	var tree_main_nodes = {};
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
			var dis = (a.parent == b.parent ? 1 : 2) / (a.depth * 2);
			if(a.depth <=2 && b.depth <= 2)
				dis = 3.3 / 2;
			if(a.depth==3 && b.depth==3)
				dis = 1 / 2;
			if(tree_main_nodes[a.id] == true || tree_main_nodes[b.id] == true)
				dis *= 2;
	        return dis;
		 });
	var oneline_only_mark = false;
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
	compare_g_first.call(tip);
	//add A B sign
	var dts = datasets[0].processor.result.dataList;
	var dts2 = datasets[1].processor.result.dataList;
	var dt_root = datasets[0].processor.result.treeRoot;
	var dt_root2 = datasets[1].processor.result.treeRoot;
	var nodesA = tree.nodes(dt_root);
	var nodesB = tree.nodes(dt_root2);
	var mult_tree_smaller = [];
	mult_tree_smaller.push({nodes:nodesA, node:dt_root, g:compare_g_first, index:1, divid:"treemapA"},
		{nodes:nodesB, node:dt_root2, g:compare_g_second, index:2, divid:"treemapB"});
	change_tree_main_nodes();
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
	var total_root = sigtree.dataProcessor().mergeTwoListAsTree(dts, dts2);
	root.x0 = svg_size.width/2;
	root.y0 = 0;
	nodes = tree.nodes(root);
	var tmp_total_nodes = tree.nodes(total_root);
	distinguishTree(nodes);
	distinguishTree(tmp_total_nodes);
	accumulateFlow(root);
	var id_nodes;
	var Aindex = 1;
	var Bindex = 2;
	// console.log("nodes", nodes);
	function build_id_nodes(nodes){
		id_nodes = [];
		for(var i = 0; i < nodes.length; i++){
			id_nodes.push(nodes[i].id);
		}		
	}
	function build_id_values(nodes){
		id_nodes = [];
		for(var i = 0; i < nodes.length; i++){
			id_nodes.push(nodes[i].id);
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
			node.has = [];
			if(hasObj1) node.has.push(1);
			if(hasObj2) node.has.push(2);
			while (node.parent != null) {
				node = node.parent;
				node.hasObj1 = node.hasObj1 || hasObj1;
				node.hasObj2 = node.hasObj2 || hasObj2;
				node.has = [];
				if(node.hasObj1) node.has.push(1);
				if(node.hasObj2) node.has.push(2);
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
		build_id_nodes(_nodes);
		for(var i = 2; i < mult_tree_smaller.length; i++){
			draw_tree_lastTwoLevel(mult_tree_smaller[i].nodes,mult_tree_smaller[i].g,_nodes);
		}
	}
	function merge_trees_putIndex(root,index){
		root.has = [];
		root.has.push(index);
		if(root.children == undefined) return;
		for(var i = 0; i < root.children.length; i++){
			merge_trees_putIndex(root.children[i],index);
		}
	}
	function merge_trees(root1,root2,index){
		var idlist = [];
		if(root1.children == undefined) root1.children = [];
		for(var j = 0; j < root1.children.length; j++){
			idlist.push(root1.children[j].id);
		}
		for(var i = 0; i < root2.children.length; i++){
			var tmp = idlist.indexOf(root2.children[i].id);
			if(tmp == -1){
				merge_trees_putIndex(root2.children[i],index);
				root1.children.push(root2.children[i]);
			}
			else {
				root1.children[tmp].has.push(index);
				if(root2.children[i].children == undefined) continue;
				merge_trees(root1.children[tmp],root2.children[i],index);
			}
		}
	}
	function draw_tree_lastTwoLevel(nodes, tree_g, _nodes, sorce){
		var link = tree.links(nodes).filter(function(l){
			if(oneline_only_mark == true) return false;
			if(l.target.depth == 4 && l.source.depth == 3){
				var target = id_nodes.indexOf(l.target.id),
					source = id_nodes.indexOf(l.source.id);
				if(target == -1 || source == -1) return false;
/*				var m1 = (_nodes[target].has.indexOf(Aindex) != -1) ||  (_nodes[target].has.indexOf(Bindex)!= -1);
				var m2 = (_nodes[source].has.indexOf(Aindex) != -1) ||  (_nodes[source].has.indexOf(Bindex)!= -1);
				if(m1 && m2){
					return true;
				}*/
				return true;
			}
			return false;
		});
		var links = tree_g.selectAll(".link")
			.data(link,function(l){return l.target.id});
		links.enter().insert("path")
			.attr("class","link")
			.attr("d",function(l){
				var o;
				if(sorce) o = {x:sorce.x, y:remainheight - 5};
				else o = {x:(svg_size.width - leftPadding)/2,y:remainheight - 5};
				return diagonal({source:o, target:o});
			});
		links.transition().duration(750)
			.attr("d",function(d){
				var sourceX = _nodes[id_nodes.indexOf(d.source.id)].x;
				var targetX = _nodes[id_nodes.indexOf(d.target.id)].x;
				var s = {x:sourceX, y:remainheight-5};
				var t = {x:targetX, y:0};
				return diagonal({source:s,target:t});
			});
		links.exit()
			.transition().duration(750)
			.attr("d",function(){
				var o;
				if(sorce) o = {x:sorce.x, y:remainheight - 5};
				else o = {x:(svg_size.width - leftPadding)/2,y:remainheight - 5};
				return diagonal({source:o, target:o});
			})
			.remove();
		nodes.filter(function(n){
			if(n.depth == 3) n.count = 0;
		});
		var filtered_nodes = nodes.filter(function(n){
			if(n.depth < 3) return false;
			if(id_nodes.indexOf(n.id) == -1) return false;
			if(n.depth == 4 && oneline_only_mark == true) return false;
/*			var tmp = _nodes[id_nodes.indexOf(n.id)].has;
			if(n.depth == 4 && tmp.indexOf(Aindex) == -1 && tmp.indexOf(Bindex) == -1){
				n.parent.count++;
				return false;
			}*/
			return true;
		})
		var m_nodes = tree_g.selectAll(".node")
			.data(filtered_nodes, function(d){return d.id});
		m_nodes.enter()
			.append("circle")
			.attr("id", function(d) {
				return "compare-m-node-" + d.id;
			})
			.attr("cx",function(d){
				var o;
				if(sorce) o = sorce.x;
				else o = (svg_size.width - leftPadding)/2;
				return o;
			})
			.attr("cy",function(d){
				return remainheight-5;				
			})
			.on("mouseover", function(d, i) {
				var tmp = "M" + numoftreecompare;
				ObserverManager.post("show-detail-info", { dataset:tmp, node: d });
				tip.html(function() {
					var text = d.key;
					if (Array.isArray(d.values)){
						text += "<br>子节点数:" +  d.values.length;
					}
					text += "<br>流量:" + d.flow;
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
				build_id_nodes(_nodes);
				var tmp = id_nodes.indexOf(d.id);
				node_click_focus(_nodes[tmp]);
			});
		m_nodes.attr("class",function(n){
				if(n._children) return "node node-inner";
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
			.transition().duration(750)
			.attr("cx",function(d){
				var x = _nodes[id_nodes.indexOf(d.id)].x;
				return x;
			})
			.attr("cy",function(d){
				if(d.depth == 3) return remainheight-5;
				if(d.depth == 4) return 0;
			});
		m_nodes.exit()
			.transition().duration(750)
			.attr("cx",function(d){
				var o;
				if(sorce) o = sorce.x;
				else o = (svg_size.width - leftPadding)/2;
				return o;
			})
			.attr("cy",function(d){return remainheight-5;}).remove();
/*		tree_g.selectAll(".node-count-mult").remove();
		tree_g.selectAll(".node-count-mult")
			.data(filtered_nodes.filter(function(n){
				if(n.depth == 3 && n.count > 0) return true;
				return false;
			}))
			.enter()
			.append("text")
			.attr("class","node-count-mult")
			.attr("x",function(d,i){
				return _nodes[id_nodes.indexOf(d.id)].x - 3;
			})
			.attr("y",function(d){ 
				var r = 2.5;
				return remainheight-30 + r + 18;
			})
			.text(function(d,i){
				if(d.count) return d.count;
			})
			.attr("font-size","12px");
		tree_g.selectAll(".node-polygon-mult").remove();
		tree_g.selectAll(".node-polygon-mult")
			.data(filtered_nodes.filter(function(n){
				if(n.depth == 3 && n.count > 0) return true;
				return false;
			}))
			.enter()
			.append("polygon")
			.attr("class","node-polygon-mult")
			.attr("points",function(d,i){
				var r = 2.5;
				var x0 = _nodes[id_nodes.indexOf(d.id)].x;
				var y0 = remainheight - 28.5;
				var updotx = x0;
				var updoty = y0 + r;
				var leftx = x0 - 3;
				var lefty = y0 + r + 4;
				var rightx = x0 + 3;
				var righty = y0 + r + 4;
				return ""+updotx+","+updoty+" "+leftx+","+lefty+" "+rightx+","+righty+"";
			})
			.attr("fill","#000000");*/
	}

	function draw_separate_tree(nodes, source){
		// console.log("nodes",nodes);


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
		var top_links = compare_g_first.selectAll(".link")
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
		var bottom_links = compare_g_second.selectAll(".link")
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
		var top_nodes = compare_g_first.selectAll(".node")
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
			top_nodes.attr("class",function(n){
				if(n._children) return "node node-inner";
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
			.transition().duration(750)
			.attr("cx",function(d){return d.x})
			.attr("cy",function(d){return d.y});
		top_nodes.on("click",node_click_focus)
		top_nodes.exit()
			.transition().duration(750)
			.attr("cx",function(d){return source.x0})
			.attr("cy",function(d){return source.y0}).remove();
		compare_g_first.selectAll(".node-text-top").remove();
		compare_g_first.selectAll(".node-text-top")
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
		compare_g_first.selectAll(".node-count1-top").remove();
		compare_g_first.selectAll(".node-count1-top")
			.data(nos[0])
			.enter()
			.append("text")
			.attr("class","node-count1-top")
			.attr("x",function(d,i){
				var strArray = d.key.split(" ");
				return d.x - 4 /*+ 7 * strArray[0].length/2*/;
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
				return d.y - r - 12;
			})
			.text(function(d,i){
				if(d.count1) return d.count1;
			})
			.attr("font-size","20px");
		compare_g_first.selectAll(".node-polygon-top").remove();
		compare_g_first.selectAll(".node-polygon-top")
			.data(nos[0].filter(function(d,i){
				return d.count1;
			}))
			.enter()
			.append("polygon")
			.attr("class","node-polygon-top")
			.attr("points",function(d,i){
				var r;
				if(d.depth == 4){
					r = 1;
				}
				else if(d.depth == 3){
					r = 2.5;
				}
				else r = (4.5 - d.depth) * 2;
				var updotx = d.x;
				var updoty = d.y - r;
				var leftx = d.x - 6;
				var lefty = d.y - r - 7;
				var rightx = d.x + 6;
				var righty = d.y - r - 7;
				return ""+updotx+","+updoty+" "+leftx+","+lefty+" "+rightx+","+righty+"";
			})
			.attr("fill","#000000");
		var bottom_nodes = compare_g_second.selectAll(".node")
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
					text += "<br>id:" + nodesB[i].id;
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
			.style("stroke","#FF7F0E")
			.transition().duration(750)
			.attr("cx",function(d){return d.x})
			.attr("cy",function(d){return tree_height - d.y})
		bottom_nodes.on("click",node_click_focus);
		bottom_nodes.exit().
			transition().duration(750)
			.attr("cx",function(d){return source.x0})
			.attr("cy",function(d){return tree_height-source.y0}).remove();
		
		compare_g_second.selectAll(".node-text-bottom").remove();
		compare_g_second.selectAll(".node-text-bottom")
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
		compare_g_second.selectAll(".node-count2-top").remove();
		compare_g_second.selectAll(".node-count2-top")
			.data(nos[1])
			.enter()
			.append("text")
			.attr("class","node-count2-top")
			.attr("x",function(d,i){
				var strArray = d.key.split(" ");
				return d.x - 4 /*+ 7 * strArray[0].length/2*/;
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
				return tree_height - d.y + r + 17;
			})
			.text(function(d,i){
				if(d.count2) return d.count2;
			})
			.attr("font-size","20px");
		compare_g_second.selectAll(".node-polygon-bottom").remove();
		compare_g_second.selectAll(".node-polygon-bottom")
			.data(nos[1].filter(function(d,i){
				return d.count2;
			}))
			.enter()
			.append("polygon")
			.attr("class","node-polygon-bottom")
			.attr("points",function(d,i){
				var r;
				if(d.depth == 4){
					r = 1;
				}
				else if(d.depth == 3){
					r = 2.5;
				}
				else r = (4.5 - d.depth) * 2;
				var updotx = d.x;
				var updoty = tree_height - d.y + r;
				var leftx = d.x - 6;
				var lefty = tree_height - d.y + r + 7;
				var rightx = d.x + 6;
				var righty = tree_height - d.y + r + 7;
				return ""+updotx+","+updoty+" "+leftx+","+lefty+" "+rightx+","+righty+"";
			})
			.attr("fill","#000000");
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
			var tmp = n.hasObj1 || n.hasObj2;
			return !n.children && n.depth == cur_depth && tmp;
		});
		var max = d3.max(leaves, function(leaf){
			var sum = +0;
			var f1 = 0,f2 = 0;
			if(leaf.flow1 == 0) f1 = 0;
			else f1 = Math.log(leaf.flow1);
			if(leaf.flow2 == 0) f2 = 0;
			else f2 = Math.log(leaf.flow2);
			sum += f1 + f2;
			return sum;
		});
		scale.domain([0,max*1.1]);
		var xscale = d3.scale.identity()
			.domain([0,svg_size.width - leftPadding]);
		brush_compare.x(xscale)
			.on("brushend",brushedcompare);
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
				if(leaf.flow1 < 1) return 0;
				return scale(Math.log(leaf.flow1));
			})
			.on("mouseover",function(d,i){
				ObserverManager.post("show-detail-info", { dataset:"A", node: d });
			});
		bars.select("rect.bottom_bar").attr("width",2)
			.attr("height",function(leaf){
				if(leaf.flow2 < 1) return 0;
				return scale(Math.log(leaf.flow2));
			}).attr("transform",function(leaf){
				if(leaf.flow2 < 1) return "translate(0)";
				var t = trend_height - scale(Math.log(leaf.flow2));
				return "translate(0,"+t+")";
			})
			.on("mouseover",function(d,i){
				ObserverManager.post("show-detail-info", { dataset:"B", node: d });
			});
		bars.transition().duration(750).attr("transform", function(leaf){
			return "translate(" + leaf.x + ")";
		});
		bars.exit().remove();
/*		g_trend.append("g")
			.attr("class","x brush")
			.call(brush_compare)
			.selectAll("rect")
			.attr("y",0)
			.attr("height",trend_height);*/
	}
	function brushedcompare(){

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
		nodes = tree.nodes(total_root);
		draw_separate_tree(nodes,total_root);
		draw_trend(nodes,total_root);
		for(var i = 2; i < mult_tree_smaller.length; i++){
			draw_tree_lastTwoLevel(mult_tree_smaller[i].nodes, mult_tree_smaller[i].g, nodes);
		}
		brush_nodes_list = {};
		tree.separation(function(a, b) { 
			var dis = (a.parent == b.parent ? 1 : 2) / (a.depth * 2);
			if(a.depth <=2 && b.depth <= 2)
				dis = 3.3 / 2;
			if(a.depth==3 && b.depth==3)
				dis = 1 / 2;
			if(tree_main_nodes[a.id] == true || tree_main_nodes[b.id] == true)
				dis *= 2;
	        return dis;
		 });
	}
	function node_click_focus(node){
		if(dataCenter.global_variable.click_thisNode_shrink == false)
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
		build_id_nodes(_nodes);	
		draw_separate_tree(_nodes, node);
		draw_trend(_nodes, node);
		for(var i = 2; i < mult_tree_smaller.length; i++){
			draw_tree_lastTwoLevel(mult_tree_smaller[i].nodes,mult_tree_smaller[i].g,_nodes,node);
		}
	}
	function node_focus(node){
		if(node == root) {
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
		var _nodes = tree.nodes(root);
		build_id_nodes(_nodes);		
		draw_separate_tree(_nodes, node);
		draw_trend(_nodes, node);
		for(var i = 2; i < mult_tree_smaller.length; i++){
			draw_tree_lastTwoLevel(mult_tree_smaller[i].nodes,mult_tree_smaller[i].g,_nodes,node);
		}
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
/*	function showSimilarPart(){
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
	}*/
	function completelyShowSimilarPart(){
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
					node.parent.children = [];
					var AnumOfNodes = 0;
					var BnumOfNodes = 0;
					for(var j = 0; j < node.parent._children.length; j++){
						var tmp = node.parent._children[j];
						if(tmp.hasObj2) BnumOfNodes++;
						if(tmp.hasObj1) AnumOfNodes++;
						if(markifexpand.indexOf(tmp) != -1)
							node.parent.children.push(tmp);
					}
					var count1 = AnumOfNodes - node.parent.children.length;
					var count2 = BnumOfNodes - node.parent.children.length;
					if(count1 != 0){
						node.parent.count1 = count1;
					}
					if(count2 != 0){
						node.parent.count2 = count2;
					}
					node.parent.originalChildren = node.parent._children;
					delete node.parent._children;
				}
				else break;
				node = node.parent;
			}
		}
		var _nodes = tree.nodes(root);
		build_id_nodes(_nodes);
		draw_separate_tree(_nodes, root);
		draw_trend(_nodes, root);	
		for(var i = 2; i < mult_tree_smaller.length; i++){
			draw_tree_lastTwoLevel(mult_tree_smaller[i].nodes,mult_tree_smaller[i].g,_nodes);
		}
		for(var i = 0; i < _nodes.length; i++){
			if(_nodes[i].originalChildren){
				_nodes[i].children = _nodes[i].originalChildren;
				delete _nodes[i].originalChildren;
				if(_nodes[i].count1) delete _nodes[i].count1;
				if(_nodes[i].count2) delete _nodes[i].count2;
			}
		}
	}
	function change_tree_main_nodes(){
		tree_main_nodes = {};
		for(var i = 0; i < mult_tree_smaller[0].nodes.length; i++){
			var tmp = mult_tree_smaller[0].nodes[i];
			tree_main_nodes[tmp.id] = true;
		}
		for(var i = 0; i < mult_tree_smaller[1].nodes.length; i++){
			var tmp = mult_tree_smaller[1].nodes[i];
			if(tree_main_nodes[tmp.id] == undefined || tree_main_nodes[tmp.id] == false)
				tree_main_nodes[tmp.id] = true;
		}
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
	$("#showSimilar").on("click",function(){
		completelyShowSimilarPart();
	});
	function delete_index_fromroot(root,index){
		if(root.children == undefined) return;
		var deletemark = [];
		for(var i = 0; i < root.children.length; i++){
			var tmp = root.children[i];
			var tmpindex = tmp.has.indexOf(index);
			if(tmpindex == -1)
				continue;
			else{
				if(tmp.has.length == 1){
					deletemark.push(i);
					continue;
				}
				else{
					tmp.has.splice(tmpindex,1);
					delete_index_fromroot(tmp,index);
				}
			}
		}
		for(var i = deletemark.length - 1; i >= 0; i--){
			root.children.splice(i,1);
		}
	}
	function delete_tree(node){
		var index;
		var d;
		for(var i = 0; i < mult_tree_smaller.length; i++){
			if(mult_tree_smaller[i].node == node) {
				d = i;
				index = mult_tree_smaller[i].index;
				break;
			}
		}
		total_root.has.splice(total_root.has.indexOf(index),1);
		delete_index_fromroot(total_root,index);
		if(d < 2){
			mult_tree_smaller[d].nodes = mult_tree_smaller[2].nodes;
			mult_tree_smaller[d].node = mult_tree_smaller[2].node;
			mult_tree_smaller[d].index = mult_tree_smaller[2].index;
			if(d == 0) Aindex = mult_tree_smaller[d].index;
			else if(d == 1) Bindex = mult_tree_smaller[d].index;
			d = 2;
			change_tree_main_nodes();
		}
		d3.select("#" + mult_tree_smaller[d].divid).remove();
		mult_tree_smaller.splice(d,1);
		if(mult_tree_smaller.length <= 6) oneline_only_mark = false;
		if(mult_tree_smaller.length < 6){
			var svgheightA = $("#treemapA svg").attr("height");
			var svgheighthis = $("#treehis svg").attr("height");
			var svgheightB = $("#treemapB svg").attr("height");
			d3.select("#treemapA svg").attr("height",svgheightA/6*7);
			d3.select("#treehis svg").attr("height",svgheighthis/6*7);
			d3.select("#treemapB svg").attr("height",svgheightB/6*7);
			svgheightA = $("#treemapA svg").attr("height");
			svgheighthis = $("#treehis svg").attr("height");
			svgheightB = $("#treemapB svg").attr("height");
			remainheight = (height - svgheightA - svgheighthis - svgheightB) / (mult_tree_smaller.length - 2);
			for(var i = 2; i < mult_tree_smaller.length; i++){
				d3.select("#treemap" + (mult_tree_smaller[i].index-2) + " svg").attr("height",remainheight);
			}
		}
		changeViewForSvg($("#treemapA svg").attr("height")-20,$("#treehis svg").attr("height"));
		for(var i = 2; i < mult_tree_smaller.length; i++){
			var tmp = mult_tree_smaller[i];
			draw_tree_lastTwoLevel(tmp.nodes,tmp.g,nodes);
		}
	}
	function exchangeAB_draw_all(index1,index2){
		if(Aindex == index1) Aindex = index2;
		else if(Bindex == index1) Bindex = index2;
		var index1mark,index2mark;
		for(var i = 0; i < mult_tree_smaller.length; i++){
			var tmp = mult_tree_smaller[i];
			if(tmp.index == index1) {
				index1mark = tmp;
				continue;
			}
			if(tmp.index == index2) {
				index2mark = tmp;
				continue;
			}
		}
		var tmpnodes1 = index1mark.nodes,
			tmpnode1 = index1mark.node,
			tmpindex1 = index1mark.index;
		index1mark.nodes = index2mark.nodes;
		index1mark.node = index2mark.node;
		index1mark.index = index2mark.index;
		index2mark.nodes = tmpnodes1;
		index2mark.node = tmpnode1;
		index2mark.index = tmpindex1;
		change_tree_main_nodes();
		nodes = tree.nodes(total_root);
		change_comparison_A_B(nodes);
		for(var i = 2; i < mult_tree_smaller.length; i++){
			var tmp = mult_tree_smaller[i];
			draw_tree_lastTwoLevel(tmp.nodes,tmp.g,nodes);
		}
	}
	function change_comparison_A_B(_nodes){
		for(var i = 0; i < mult_tree_smaller.length; i++){
			if(mult_tree_smaller[i].index == Aindex){
				nodesA = mult_tree_smaller[i].nodes;
			}
			if(mult_tree_smaller[i].index == Bindex){
				nodesB = mult_tree_smaller[i].nodes;
			}
		}		
		var Aidlist = [],Bidlist = [];
		for(var i = 0; i < nodesA.length; i++){
			Aidlist.push(nodesA[i].id);
		}
		for(var i = 0; i < nodesB.length; i++){
			Bidlist.push(nodesB[i].id);
		}
		for(var i = 0; i < _nodes.length; i++){
			var tmp = _nodes[i];
			if(tmp.has.indexOf(Aindex) == -1){
				if(tmp.hasObj1) delete tmp.hasObj1;
				tmp.flow1 = 0;
			}
			else{
				tmp.hasObj1 = true;
				tmp.flow1 = nodesA[Aidlist.indexOf(tmp.id)].flow;
			}
			if(tmp.has.indexOf(Bindex) == -1){
				if(tmp.hasObj2) delete tmp.hasObj2;
				tmp.flow2 = 0;
			}
			else{
				tmp.hasObj2 = true;
				tmp.flow2 = nodesB[Bidlist.indexOf(tmp.id)].flow;
			}
		}
		total_root.x0 = total_root.x;
		total_root.y0 = total_root.y;
		_nodes[0].hasObj1 = true;
		_nodes[0].hasObj2 = true;
		draw_separate_tree(_nodes,total_root);
		draw_trend(_nodes,total_root);
	}
	////////////////////////////////////////////////////////////////////////////////////////////////
	var newnode = [];
	newnode.push(dt_root);
	newnode.push(dt_root2);
	addMultiTree(newnode);
//	delete_tree(dt_root2);
	function addMultiTree(nodes){
		for(var i = 0; i < nodes.length; i++){
			if(mult_tree_smaller.length > 11) break;
			var node = nodes[i];
			var g = addclick();
			var tree_g = g.append("g")
				.attr("transform","translate(30,0)");
			var nodes1 = tree.nodes(node);
			mult_tree_smaller.push({nodes:nodes1, node:node, g:tree_g, index:numoftreecompare+2, divid:"treemap"+numoftreecompare});
			if(mult_tree_smaller.length > 6) oneline_only_mark = true;	
			total_root.has.push(numoftreecompare + 2);
			merge_trees(total_root,node,numoftreecompare + 2);
		}
		var _nodes = tree.nodes(total_root);
		build_id_values(_nodes);
		for(var i = 2; i < mult_tree_smaller.length; i++){
			var tmp = mult_tree_smaller[i];
			draw_tree_lastTwoLevel(tmp.nodes,tmp.g,_nodes);
		}
		changeViewForSvg($("#treemapA svg").attr("height")-20,$("#treehis svg").attr("height"));
	}
	var remainheight;
	var svgheightA,svgheighthis,svgheightB;
	function addclick(){
		var svg,svg_g;
		if(mult_tree_smaller.length < 6) {
			numoftreecompare++;
			svgheightA = $("#treemapA svg").attr("height");
			svgheighthis = $("#treehis svg").attr("height");
			svgheightB = $("#treemapB svg").attr("height");
			d3.select("#treemapA svg").attr("height",svgheightA/7*6);
			d3.select("#treehis svg").attr("height",svgheighthis/7*6);
			d3.select("#treemapB svg").attr("height",svgheightB/7*6);
			svgheightA = $("#treemapA svg").attr("height");
			svgheighthis = $("#treehis svg").attr("height");
			svgheightB = $("#treemapB svg").attr("height");
			remainheight = (height - svgheightA - svgheighthis - svgheightB) / (mult_tree_smaller.length - 1);
			var new_svg_size = { width:_width, height:remainheight,
				left:20, right:10, top:0, bottom:0 };
			for(var i = 2; i < mult_tree_smaller.length; i++){
				d3.select("#treemap" + (mult_tree_smaller[i].index-2) + " svg").attr("height",remainheight);
			}
			d3.select("#multitree").append("div").attr("id",function(){
				return "treemap" + numoftreecompare;
			})
			svg = d3.select("#treemap" + numoftreecompare).append("svg");
			svg_g = initFrame(svg,new_svg_size,false);
		}
		else {
			numoftreecompare++;
			d3.select("#multitree").append("div").attr("id",function(){
				return "treemap" + numoftreecompare;
			});
			remainheight = (height - svgheightA - svgheighthis - svgheightB) / (mult_tree_smaller.length);
			var new_svg_size = { width:_width, height:remainheight,
				left:20, right:10, top:0, bottom:0 };
			svg = d3.select("#treemap" + numoftreecompare).append("svg");
			svg_g = initFrame(svg,new_svg_size,false);
			for(var i = 2; i < mult_tree_smaller.length; i++){
				d3.select("#treemap" + (mult_tree_smaller[i].index-2) + " svg").attr("height",remainheight);
			}
		}
		var tmpg = svg.append("g").attr("transform","translate(0,0)");
		tmpg.append("rect")
			.attr("class","multi-tree-rect")
			.attr("width", svg.attr("width"))
			.attr("height", svg.attr("height"))
			.attr("fill","none")
			.attr("stroke","gray")
			.attr("stroke-width","2px")
			.attr("opacity",0.5);
		tmpg.append("button").attr("type","button").attr("id","button"+numoftreecompare+2)
			.text("delete");
		return svg_g;
/*		else {
			numoftreecompare++;
			d3.select("#multitree").append("div").attr("id",function(){
				return "treemap" + numoftreecompare;
			})
			var new_svg_size = { width:_width, height:remainheight,
				left:20, right:10, top:0, bottom:0 };
			var svg_g = initFrame(d3.select("#treemap" + numoftreecompare).append("svg"),new_svg_size,false);
			return svg_g;
		}*/
	}
	function changeViewForSvg(height,svgheighthis){
		tree = d3.layout.tree()
		.size([svg_size.width - leftPadding,height])
		.separation(function(a, b) { 
			var dis = (a.parent == b.parent ? 1 : 2) / (a.depth * 2);
			if(a.depth <=2 && b.depth <= 2)
				dis = 3.3 / 2;
			if(a.depth==3 && b.depth==3)
				dis = 1 / 2;
			if(tree_main_nodes[a.id] == true || tree_main_nodes[b.id] == true)
				dis *= 2;
	        return dis;
		 });
		$("#treemapArect").attr("height",$("#treemapA svg").attr("height"));
		$("#treemapBrect").attr("height",$("#treemapB svg").attr("height"));
		d3.selectAll(".multi-tree-rect").attr("height",remainheight);
		diagonal_ = d3.svg.diagonal().projection(function(d){
			return [d.x, height - d.y];
		});
		nodes = tree.nodes(total_root);
		root = total_root;
		tree_height = height;
		trend_height = svgheighthis;
		g_trend.select("rect").attr("width", svg_size.width - leftPadding)
			.attr("height", svgheighthis)
			.attr("class","trend");
		scale = d3.scale.linear().range([0,svgheighthis]);
		change_comparison_A_B(nodes);
	}

    TreeCompare.OMListen = function(message, data) {
		var idPrefix = "#compare-top-node-";
		var idBottom = "#compare-bottom-node-";
		var idmulti = "#compare-m-node-";
		if (message == "highlight") {
			compare_g_first.selectAll(".highlight").classed("highlight", false)
			compare_g_first.selectAll(".half-highlight").classed("half-highlight", false)
			for (var i = 0; i < data.length; i++) {
				compare_g_first.select(idPrefix + data[i]).classed("highlight", true);
				compare_g_first.select(idPrefix + data[i]).each(function(d) {
					if (d == null) return;
					var node = d.parent;
					while (node != null) {
						compare_g_first.select(idPrefix + node.id).classed("half-highlight", true);
						node = node.parent;
					}
				})				
			}
		}
        if(message == "mouse-over"){
        	for (var i = 0; i < data.length; i++) {
				compare_g_first.select(idPrefix + data[i]).classed("focus-highlight", true);
				compare_g_second.select(idBottom + data[i]).classed("focus-highlight", true);
				for(var j = 2; j < mult_tree_smaller.length; j++){
					var tmp = mult_tree_smaller[j].g;
					tmp.select(idmulti + data[i]).classed("focus-highlight",true);
				}
			}
        }
        if(message == "mouse-out"){
        	for (var i = 0; i < data.length; i++) {
				compare_g_first.select(idPrefix + data[i]).classed("focus-highlight", false);
				compare_g_second.select(idBottom + data[i]).classed("focus-highlight", false);
				for(var j = 2; j < mult_tree_smaller.length; j++){
					var tmp = mult_tree_smaller[j].g;
					tmp.select(idmulti + data[i]).classed("focus-highlight",false);
				}
			}
        }
    }

    return TreeCompare;

}