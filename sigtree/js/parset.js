var parset = {
	initialize: function(){
		var self = this;
		self._add_to_listener();
		self._bind_view();
		var dataList = dataCenter.datasets[0].processor.result.dataList;
		self._render_view(dataList);
		return self;
	},
	_add_to_listener: function(){
		var self = this;
		ObserverManager.addListener(self);
	},
	_bind_view: function(){
	},
	_render_view: function(data_list){
		var dt = data_list;
		var width = +$("#leftBottomWrapper").width();
		var height = +$("#leftBottomWrapper").height();
		var svg = d3.select("svg.parset")
		  .attr("width", width)
		  .attr("height", height);
		var tip = d3.tip()
	    .attr('class', 'd3-tip')
	    .offset([-10, 0])
	    .html(function(d) {
	      return "flowSize:" + d3.format(".3s")(d.count) + " nodeName:" + d.name + "</span>";
	    });
		var chart = d3.parsets()
				.dimensions(["root", "atm", "aal", "vpi", "cid"])
				.value(function(d){
					var strs = d.percent.split(",");
					if (strs.length == 0)
						return 0;
					var value = strs[0].replace("数量：", "").replace("字节", "");
					value = +value;
					return value;
				})
				.width(width - 20)
				.height(height-20)
				.mouseoverCallback(mouseoverCallback)
				.mouseoutCallback(mouseoutCallback)
				.spacing(110)
				.tension(0.5);
		var data = [];
		dt.forEach(function(d){
			d.root = "root";
			if(d.tcp){
				d.cid = d.tcp;
				delete d.tcp;
			}
			else if(d.udp){
				d.cid = d.udp;
				delete d.udp;
			}
			else if(d.icmp){
				d.cid = d.icmp;
				delete d.icmp;
			}
			else if(d.other){
				d.cid = d.other;
				delete d.other;
			}
			if(!d.cid){
				d.cid = "none";
			}
			data.push(d);
		});
		svg.datum(data).call(chart);
		svg.call(tip);
		svg.selectAll('path')
			.on('mouseover', function(d,i){
				tip.show(d);
			})
			.on('mouseout', function(d,i){
				tip.hide(d);
			})
			.on('click',function(d){
				console.log(d)
			})
		svg.selectAll("rect")
			.on("mouseover",function(){
				if(d3.select(this).attr("class") != "category-0") return;
				ObserverManager.post("mouse-over", ["-root"]);
			})
			.on("mouseout",function(){
				if(d3.select(this).attr("class") != "category-0") return;
				ObserverManager.post("mouse-out", ["-root"]);
			});
		svg.selectAll("path").filter(function(d){
			var tmp = d.id.slice(-4);
			if(tmp == "none") return true;
			return false;
		}).attr("opacity",0);
		svg.selectAll("g").filter(function(d){
			if(d.name == "none") {
				return true;
			}
			return false;
		}).attr("opacity",0);
		function mouseoverCallback(data) {
			ObserverManager.post("mouse-over", [data.id])
		}

		function mouseoutCallback(data) {
			ObserverManager.post("mouse-out", [data.id])
		}
	},
	_highlight_subtree_and_route_from_root: function(dataI) {
		var svg = d3.select("svg.parset");
		var highlight_id_list = dataCenter.global_variable.radial_highlight_id_list;
		for(var i = 0; i < highlight_id_list.length; i++){
			svg.selectAll("#parset-mouse-" + highlight_id_list[i])
				.style("fill-opacity",0.9)
				.style("fill","#4A4AFF");
		}
	},
	_unhighlight_subtree_root: function(){
		var svg = d3.select("svg.parset");
		svg.selectAll("path")
			.style("fill-opacity",0.3)
			.style("fill","steelblue");
		dataCenter.set_global_variable('radial_highlight_id_list', []);
	},
    OMListen: function(message, data) {
		var idPrefix = "#parset-ribbon-";
		var svg = d3.select("svg.parset");
		if (message == "highlight") {
			svg.selectAll(".highlight").classed("highlight", false);
			for (var i = 0; i < data.length; i++) {
				var dataI = data[i].replace(';','');
				svg.selectAll("#parset-ribbon-" + dataI).classed("highlight", true);
			}
		}
        if (message == "mouse-over") {
        	var self = this;
			for (var i = 0; i < data.length; i++) {
				var dataI = data[i].replace(';','');
				svg.selectAll("#parset-ribbon-" + dataI).classed("focus-highlight", true);
				svg.selectAll("#parset-mouse-" + dataI).classed("focus-highlight", true);	
				self._highlight_subtree_and_route_from_root(dataI);
			}
        }
        if (message == "mouse-out") {
        	var self = this;
			for (var i = 0; i < data.length; i++) {
				var dataI = data[i].replace(';','');
				svg.selectAll("#parset-ribbon-" + dataI).classed("focus-highlight", false);
				svg.selectAll("#parset-mouse-" + dataI).classed("focus-highlight", false);
			}        	
			self._unhighlight_subtree_root();
        }
        if(message=="update-view"){
        	var self = this;
        	var currentId = dataCenter.global_variable.current_id;
        	for(var i = 0;i < dataCenter.datasets.length;i++){
        		if(currentId == dataCenter.datasets[i].id){
        			var dataList = dataCenter.datasets[i].processor.result.dataList;
        			self._render_view(dataList);
        			break;
        		}
        	}
        }
        if(message == "set:similar_id_array"){
        	var similarIdArray = dataCenter.global_variable.similar_id_array;
        	console.log(similarIdArray);
        	svg.selectAll('path')
        	.classed('path-remove', true);
        	//classed('opacity-non-similar', true);
        	for(var i = 0;i < similarIdArray.length;i++){
        		console.log( similarIdArray[i]);
        		svg.select('#parset-ribbon-' + similarIdArray[i]).classed('path-remove', false);//.style('opacity', '1');
        	}
        }
        if(message == 'show-all'){
        	svg.selectAll('path')
        	.classed('path-remove', false);
        }
        if(message == 'clean-view'){
        	svg.selectAll('*').remove();
        }
    }	
};