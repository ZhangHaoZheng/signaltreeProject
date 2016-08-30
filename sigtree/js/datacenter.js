var dataCenter = {
	view_collection:{
		'tree_select_view': new Object(),
		'radial_view': new Object(),
		'tree_compare_view': new Object(),
		'parallel_set_view': new Object(),
		'toolbar_all_view': new Object(),
		'toolbar_comparison_view': new Object(),
		'toolbar_tree_view': new Object(),
		'projection_view': new Object(),
	},
	global_variable: {
		'file_array_path': [],
		'show_arc': true,
		'hover_show_arc': false,
		'sort_mode': 'time', //delete
		'click_thisNode_shrink': true,
		'compare_same_node': false, //delete
		'radialexpandmarkA': [], //delete
		'radialexpandmarkB': [], //delete
		'marknodesdepth': false, //delete
		'nodesIddepthA': [], //delete
		'nodesIddepthB': [], //delete
		'activeA': 4, //delete
		'activeB': 4, //delete
		'tree_node_list': [],    //delete
		'selection_object_array': [], //delete
		'selection_array':[],
		'current_id': null,
		'current_nodeid_before':[], //delete
		'hover_arc_link_num': 0,
		'sunburst_or_radial': 'radial',
		'treeview_or_projection':'treeview',
		'current_bg_color':'black',
		'current_bg_language':'Chinese',
		'projection_method': 'original_projection',
		'similar_id_array':[], //delete
		'numoftreecompare':0, //delete
		'time_sort_array':[],
		'propotion_array':[],
		'radial_highlight_id_list':[], //delete
		'mouse_over_signal_tree':null,
		'mouse_over_signal_node':null,
		'remove_signal_tree_index':[], //delete
		'current_signal_tree_index_array':[], //delete
		'enable_tooltip': true,
		'mult_tree_smaller':null
	},
	initial_global_variable: {
		'file_array_path': [],
		'show_arc': true,
		'hover_show_arc': false,
		'sort_mode': 'time',
		'click_thisNode_shrink': true,
		'compare_same_node': false,
		'radialexpandmarkA': [],
		'radialexpandmarkB': [],
		'marknodesdepth': false,
		'nodesIddepthA': [],
		'nodesIddepthB': [],
		'activeA': 4,
		'activeB': 4,
		'tree_node_list': [],
		'selection_object_array': [],
		'selection_array':[],
		'current_id': null,
		'current_nodeid_before':[],
		'hover_arc_link_num': 0,
		'sunburst_or_radial': 'radial',
		'treeview_or_projection':'treeview',
		'current_bg_color':'black',
		'current_bg_language':'Chinese',
		'projection_method': 'original_projection',
		'similar_id_array':[],
		'numoftreecompare':0,
		'time_sort_array':[],
		'propotion_array':[],
		'radial_highlight_id_list':[],
		'mouse_over_signal_tree':null,
		'mouse_over_signal_node':null,
		'remove_signal_tree_array':[],
		'current_signal_tree_index_array':[],
		'enable_tooltip': true,
		'mult_tree_smaller':null
	},
	GLOBAL_STATIC: {
		'radius': 3.5,
		'DEFAULT_ARC_LINK_NUM': 2,
		'MAX_DEPTH': 4
	},
	set_global_variable: function(variable_name, value, setter){
		this.global_variable[variable_name] = value;
		ObserverManager.post('set:' + variable_name, value, setter);
	},
	add_remove_index_array: function(remove_index){
		this.global_variable.remove_signal_tree_array.push(remove_index);
		this.global_variable.remove_signal_tree_array = this.global_variable.remove_signal_tree_array.sort(function(a,b){
			return a - b;
		});
		console.log(this.global_variable.remove_signal_tree_array);
	},
	get_current_tree_index: function(){
		var removeIndexArray = this.global_variable.remove_signal_tree_array
		if(removeIndexArray.length != 0){
			removeIndexArray.splice(0,1);
			return removeIndexArray[0];
		}else{
			//var maxNum = current_signal_tree_index_array.
		}
	}
}