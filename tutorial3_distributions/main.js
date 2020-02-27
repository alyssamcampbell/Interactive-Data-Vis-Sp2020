/**
 * CONSTANTS AND GLOBALS
 * */
const width = window.innerWidth * 0.65,
  height = window.innerHeight * 0.65,
  margin = { top: 50, bottom: 50, left: 50, right: 50 },
  radius = 4;

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
d3.csv("../data/NetMigrationClimateRisk.csv", d3.autoType).then(raw_data => {
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
  const yAxis = d3.axisLeft(yScale).tickValues([-30,-10,0,10,30]); // CHANGE THE TICKS ON THE AXIS HERE

  // UI ELEMENT SETUP
  // add dropdown (HTML selection) for interaction
  // HTML select reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select
  const selectElement = d3.select("#dropdown" && "dropdown1").on("change", function() {                  // Ellie: Do I need to add this second drop down here?
    console.log("the income group is", this.value);
    // `this` === the selectElement
    // this.value holds the dropdown value a user just selected
    state.selectedIG = this.value,
    state.selectedRegion = this.value;
    draw(); // re-draw the graph based on this new selection
  });

  // add in dropdown options from the unique values in the data
  selectElement
    .selectAll("option")
    .data(["All", "Lower middle", "Upper middle","Low", "Upper"]) // unique data values-- (hint: to do this programmatically take a look `Sets`)
    .data(["All", "North America","Asia","Europe"]) // unique data values-- (hint: to do this programmatically take a look `Sets`)
    .join("option")
    .attr("value", d => d)
    .text(d => d);

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
          .attr("stroke", "lightgrey")
          .attr("opacity", 0.75)
          .attr("fill", d => {
            if (d.IG === "Low") return "Red";
            else if (d.IG === "Lower middle") return "Pink";
            else if (d.IG === "Upper middle") return "Orange";
            else return "yellow";
            if (d.Region == "Asia") return "Pink";
            else if (d.Region == "Europe") return "Blue";
            else return "orange";
          })
          .attr("r", radius)
          .attr("cy", d => yScale(d.NMR))
          .attr("cx", d => width) // initial value - to be transitioned
          .call(enter =>
            enter
              .transition() // initialize transition
              .delay(d => 200 * d.CCVS) // delay on each element
              .duration(200) // duration 500ms
              .attr("cx", d => xScale(d.CCVS))
              .attr("r",6)
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