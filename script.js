// using d3 for convenience
var main = d3.select("main");
var scrolly = main.select("#scrolly");
var figure = scrolly.select("figure");
var article = scrolly.select("article");
var step = article.selectAll(".step");

////////////////////////////////////////////////////////////////////////////////
//                             GRAPHICS                                       //
////////////////////////////////////////////////////////////////////////////////
const margin = { top: 40, bottom: 200, left: 120, right: 20 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const default_bar_color = "#69b3a2";

let current_data;
let transition;

const svg = figure
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// X axis
const x = d3.scaleBand().range([0, width]).padding(0.2);

const xAxis = svg.append("g").attr("transform", `translate(0,${height})`);

// Add Y axis
const y = d3.scaleLinear().range([height, 0]);

const yAxis = svg.append("g").attr("class", "myYaxis");

const draw = (data, xName, yName) => {
  // x.domain(data.map((d) => d[xName]));
  x.domain(current_data.sort((d) => d["pop_com"]).map((d) => d[xName]));

  xAxis
    .transition()
    .duration(800)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  y.domain([0, d3.max(data, (d) => d[yName])]).nice();
  yAxis.transition().duration(1000).call(d3.axisLeft(y));

  // Bars
  svg
    .selectAll("mybar")
    .data(data)
    .join("rect")
    .attr("x", (d) => x(d[xName]))
    .attr("width", x.bandwidth())
    .attr("fill", default_bar_color)
    // no bar at the beginning thus:
    .attr("height", (d) => height - y(0)) // always equal to 0
    .attr("y", (d) => y(0));

  // Animation
  svg
    .selectAll("rect")
    .transition()
    .duration(800)
    .attr("y", (d) => y(d[yName]))
    .attr("height", (d) => height - y(d[yName]))
    .delay((d, i) => {
      return i * 10;
    });
};

const updateXOrder = (order, xName, t) => {
  x.domain(
    current_data.sort((a, b) => a[order] - b[order]).map((d) => d[xName])
  );

  svg
    .selectAll("rect")
    .data(current_data, (d) => d[xName])
    .order()
    .transition(t)
    .delay((d, i) => i * 20)
    .attr("x", (d) => x(d[xName]));

  xAxis
    .transition(t)
    .call(d3.axisBottom(x))
    .selectAll(".tick")
    .delay((d, i) => i * 20);
};

const changeColorOnThreshold = (
  threshold,
  color_below,
  color_above,
  yName,
  t
) => {
  svg
    .selectAll("rect")
    .transition(t)
    .style("fill", (d) => (d[yName] >= threshold ? color_above : color_below));
};

const highlightBars = (
  bars,
  color,
  yName,
  t
) => {
  svg
    .selectAll("rect")
    .transition(t)
    .style("fill", (d) => (bars.includes(d[yName]) ? color : "grey"));
};

// A function that create / update the plot for a given variable:
const updateData = (xDataName, yDataName, t) => {
  // X axis
  x.domain(current_data.map((d) => d[xDataName]));
  xAxis.transition(t).call(d3.axisBottom(x));

  // Add Y axis
  y.domain([0, d3.max(current_data, (d) => +d[yDataName])]);
  yAxis.transition(t).call(d3.axisLeft(y));

  // variable u: map current_data to existing bars
  const u = svg.selectAll("rect").data(current_data);

  // update bars
  u.join("rect")
    .transition(t)
    .attr("x", (d) => x(d[xDataName]))
    .attr("y", (d) => y(d[yDataName]))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d[yDataName]))
    .attr("fill", default_bar_color);
};

////////////////////////////////////////////////////////////////////////////////
//                             SCROLLAMA                                      //
////////////////////////////////////////////////////////////////////////////////
// initialize the scrollama
var scroller = scrollama();

// generic window resize listener event
function handleResize() {
  // 1. update height of step elements
  var stepH = Math.floor(window.innerHeight * 0.75);
  step.style("height", stepH + "px");

  var figureHeight = window.innerHeight / 2;
  var figureMarginTop = (window.innerHeight - figureHeight) / 2;

  figure
    .style("height", figureHeight + "px")
    .style("top", figureMarginTop + "px");

  // 3. tell scrollama to update new element dimensions
  scroller.resize();
}

// scrollama event handlers
function handleStepEnter(response) {
  console.log(response);
  // response = { element, direction, index }

  // add color to current step only
  step.classed("is-active", function (d, i) {
    return i === response.index;
  });

  // update graphic based on step
  switch (response.element.dataset.step) {
    case "positions":
      figure.select("img").remove();
      figure.append("img").attr("src", "./img/emplacements.png");
      break;
    case "qp_centre":
      figure.select("img").remove();
      figure.append("img").attr("src", "./img/qp_centre.png");
      break;
    case "communes_centre":
      figure.select("img").remove();
      figure.append("img").attr("src", "./img/communes_centre.png");
      break;
    case "pop_commune":
      figure.select("img").remove();
      // Parse the Data
      d3.csv("./data/pop_commune.csv", d3.autoType).then((data) => {
        current_data = data;
        draw(data, "nom_commune", "pop_com");
      });
      break;
    case "petites_communes":
      transition = svg.transition().duration(750);
      changeColorOnThreshold(41000, "blue", default_bar_color, "pop_com", transition);
      updateXOrder("pop_com", "nom_commune", transition);
      break;
    case "pop_qp":
      transition = svg.transition().duration(1000);
      updateData("nom_commune", "pop_mun", transition)
      updateXOrder("pop_mun", "nom_commune", transition);
      break;
    case "tx_pop_qp":
      transition = svg.transition().duration(1000);
      updateData("nom_commune", "tx_pop", transition)
      updateXOrder("tx_pop", "nom_commune", transition);
      break;
    case "grand_combe":
      transition = svg.transition().duration(1000);
      highlightBars(["La Grand-Combe"], "red", "nom_commune", transition)
      break;
    case "tx_pop_toulouse":
      transition = svg.transition().duration(1000);
      highlightBars(["Toulouse"], "red", "nom_commune", transition)
      break;
  }
}

function setupStickyfill() {
  d3.selectAll(".sticky").each(function () {
    Stickyfill.add(this);
  });
}

function init() {
  setupStickyfill();

  // 1. force a resize on load to ensure proper dimensions are sent to scrollama
  handleResize();

  // 2. setup the scroller passing options
  // 		this will also initialize trigger observations
  // 3. bind scrollama event handlers (this can be chained like below)
  scroller
    .setup({
      step: "#scrolly article .step",
      offset: 0.33,
      debug: false,
    })
    .onStepEnter(handleStepEnter);

  // setup resize event
  window.addEventListener("resize", handleResize);
}

// kick things off
init();
