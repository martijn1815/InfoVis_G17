const treemap = d3.treemap();

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
    //console.log(data);

    //var YearID = this.value;
    //console.log(YearID);

    //YearID = getID(data.children, year);
     RegionID = getID(data.children[YearID].children, "Totaal");

     const newRoot = d3.hierarchy(data.children[YearID].children[RegionID], (d) => d.children)
                       .sum((d) => d.votes);

     node.data(treemap(newRoot).leaves())
         .transition()
         .duration(1000)
         .style("left", (d) => d.x0 + "px")
         .style("top", (d) => d.y0 + "px")
         .style("width", (d) => Math.max(0, d.x1 - d.x0 - 1) + "px")
         .style("height", (d) => Math.max(0, d.y1 - d.y0  - 1) + "px")
}


function createTreemap(data) {
    console.log("TEST: treemap called");

    const margin_tm = {top: 10, right: 5, bottom: 10, left: 0},
          width_tm = 480 - margin_tm.left - margin_tm.right,
          height_tm = 500 - margin_tm.top - margin_tm.bottom;

    const color = d3.scaleOrdinal().range(d3.schemeSet1);
    treemap.size([width_tm, height_tm]);

    const div = d3.select("#treemap")
                  .style("position", "relative")
                  .style("width", (width_tm + margin_tm.left + margin_tm.right) + "px")
                  .style("height", (height_tm + margin_tm.top + margin_tm.bottom) + "px")
                  .style("left", margin_tm.left + "px")
                  .style("top", margin_tm.top + "px");

    //var YearID = getID(data.children, 2017);
    var YearID = 27;
    var RegionID = getID(data.children[YearID].children, "Totaal");

    const root = d3.hierarchy(data.children[YearID].children[RegionID], (d) => d.children)
                   .sum((d) => d.votes);

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

    return node;
};