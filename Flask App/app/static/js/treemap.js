function get_info_on_var(variable) {
    var rel_meta = meta_data.find(function(d) {
        return d.Variabele == variable;
    })

    var label = rel_meta['Label_1'];
    var definition = rel_meta['Definition'];

    return [label, definition]
}

function updateArea(selectObject) {
    selected_area = selectObject.value;
    updatePlot();
};

function updatePlot() {
    var fetch_url = "/d3_plot_data?area_name=" + selected_area;
    fetch(fetch_url)
        .then(function(response) { return response.json(); })
        .then((data) => {
            plot_data = data;
            removeOldChart();
            createNewChart();
    });
}

function removeOldChart() {
    d3.select("#chart_group")
        .remove();
}

function createNewChart() {
    var svg = d3.select(container_id)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Read data
    d3.csv('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_hierarchy_1level.csv', function(data) {

        // stratify the data: reformatting for d3.js
        var root = d3.stratify()
                     .id(function(d) { return d.name; })  // Name of the entity (column name is name in csv)
                     .parentId(function(d) { return d.parent; })  // Name of the parent (column name is parent in csv)
                     (data);
        root.sum(function(d) { return +d.value });  // Compute the numeric value for each entity

        // Then d3.treemap computes the position of each element of the hierarchy
        // The coordinates are added to the root object above
        d3.treemap()
          .size([width, height])
          .padding(4)
          (root);

        console.log(root.leaves());

        // use this information to add rectangles:
        svg.selectAll("rect")
           .data(root.leaves())
           .enter()
           .append("rect")
           .attr('x', function (d) { return d.x0; })
           .attr('y', function (d) { return d.y0; })
           .attr('width', function (d) { return d.x1 - d.x0; })
           .attr('height', function (d) { return d.y1 - d.y0; })
           .style("stroke", "black")
           .style("fill", "#69b3a2");

        // and to add the text labels
        svg.selectAll("text")
           .data(root.leaves())
           .enter()
           .append("text")
           .attr("x", function(d){ return d.x0+10})    // +10 to adjust position (more right)
           .attr("y", function(d){ return d.y0+20})    // +20 to adjust position (lower)
           .text(function(d){ return d.data.name})
           .attr("font-size", "15px")
           .attr("fill", "white");
    })
};
