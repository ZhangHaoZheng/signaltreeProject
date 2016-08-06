// dataCenter:
//     stats: 各个数据文件的统计
//     datasets: [   //各个数据集
//         id: 
//         processor:         
//     ]
var changedatamark = false;
(function() {
    this.dataCenter = {};
})()
var mark11 = false;
var numoftreecompare = 0;
$("#radialcheckbox").on("change",function(){
    var radialView, parsetView;
    var m = $("#radialcheckbox").attr("mark");
    if(m==1) {$("#radialcheckbox").attr("mark",2);}
    else $("#radialcheckbox").attr("mark",1);
    m = $("#radialcheckbox").attr("mark");
    changedatamark = true;
    $("svg[class=radial]").html("");
    $("svg[class=parset]").html("");
    var listeners = _.without(ObserverManager.getListeners(),radialView,parsetView); //remove old views in listeners
    ObserverManager.setListeners(listeners);
    radialView = radial();     
    parsetView = parset();
    changedatamark = false;
})
var radialexpandmarkA = [];
var radialexpandmarkB = [];
var marknodesdepth = false;
var nodesIddepthA = [];
var nodesIddepthB = [];
nodesIddepthA.length = 4;
nodesIddepthB.length = 4;
var activeA = 4;
var activeB = 4;
function changenodedepthA(){
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
}
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
var mainController = function(){
    var treeSelectView, radialView, treeCompareView, parsetView;
    var datasetID = [];
    function loadStatData() {
        var dtd = $.Deferred();
        d3.json("stat.json", function(error, data){
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

    function initInteractionHandler() {
        ObserverManager.addListener(this);
    }

    this.OMListen = function(message, data) {
        if (message == "changeData") {
            var justChangeDataA = false;
            if (data[1] == datasetID[1]){
                justChangeDataA = true;
            }
            datasetID = _.clone(data);
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
                var file = dataCenter.stats[id].file;
                file = "data/" + file;
                defers.push(dataset.processor.loadData(file));
            }
            $.when(defers[0], defers[1])
                .done(function() {
                    if (justChangeDataA == false) {

                        $("svg[class=radial]").html("");
                        $("svg[class=parset]").html("");
                        $("#treemapA").html("");
                        $("#treemapB").html("");
                        $("#treehis").html("");
                            changenodedepthA();
                            var listeners = _.without(ObserverManager.getListeners(), radialView, treeCompareView, parsetView); //remove old views in listeners
                            ObserverManager.setListeners(listeners);
                            radialView = radial();   
                            treeCompareView = treeCompare();     
                            parsetView = parset();     
                            
             
                    } else {

                        $("#treemapA").html(""); 
                        $("svg[class=radial]").html("");
                        $("svg[class=parset]").html("");
                        $("#treemapB").html("");
                        $("#treehis").html("");
                            changenodedepthB();
                            var listeners = _.without(ObserverManager.getListeners(), radialView, treeCompareView, parsetView); //remove old views in listeners
                            ObserverManager.setListeners(listeners);
                            radialView = radial();   
                            treeCompareView = treeCompare();     
                            parsetView = parset();   
                    }
                })
        }
    }
    initInteractionHandler();
    $.when(loadStatData())
        .done(function() {
            treeSelectView = treeSelect();         
        })
}
$(document).ready(function() {
    mainController();
})


