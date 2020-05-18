// data load
// reference for d3.autotype: https://github.com/d3/d3-dsv#autoType
d3.csv("../../data/narrative/barchart.csv", d3.autoType).then(data => {
  console.log(data);

  /** CONSTANTS */
  // constants help us reference the same values throughout our code
  const width = window.innerWidth,
    height = window.innerHeight,
    paddingInner = 0.5,
    margin = { top: 20, bottom: 20, left: 20, right: 20 };

  /** SCALES */
  // reference for d3.scales: https://github.com/d3/d3-scale
  const xScale = d3
    .scaleBand()
    .domain(data.map(d => d.Income))
    .range([margin.left, width - margin.right])
    .paddingInner(paddingInner);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.Average2018CCD)])
    .range([height - margin.bottom, margin.top]);

  // reference for d3.axis: https://github.com/d3/d3-axis
  const xAxis = d3.axisBottom(xScale).ticks(data.length);
  const yAxis = d3.axisLeft(yScale); 

  /** MAIN CODE */
  const svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // append rects
  const rect = svg
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("y", d => yScale(d.Average2018CCD))
    .attr("x", d => xScale(d.Income))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - margin.bottom - yScale(d.Average2018CCD))
    .attr("fill", "green")

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
    .attr("dy", "1em");

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(xAxis);
    
    svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(yAxis);
});;