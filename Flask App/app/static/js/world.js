console.log('testtest')

function getMax(arr, prop) {
    var max;
    for (var i=0 ; i<arr.length ; i++) {
        if (max == null || parseInt(arr[i][prop]) > parseInt(max[prop]))
            max = arr[i];
    }
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

function createNLMap(yearid) {
    // Setting the margin, height and width variables
    // Adding a svg
    var YearID2 = yearid

    var box = d3.select("#map_netherlands")
        .append("div")
        .attr("id", "map_box")

    var svg = d3.select("#map_box")
        .append("svg")
        .attr("id", "#mapsvg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("id", '#nlmap')
        .attr("transform", "translate(" + margin.left + "," + margin.top  + ")");

    var div = d3.select("main").append("div")
            .attr("class", "tooltip")
            .attr("id", "tooltip")
            .style("opacity", 0);

    d3.queue()
        .defer(d3.json, "https://cartomap.github.io/nl/wgs84/provincie_2021.geojson")
        .defer(d3.json, "static/data/data.json")
        .await(ready);

    function ready(error, topo, data) {
        console.log(data)
        console.log(YearID2)
        var DataYear = data.children[yearid].children;
        console.log(data.children[yearid].children);

        for (var i = 0; i<DataYear.length; i++) {

            var ProvinceData = DataYear[i].name;
            if (ProvinceData == "'s-Hertogenbosch") {
                ProvinceData = "Noord-Brabant"
            }
            if (ProvinceData == "FryslÃ¢n") {
                ProvinceData = "Fryslân"
            }
            //console.log(DataYear[i].children)
            var Max = getMax(DataYear[i].children, "votes");

            for (var j = 0; j<topo.features.length; j++) {
                var Province_topo = topo.features[j].properties.statnaam;

                if (ProvinceData == Province_topo) {

                    topo.features[j].properties.PartyName = Max.name;
                    topo.features[j].properties.PartyVotes= Max.votes;
                    console.log(topo.features[j].properties)
                    break;
                }
            }
        };

        // Draw the map

        var center = d3.geoCentroid(topo);
        var scale  = 150;
        var offset = [width/2, height/2];
        var projection = d3.geoMercator().scale(scale).center(center)
            .translate(offset);

        // create the path
        var path = d3.geoPath().projection(projection);

        // using the path determine the bounds of the current map and use
        // these to determine better values for the scale and translation
        var bounds  = path.bounds(topo);
        var hscale  = scale*width  / (bounds[1][0] - bounds[0][0]);
        var vscale  = scale*height / (bounds[1][1] - bounds[0][1]);
        var scale   = (hscale < vscale) ? hscale : vscale;
        var offset  = [width - (bounds[0][0] + bounds[1][0])/2,
                          height - (bounds[0][1] + bounds[1][1])/2];

        // new projection
        projection = d3.geoMercator().center(center)
          .scale(scale).translate(offset);
        path = path.projection(projection);

        var color = d3.scaleOrdinal().range(d3.schemeCategory20c);

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
                var Stream = d.properties.PartyName
                console.log(Stream)
                return color(Stream);
                })
            .style("stroke", "black")
            .style("stroke-width", "0.25")
            .on("mouseover", function(d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                    div.html(function() {

                    return "<strong>" + d.properties.statnaam + "</strong>" + '<br><br>Biggest party: ' + d.properties.PartyName
                   })
                    .style("left", (d3.event.pageX + 50) + "px")
                    .style("top", (d3.event.pageY - 50) + "px");
            })
            .on("mouseout", function(d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });


        d3.selectAll("#yearRange").on("change", function change() {
            console.log("Update - Map: year");

            var YearID = this.value;
            d3.selectAll("#map_box").remove()
            d3.selectAll("#tooltip").remove()
            createNLMap(YearID)
        });
    };

};