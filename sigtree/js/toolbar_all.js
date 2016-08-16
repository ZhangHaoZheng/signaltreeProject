var toolbarAll = {
	initialize: function(){
		var self = this;
		self._add_to_listeners();
		self._bind_view();
		return self;
	},
	_add_to_listeners: function(){
		ObserverManager.addListener(this);
	},
	_bind_view: function(){
		$('#arc-link').on('click', function(d,i){
			if($('#arc-link').hasClass('active')){
				dataCenter.set_global_variable('show_arc', false);
			}else{
				dataCenter.set_global_variable('show_arc', true);
			}
		});
		$('#arc-link-hover').on('click', function(d,i){
			if($('#arc-link-hover').hasClass('active')){
				dataCenter.set_global_variable('hover_show_arc', false);
			}else{
				dataCenter.set_global_variable('hover_show_arc', true);
			}
		})
		//group button
		$('#time-sort').on('click', function(d,i){
			if(!($('#time-sort').hasClass('active'))){
				dataCenter.set_global_variable('sort_mode', 'time');
			}
		});
		$('#size-sort').on('click', function(d,i){
			if(!($('#size-sort').hasClass('active'))){
				dataCenter.set_global_variable('sort_mode', 'size');
			}
		});
		$('#switch-selection').on('click', function(d,i){
			/*if($('#switch-selection').hasClass('active')){
				$('#switch-selection').removeClass('active');
			}else{
				$('#switch-selection').addClass('active');
			}*/
			var selectionArray = dataCenter.global_variable.selection_array;
			var currentId = dataCenter.global_variable.current_id;
			var currentIndex = selectionArray.indexOf(currentId);
			var nextIndex = (currentIndex + 1)%(selectionArray.length);
			var nextId = selectionArray[nextIndex];
			dataCenter.global_variable.current_id = nextId;
			ObserverManager.post('update-view', 'toolbarAll');
		});
		$('#click-node-shrink').on('click', function(d,i){
			if(!($('#click-node-shrink').hasClass('active'))){
				dataCenter.set_global_variable('click_thisNode_shrink', true);
			}
		});
		$('#click-other-node-shrink').on('click', function(d,i){
			if(!($('#click-other-node-shrink').hasClass('active'))){
				dataCenter.set_global_variable('click_thisNode_shrink', false);
			}
		});
		$('#change-color-black').on('click', function(d,i){
			dataCenter.set_global_variable('current_bg_color', 'black');
		});
		$('#change-color-white').on('click', function(d,i){
			dataCenter.set_global_variable('current_bg_color', 'white');
		});
		$('#change-language-chinese').on('click', function(d,i){
			dataCenter.set_global_variable('current_bg_language', 'chinese');
		});
		$('#change-language-english').on('click', function(d,i){
			dataCenter.set_global_variable('current_bg_language', 'english');
		});
		d3.selectAll('.toolbar-all')
		.append('title')
		.text(function(d,i){
			return 'dddd';
		})
	}
	/*
	$('.click-shrink').on('click', function(d,i){
		var thisId = $(this).attr('id');
		if($(this).hasClass('active')){
			if(thisId != 'click-node-shrink'){
				//当前选中的状态是点击节点之后该节点收缩
				$(this).removeClass('active');
				$('#click-node-shrink').addClass('active');
				dataCenter.globalVariable.clickThisNodeShrink = true;
			}
		}else{
			$('.click-shrink').removeClass('active');
			$(this).addClass('active');
			if(thisId == 'click-node-shrink'){
				//当前选中的状态是点击节点之后该节点收缩
				dataCenter.globalVariable.clickThisNodeShrink = true;
			}else{
				//当前选中的状态是点击节点之后其它节点收缩
				dataCenter.globalVariable.clickThisNodeShrink = false;
			}
		}
	});*/
}