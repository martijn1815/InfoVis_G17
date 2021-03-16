console.log('testtest')
function createNLMap() {
    // Setting the margin, height and width variables

    // Adding a svg
    var svg = d3.select("#map_netherlands")
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top  + ")");

    // Map and projection
    //var projection = d3.geoNaturalEarth()
    //    .scale(width / 1.3 / Math.PI)
      //  .translate([width / 2, height / 2])


    d3.queue()
        .defer(d3.json, "https://cartomap.github.io/nl/wgs84/provincie_2021.geojson")
        .defer(d3.csv, "static/data/netherlands_map.csv")
        .await(ready);

    function ready(error, topo, data) {



        for (var i = 0; i<data.length; i++) {
            var Province = data[i].Regio

            var Party = data[i].Partij
            var Stream = data[i].Stroming
            if (Province == "'s-Hertogenbosch") {
                Province = "Noord-Brabant"
            }
            if (Province == "FryslÃ¢n") {
                Province = "Fryslân"
            }
            for (var j = 0; j<topo.features.length; j++) {
                var Province_topo = topo.features[j].properties.statnaam

                if (Province == Province_topo) {
                 console.log(Province)
                    //console.log(Province)
                    //console.log(Province_topo)
                    topo.features[j].properties.Party = Party
                    topo.features[j].properties.Stream = Stream
                    break;
                }

            }
        }

        // Draw the map

        var center = d3.geoCentroid(topo)
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

        var color = d3.scaleOrdinal()
                .range(["rgb(255, 0, 0)", "rgb(51, 102, 255)", "rgb(0, 204, 0)", "rgb(128, 128, 128)"])
                .domain(['Rechts', 'Centrum', 'Links', 'Overig']);

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
                var Stream = d.properties.Stream
                return color(Stream);
                })
            .style("stroke", "black")
            .style("stroke-width", "0.25");
            };

};