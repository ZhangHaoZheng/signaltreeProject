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
	_render_view: function(){
		var padding  = 10;
		var width = $('#projectionWrapper').width() - padding * 2;
		var height = $('#projectionWrapper').height() - padding * 2;

		d3.select('svg.projection')
		.attr('width', width)
		.attr('height', height);

		var svg = d3.select('svg.projection')
			.append('g')
			.attr('id', 'projection-view')
			.attr('transform', 'translate(' + padding + ',' + padding + ')');
		var mdsByDistance = window["MDS"]["byDistance"];
		console.log(dataCenter.distanceMatrix);
		var coordinate = mdsByDistance(dataCenter.distanceMatrix);
		var nodes = svg.selectAll('.nodes')
					.data(coordinate);
		nodes.enter()
		.append('circle')
		.attr('class', function(d,i){
			return 'projection-nodes';
		})
		.attr('id', function(d,i){
			var id = dataCenter.distanceObject[i].fileName.replace('.csv','').replace('XX','');
			return 'node' + id;
		})
		.attr('cx', function(d,i){
			return 0.1 * width + d[0] * width * 0.8;
		})
		.attr('cy', function(d,i){
			return d[1] * height;
		})
		.on('mouseover', function(d,i){
			//send message, highlight the corresponding histogram
			var thisId = d3.select(this).attr('id');
			ObserverManager.post("projection-highlight", thisId);
			d3.selectAll('.projection-nodes').classed('opacity-unhighlight', true);
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
		nodes.exit().remove();
	},
	OMListen: function(message, data) {
		if (message == "similarity-node-array") {
			d3.selectAll('.projection-nodes').classed('opacity-unhighlight', true);
			if(data.length != 0){
				for(var i = 0;i < data.length;i++){
					d3.select('#' + data[i]).classed('opacity-highlight', true);
				}
			}else{
				d3.selectAll('.projection-nodes').classed('opacity-unhighlight', false);
				d3.selectAll('.projection-nodes').classed('opacity-highlight', false);
			}
		}
    }
}