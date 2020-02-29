import 'jquery.flot';
import './jquery.flot.orderBars';

var chartData1 = {
  'iterative': [[1000, 153.39],
                [2000, 30.63],
                [3000, 497.2],
                [4000, 225.4]],

  'linq': [[1000, 478.37],
           [2000, 390.25],
           [3000, 462.0],
           [4000, 411.0]],

  'linqFaster': [[1000, 138.72],
                 [2000, 138.69],
                 [3000, 457.1],
                 [4000, 415.5]]
};

var chartData2 = {
  'iterative': [[153.39, 1000]],
  'linq': [[478.37, 1000]],
  'linqFaster': [[138.72, 1000]],
  'haskell' : [[180.8, 1000]]
};

function timeFormatter(v, axis) {
  return v + " µs ";
};

function loadCharts () {
  $.plot($("#postchart1"),
         [
           { data: chartData1['iterative'], label: "Iterative", color: "#1e90ff",order: 0 },
           { data: chartData1['linq'], label: "LINQ", color: "#ffa500", order:1 },
           { data: chartData1['linqFaster'], label: "LinqFaster", color: "#00fa9a", order:2 }
         ],
         {
           series: {
             bars: { show: true, lineWidth: 5, order: 0 }
           },
           grid: { hoverable: true },
           yaxis: { max: 600, tickFormatter: timeFormatter, ticks: 6 },
           xaxis: {
             autoscaleMargin: 0.05,
             labelWidth: 18,
             ticks: [
               [1000, "First (List)" ],
               [2000, "First (Array)" ],
               [3000, "Where Select (List)" ],
               [4000, "Where Select (Array)" ]
             ]
           },
           legend: { position: 'ne', backgroundOpacity: 0.5 }
         });


  $.plot($("#postchart2"),
         [
           { data: chartData2['iterative'], label: "Iterative", color: "#1e90ff" },
           { data: chartData2['linq'], label: "LINQ", color: "#ffa500" },
           { data: chartData2['linqFaster'], label: "LinqFaster", color: "#00fa9a" },
           { data: chartData2['haskell'], label: "Haskell", color: "#4b0082" }
         ],
         {
           series: {
             bars: { show: true, fill: 0.75, lineWidth: 1, horizontal: true, order: 0 }
           },
           grid: { hoverable: true },
           yaxis: {
             autoscaleMargin: 0.25,
             ticks: [
               [1000, "First (List)" ]
             ]
           },
           xaxis: { max: 500, tickFormatter: timeFormatter, ticks: 4 },
           legend: { position: 'ne', backgroundOpacity: 0.5 }
         });
};

$(document).ready(loadCharts);
