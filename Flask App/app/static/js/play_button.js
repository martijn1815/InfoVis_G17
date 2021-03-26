// Play button //
function updateSlider(objectID) {
    var b = d3.select(objectID);
    var t = (+b.property("value") + 1) % (+b.property("max") + 1);
    if (t == 0) { t = +b.property("min"); }
    b.property("value", t).dispatch('change');
    output.innerHTML = yearArray[t];
}

function buttonPlayPress() {
    if(state=='play'){
        state = 'pause';
        d3.select("#button_play i").attr('class', "fa fa-play");

        clearInterval (myTimer);
    }
    else if(state=='pause'){
        state = 'play';
        d3.select("#button_play i").attr('class', "fa fa-pause");

        clearInterval (myTimer);
        updateSlider("#yearRange");
        myTimer = setInterval (function() {
            updateSlider("#yearRange");
        }, 2000);
    }
    console.log("button play pressed, was "+state);
}
////////////////