export function chart2() {
 /**
 * CONSTANTS AND GLOBALS
 * */
const width = window.innerWidth * 0.65,
  height = window.innerHeight * 0.65,
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
  console.log("chart 2 raw_data", raw_data);
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
  const yAxis = d3.axisLeft(yScale).tickValues([-10,-5,0,5,10]); // CHANGE THE TICKS ON THE AXIS HERE

  // UI ELEMENT SETUP
  // add dropdown (HTML selection) for interaction
  // HTML select reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select
  const selectElement = d3.select("#dropdown1").on("change", function() {                  // Ellie: Do I need to add this second drop down here?
    console.log("the income group is", this.value);
    // `this` === the selectElement
    // this.value holds the dropdown value a user just selected
    state.selectedIG = this.value,
    draw(); // re-draw the graph based on this new selection
  });

  const selectElement1 = d3.select("#dropdown2").on("change", function() {                  // Ellie: Do I need to add this second drop down here?
    console.log("the income group is", this.value);
    // `this` === the selectElement
    // this.value holds the dropdown value a user just selected
    state.selectedRegion = this.value;
    draw(); // re-draw the graph based on this new selection
  });

  // add in dropdown options from the unique values in the data
  selectElement
    .selectAll("option.one")
    .data(["All", "Low Income","High Income","Lower Middle Income","Upper Middle Income"]) // unique data values-- (hint: to do this programmatically take a look `Sets`)
    .join("option")
    .attr("class","one")
    .attr("value", d => d)
    .text(d => d);

  selectElement1
    .selectAll("option.two")
    .data(["All", "Western Asia","South Asia","East Asia","Southeast Asia","Central Asia","Oceania","North Africa","South America","Central America & Caribbean","North America","Sub-Saharan Africa","Northern Europe","Southern Europe","Western Europe","Eastern Europe"]) // unique data values-- (hint: to do this programmatically take a look `Sets`)
    .join("option")
    .attr("class","two")
    .attr("value", d => d)
    .text(d => d);


  // create an svg element in our main `d3-container` element
  svg = d3
    .select("#d3-container-2")
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
            if (d.IG === "Low Income") return "#fff7bc";
            else if (d.IG === "Lower Middle Income") return "#fec44f";
            else if (d.IG === "Upper Middle Income") return "#addd8e";
            else if (d.IG === "High Income") return "#31a354";
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

      
        }
