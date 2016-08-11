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
		'show_arc': false,
		'hover_show_arc': false,
		'click_thisNode_shrink': true,
		'compare_same_node': false,
		'radialexpandmarkA': [],
		'radialexpandmarkB': [],
		'marknodesdepth': false,
		'nodesIddepthA': new Array(4),
		'nodesIddepthB': new Array(4),
		'activeA': 4,
		'activeB': 4,
		'tree_node_list': [],
		'selection_array':[],
		'current_id': null,
		'current_nodeid_before':[],
		'hover_arc_link_num': 5
	},
	GLOBAL_STATIC: {
		'radius': 2,
		'DEFAULT_ARC_LINK_NUM': 2
	},
	set_global_variable: function(variable_name, value){
		this.global_variable[variable_name] = value;
		ObserverManager.post('set:' + variable_name, value);
	}
}