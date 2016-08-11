var toolbarSignaltree = {
	initialize: function(){
		var self = this;
		self._add_to_listeners();
		self._bind_view();
		return this;
	},
	_add_to_listeners: function(){
		//dataCenter.set_global_variable('activeA', 3);
		ObserverManager.addListener(this);
	},
	//var toolbarSignaltreeObj: this, 
	//toolbarSignaltreeObj._bind_view();
	//selection of the subburst and radial tree
	_bind_view: function(){
		$('#sunburst-tree').on('click', function(d,i){
			if(!($('#sunburst-tree').hasClass('active'))){
				$('#sunburst-tree').addClass('active');
				$('#radial-tree').removeClass('active');
			}
		});
		$('#radial-tree').on('click', function(d,i){
			if(!($('#radial-tree').hasClass('active'))){
				$('#radial-tree').addClass('active');
				$('#sunburst-tree').removeClass('active');
			}
		});
		//--------------
		//multi group button
		//选择在投影界面上面的额显示选项，显示树形结构，或者带glyph的projection
		$('.projection-method').on('click', function(d,i){
			var thisId = $(this).attr('id');
			if(!($(this).hasClass('active'))){
				if(thisId != 'original-projection'){
					$(this).removeClass('active');
					$('#original-projection').addClass('active');
				}
			}else{
				$('.projection-method').removeClass('active');
				$(this).addClass('active');
			}
		});
		return this;
	}
	//return toolbarSignaltreeObj;
}