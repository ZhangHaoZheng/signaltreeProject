var compareAddSvgMark = false;
var compare_g_first;
var compare_g_second;

var treeCompare = function(){
	var TreeCompare = {};
//	console.log("addListener compare");
//	ObserverManager.addListener(TreeCompare);
	ObserverManager.changeListener(TreeCompare,3);
	var datasets = dataCenter.datasets;
	var pre_datasets = datasets;
	var pre_datasets_id = [];
	for(var i = 0; i < datasets.length; i++){
		pre_datasets_id.push(datasets[i].id);
	}
	// var combine1 = sigtree.combinator().by_index(true);
	// var combine2 = sigtree.combinator().compare(function(d1,d2){return d1.key.localeCompare(d2.key)});
	// var merge_tree = sigtree.merge_tree(combine2);

	var duration = 1750;
	var ratio = 1.5;
	var buttonWidth = 5;

	var _width = $("#treemapA").width() - buttonWidth;
	var height = $("#rightComparisonWrapper").height();

	//$("#multitree").width(_width);
	//$("#multitree").height(height);
	var tree_height = $('#treemapA').height() - 25;
	var trend_height = $("#treehis").height();

	var svg_size = { width:_width, height:tree_height,
		left:0, right:10, top:20, bottom:5 };
	var svghis_size = { width:_width, height:trend_height,
		left:0, right:10, top:0, bottom:0 };
	var svg2_size = {width:_width, height:tree_height,
		left:0, right:10, top:5, bottom:25 };
/*	var svgg_size = {width:_width, height:50,
		left:20, right:10, top:0, bottom:0 };*/
	var levelTop = new Array();
	var levelBottom = new Array();
	var levelTopY = new Array();
	var levelBottomY = new Array();
	var leftPadding = 25;
	//compareAddSvgMark 控制该段仅执行一次 
	if(justChangeDataA == false || compareAddSvgMark == false) {
		var svg = d3.select("#treemapA").append("svg");
		compare_g_first = initFrame(svg,svg_size,false)
			.append("g")
			.attr("transform", "translate(30,0)")
			.attr("id","g_top");
		var mapAdiv = d3.select("#treemapA").append("div").attr("id","treemap-divA")
			.style("position","absolute")
			.style("right",0)
			.style("top",0)
			.style("visibility","hidden");
		mapAdiv.append("span").attr("id","treemapAdiv")
			.attr("class","btn btn-default btn-xs active level-btn toolbar-tree")
			.html("<span class=\"glyphicon glyphicon-remove\"></span>")
			.attr("value",0)
			.on("click",delete_button_click);
		mapAdiv.append("span").attr("id","treemapAdown")
			.attr("class","btn btn-default btn-xs active level-btn toolbar-tree")
			.html("<span class=\"glyphicon glyphicon-chevron-down\"></span>")
			.attr("value",0)
			.on("click",function(){
				var index1 = mult_tree_smaller[0].index;
				var index2 = mult_tree_smaller[1].index;
				up_down_tree(index1,index2);
			})
		$("div#treemapA").hover(
			function(e){
				d3.select("#treemap-divA").style("visibility","visible");
			},
			function(e){
				d3.select("#treemap-divA").style("visibility","hidden");
		});
	}
	var tmptop;
	if(justChangeDataA == true || compareAddSvgMark == false) {
		var svg = d3.select("#treemapB").append("svg");
		compare_g_second = initFrame(svg,svg2_size,false)
			.append("g")
			.attr("transform", "translate(30,0)")
			.attr("id","g_bottom");
		var svg_g = svg.append("g")
			.attr("transform","translate(0,0)")
	}
	var svg_his = initFrame(d3.select("#treehis").append("svg"),svghis_size,false);
	var g_trend = svg_his.append("g")
			.attr("transform", "translate(30,0)")
			.attr("id","g_middle");
	compareAddSvgMark = true;	
	var brush_compare = d3.svg.brush();
	var brush_nodes_list = {};
	var tree_main_nodes = {};
	var tree_alpabet_index = ["a","b","c","d","e","f","g","h","i","j","k","l","m"];
	tmptop = parseFloat($("#treemapA").height())+parseFloat($("#treehis svg").height());
	var mapBdiv = d3.select("#treemapB").append("div").attr("id","treemap-divB")
		.style("position","absolute")
		.style("right",0)
		.style("top",tmptop + "px")
		.style("visibility","hidden");
	mapBdiv.append("span").attr("id","treemapBdiv")
		.attr("class","btn btn-default btn-xs active level-btn toolbar-tree")
		.html("<span class=\"glyphicon glyphicon-remove\"></span>")
		.attr("value",1)
		.on("click",delete_button_click);
	mapBdiv.append("span").attr("id","treemapBup")
		.attr("class","btn btn-default btn-xs active level-btn toolbar-tree")
		.html("<span class=\"glyphicon glyphicon-chevron-up\"></span>")
		.attr("value",1)
		.on("click",function(){
			var index1 = mult_tree_smaller[0].index;
			var index2 = mult_tree_smaller[1].index;
			up_down_tree(index1,index2);
		});
	mapBdiv.append("span").attr("id","treemapBdown")
		.attr("class","btn btn-default btn-xs active level-btn toolbar-tree")
		.html("<span class=\"glyphicon glyphicon-chevron-down\"></span>")
		.attr("value",1)
		.on("click",function(){
			var value = parseInt(d3.select(this).attr("value"));
			if(value == mult_tree_smaller.length - 1) return;
			up_down_tree(mult_tree_smaller[value].index,mult_tree_smaller[value+1].index);
		});
	$("#treemapB").hover(		
			function(e){
				if(prehover != -1) {
					d3.select("#treemap-div"+prehover).style("visibility","hidden");
				}
				d3.select("#treemap-divB").style("visibility","visible");
			},
			function(e){
				d3.select("#treemap-divB").style("visibility","hidden");
		});
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
		.size([svg_size.width - leftPadding - buttonWidth - 20,tree_height])
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
	var deletefrom = false;
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
	//mult_tree_smaller对应从上往下树的信息，nodes为tree.nodes(),node为根节点,g为包裹树的g,tree_id如"20120121-R07-75",index标记放在每个叶节点的has数组中标记当前节点有哪些树共用
	var mult_tree_smaller = [];
	mult_tree_smaller.push({nodes:nodesA, node:dt_root, g:compare_g_first, tree_id:datasets[0].id, index:1, divid:"treemapA",buttondiv:"treemap-divA",alpabet_index:0,alpabet_div:"treemap_alpabet_divA"},
		{nodes:nodesB, node:dt_root2, g:compare_g_second, tree_id:datasets[1].id, index:2, divid:"treemapB",buttondiv:"treemap-divB",alpabet_index:1,alpabet_div:"treemap_alpabet_divB"});
	d3.select("#treemapA").append("div").attr("id","treemap_alpabet_divA")
		.style("position","absolute")
		.style("left",0)
		.style("top",0)
	 	.html("<span class=\"btn btn-default btn-xs active level-btn toolbar-tree\">a</span>");
	d3.select("#treemapB").append("div").attr("id","treemap_alpabet_divB")
		.style("position","absolute")
		.style("left",0)
		.style("top",tmptop+"px")
	 	.html("<span class=\"btn btn-default btn-xs active level-btn toolbar-tree\">b</span>");
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
	var total_root = sigtree.dataProcessor().mergeTwoListAsTree(dts, dts2);
	total_root.x0 = svg_size.width/2;
	total_root.y0 = 0;
	nodes = tree.nodes(total_root);
	var tmp_total_nodes = tree.nodes(total_root);
	distinguishTree(nodes);
	distinguishTree(tmp_total_nodes);
//	accumulateFlow(root);
	var id_nodes;
	var Aindex = 1;
	var Bindex = 2;
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
			if(hasObj1) node.has[1] = true;
			if(hasObj2) node.has[2] = true;
			while (node.parent != null) {
				node = node.parent;
				node.hasObj1 = node.hasObj1 || hasObj1;
				node.hasObj2 = node.hasObj2 || hasObj2;
				node.has = {};
				if(node.hasObj1) node.has[1] = true;
				if(node.hasObj2) node.has[2] = true;
			}
		}
	}
	//计算流量
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
	/*g_trend.append("rect").attr("width", svg_size.width - leftPadding)
		.attr("height", trend_height)
		.attr("class","trend");*/


	var cur_depth = 4;
	var scale = d3.scale.linear().range([0,trend_height]);		
	change_comparison_A_B(nodes);
	build_id_values(nodes);
	var xscale = d3.scale.identity()
		.domain([0,svg_size.width - leftPadding]);
	brush_compare.x(xscale)
		.on("brushend",brushedcompare);
	g_trend.append("g")
		.attr("stroke","#fff")
		.attr("fill-opacity",0.125)
		.call(brush_compare)
		.selectAll("rect")
		.attr("y",0)
		.attr("height",trend_height);
	//draw_depth(cur_depth);

	$("#default").attr("checked",true);
	$("#tree-compare-depth-controller").on("click", ".level-btn", function(){
		var dep = $(this).attr("level");
		$("#tree-compare-depth-controller .level-btn").removeClass("active");		
		for (var i = 0; i <= dep; i++)
			$("#tree-compare-depth-controller .level-btn[level=" + i + "]").addClass("active");		
		draw_depth(dep);
	});
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
			}
		}
		else {
			if(node.children){
				node._children = node.children;
				delete node.children;
			}
		}
	}
	function draw_depth(depth){
		// console.log("depth", depth, nodes.length)
		cur_depth = depth;
		expand_depth(total_root,depth);
		nodes = tree.nodes(total_root);
		// console.log("nodes********************",nodes);
		// console.log("_nodes********************",_nodes);
		//var _links = tree.links(_nodes);
		//drawTree(_nodes, _links, svg_);
		//var sep_trees = separate(root);
		draw_separate_tree(nodes, total_root);
		draw_trend(nodes, total_root);
		build_id_nodes(nodes);
		for(var i = 2; i < mult_tree_smaller.length; i++){
			draw_tree_lastTwoLevel(mult_tree_smaller[i].nodes,mult_tree_smaller[i].g,nodes,null);
		}
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
	//画其他树的最下面两层
	function draw_tree_lastTwoLevel(nodes, tree_g, _nodes, sorce){
		var link = tree.links(nodes).filter(function(l){
			if(oneline_only_mark == true) return false;
			if(l.target.depth == 4 && l.source.depth == 3){
				var target = id_nodes[l.target.id],
					source = id_nodes[l.source.id];
				if(target == undefined || source == undefined) return false;
/*				var m1 = (_nodes[target].has[Aindex] != undefined) ||  (_nodes[target].has[Bindex] != undefined));
				var m2 = (_nodes[source].has[Aindex] != undefined) ||  (_nodes[source].has[Bindex] != undefined));
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
				if(sorce) o = {x:sorce.x, y:remainheight - 7};
				else o = {x:(svg_size.width - leftPadding)/2,y:remainheight - 7};
				return diagonal({source:o, target:o});
			});
		links.transition().duration(750)
			.attr("d",function(d){
				var sourceX = _nodes[id_nodes[d.source.id]].x;
				var targetX = _nodes[id_nodes[d.target.id]].x;
				var s = {x:sourceX, y:remainheight-5};
				var t = {x:targetX, y:0};
				return diagonal({source:s,target:t});
			});
		links.exit()
			.transition().duration(750)
			.attr("d",function(){
				var o;
				if(sorce) o = {x:sorce.x, y:remainheight - 7};
				else o = {x:(svg_size.width - leftPadding)/2,y:remainheight - 7};
				return diagonal({source:o, target:o});
			})
			.remove();
		nodes.filter(function(n){
			if(n.depth == 3) n.count = 0;
		});
		var filtered_nodes = nodes.filter(function(n){
			if(n.depth < 3) return false;
			if(id_nodes[n.id] == undefined) return false;
			if(n.depth == 4 && oneline_only_mark == true) return false;
/*			var tmp = _nodes[id_nodes[n.id]].has;
			if(n.depth == 4 && tmp[Aindex] == undefined && tmp[Bindex] == undefined){
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
				var tmp = id_nodes[d.id];
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
				var x = _nodes[id_nodes[d.id]].x;
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
				return _nodes[id_nodes[d.id]].x - 3;
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
				var x0 = _nodes[id_nodes[d.id]].x;
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
	//画A,B树
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
		.attr("y",function(d){ return d.y - 10;})
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
			.attr("y",function(d){ return tree_height - d.y + 18;})
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
	// 流量图
	
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
			});
		bars.select("rect.bottom_bar").attr("width",2)
			.attr("height",function(leaf){
				if(leaf.flow2 < 1) return 0;
				return scale(Math.log(leaf.flow2));
			}).attr("transform",function(leaf){
				if(leaf.flow2 < 1) return "translate(0)";
				var t = trend_height - scale(Math.log(leaf.flow2));
				return "translate(0,"+t+")";
			});
		bars.transition().duration(750).attr("transform", function(leaf){
			return "translate(" + leaf.x + ")";
		});
		bars.exit().remove();
	}
	//流量图的brush操作
	function brushedcompare(){
		var extentX = +d3.select(".extent").attr("x");
		var extentWidth = +d3.select(".extent").attr("width");
		var nodel = nodes.filter(function(n){
			var m1 = (n.hasObj1 == undefined || n.hasObj1 == false);
			var m2 = (n.hasObj2 == undefined || n.hasObj2 == false);
			if(m1 && m2) return false;
			if(n.depth != cur_depth) return false;
			if(n.x < extentX || n.x > extentX + extentWidth) return false;
			return true;
		});
		if(nodel.length < 1) {
			brush_compare.clear();
			nodes = tree.nodes(total_root);
			change_comparison_A_B(nodes);
			for(var i = 2; i < mult_tree_smaller.length; i++){
				draw_tree_lastTwoLevel(mult_tree_smaller[i].nodes, mult_tree_smaller[i].g, nodes,null);
			}
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
		nodes = tree.nodes(total_root);
		change_comparison_A_B(nodes);
		for(var i = 2; i < mult_tree_smaller.length; i++){
			draw_tree_lastTwoLevel(mult_tree_smaller[i].nodes, mult_tree_smaller[i].g, nodes,null);
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
	//点击展开模式和收缩模式
	function node_click_focus(node){
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
		draw_separate_tree(nodes, node);
		draw_trend(nodes, node);
		for(var i = 2; i < mult_tree_smaller.length; i++){
			draw_tree_lastTwoLevel(mult_tree_smaller[i].nodes,mult_tree_smaller[i].g,nodes,node,null);
		}
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
		draw_separate_tree(nodes, node);
		draw_trend(nodes, node);
		for(var i = 2; i < mult_tree_smaller.length; i++){
			draw_tree_lastTwoLevel(mult_tree_smaller[i].nodes,mult_tree_smaller[i].g,nodes,node);
		}
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
	//显示相似部分
	function completelyShowSimilarPart(){
		var markifexpand = [];	
		var similar_nodes_id = [];
		for(var i = 0; i < nodes.length; i++){
			if(nodes[i].children){
				nodes[i]._children = nodes[i].children;
				delete nodes[i].children;
			}
			if(nodes[i].hasObj2 && nodes[i].hasObj1){
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
		nodes = tree.nodes(total_root);
		build_id_nodes(nodes);
		draw_separate_tree(nodes, total_root);
		draw_trend(nodes, total_root);	
		for(var i = 2; i < mult_tree_smaller.length; i++){
			draw_tree_lastTwoLevel(mult_tree_smaller[i].nodes,mult_tree_smaller[i].g,nodes,null);
		}
		for(var i = 0; i < nodes.length; i++){
			if(nodes[i].originalChildren){
				nodes[i].children = nodes[i].originalChildren;
				delete nodes[i].originalChildren;
				if(nodes[i].count1) delete nodes[i].count1;
				if(nodes[i].count2) delete nodes[i].count2;
			}
		}
	}
	//在tree_main_nodes中记录AB树的所有节点的id
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
		for(var i = 0; i < mult_tree_smaller.length; i++){
			if(mult_tree_smaller[i].alpabet_index > alpabet_index)
				mult_tree_smaller[i].alpabet_index--;
		}
		delete total_root.has[index];
		delete_index_fromroot(total_root,index);
		if(d < 2){
			mult_tree_smaller[d].nodes = mult_tree_smaller[2].nodes;
			mult_tree_smaller[d].node = mult_tree_smaller[2].node;
			mult_tree_smaller[d].index = mult_tree_smaller[2].index;
			mult_tree_smaller[d].tree_id = mult_tree_smaller[2].tree_id;
			mult_tree_smaller[d].alpabet_index = mult_tree_smaller[2].alpabet_index;
			if(d == 0) Aindex = mult_tree_smaller[d].index;
			else if(d == 1) Bindex = mult_tree_smaller[d].index;
			d = 2;
			change_tree_main_nodes();
		}
		if(deletefrom){
			for(var i = d; i < mult_tree_smaller.length; i++){
				d3.select("#" + mult_tree_smaller[i].buttondiv).selectAll("span").attr("value",i - 1);
			}
		}
		d3.select("#" + mult_tree_smaller[d].divid).remove();
		mult_tree_smaller.splice(d,1);
		if(mult_tree_smaller.length <= 6) oneline_only_mark = false;
		if(mult_tree_smaller.length < 6){
			$('#treemapA').height(svgheightA/6*7);
			$('#treehis').height(svgheighthis/6*7);
			$('#treemapB').height(svgheightB/6*7);
			d3.select("#treemapA svg").attr("height",svgheightA/6*7);
			d3.select("#treehis svg").attr("height",svgheighthis/6*7);
			d3.select("#treemapB svg").attr("height",svgheightB/6*7);
			svgheightA = $("#treemapA svg").height();
			svgheighthis = $("#treehis svg").height();
			svgheightB = $("#treemapB svg").height();
			remainheight = (height - svgheightA - svgheighthis - svgheightB) / (mult_tree_smaller.length - 2);
			for(var i = 2; i < mult_tree_smaller.length; i++){
				d3.select("#treemap" + (mult_tree_smaller[i].index-2) + " svg").attr("height",remainheight);
				$("#treemap"+(mult_tree_smaller[i].index-2)).height(remainheight);
			}
		}
		else{
			remainheight = (height - svgheightA - svgheighthis - svgheightB) / (mult_tree_smaller.length - 2);
			for(var i = 2; i < mult_tree_smaller.length; i++){
				d3.select("#treemap" + (mult_tree_smaller[i].index-2) + " svg").attr("height",remainheight);
				$("#treemap"+(mult_tree_smaller[i].index-2)).height(remainheight);
			}
		}
		changeViewForSvg($("#treemapA svg").attr("height")-20,$("#treehis svg").attr("height"));
		build_id_nodes(nodes);
		for(var i = 2; i < mult_tree_smaller.length; i++){
			var tmp = mult_tree_smaller[i];
			draw_tree_lastTwoLevel(tmp.nodes,tmp.g,nodes,null);
		}
		modify_buttondiv_top();
	}
	//对换树的位置
	function up_down_tree(index1,index2){
		if(index1 == Aindex && index2 == Bindex){
			just_exchange_AB();
			just_modify_alpabet_label();
			return;
		}
		if(index1 == Aindex || index1 == Bindex){
			exchangeAB_draw_all(index1,index2);
			just_modify_alpabet_label();
			return;
		}
		var tree1,tree2;
		for(var i = 2; i < mult_tree_smaller.length; i++){
			var tmp = mult_tree_smaller[i];
			if(tmp.index == index1) {
				tree1 = tmp;
			}
			else if(tmp.index == index2) {
				tree2 = tmp;
			}
		}
		var tmpnodes1 = tree1.nodes,
			tmpnode1 = tree1.node,
			tmpindex1 = tree1.index,
			tmptree_id = tree1.tree_id;
			tmpalpabet = tree1.alpabet_index;
		tree1.nodes = tree2.nodes;
		tree1.node = tree2.node;
		tree1.index = tree2.index;
		tree1.tree_id = tree2.tree_id;
		tree1.alpabet_index = tree2.alpabet_index;
		tree2.nodes = tmpnodes1;
		tree2.node = tmpnode1;
		tree2.index = tmpindex1;
		tree2.tree_id = tmptree_id;
		tree2.alpabet_index = tmpalpabet;
		just_modify_alpabet_label();
		draw_tree_lastTwoLevel(tree1.nodes,tree1.g,nodes,null);
		draw_tree_lastTwoLevel(tree2.nodes,tree2.g,nodes,null);
	}
	//交换AB树的位置
	function just_exchange_AB(){
		var tmp = Aindex;
		Aindex = Bindex;
		Bindex = tmp;
		var A = mult_tree_smaller[0];
		var B = mult_tree_smaller[1];
		var tmpnodes1 = A.nodes,
			tmpnode1 = A.node,
			tmpindex1 = A.index,
			tmptree_id = A.tree_id;
			tmpalpabet = A.alpabet_index;
		A.nodes = B.nodes;
		A.node = B.node;
		A.index = B.index;
		A.tree_id = B.tree_id;
		A.alpabet_index = B.alpabet_index;
		B.nodes = tmpnodes1;
		B.node = tmpnode1;
		B.index = tmpindex1;
		B.tree_id = tmptree_id;
		B.alpabet_index = tmpalpabet;
		change_comparison_A_B(nodes);
	}
	//交换A树与除B以外树的位置，或B与除A。。
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
			tmpindex1 = index1mark.index,
			tmptree_id = index1mark.tree_id;
			tmpalpabet = index1mark.alpabet_index;
		index1mark.nodes = index2mark.nodes;
		index1mark.node = index2mark.node;
		index1mark.index = index2mark.index;
		index1mark.tree_id = index2mark.tree_id;
		index1mark.alpabet_index = index2mark.alpabet_index;
		index2mark.nodes = tmpnodes1;
		index2mark.node = tmpnode1;
		index2mark.index = tmpindex1;
		index2mark.tree_id = tmptree_id;
		index2mark.alpabet_index = tmpalpabet;
		change_tree_main_nodes();
		nodes = tree.nodes(total_root);
		change_comparison_A_B(nodes);
		for(var i = 2; i < mult_tree_smaller.length; i++){
			var tmp = mult_tree_smaller[i];
			draw_tree_lastTwoLevel(tmp.nodes,tmp.g,nodes,null);
		}
	}
	//在树的节点中补充信息以调用draw_separate_tree方法画AB树
	function change_comparison_A_B(_nodes){
		for(var i = 0; i < mult_tree_smaller.length; i++){
			if(mult_tree_smaller[i].index == Aindex){
				nodesA = mult_tree_smaller[i].nodes;
			}
			if(mult_tree_smaller[i].index == Bindex){
				nodesB = mult_tree_smaller[i].nodes;
			}
		}		
		var Aidlist = {},Bidlist = {};
		for(var i = 0; i < nodesA.length; i++){
			Aidlist[nodesA[i].id] = i;
		}
		for(var i = 0; i < nodesB.length; i++){
			Bidlist[nodesB[i].id] = i;
		}
		for(var i = 0; i < _nodes.length; i++){
			var tmp = _nodes[i];
			if(tmp.has[Aindex] == undefined){
				if(tmp.hasObj1) delete tmp.hasObj1;
				tmp.flow1 = 0;
			}
			else{
				tmp.hasObj1 = true;
				tmp.flow1 = nodesA[Aidlist[tmp.id]].flow;
			}
			if(tmp.has[Bindex] == undefined){
				if(tmp.hasObj2) delete tmp.hasObj2;
				tmp.flow2 = 0;
			}
			else{
				tmp.hasObj2 = true;
				tmp.flow2 = nodesB[Bidlist[tmp.id]].flow;
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
	//删除按钮操作
	function delete_button_click(){
		if(mult_tree_smaller.length == 2) return;
		var value = parseInt(d3.select(this).attr("value"));
		if(value == 0 || value == 1){
			for(var i = 3; i < mult_tree_smaller.length; i++){
				d3.select("#" + mult_tree_smaller[i].buttondiv).selectAll("span").attr("value",i - 1);
			}
		}
		else{
			for(var i = value + 1; i < mult_tree_smaller.length; i++){
				d3.select("#" + mult_tree_smaller[i].buttondiv).selectAll("span").attr("value",i - 1);
			}
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
			if(mult_tree_smaller.length > 11) break;
			var node = nodes[i];
			var g = addclick();  
			var tree_g = g.append("g")
				.attr("transform","translate(30,0)");
			var nodes1 = tree.nodes(node);
			mult_tree_smaller.push({
				nodes:nodes1, 
				node:node, 
				g:tree_g, 
				tree_id:idlist[i], 
				index:numoftreecompare+2, 
				divid:"treemap"+numoftreecompare,
				buttondiv:"treemap-div"+numoftreecompare,
				alpabet_index:mult_tree_smaller.length,
				alpabet_div:"treemap_alpabet_div" + numoftreecompare
			});
			modify_buttondiv_top();
			if(mult_tree_smaller.length > 6) oneline_only_mark = true;	
			total_root.has[numoftreecompare + 2] = true;
			merge_trees(total_root,node,numoftreecompare + 2);
		}
		nodes = tree.nodes(total_root);
		build_id_values(nodes);
		for(var i = 2; i < mult_tree_smaller.length; i++){
			var tmp = mult_tree_smaller[i];
			draw_tree_lastTwoLevel(tmp.nodes,tmp.g,nodes,null);
		}
		changeViewForSvg($("#treemapA svg").attr("height")-20,$("#treehis svg").attr("height"));
	}
	var remainheight;
	var svgheightA,svgheighthis,svgheightB;
	var prehover;
	//改变各div的高度，增加div，返回g
	function addclick(){
		var svg,svg_g;
		if(mult_tree_smaller.length < 6) {
			numoftreecompare++;
			svgheightA = $("#treemapA svg").attr("height");
			svgheighthis = $("#treehis svg").attr("height");
			svgheightB = $("#treemapB svg").attr("height");
			$('#treemapA').height(svgheightA/7*6);
			$('#treehis').height(svgheighthis/7*6);
			$('#treemapB').height(svgheightB/7*6);
			d3.select("#treemapA svg").attr("height",svgheightA/7*6);
			d3.select("#treehis svg").attr("height",svgheighthis/7*6);
			d3.select("#treemapB svg").attr("height",svgheightB/7*6);
			svgheightA = $("#treemapA").height();
			svgheighthis = $("#treehis").height();
			svgheightB = $("#treemapB").height();
			remainheight = (height - svgheightA - svgheighthis - svgheightB) / (mult_tree_smaller.length - 1);
			var new_svg_size = { width:_width - buttonWidth , height:remainheight,
				left:0, right:0, top:0, bottom:0 };
			for(var i = 2; i < mult_tree_smaller.length; i++){
				d3.select("#treemap" + (mult_tree_smaller[i].index-2) + " svg").attr("height",remainheight);
				$("#treemap" + (mult_tree_smaller[i].index-2)).height(remainheight);
			}
			d3.select("#multitree").append("div").attr("id",function(){
				return "treemap" + numoftreecompare;
			})
			.attr('class','single-tree');
			$("#treemap"+numoftreecompare).height(remainheight);
			svg = d3.select("#treemap" + numoftreecompare).append("svg").attr("id","treemap-svg"+numoftreecompare);
			svg_g = initFrame(svg,new_svg_size,false);
		}
		else {
			numoftreecompare++;
			d3.select("#multitree").append("div").attr("id",function(){
				return "treemap" + numoftreecompare;
			})
			.attr('class','single-tree');
			//.css('class', 'single-tree');
			remainheight = (height - svgheightA - svgheighthis - svgheightB) / (mult_tree_smaller.length);
			var new_svg_size = { width:_width, height:remainheight,
				left:20, right:10, top:0, bottom:0 };
			svg = d3.select("#treemap" + numoftreecompare).append("svg").attr("id","treemap-svg"+numoftreecompare);
			$("#treemap"+ numoftreecompare).height(remainheight);
			svg_g = initFrame(svg,new_svg_size,false);
			for(var i = 2; i < mult_tree_smaller.length; i++){
				d3.select("#treemap" + (mult_tree_smaller[i].index-2) + " svg").attr("height",remainheight);
				$("#treemap" + (mult_tree_smaller[i].index-2)).height(remainheight);
			}
		}
		d3.select("#treemap" + numoftreecompare).append("div").attr("id","treemap_alpabet_div" + numoftreecompare)
			.style("position","absolute")
			.style("left",0);
		var tmpdiv = d3.select("#treemap"+numoftreecompare).append("div").attr("id","treemap-div"+numoftreecompare)
			.style("position","absolute")
			.style("right",0)
			.style("visibility","hidden");
		tmpdiv.append("span").attr("id","delete" + mult_tree_smaller.length)
			.attr("class","btn btn-default btn-xs active level-btn toolbar-tree")
			.html("<span class=\"glyphicon glyphicon-remove\"></span>")
			.attr("value",mult_tree_smaller.length)
			.on("click",delete_button_click);
		tmpdiv.append("span").attr("id","up" + mult_tree_smaller.length)
			.attr("class","btn btn-default btn-xs active level-btn toolbar-tree")
			.html("<span class=\"glyphicon glyphicon-chevron-up\"></span>")
			.attr("value",mult_tree_smaller.length)
			.on("click",function(){
				var value = parseInt(d3.select(this).attr("value"));
				up_down_tree(mult_tree_smaller[value-1].index,mult_tree_smaller[value].index);
			});
		tmpdiv.append("span").attr("id","down" + mult_tree_smaller.length)
			.attr("class","btn btn-default btn-xs active level-btn toolbar-tree")
			.html("<span class=\"glyphicon glyphicon-chevron-down\"></span>")
			.attr("value",mult_tree_smaller.length)
			.on("click",function(){
				var value = parseInt(d3.select(this).attr("value"));
				if(value == mult_tree_smaller.length - 1) return;
				up_down_tree(mult_tree_smaller[value].index,mult_tree_smaller[value+1].index);
			});
		$("#treemap-svg" + numoftreecompare).hover(function(e){
			var tmp = this.id.slice(11);
			d3.select("#treemap-div"+tmp).style("visibility","visible");
		},
		function(e){
			var tmp = this.id.slice(11);
			d3.select("#treemap-div"+tmp).style("visibility","hidden");
		})
		$("#treemap-div"+numoftreecompare).hover(function(e){
			var tmp = this.id.slice(11);
			d3.select("#treemap-div"+tmp).style("visibility","visible");
		},
		function(e){
			var tmp = this.id.slice(11);
			d3.select("#treemap-div"+tmp).style("visibility","hidden");
		})
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
	//树的数目改变时，改变AB树的布局
	function changeViewForSvg(height,svgheighthis){
		tree = d3.layout.tree()
			.size([svg_size.width - leftPadding - buttonWidth - 20,height])
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
		tree_height = height;
		trend_height = svgheighthis;
		scale = d3.scale.linear().range([0,svgheighthis]);
		change_comparison_A_B(nodes);
	}
	//根据树的数目，调整对应操作栏的高度
	function modify_buttondiv_top(){
		var top = 0;
		top += parseFloat($("#treehis").height());
		for(var i = 0; i < mult_tree_smaller.length - 1; i++){
			var buttondiv = mult_tree_smaller[i + 1].buttondiv;
			var h = parseFloat($("#" + mult_tree_smaller[i].divid).height());
			top +=h + 1.4;
			d3.select("#" + buttondiv).style("top",top + "px");
			var alpabet_div = mult_tree_smaller[i + 1].alpabet_div;
			d3.select("#"+alpabet_div).style("top",top + "px")
				.html("<span class=\"btn btn-default btn-xs active level-btn toolbar-tree\">"+tree_alpabet_index[mult_tree_smaller[i+1].alpabet_index]+"</span>");
		}
		d3.select("#"+mult_tree_smaller[0].alpabet_div)
			.html("<span class=\"btn btn-default btn-xs active level-btn toolbar-tree\">"+tree_alpabet_index[mult_tree_smaller[0].alpabet_index]+"</span>");
	}
	function just_modify_alpabet_label(){
		for(var i = 0; i < mult_tree_smaller.length; i++){
			d3.select("#" + mult_tree_smaller[i].alpabet_div)
				.html("<span class=\"btn btn-default btn-xs active level-btn toolbar-tree\">"+tree_alpabet_index[mult_tree_smaller[i].alpabet_index]+"</span>")
		}
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
				var tmp = nodes[id_nodes[data[i]]];
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