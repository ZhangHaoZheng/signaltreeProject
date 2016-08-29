var toolbarAll = {
	name: 'toolbar-all',
	initialize: function(){
		var self = this;
		self._add_sample_data();
		self._add_to_listeners();
		self._bind_view();
		return self;
	},
	_add_to_listeners: function(){
		ObserverManager.addListener(this);
	},
	_bind_view: function(){
		/*$('.toolbar-all').on('click', function(d,i){
			if(!$(this).hasClass('active')){
				$(this).addClass('active');
			}
		})*/
		$('#arc-link').on('click', function(d,i){
			if($('#arc-link').hasClass('active')){
				dataCenter.set_global_variable('show_arc', false);
			}else{
				dataCenter.set_global_variable('show_arc', true);
			}
		});
		$('#arc-link-hover').on('click', function(d,i){
			$("#slider").slider();
			$( "#slider" ).slider({
			      orientation: "horizontal",
			      range: "min",
			      max: 10,
			      value: dataCenter.global_variable.hover_arc_link_num,
			      slide: refreshText,
			      change: refreshText
		    });
			if($('#hover-arc-div').css('display') == 'none'){
				$('#hover-arc-div').slideDown('slow');
			}else{
				$('#hover-arc-div').slideUp('slow');
			}
		});
		//hover的按钮是否通过高亮标记是由数量决定
		function refreshText(){
			var num = $( "#slider" ).slider( "value" );
			$('#slider-text').text(num);
			dataCenter.set_global_variable('hover_arc_link_num', num);
			if(num > 0){
				dataCenter.set_global_variable('hover_show_arc', true);
			}else{
				dataCenter.set_global_variable('hover_show_arc', false);
			}
		}
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
		$('#load-file-name').on('click', function(d,i){
			//var filePathArray = dataCenter.global_variable.file_array_path;
			if($('#load-file-div').css('display') == 'none'){
				$('#load-file-div').slideDown('qiuck');
			}else{
				$('#load-file-div').slideUp('quick');
			}
		});
		$('#clear-all-div').on('click', function(d,i){
			clear_all_selection();
		});
		$('#enable-tool-tip').on('click', function(d,i){
			if($('#enable-tool-tip').hasClass('active')){
				dataCenter.set_global_variable('enable_tooltip', false);
				$('#enable-tool-tip').removeClass('active');
			}else{
				dataCenter.set_global_variable('enable_tooltip', true);
				$('#enable-tool-tip').addClass('active')
			}
		});
		$('span:not(#load-file-name, #arc-link-hover)').on('click', function(d,i){
			$('#load-file-div').slideUp('quick');
			$('#hover-arc-div').slideUp('slow');
		});
		$('div:not(#toolbar, #load-files, .load-file-item, #load-file-div, #arc-link-div, #slider-container, #slider)').on('click', function(d,i){
			$('#load-file-div').slideUp('quick');	
			$('#hover-arc-div').slideUp('slow');		
		});	
		$('#help').click(function(){
			console.log("!!!")
			$("#dialog-confirm").dialog("open");
		});
		$("#dialog-confirm").dialog
		({
			width:"900",
			height:"600",
	        //modal: true,             // 创建模式对话框
	        autoOpen: false,         // 只初始化，不显示
	        buttons: {
		        "Back": function() {
		        	d3.selectAll(".help_img").remove()
		        	$( ".help_document" ).append( 
		        		"<img src=\"helpdocument/signal_tree_interface_intro.png\" class=\"help_img\" width=\"800px\" >"
		        		);
		        },
		        "Next": function() {
		        	d3.selectAll(".help_img").remove()
		        	$( ".help_document" ).append( 
		        		"<img src=\"helpdocument/signal_tree.png\" class=\"help_img\" width=\"550px\" >"
		        		);
		        }
		    }
	    });
		function clear_all_selection() {
		    if (confirm("确定清空选择？") == true) {
		    	//清空当前选择的信号树
		    	dataCenter.set_global_variable('selection_array', []);
		    	dataCenter.set_global_variable('current_id', null);
		    	ObserverManager.post('changeData', []);
		    }
		}
	},
	_add_sample_data: function(){
		$.get("data/", function(data) 
		{
		    var filePathArray = dataCenter.global_variable.file_array_path;
		    $(data).find("li > a").each(function(d){
		        var fileName = $(this).attr('href').replace('/','');
		        if(fileName != '.DS_Store'){
		            filePathArray.push(fileName);
		        }
		    });
		    var load_file_table_height = filePathArray.length * 20;
		    $('#load-file-div').height(load_file_table_height);
		    for(var j = 0;j < filePathArray.length;j++){
				$("#load-file-table").append("<tr id = \"load-file-item\"><th id=\"load-file-th\">" + filePathArray[j] + "</th></tr>");
			}
			$('#load-file-div #load-file-table #load-file-item #load-file-th').click(function(d){
				var selectFileName = $(this)[0].innerHTML;
				$('#set-select-name').text(selectFileName);
				mainController(selectFileName);
				$('#load-file-div').slideUp('quick');
			});
			$('#load-file-div #load-file-table #load-file-item #load-file-th').mouseover(function(d){
				$(this).addClass('active');
			});
			$('#load-file-div #load-file-table #load-file-item #load-file-th').mouseout(function(d){
				$(this).removeClass('active');
			});
		});
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