function getMaxMov(arr, prop) {
    var max;
    for (var i=0 ; i<arr.length ; i++) {
        if (max == null || parseInt(arr[i][prop]) > parseInt(max[prop]))
            max = arr[i];
    }
    //console.log(max)
    return max;
};


function getMaxPary(arr, prop) {
    var max;
    //console.log(arr)
    for (var i=0; i<arr.length;i++) {
        //console.log(arr[i])
        //console.log()
         for (var j=0; j<arr[i].children.length;j++) {
            if (max == null || parseInt(arr[i].children[j][prop]) > parseInt(max[prop]))
            max = arr[i].children[j];

         };

    };
    return max;
};


function getID(d, x) {
    var ID = 0;
    for (var i = 0; i < Object.values(d).length; i++) {
        if (d[i].name == x) {
            ID = i;
        }
    }
    return ID;
};


function updateNLMap(YearID) {
    d3.selectAll("#map_box").remove();
    d3.selectAll("#tooltip").remove();
    createNLMap(YearID);
};


function createNLMap(yearid) {
    // Setting the margin_map, height_map and width_map variables
    // Adding a svg
    var YearID2 = yearid

    var box = d3.select("#map_netherlands")
                .append("div")
                .attr("id", "map_box")

    const margin_map = {top: 10, right: 0, bottom: 10, left: 80},
          width_map = 480 - margin_map.left - margin_map.right,
          height_map = 500 - margin_map.top - margin_map.bottom;

    //var color = d3.scaleOrdinal().range(d3.schemeSet1);

    var svg = d3.select("#map_box")
                .append("svg")
                .attr("id", "#mapsvg")
                .attr("height", height_map + margin_map.top + margin_map.bottom)
                .attr("width", width_map + margin_map.left + margin_map.right)
                .append("g")
                .attr("id", '#nlmap')
                .attr("transform", "translate(" + margin_map.left + "," + margin_map.top  + ")");

    var div = d3.select("main").append("div")
                .attr("class", "tooltip")
                .attr("id", "tooltip")
                .style("opacity", 0);

    d3.queue()
      .defer(d3.json, "https://cartomap.github.io/nl/wgs84/provincie_2021.geojson")
      .defer(d3.json, "static/data/data.json")
      .await(ready);

    function ready(error, topo, data) {
        var DataYear = data.children[yearid].children;
        //console.log(DataYear)
        for (var i = 0; i<DataYear.length; i++) {
            var ProvinceData = DataYear[i].name;
            //console.log(ProvinceData)
            var MaxMov = getMaxMov(DataYear[i].children, "votes");
            var MaxParty = getMaxPary(DataYear[i].children, "votes");
            //console.log(MaxMov)
            //console.log(MaxParty)
            if (ProvinceData == "FryslÃ¢n") {
                ProvinceData = "Fryslân"
            }

            for (var j = 0; j<topo.features.length; j++) {
                var Province_topo = topo.features[j].properties.statnaam;

                if (ProvinceData == Province_topo) {
                    topo.features[j].properties.MovName = MaxMov.name;
                    topo.features[j].properties.MovVotes = MaxMov.votes;
                    topo.features[j].properties.PartyName = MaxParty.name;
                    topo.features[j].properties.PartyVotes= MaxParty.votes;
                    break;
                }
            }
        };
        console.log(topo)
        // Draw the map

        var center = d3.geoCentroid(topo);
        var scale  = 150;
        var offset = [width_map/2, height_map/2];
        var projection = d3.geoMercator().scale(scale).center(center)
                           .translate(offset);

        // create the path
        var path = d3.geoPath().projection(projection);

        // using the path determine the bounds of the current map and use
        // these to determine better values for the scale and translation
        var bounds  = path.bounds(topo);
        var hscale  = scale*width_map  / (bounds[1][0] - bounds[0][0]);
        var vscale  = scale*height_map / (bounds[1][1] - bounds[0][1]);
        var scale   = (hscale < vscale) ? hscale : vscale;
        var offset  = [width_map - (bounds[0][0] + bounds[1][0])/2,
                       height_map - (bounds[0][1] + bounds[1][1])/2];

        // new projection
        projection = d3.geoMercator().center(center)
                       .scale(scale).translate(offset);
        path = path.projection(projection);

        svg.append("g")
           .selectAll("path")
           .data(topo.features)
           .enter()
           .append("path")
           // draw each country
           .attr("d", d3.geoPath()
                        .projection(projection)
           )
           .attr("fill", function (d) {
                var Movement = d.properties.MovName
                return color(Movement);
           })
           .style("stroke", "black")
           .style("stroke-width_map", "0.002")
           .on("mouseover", function(d) {
                div.transition()
                   .duration(200)
                   .style("opacity", .9);

                div.html(function() {
                        return "<strong>" + d.properties.statnaam + "</strong>" + '<br>Biggest political movement: ' + d.properties.MovName + '<br>Biggest party: ' + d.properties.PartyName;
                    })
                   .style("left", (d3.event.pageX + 50) + "px")
                   .style("top", (d3.event.pageY - 50) + "px");
           })
           .on("mouseout", function(d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
           })
           .on('mousedown.log', function (d) {
                console.log(d.properties.statnaam)
                // Here function to change others;
                d3.selectAll("path").style('opacity', 1);
                d3.select(this).style('opacity', 0.5);
            });
    };
};


d3.select('html').on('mousedown.log', function (d) {
    if (this == d3.selectAll('svg')) {
        d3.selectAll("path").style('opacity', 1);
    }
});