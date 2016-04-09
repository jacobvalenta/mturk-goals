// ==UserScript==
// @name         mTurk Goals
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Add goals and progess bars to the mTurk Dashboard and Status pages.
// @author       Jacob Valenta
// @include      https://www.mturk.com/mturk/dashboard
// @include      https://www.mturk.com/mturk/status
// @grant        none
// ==/UserScript==

var setGoal = function(newGoal){
    localStorage.setItem("mturk-goal", parseFloat(newGoal).toFixed(2).toString());
};

var getGoal = function(){
    if (localStorage.getItem("mturk-goal") === null) {
        setGoal(10.00);
        return 10.00;
    }else{
        return parseFloat(localStorage.getItem("mturk-goal"));
    }
};

var percentColors = [
    { pct: 0.0, color: { r: 0xc0, g: 0x60, b: 0x60 } },
    { pct: 0.5, color: { r: 0xc0, g: 0xc0, b: 0x60 } },
    { pct: 1.0, color: { r: 0x60, g: 0xc0, b: 0x60 } } ];

var getColorForPercentage = function(pct) {
    for (var i = 1; i < percentColors.length - 1; i++) {
        if (pct < percentColors[i].pct) {
            break;
        }
    }
    var lower = percentColors[i - 1];
    var upper = percentColors[i];
    var range = upper.pct - lower.pct;
    var rangePct = (pct - lower.pct) / range;
    var pctLower = 1 - rangePct;
    var pctUpper = rangePct;
    var color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    };
    return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
};


(function() {
    'use strict';

    var page, width, metrics, goal;
    if (location.pathname == "/mturk/dashboard"){
        page = "dashboard";
        width = "200";
    }
    else if (location.pathname == "/mturk/status"){
        page = "status";
        width = "100";
    }

    goal = getGoal();

    if (page == "dashboard"){
        metrics = document.querySelectorAll(".metrics-table")[3].querySelectorAll("tr");

        // Add a change goal button to the bottom of the Dashboard
        var change_goal = document.createElement("td");
        change_goal.innerHTML = 'Goal: <input id="goal" style="width:50px;" value="'+goal.toFixed(2)+'" />&nbsp;<input id="goal-button" type="button" value="Set" style="border: 2px outset buttonface; background-color: buttonface" />';
        var last_td = metrics[metrics.length - 1].querySelectorAll("td")[0];
        last_td.setAttribute("colspan", "9");

        metrics[metrics.length -1].insertBefore(change_goal, last_td);

        // Add click callback
        document.getElementById("goal-button").addEventListener("click", function(){
            // Set goal from input and refresh page
            setGoal(document.getElementById("goal").value);
            location.reload();
        });
    }
    else if (page == "status"){
        metrics = document.querySelectorAll('table')[6].querySelectorAll("tr");
    }

    for (var i = 1; i < metrics.length - 1; ++i) {
        var row = metrics[i];
        var earned = parseFloat(row.querySelectorAll("td:last-child")[0].innerText.replace('$', ''));

        var fraction = (earned / goal);

        var prog = fraction * width;

        var progress_container = document.createElement('div');
        var progress = document.createElement('div');
        var progress_label = document.createElement('div');

        // TODO: Add actual CSS and classes to DOM.
        progress_container.setAttribute("style", "display: inline-block; float: right; width: " + width + "px; height: 6px; background-color: #eee; border: 1px solid #888; margin-top: 3px; border-radius: 1px");
        progress.setAttribute("style", "width: " + prog + "px; max-width: "+width+"px; height: 100%; background-color: "+ getColorForPercentage(fraction) + ";");

        progress_label.setAttribute("style", "float: right; display: inline-block;");
        progress_label.innerHTML = (Math.round((fraction * 100) * 10) / 10).toFixed(1).toString() + "%&nbsp;&nbsp;";

        progress_container.appendChild(progress);

        row.querySelectorAll("td")[0].appendChild(progress_label).appendChild(progress_container);
    }
})();