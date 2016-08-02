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
                        $("#treemap").html("");

                            var listeners = _.without(ObserverManager.getListeners(), radialView, treeCompareView, parsetView); //remove old views in listeners
                            ObserverManager.setListeners(listeners);
                            radialView = radial();   
                            treeCompareView = treeCompare();     
                            parsetView = parset();     
                          
             
                    } else {

                        $("#treemap").html(""); 
                        $("svg[class=radial]").html("");
                        $("svg[class=parset]").html("");
                        $("#treemap").html("");

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


