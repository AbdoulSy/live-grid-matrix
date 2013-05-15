(function ($, window, undefined) {
    var pods = [];
    var podsOrdered = [];
    var globalOptions = [];
    var configuration = {
        '2x2': 10,
        '3x2': 6,
        '2x1': 14,
        '1x2': 13,
        '1x1': 18
    };
    var alreadyConfigured = [];
    var functions = {
        orderPodsByWeight : function (pods) {
            var weightTable = [],
                podsTable = [],
                ret = [];

            for(var key in pods) {
                if(!pods[key].wide && !pods[key].tall) {
                    weightTable.push(0);
                    podsTable[0].push(pods[key]);
                } else{
                    if(!pods[key].wide) {
                        pods[key].wide = 1
                    } if(!pods[key].tall) {
                        pods[key].tall = 1
                    }
                    if(pods[key].wide == 1 && pods[key].tall == 1){
                        if( $.inArray(0, weightTable) == -1 ){
                            weightTable.push(0);
                        }
                        if(!podsTable[0]) {
                            podsTable[0] = []
                        }
                        podsTable[0].push(pods[key]);
                    } else if(pods[key].wide == 2 && pods[key].tall ==1){
                        if( $.inArray(3, weightTable) == -1 ){
                            weightTable.push(3);
                        }
                        if(!podsTable[3]) {
                            podsTable[3] = []
                        }
                        podsTable[3].push(pods[key]);
                    } else {
                        var weight = (pods[key].wide * pods[key].tall);
                        if(!podsTable[weight]) {
                            podsTable[weight] = []
                        }
                        if( $.inArray(weight, weightTable) == -1 ){
                            weightTable.push(weight);
                        }
                        podsTable[weight].push(pods[key]);
                    }

                }


            }
            weightTable.sort(function(a,b){return a-b});
            for(var key in weightTable) {
                ret[weightTable[key]] = podsTable[weightTable[key]];
            }
            return ret;
        },
        getRandomConfiguration : function (buildConfig, build, $elem) {

            var randConfig = Math.floor((Math.random() * buildConfig)+1),
                obj = {};
            if((alreadyConfigured[build]===undefined)) {
                alreadyConfigured[build] = [];
            }
            if( ($.inArray(randConfig, alreadyConfigured[build]) == -1)){
                var elemz = $elem.find('.pointer-config-'+build+'-'+randConfig).not('.unavailable');
                alreadyConfigured[build].push(randConfig);
                if(elemz.length >0 ){
                    obj.$pointer = elemz;
                    obj.$configs = $elem.find('.config-'+build+'-'+randConfig);
                    return obj;

                }else{
                    return functions.getRandomConfiguration(buildConfig,build, $elem);
                }

            } else {
                return functions.getRandomConfiguration(buildConfig,build, $elem);
            }

        },

        render : function(pod) {
            var tmp = pod.$elem;

            if(pod.vars && typeof pod.vars == 'object'){
                for(var i= 0, nbVars=pod.vars.length; i<nbVars; i++) {
                    tmp = tmp.replace('{{'+pod.vars[i]+'}}', pod.data[i]);

                }
            }
            return tmp;

        },

        injectPodsInHtml : function (podsByWeight, $elem) {

            for(var aKey in podsByWeight ){
                var pods = podsByWeight[aKey];
                for (var key in pods) {
                    var build = pods[key].wide + 'x' + pods[key].tall,
                        randConfig = functions.getRandomConfiguration(configuration[build],build,$elem);
                    randConfig.$pointer.attr({colspan:pods[key].wide, rowspan:pods[key].tall});
                    randConfig.$pointer.html(functions.render(pods[key])).hide().fadeIn();
                    randConfig.$pointer.addClass('unavailable');
                    randConfig.$configs.remove();
                }
            }

        },
        get5x4Matrix : function () {
            return functions.compileHTML($("#5x4Table").html());
        },
        refresh : function (table) {
            table.find('td').empty();
        },
        compileHTML : function (html) {
            var div = document.createElement("div");
            div.innerHTML = html;
            var fragment = document.createDocumentFragment();
            while ( div.firstChild ) {
                fragment.appendChild( div.firstChild );
            }
            return fragment
        }
    };


    var methods = {
        init : function( options ) {
            var matrix = functions.get5x4Matrix();
            globalOptions = options;
            this.html(matrix);
            return this;
        },
        inject : function (podsData, callback) {
            var thePods = podsData,
                podsOrderedByWeight = functions.orderPodsByWeight(thePods);
            pods = thePods
            podsOrdered = podsOrderedByWeight;
            functions.refresh(this.find('.table5x4'));
            functions.injectPodsInHtml(podsOrderedByWeight, this.find('.table5x4'));
            if(typeof callback === 'function'){
                callback.call(this);
            }
        },
        append : function (pod) {
            pods.push(pod);
            var podsOrderedByWeight = functions.orderPodsByWeight(pods),
                matrix = functions.get5x4Matrix();
            podsOrdered = podsOrderedByWeight;
            functions.refresh(this.find('.table5x4'));
            functions.injectPodsInHtml(podsOrderedByWeight, this.find('.table5x4'));
        },
        update : function (name,data) {

        }

    };

    $.fn.liveGrid = function( method ) {

        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.liveGrid' );
        }

    };
})(jQuery,window);