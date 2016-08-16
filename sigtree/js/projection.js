var projection = {
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

		//d3.select('svg.projection').selectAll('*').remove();
		
		var svg = d3.select('svg.projection')
		.attr('width', width)
		.attr('height', height);
		
		svg.selectAll('*').remove();

		var mdsByDistance = window["MDS"]["byDistance"];
		var coordinate = mdsByDistance(dataCenter.distanceMatrix);
		var nodeNum = coordinate.length;
		var nodeLocation = new Array(nodeNum);
		for(var i = 0;i < nodeNum;i++){
			nodeLocation[i] = new Array();
			nodeLocation[i][0] = coordinate[i][0] * width * 0.8 + width * 0.1;
			nodeLocation[i][1] = coordinate[i][1] * height * 0.8 + height * 0.1;
		}
		if(projection_method == 'center-projection'){
			self.draw_link(nodeLocation);	
		}
		svg.selectAll(".nodes")
	    .data(nodeLocation)
	  	.enter()
	  	.append("circle")
	  	.attr('class', 'projection-nodes')
		.attr('id', function(d,i){
			var id = dataCenter.distanceObject[i].fileName.replace('.csv','').replace('XX','');
			return 'node' + id;
		})
	    .attr("r", 4)
		.attr('cx', function(d,i){
			return d[0];
		})
		.attr('cy', function(d,i){
			return d[1];
		})
	    .on('mouseover', function(d,i){
			//send message, highlight the corresponding histogram
			var thisId = d3.select(this).attr('id');
			ObserverManager.post("projection-highlight", thisId);
			d3.selectAll('.projection-nodes').classed('opacity-unhighlight', true);
			d3.select(this).classed('opacity-unhighlight', false);
			d3.select(this).classed('opacity-highlight', true);
		})
		.on('mouseout', function(d,i){
			//send message, unhighlight the corresponding histogram
			ObserverManager.post("projection-highlight", null);
			d3.selectAll('.projection-nodes').classed('opacity-unhighlight', false);
			d3.selectAll('.projection-nodes').classed('opacity-highlight', false);
		})
		.on('click', function(d,i){
			//re-projection according to this node
		});
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
		//
		/*var selectionArray = dataCenter.global_variable.selection_array;
		d3.selectAll('.projection-nodes').classed('opacity-selection-unhighlight', true);
		for(var i = 0;i < selectionArray.length;i++){
			d3.select('#node' + selectionArray[i]).classed('opacity-selection-unhighlight', false);
			d3.select('#node' + selectionArray[i]).classed('opacity-selection-highlight', true);
		}*/
	},
	highlight_node: function(this_node_id){
		var self = this;
		self.re_draw_node(d3.select('#' + this_node_id));
		d3.select('#' + this_node_id).classed('opacity-unhighlight', false);
		d3.select('#' + this_node_id).classed('opacity-highlight', true);
	},
	re_draw_node: function(this_node){
		if(this_node != null){
			var this_class = this_node.attr('class');
			var this_id = this_node.attr('id');
			//var translate = this_node.attr('transform');
			//var translateArray = translate.replace('translate(','').replace(')','').split(',');
			var this_cx = +this_node.attr('cx');
			var this_cy = +this_node.attr('cy');
			d3.select('#' + this_id).remove();
			d3.select('svg.projection')
				.append('circle')
				.attr('class', function(d,i){
					return this_class;
				})
				.attr('id', function(d,i){
					return this_id;
				})
				.attr('cx', this_cx)
				.attr('cy', this_cy)
				.on('mouseover', function(d,i){
					//send message, highlight the corresponding histogram
					var thisId = d3.select(this).attr('id');
					ObserverManager.post("projection-highlight", thisId);
					d3.selectAll('.projection-nodes').classed('opacity-unhighlight', true);
					d3.select(this).classed('opacity-unhighlight', false);
					d3.select(this).classed('opacity-highlight', true);
				})
				.on('mouseout', function(d,i){
					//send message, unhighlight the corresponding histogram
					ObserverManager.post("projection-highlight", null);
					d3.selectAll('.projection-nodes').classed('opacity-unhighlight', false);
					d3.selectAll('.projection-nodes').classed('opacity-highlight', false);
				});
		}
	},
	draw_link: function(node_location){
		var nodeLocation = node_location;
		var svg = d3.select('svg.projection');
		var path = svg.append("path")
			.attr('class', 'projection-node-path')
		    .data([nodeLocation])
		    .attr("d", d3.svg.line()
		    .tension(-1) // Catmull–Rom
		    .interpolate("linear"));
		var circle = svg.append("circle")
		    .attr("r", 10)
		    .attr("transform", "translate(" + nodeLocation[0] + ")");
		transition();
		function transition() {
		  circle.transition()
		      .duration(40000)
		      .ease("linear")
		      .attrTween("transform", translateAlong(path.node()))
		      .each("end", transition);
		}
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
		if (message == "similarity-node-array") {
			d3.selectAll('.projection-nodes').classed('opacity-unhighlight', true);
			if(data.length != 0){
				for(var i = 0;i < data.length;i++){
					self.highlight_node(data[i]);
				}
			}else{
				d3.selectAll('.projection-nodes').classed('opacity-unhighlight', false);
				d3.selectAll('.projection-nodes').classed('opacity-highlight', false);
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
    }
}