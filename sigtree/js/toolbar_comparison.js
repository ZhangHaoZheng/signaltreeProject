var toolbarComparison = {
	initialize: function(){
		var self = this;
		self._add_to_listeners();
		self._bind_view();
		return this;
	},
	_add_to_listeners: function(){
		ObserverManager.addListener(this);
	},	
	_bind_view: function(){
		//multi group button
		$('.level-selection').on('click', function(d,i){
			$('.level-selection').removeClass('active');
			var depth = +$(this).attr('id').replace('level-','');
			for(var _i = 0;_i <= depth;_i++){
				$('#level-' + _i).addClass('active');
			}
			ObserverManager.post('change-depth', depth);
		});
		//--------------
		//group button
		$('#all-node-comparison').on('click', function(d,i){
			if(!($('#all-node-comparison').hasClass('active'))){
				$('#all-node-comparison').addClass('active');
				$('#same-node-comparison').removeClass('active');
				ObserverManager.post('show-all');
			}
		});
		$('#same-node-comparison').on('click', function(d,i){
			if(!($('#same-node-comparison').hasClass('active'))){
				$('#same-node-comparison').addClass('active');
				$('#all-node-comparison').removeClass('active');
				ObserverManager.post('show-similiar');
			}
		});
	}
}