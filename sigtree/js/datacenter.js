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
		'propotion_array':[]
	},
	GLOBAL_STATIC: {
		'radius': 3.5,
		'DEFAULT_ARC_LINK_NUM': 2,
		'MAX_DEPTH': 4
	},
	set_global_variable: function(variable_name, value){
		this.global_variable[variable_name] = value;
		ObserverManager.post('set:' + variable_name, value);
	}
}