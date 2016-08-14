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
				console.log(d.tcp);
				d.cid = d.tcp;
				delete d.tcp;
			}
			else if(d.udp){
				console.log(d.udp);
				d.cid = d.udp;
				delete d.udp;
			}
			else if(d.icmp){
				console.log(d.icmp);
				d.cid = d.icmp;
				delete d.icmp;
			}
			else if(d.other){
				console.log(d.other);
				d.cid = d.other;
				delete d.other;
			}
			if(!d.cid){
				d.cid = "none";
			}
			data.push(d);
		});
		svg.datum(data).call(chart);
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
			for (var i = 0; i < data.length; i++) {
				var dataI = data[i].replace(';','');
				svg.selectAll("#parset-ribbon-" + dataI).classed("focus-highlight", true);
				svg.selectAll("#parset-mouse-" + dataI).classed("focus-highlight", true);	
			}
        }
        if (message == "mouse-out") {
			for (var i = 0; i < data.length; i++) {
				var dataI = data[i].replace(';','');
				svg.selectAll("#parset-ribbon-" + dataI).classed("focus-highlight", false);
				svg.selectAll("#parset-mouse-" + dataI).classed("focus-highlight", false);
			}        	
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
    }	
};