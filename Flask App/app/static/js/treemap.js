const treemap = d3.treemap();

var tooltip = d3.select("main").append("div")
                .attr("class", "tooltip")
                .attr("id", "tooltip_treemap")
                .style("opacity", 0);


function getID(d, x) {
    var ID = 0;
    for (var i = 0; i < Object.values(d).length; i++) {
        if (d[i].name == x) {
            ID = i;
        }
    }
    return ID
}


function updateTreemap(data, node, YearID) {
    console.log("Update - Treemap: year");

    //var YearID = this.value;
    //console.log(YearID);

    //YearID = getID(data.children, year);
     RegionID = getID(data.children[YearID].children, selectedRegion);

     const newRoot = d3.hierarchy(data.children[YearID].children[RegionID], (d) => d.children)
                       .sum((d) => d.votes2);

     console.log(data.children[YearID].children[RegionID]);

     node.data(treemap(newRoot).leaves());

     node.transition()
         .duration(1000)
         .style("left", (d) => d.x0 + "px")
         .style("top", (d) => d.y0 + "px")
         .style("width", (d) => Math.max(0, d.x1 - d.x0 - 1) + "px")
         .style("height", (d) => Math.max(0, d.y1 - d.y0  - 1) + "px");

     node.on("mouseover", function(d) {
            tooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
            tooltip.html(function() {
                        return "<strong>" + d.data.name + "</strong>" + '<br>Political movement: ' + d.parent.data.name + '<br>Votes: ' + d.data.votes.toLocaleString('en');
                    })
                   .style("left", (d3.event.pageX + 50) + "px")
                   .style("top", (d3.event.pageY - 50) + "px");
         })
         .on("mouseout", function(d) {
            tooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
         });
}


function createTreemap(data) {
    console.log("TEST: treemap called");

    const margin_tm = {top: 10, right: 0, bottom: 10, left: 5},
          width_tm = 480 - margin_tm.left - margin_tm.right,
          height_tm = 500 - margin_tm.top - margin_tm.bottom;

    //const color = d3.scaleOrdinal().range(d3.schemeSet1);
    treemap.size([width_tm, height_tm]);

    const div = d3.select("#treemap")
                  .style("position", "relative")
                  .style("width", (width_tm + margin_tm.left + margin_tm.right) + "px")
                  .style("height", (height_tm + margin_tm.top + margin_tm.bottom) + "px")
                  .style("left", margin_tm.left + "px")
                  .style("top", margin_tm.top + "px");

    //var YearID = getID(data.children, 2017);
    var RegionID = getID(data.children[YearID].children, selectedRegion);

    const root = d3.hierarchy(data.children[YearID].children[RegionID], (d) => d.children)
                   .sum((d) => d.votes2);

    const tree = treemap(root);

    const node = div.datum(root).selectAll(".node")
                    .data(tree.leaves())
                    .enter().append("div")
                    .attr("class", "node")
                    .style("left", (d) => d.x0 + "px")
                    .style("top", (d) => d.y0 + "px")
                    .style("width", (d) => Math.max(0, d.x1 - d.x0 - 1) + "px")
                    .style("height", (d) => Math.max(0, d.y1 - d.y0  - 1) + "px")
                    .style("background", (d) => color(d.parent.data.name))
                    .text((d) => d.data.name);

    node.on("mouseover", function(d) {
            tooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
            tooltip.html(function() {
                        return "<strong>" + d.data.name + "</strong>" +
                               '<br>Political movement: <strong>' + d.parent.data.name + "</strong>" +
                               '<br>Votes: <strong>' + d.data.votes.toLocaleString('en') + "</strong>";
                   })
                   .style("left", (d3.event.pageX + 50) + "px")
                   .style("top", (d3.event.pageY - 50) + "px");
        })
        .on("mouseout", function(d) {
           tooltip.transition()
                  .duration(500)
                  .style("opacity", 0);
        });

    return node;
};