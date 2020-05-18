export function chart5() {
// load in csv
// data load
// reference for d3.autotype: https://github.com/d3/d3-dsv#autoType
d3.csv("../../data/narrative/barchart.csv", d3.autoType).then(data => {
  console.log(data);

  /** CONSTANTS */
  // constants help us reference the same values throughout our code
  const width = window.innerWidth * 0.7,
    height = window.innerHeight / 2,
    paddingInner = 0.5,
    margin = { top: 40, bottom: 40, left: 100, right: 100 };

  /** SCALES */
  // reference for d3.scales: https://github.com/d3/d3-scale
  const xScale = d3
    .scaleBand()
    .domain(data.map(d => d.Income))
    .range([margin.left, width - margin.right])
    .paddingInner(paddingInner);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.Rate)])
    .range([height - margin.bottom, margin.top]);

  // reference for d3.axis: https://github.com/d3/d3-axis
  const xAxis = d3.axisBottom(xScale).ticks(data.length);
  const yAxis = d3.axisLeft(yScale); 

  /** MAIN CODE */
  const svg = d3
    .select("#d3-container-5")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // append rects
  const rect = svg
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("y", d => yScale(d.Rate))
    .attr("x", d => xScale(d.Income))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - margin.bottom - yScale(d.Rate))
    .attr("fill", "#1DB79B")

  // append text
  const text = svg
    .selectAll("text")
    .data(data)
    .join("text")
    .attr("class", "label")
    // this allows us to position the text in the center of the bar
    .attr("x", d => xScale(d.Income) + (xScale.bandwidth() / 2))
    .attr("y", d => yScale(d.Rate))
    .text(d => d.Rate)
    .attr("dy", "1.5em");

  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(xAxis);

    svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(yAxis);
});
      
        }
