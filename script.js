const margin = { top: 40, bottom: 100, left: 120, right: 20 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Parse the Data
d3.csv("pop_commune.csv", d3.autoType).then((data) =>
  draw(data, "nom_commune", "pop_mun")
);

const draw = (data, xName, yName) => {
  // append the svg object to the body of the page
  const svg = d3
    .select("#BarChart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // X axis
  const x = d3
    .scaleBand()
    .range([0, width])
    .domain(data.map((d) => d[xName]))
    .padding(0.2);

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  // Add Y axis
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d[yName])])
    .nice()
    .range([height, 0]);

  svg.append("g").call(d3.axisLeft(y));

  // Bars
  svg
    .selectAll("mybar")
    .data(data)
    .join("rect")
    .attr("x", (d) => x(d[xName]))
    .attr("width", x.bandwidth())
    .attr("fill", "#69b3a2")
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
