var toolbar = function(){
	$('#arc-link').on('click', function(d,i){
		if($('#arc-link').hasClass('active')){
			$('#arc-link').removeClass('active');
			dataCenter.globalVariable.showArc = false;
		}else{
			$('#arc-link').addClass('active')
			dataCenter.globalVariable.showArc = true;
		}
		//refresh the view
	});
	//group button
	$('#time-sort').on('click', function(d,i){
		if($('#time-sort').hasClass('active')){
			$('#time-sort').removeClass('active');
			$('#size-sort').addClass('active');
		}else{
			$('#time-sort').addClass('active');
			$('#size-sort').removeClass('active');
		}
	});
	$('#size-sort').on('click', function(d,i){
		if($('#size-sort').hasClass('active')){
			$('#size-sort').removeClass('active');
			$('#time-sort').addClass('active');
		}else{
			$('#size-sort').addClass('active');
			$('#time-sort').removeClass('active');
		}
	});
	//-------------
	$('#switch-selection').on('click', function(d,i){
		if($('#switch-selection').hasClass('active')){
			$('#switch-selection').removeClass('active');
		}else{
			$('#switch-selection').addClass('active');
		}
	});
	//group button
	$('#sunburst-tree').on('click', function(d,i){
		if($('#sunburst-tree').hasClass('active')){
			$('#sunburst-tree').removeClass('active');
			$('#radial-tree').addClass('active');
		}else{
			$('#sunburst-tree').addClass('active');
			$('#radial-tree').removeClass('active');
		}
	});
	$('#radial-tree').on('click', function(d,i){
		if($('#radial-tree').hasClass('active')){
			$('#radial-tree').removeClass('active');
			$('#sunburst-tree').addClass('active');
		}else{
			$('#radial-tree').addClass('active');
			$('#sunburst-tree').removeClass('active');
		}
	});
	//--------------
	//group button
	$('#tree-view').on('click', function(d,i){
		console.log('click treeview');
		if($('#tree-view').hasClass('active')){
			$('#tree-view').removeClass('active');
			$('#projection-view').addClass('active');
			$('#leftWrapper').css('visibility', 'hidden');
			$('#projectionWrapper').css('visibility', 'visible');
		}else{
			$('#tree-view').addClass('active');
			$('#projection-view').removeClass('active');
			$('#leftWrapper').css('visibility', 'visible');
			$('#projectionWrapper').css('visibility', 'hidden');
		}
	});
	$('#projection-view').on('click', function(d,i){
		if($('#projection-view').hasClass('active')){
			$('#projection-view').removeClass('active');
			$('#tree-view').addClass('active');
			$('#leftWrapper').css('visibility', 'visible');
			$('#projectionWrapper').css('visibility', 'hidden');
		}else{
			$('#projection-view').addClass('active');
			$('#tree-view').removeClass('active');
			$('#leftWrapper').css('visibility', 'hidden');
			$('#projectionWrapper').css('visibility', 'visible');
		}
	});
	//--------------
	//multi group button
	$('.projection-method').on('click', function(d,i){
		var thisId = $(this).attr('id');
		if($(this).hasClass('active')){
			if(thisId != 'original-projection'){
				$(this).removeClass('active');
				$('#original-projection').addClass('active');
			}
		}else{
			$('.projection-method').removeClass('active');
			$(this).addClass('active');
		}
	});
	//--------------
	//group button
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
		console.log(dataCenter.globalVariable.clickThisNodeShrink);
	});
	//--------------
	//group button
	$('#all-node-comparison').on('click', function(d,i){
		if($('#all-node-comparison').hasClass('active')){
			$('#all-node-comparison').removeClass('active');
			$('#same-node-comparison').addClass('active');
			
		}else{
			$('#all-node-comparison').addClass('active');
			$('#same-node-comparison').removeClass('active');

		}
	});
	$('#same-node-comparison').on('click', function(d,i){
		if($('#same-node-comparison').hasClass('active')){
			$('#same-node-comparison').removeClass('active');
			$('#all-node-comparison').addClass('active');

		}else{
			$('#same-node-comparison').addClass('active');
			$('#all-node-comparison').removeClass('active');
			
		}
	});
	//--------------
	//multi group button
	$('.level-selection').on('click', function(d,i){
		$('.level-selection').removeClass('active');
		var depth = +$(this).attr('id').replace('level-','');
		for(var _i = 0;_i <= depth;_i++){
			$('#level-' + _i).addClass('active');
		}
	});
	//--------------
}