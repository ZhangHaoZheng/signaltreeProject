// dataCenter:
//     stats: 各个数据文件的统计
//     datasets: [   //各个数据集
//         id: 
//         processor:         
//     ]
var numoftreecompare = 0;
/*$("#radialcheckbox").on("change",function(){
    var radialView, parsetView;
    var m = $("#radialcheckbox").attr("mark");
    if(m==1) {$("#radialcheckbox").attr("mark",2);}
    else $("#radialcheckbox").attr("mark",1);
    m = $("#radialcheckbox").attr("mark");
    $("svg[class=radial]").html("");
    $("svg[class=parset]").html("");
    //var listeners = _.without(ObserverManager.getListeners(),radialView,parsetView); //remove old views in listeners
    ObserverManager.setListeners(listeners);
    radialView = radial();     
    parsetView = parset();
})*/
var radialexpandmarkA = [];
var radialexpandmarkB = [];
var marknodesdepth = false;
var nodesIddepthA = [];
var nodesIddepthB = [];
nodesIddepthA.length = 4;
nodesIddepthB.length = 4;
var activeA = 4;
var activeB = 4;
var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d,i) {
      return "<span style='font-size:12px;'>"  + d.key + "</span>";
    });
$(document).ready(function(){
    $('.button').tooltip(); 
});
//将不同层级的节点塞入到不同的数组中，方便当切换层级的时候将整个数组的节点都放到收缩的数组中
/*function changenodedepthA(){
    var tree = d3.layout.tree()
        .children(function(d){
            if(Array.isArray(d.values)) return d.values;
            return undefined;
        }); 
    for(var i = 0; i < 4; i++)
        nodesIddepthA[i] = [];
    var rootA = dataCenter.datasets[0].processor.result.treeRoot;
    var treeNodeLista = tree.nodes(rootA).reverse();
    for(var i = 0; i < treeNodeLista.length; i++){
        var d = treeNodeLista[i].depth;
        var flow = treeNodeLista[i].flow;
        if(d == 4 || (+flow) == 0) continue;
        var tmp = treeNodeLista[i];
        nodesIddepthA[d].push(tmp);
     }
}*/
//将不同层级的节点塞入到不同的数组中
function changenodedepthB(){
    var tree = d3.layout.tree()
        .children(function(d){
            if(Array.isArray(d.values)) return d.values;
            return undefined;
        }); 
    for(var i = 0; i < 4; i++)
        nodesIddepthB[i] = [];
    var rootB = dataCenter.datasets[1].processor.result.treeRoot;
    var treeNodeListb = tree.nodes(rootB).reverse();
    for(var i = 0; i < treeNodeListb.length; i++){
        var d = treeNodeListb[i].depth;
        var flow = treeNodeListb[i].flow;
        if(d == 4 || (+flow) == 0) continue;
        var tmp = treeNodeListb[i];
        nodesIddepthB[d].push(tmp);
    }
}
var justChangeDataA;
var initial_toolbar = function(){
    dataCenter.view_collection.toolbarAllView =  toolbarAll.initialize();
    dataCenter.view_collection.toolbar_comparison_view =  toolbarComparison.initialize();
    dataCenter.view_collection.toolbar_tree_view = toolbarSignaltree.initialize();
}
var mainController = function(file_path_name){
    //var treeSelectView, radialView, treeCompareView, parsetView, toolbarAllView, toolbarComparisonView, toolbartreeView;
    var datasetID = [];
    var filePath = 'data/' + file_path_name + '/';
    function loadStatData() {
        var dtd = $.Deferred();
        d3.json(filePath + "stat.json", function(error, data){
            if (error) {
                dtd.reject();
                throw error;
            }
            else {
                dataCenter.stats = data;
            }
            dtd.resolve();
        });
        return dtd.promise();
    }
    function load_distance_matrix_data(){
        var dtd = $.Deferred();
        d3.csv(filePath + 'distance_matrix_file2.csv', function(error, data){
            if(error){
                dtd.reject();
                throw error;
            }
            else{
                dataCenter.distanceObject = data;
                var dataLength = data.length;
                dataCenter.distanceMatrix = new Array(dataLength);
                for(var i = 0;i < dataLength;i++){
                    dataCenter.distanceMatrix[i] = new Array(dataLength);
                }
                for(var i = 0;i < dataLength;i++){
                    for(var j = 0;j < dataLength;j++){
                        dataCenter.distanceMatrix[i][j] = +data[i]['attr' + j];
                    }
                }
            }
            dtd.resolve();
        })
        return dtd.promise();
    }
    function load_similarity_matrix_data(){
        var dtd = $.Deferred();
        d3.csv(filePath + 'similarity_matrix_file2.csv', function(error, data){
            if(error){
                dtd.reject();
                throw error;
            }
            else{
                dataCenter.similarityMatrix = data;
            }
            dtd.resolve();
        })
        return dtd.promise();
    }
    function initInteractionHandler() {
        ObserverManager.addListener(this);
    }
    //初始化所有的界面，这时候同样也需要读入数据进行操作
    function initViewsHandler(){     
    }
    //预先加载设定好需要读取的数据，目前需要读取的数据是第一个文件与第二个文件
    function load_init_data(){
        var dtd = $.Deferred();
        var data = dataCenter.global_variable.selection_array;
        var datasetID = _.clone(data);
        dataCenter.datasets = [];
        var defers = [];
        for (var i = data.length - 1; i >= 0; i--) {
            var id = data[i];
            var processor = new sigtree.dataProcessor();
            var dataset = {
                id: id,
                processor: processor
            }
            dataCenter.datasets.push(dataset)
            //var file = dataCenter.stats[id].file;
            var fileName = data[i] + 'XX.csv';
            file = filePath + fileName;
            defers.push(dataset.processor.loadData(file));
        }
        $.when(defers[0], defers[1])
            .done(function(){
            dtd.resolve();
        });
        return dtd.promise();
    }
    this.OMListen = function(message, data) {
        //changeData信号是从treeselection界面中传递到main中，main中接收到之后对于所有的界面进行转发
        if (message == "changeData") {
            datasetID = _.clone(data);
            dataCenter.datasets = [];
            var defers = [];
            for (var i = data.length - 1; i >= 0; i--) {
                var id = data[i];
                console.log(sigtree);
                var processor = new sigtree.dataProcessor();
                var dataset = {
                    id: id,
                    processor: processor
                }
                dataCenter.datasets.push(dataset)
                //var file = dataCenter.stats[id].file;
                var file = data[i] + 'XX.csv';
                file = filePath + file;
                defers.push(dataset.processor.loadData(file));
            }
            $.when.apply($, defers)
                .done(function() {
                    ObserverManager.post("update-view", dataCenter.datasets);
            });
        }
    }
    initInteractionHandler();
    $.when(loadStatData(), load_distance_matrix_data(), load_similarity_matrix_data(), load_init_data())
        .done(function() {
            console.log('-----------------------initialize---------------------');
            treeSelectView = treeSelect();
            dataCenter.view_collection.radial_view = radial.initialize();
            dataCenter.view_collection.sunburst_view = sunburst.initialize();
            dataCenter.view_collection.radial_histogram = radialHistogram.initialize();  
            dataCenter.view_collection.tree_compare_view = treeCompare();     
            dataCenter.view_collection.parallel_set_view =  parset.initialize();     
            dataCenter.view_collection.projectionView = projection.initialize();
            $('.hidden-content').css({'visibility': 'visible'});
            $('#loading').css({'visibility':'hidden'});
            $('.toolbar').css({'visibility':'visible'});
        })
}
$(document).ready(function() {
      //document.write("The number of files in this folder is: " + filesCount);
    initial_toolbar();
    mainController('sample1');
})


