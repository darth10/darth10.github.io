(function() {

  var chartData = {
    'scalaFiboList': [[1, 9],
                      [10000, 70],
                      [20000, 85],
                      [30000, 141],
                      [40000, 182],
                      [50000, 235]],

    'scalaFiboLast': [[1, 10],
                      [10000, 63],
                      [20000, 87],
                      [30000, 174],
                      [40000, 243],
                      [50000, 555]],

    'clojureFiboList': [[1, 0],
                        [10000, 1],
                        [20000, 1],
                        [30000, 1],
                        [40000, 1],
                        [50000, 1]],

    'clojureFiboLast': [[1, 0],
                        [10000, 144],
                        [20000, 615],
                        [30000, 980],
                        [40000, 1121],
                        [50000, 1450]]
  };

  function timeFormatter(v, axis) {
    return (v.toFixed(2) / 1000) + " s ";
  };

  function nFormatter(v, axis) {
    return (v / 1000) + "k";
  };

  function loadCharts () {

    $.plot($("#postchart"),
           [
             { data: chartData['scalaFiboList'], label: "fiboList(x)", color: "#aaff00"},
             { data: chartData['scalaFiboLast'], label: "fiboLast(x)", color: "#00ff00" },
             { data: chartData['clojureFiboList'], label: "(fibo-list x)", color: "#00ccee" },
             { data: chartData['clojureFiboLast'], label: "(fibo-last x)", color: "#0066ff" },
           ],
           {
             series: {
               lines: { show: true },
               points: { show: true }
             },
             grid: { hoverable: true },
             xaxis: { max: 50500, tickFormatter: nFormatter },
             yaxis: { min: -50, max: 1550, tickFormatter: timeFormatter },
             legend: { position: 'nw' }
           });
  };

  $(document).ready(loadCharts);
})();
