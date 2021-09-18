const margin = { top: 40, bottom: 10, left: 120, right: 20 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

d3.csv("pop_qp.csv", d3.autoType).then((csv) => {
  data = csv;
  draw(data);
});

const draw = (data) => {
  // Creates sources <svg> element
  const svg = d3
    .select("#BarChart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  x = d3
    .scaleBand()
    .domain(data.map((d) => d.nom_commune))
    .range([margin.left, width - margin.right])
    .padding(0.1);
  y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.pop_mun)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  xAxis = (g) =>
    g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));

  yAxis = (g) =>
    g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call((g) => g.select(".domain").remove());

  // height = 500;
  // margin = { top: 20, right: 0, bottom: 30, left: 40 };

  const bar = svg
    .append("g")
    .attr("fill", "steelblue")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .style("mix-blend-mode", "multiply")
    .attr("x", (d) => x(d.nom_commune))
    .attr("y", (d) => y(d.pop_mun))
    .attr("height", (d) => y(0) - y(d.pop_mun))
    .attr("width", x.bandwidth());

  const gx = svg.append("g").call(xAxis);

  const gy = svg.append("g").call(yAxis);

  const update = (order) => {
    x.domain(data.sort(order).map((d) => d.nom_commune));

    const t = svg.transition().duration(750);

    bar
      .data(data, (d) => d.nom_commune)
      .order()
      .transition(t)
      .delay((d, i) => i * 20)
      .attr("x", (d) => x(d.nom_commune));

    gx.transition(t)
      .call(xAxis)
      .selectAll(".tick")
      .delay((d, i) => i * 20);
  };
};
