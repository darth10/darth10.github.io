var chartData = {
  'scalaFiboList': [ [1, 10],
		     [1000, 20],
		     [5000, 27],
		     [10000, 56],
		     [25000, 145],
		     [50000, 843] ],

  'scalaFiboLast': [ [1, 8],
		     [1000, 21],
		     [5000, 25],
		     [10000, 75],
		     [25000, 147],
		     [50000, 572] ],

  'clojureFiboList': [ [1, 0],
		       [1000, 200],
		       [5000, 400],
		       [10000, 600],
		       [25000, 800],
		       [50000, 1000] ],

  'clojureFiboLast': [ [1, 0],
		       [1000, 300],
		       [5000, 600],
		       [10000, 1200],
		       [25000, 2400],
		       [50000, 4800] ]
};

function showChartTooltip(x, y, contents) {
  $('<div id="tooltip">' + contents + '</div>').css( {
    position: 'absolute',
    display: 'none',
    top: y + 5,
    left: x + 5,
    border: '1px solid #bbb',
    padding: '2px',
    'background-color': '#eef',
    opacity: 0.80
  }).appendTo("body").fadeIn(200);
};

function timeFormatter(v, axis) {
  return (v.toFixed(2) / 1000) + " s ";
};

function nFormatter(v, axis) {
  return (v / 1000) + "k";
};

function onChartHover(event, pos, item) {
  var previousPoint = null;
  $("#x").text(pos.x);
  $("#y").text(pos.y);

  if (item) {
    if (previousPoint != item.dataIndex) {
      previousPoint = item.dataIndex;

      $("#tooltip").remove();
      var x = item.datapoint[0];
      var y = item.datapoint[1];

      showChartTooltip(item.pageX, item.pageY,
		       "Time taken for " + item.series.label + " with x=" + x + " is " + y + " ms" );
    }
  }
  else {
    $("#tooltip").remove();
    previousPoint = null;
  };
};

function loadCharts () {
  var chartId = "#postchart"
  var plot = $.plot($(chartId),
		    [ { data: chartData['scalaFiboList'], label: "fiboList(x)", color: "#aaff00"},
		      { data: chartData['scalaFiboLast'], label: "fiboLast(x)", color: "#00ff00" },
		      { data: chartData['clojureFiboList'], label: "(fibo-list x)", color: "#0066ff" },
		      { data: chartData['clojureFiboLast'], label: "(fibo-last x)", color: "#00ccee" },
		    ],
		    { series: {
			lines: { show: true },
			points: { show: true }
		      },
		      grid: { hoverable: true },
		      xaxis: { tickFormatter: nFormatter },
		      yaxis: { tickFormatter: timeFormatter },
		      legend: { position: 'nw' }
		    });

  $(chartId).bind("plothover", onChartHover);
};

$(loadCharts);
