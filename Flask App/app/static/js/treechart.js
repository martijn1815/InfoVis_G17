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
    //TO DO
};
