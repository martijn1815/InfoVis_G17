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

    const margin_map = {top: 0, right: 0, bottom: 0, left: 80},
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

        for (var i = 0; i<DataYear.length; i++) {
            var ProvinceData = DataYear[i].name;
            //console.log(ProvinceData)
            var TotalVotes = DataYear[i].GeldigeStemmen;
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
                    topo.features[j].properties.MovPercVotes = Math.round(((MaxMov.votes / TotalVotes) * 100) * 10) / 10;
                    topo.features[j].properties.PartyName = MaxParty.name;
                    topo.features[j].properties.PartyVotes= MaxParty.votes;
                    topo.features[j].properties.PartyPercVotes = Math.round((MaxParty.votes / TotalVotes) * 100 * 10) / 10;
                    topo.features[j].properties.Voters = DataYear[i].Kiesgerechtigden;
                    topo.features[j].properties.Age20 = DataYear[i].Age20;
                    topo.features[j].properties.Age20_45 = DataYear[i].Age20_45;
                    topo.features[j].properties.Age45_65 = DataYear[i].Age45_65;
                    topo.features[j].properties.Age65_80 = DataYear[i].Age65_80;
                    topo.features[j].properties.Age80 = DataYear[i].Age80;
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
                if (d.properties.MovName) {
                    var Movement = d.properties.MovName
                    return color(Movement);
                }
                else {
                    return "grey";
                }
           })
           .style("opacity", function(d) {
                if (d.properties.statnaam == selectedRegion) {
                    return 0.7;
                }
                else {
                    return 1;
                }
           })
           .style("stroke", "black")
           .style("stroke-width", function(d) {
                if (d.properties.statnaam == selectedRegion) {
                    return 3;
                }
                else {
                    return 1;
                }
           })
           .on("mouseover", function(d) {
                div.transition()
                   .duration(200)
                   .style("opacity", .9);

                div.html(function() {
                        console.log(d.properties);
                        return "<strong>" + d.properties.statnaam + "</strong>" +
                               '<br>Biggest political movement: <strong>' + d.properties.MovName + " (" + + d.properties.MovPercVotes + "%)</strong>" +
                               '<br>Biggest party: <strong>' + d.properties.PartyName + " (" + d.properties.PartyPercVotes + "%)</strong>" +
                               '<br>Age Demographic:' +
                               '<table style="width:70%">' +
                               '<tr><td>0-20</td><td style="text-align:right">' + d.properties.Age20.toLocaleString('en') + '</td></tr>' +
                               '<tr><td>20-45</td><td style="text-align:right">' + d.properties.Age20_45.toLocaleString('en') + '</td></tr>' +
                               '<tr><td>45-65</td><td style="text-align:right">' + d.properties.Age45_65.toLocaleString('en') + '</td></tr>' +
                               '<tr><td>65-80</td><td style="text-align:right">' + d.properties.Age65_80.toLocaleString('en') + '</td></tr>' +
                               '<tr><td>80+</td><td style="text-align:right">' + d.properties.Age80.toLocaleString('en') + '</td></tr></table>';
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
                // Here function to change others;
                if (!(d.properties.statnaam == "Flevoland" && YearID < 18)) {
                    if (selectedRegion == d.properties.statnaam) {
                        selectedRegion = "Total";
                        d3.selectAll("path").style('opacity', 1)
                                            .style("stroke-width", 1);
                        d3.select('#yearRangeShadow').dispatch('change');
                    }
                    else {
                        selectedRegion = d.properties.statnaam;
                        d3.selectAll("path").style('opacity', 1)
                                            .style("stroke-width", 1);
                        d3.select(this).style('opacity', 0.7)
                                       .style("stroke-width", 3);
                        d3.select('#yearRangeShadow').dispatch('change');
                    }
                    console.log(selectedRegion);
                }
           });
    };
};