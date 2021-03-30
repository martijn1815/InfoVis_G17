
function createStackedchart(value) {
    d3.select("#chartbox").remove()

    console.log("TEST: Stackedchart called");
    console.log(value)
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 0, bottom: 20, left: 70},
        width = 960 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    // append the svg object to the body of the page


    var svg = d3.select("#stacked_bar_chart")
                .append("svg")
                .attr("id", "chartbox")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Parse the Data
    d3.csv("static/data/data_stack_v3.csv", function(data) {
    //d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/5_OneCatSevNumOrdered_wide.csv", function(data) {

        /////////////
        // GENERAL //
        /////////////

        //console.log(data);

        // List of groups = header of the csv files
        var keys = data.columns.slice(2);

        if (value == "percentages") {
            for (var i=0; i<data.length;i++) {
                //console.log(data[i])
                var Total_votes = parseInt(data[i][keys[0]]) + parseInt(data[i][keys[1]]) + parseInt(data[i][keys[2]]) + parseInt(data[i][keys[3]])
                //console.log(Total_votes)
                for (j=0; j<keys.length;j++) {
                    data[i][keys[j]] = (data[i][keys[j]] / Total_votes) * 100
                    //console.log(keys[j])
                };
            };
        };

        console.log(data);
        // color palette
        //var color = d3.scaleOrdinal()
        //              .domain(keys)
        //              .range(d3.schemeSet1);

        //stack the data?
        var stackedData = d3.stack()
                            .keys(keys)
                            (data);

        //////////
        // AXIS //
        //////////

        // Add X axis
        var x = d3.scaleLinear()
                  .domain(d3.extent(data, function(d) { return d.Year; }))
                  .range([ 0, width ]);
        var xAxis = svg.append("g")
                       .attr("transform", "translate(0," + height + ")")
                       .call(d3.axisBottom(x).ticks(7));

        // Add X axis label:
        svg.append("text")
           .attr("text-anchor", "end")
           .attr("x", width)
           .attr("y", height+40 )
           .text("Time (year)");

         // Add Y axis label:
        svg.append("text")
           .attr("text-anchor", "end")
           .attr("x", 0)
           .attr("y", -20 )
           .text("Amount of votes")
           .attr("text-anchor", "start");

        // Add Y axis

        if (value == "percentages") {
        var y = d3.scaleLinear()
                  .domain([0, 100])
                  .range([ height, 0 ]);
        } else {
        var y = d3.scaleLinear()
              .domain([0, 11000000])
              .range([ height, 0 ]);
        }
        svg.append("g")
           .call(d3.axisLeft(y).ticks(5));

        ////////////////////////
        // BRUSHING AND CHART //
        ////////////////////////

        // Add a clipPath: everything out of this area won't be drawn.
        var clip = svg.append("defs").append("svg:clipPath")
                      .attr("id", "clip")
                      .append("svg:rect")
                      .attr("width", width )
                      .attr("height", height )
                      .attr("x", 0)
                      .attr("y", 0);

        // Add brushing
        var brush = d3.brushX()                 // Add the brush feature using the d3.brush function
                      .extent( [ [0,0], [width,height] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
                      .on("end", updateChart); // Each time the brush selection changes, trigger the 'updateChart' function

        // Create the scatter variable: where both the circles and the brush take place
        var areaChart = svg.append('g')
                           .attr("clip-path", "url(#clip)");

        // Area generator
        var area = d3.area()
                     .x(function(d) { return x(d.data.Year); })
                     .y0(function(d) { return y(d[0]); })
                     .y1(function(d) { return y(d[1]); });

        // Show the areas
        areaChart .selectAll("mylayers")
                  .data(stackedData)
                  .enter()
                  .append("path")
                  .attr("class", function(d) { return "myArea " + d.key.replace(/\s/g, "") })
                  .style("fill", function(d) { return color(d.key); })
                  .attr("d", area);

        // Add the brushing
        areaChart.append("g")
                 .attr("class", "brush")
                 .call(brush);

        var idleTimeout;
        function idled() { idleTimeout = null; }

        // A function that update the chart for given boundaries
        function updateChart() {
            extent = d3.event.selection;

            // If no selection, back to initial coordinate. Otherwise, update X axis domain
            if (!extent) {
              if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
              x.domain(d3.extent(data, function(d) { return d.Year; }));
            } else {
              x.domain([ x.invert(extent[0]), x.invert(extent[1]) ]);
              areaChart.select(".brush").call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
            }

            // Update axis and area position
            xAxis.transition().duration(1000).call(d3.axisBottom(x).ticks(5));
            areaChart.selectAll("path")
                     .transition().duration(1000)
                     .attr("d", area);
        }

        /////////////////////
        // HIGHLIGHT GROUP //
        /////////////////////

        // What to do when one group is hovered
        var highlight = function(d){
            console.log(d);
            // reduce opacity of all groups
            d3.selectAll(".myArea").style("opacity", .1);
            // expect the one that is hovered
            d3.select("."+d.replace(/\s/g, "")).style("opacity", 1);
        }

        // And when it is not hovered anymore
        var noHighlight = function(d){
            d3.selectAll(".myArea").style("opacity", 1);
        }

        ////////////
        // LEGEND //
        ////////////

        d3.select(".legend4 svg").remove();

        var svgLegned4 = d3.select(".legend4").append("svg")
                           .attr("width", 350)
                           .attr("height", 15)
                           .attr("right", 0)

        var dataL = 0;
        var offset = 80;

        var legend4 = svgLegned4.selectAll('.legends4')
            .data(keys)
            .enter().append('g')
            .attr("class", "legends4")
            .attr("transform", function (d, i) {
             if (i === 0) {
                dataL = d.length + offset
                return "translate(0,0)"
             } else {
                var newdataL = dataL
                dataL +=  d.length + offset
                return "translate(" + (newdataL) + ",0)"
             }
        });

        legend4.append('rect')
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", function(d){ return color(d)})
            .on("mouseover", highlight)
            .on("mouseleave", noHighlight);

        legend4.append('text')
            .attr("x", 20)
            .attr("y", 10)
        //.attr("dy", ".35em")
            .text(function(d){ return d})
            .attr("class", "textselected")
            .style("text-anchor", "start")
            .style("font-size", 15)
            .on("mouseover", highlight)
            .on("mouseleave", noHighlight);
    });
}
