/**
 * CONSTANTS AND GLOBALS
 * */
const width = window.innerWidth * 0.8,
  height = window.innerHeight * 0.8,
  margin = { top: 40, bottom: 50, left: 50, right: 50 },
  radius = 0.2;

/** these variables allow us to access anything we manipulate in
 * init() but need access to in draw().
 * All these variables are empty before we assign something to them.*/
let svg;
let xScale;
let yScale;

/**
 * APPLICATION STATE
 * */
let state = {
  data: [],
  selectedIG: "All",
  selectedRegion: "All"
};

/**
 * LOAD DATA
 * */
d3.csv("../../data/narrative/projectdata.csv", d3.autoType).then(raw_data => {
  console.log("raw_data", raw_data);
  state.data = raw_data;
  init();
});

/**
 * INITIALIZING FUNCTION
 * this will be run *one time* when the data finishes loading in
 * */
function init() {
  // SCALES
  xScale = d3
    .scaleLinear()
    .domain(d3.extent(state.data, d => d.CCVS))
    .range([margin.left, width - margin.right]);

  yScale = d3
    .scaleLinear()
    .domain(d3.extent(state.data, d => d.NMR))
    .range([height - margin.bottom, margin.top]);

  // AXES
  const xAxis = d3.axisBottom(xScale).ticks(5); // CHANGE THE TICKS ON THE AXIS LIKE THIS -- you can use .tick(5) or the code .tickvalues(INSERT VALUE X,Y,Z that you want here) to define exact values
  const yAxis = d3.axisLeft(yScale).tickValues([-10,5,0,5,10]); // CHANGE THE TICKS ON THE AXIS HERE

  // create an svg element in our main `d3-container` element
  svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // add the xAxis
  svg
    .append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0,${height - margin.top})`)
    .call(xAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("x", "50%")
    .attr("dy", "3em")
    .text("Climate Change Vulnerability Score");

  // add the yAxis
  svg
    .append("g")
    .attr("class", "axis y-axis")
    .attr("transform", `translate(${margin.right},0)`)
    .call(yAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("y", "60%")
    .attr("dx", "-3em")
    .attr("writing-mode", "vertical-lr")
    .text("Net Migration Rate");

  draw(); // calls the draw function
}

/**
 * DRAW FUNCTION
 * we call this everytime there is an update to the data/state
 * */
function draw() {
  // filter the data for the selected IG
  let filteredData = state.data;
  // if there is a selectedIG, filter the data before mapping it to our elements
  if (state.selectedIG !== "All" && state.selectedRegion != "All") {
    filteredData = state.data.filter(d => d.IG === state.selectedIG && d.Region === state.selectedRegion);
  }

  const dot = svg
    .selectAll(".dot")
    .data(filteredData, d => d.name) // use `d.name` as the `key` to match between HTML and data elements
    .join(
      enter =>
        // enter selections -- all data elements that don't have a `.dot` element attached to them yet
        enter
          .append("circle")
          .attr("class", "dot") // Note: this is important so we can identify it in future updates
          .attr("opacity", 1.0)
          .attr("fill", d => {             
            if (d.IG === "Low Income") return "#89DF9F";
            else if (d.IG === "Lower Middle Income") return "#1DB79B";
            else if (d.IG === "Upper Middle Income") return "#1894BC";
            else if (d.IG === "High Income") return "#124DC2";
          })
          .attr("r", radius)
          .attr("cy", d => yScale(d.NMR))
          .attr("cx", d => width) // initial value - to be transitioned
          .call(enter =>
            enter
              .transition() // initialize transition
              .delay(d => 200 * d.NMR) // delay on each element
              .duration(200) // duration 500ms
              .attr("cx", d => xScale(d.CCVS))
              .attr("r",3)
          ),
      update =>
        update
        .attr("stroke","black")
        .call(update =>
          // update selections -- all data elements that match with a `.dot` element
          update
            .transition()
            .duration(300)
            .attr("stroke", "lightgrey")
        ),
      exit =>
        exit
        .attr("cx",length)
        .call(exit =>
          // exit selections -- all the `.dot` element that no longer match to HTML elements
          exit
            .transition()
            .delay(d => 100 * d.CCVS)
            .duration(400)
            .attr("cx", margin.left)
            .remove()
        )
    );} 
