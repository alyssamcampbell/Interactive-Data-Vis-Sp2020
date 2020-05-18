/**
 * CONSTANTS AND GLOBALS
 * */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };

/** these variables allow us to access anything we manipulate in
 * init() but need access to in draw().
 * All these variables are empty before we assign something to them.*/
let svg;

/**
 * APPLICATION STATE
 * */
let state = {
  data: [],
  selectedTrend: "All",
  selectedIG: "All",
  selectedRegion: "All",
  geojson: null,
  migration: null,
  hover: {
    latitude: null,
    longitude: null,
    state: null,
  },
};

/**
 * LOAD DATA
 * Using a Promise.all([]), we can load more than one dataset at a time
 * */
Promise.all([
  d3.json("../../data/worldmapgeojson.json"),
  d3.csv("../../data/projectdata.csv", d3.autoType),
]).then(([geojson, migration]) => {
  state.geojson = geojson;
  state.migration = migration;
  // console.log("state: ", state);
  init();
});

/**
 * INITIALIZING FUNCTION
 * this will be run *one time* when the data finishes loading in
 * */
function init() {
  // our projection and path are only defined once, and we don't need to access them in the draw function,
  // so they can be locally scoped to init()

  const colorScale = d3.scaleSequential(d3.interpolateBlues)
  .domain(d3.extent(state.migration.map(d => d['CCVS'])))

  const projection = d3.geoMercator().fitSize([width, height], state.geojson);

  const path = d3.geoPath().projection(projection);

// UI Element Set Up 
// add dropdown (HTML selection) for interaction

// HTML select reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select
const selectElement = d3.select("#dropdown1").on("change", function() {                  
  console.log("the region is", this.value);
  // `this` === the selectElement
  // this.value holds the dropdown value a user just selected
  state.selectedRegion = this.value;
  draw(); // re-draw the graph based on this new selection
});

const selectElement1 = d3.select("#dropdown2").on("change", function() {                 
  console.log("the income group is", this.value);
  // `this` === the selectElement
  // this.value holds the dropdown value a user just selected
  state.selectedIG = this.value,
  draw(); // re-draw the map based on this new selection
});

// add in dropdown options from the unique values in the data
selectElement
  .selectAll("option.one") 
  .data(["All", "Central America & the Caribbean", "East Asia", "Eastern Europe", "North Africa", "North America", "Northern Europe", "Oceania", "South America", "South Asia"
, "Southeast Asia", "Southern Europe", "Sub-Saharan Africa", "Western Asia", "Western Europe"])
  .join("option")
  .attr("class","one")
  .attr("value", d => d)
  .text(d => d);

selectElement1
  .selectAll("option.two")
  .data(["All", "Low Income","High Income","Lower Middle Income","Upper Middle Income"]) 
  .join("option")
  .attr("class","two")
  .attr("value", d => d)
  .text(d => d);

  // create an svg element in our main `d3-container` element
  svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  svg
    .selectAll(".state") // arbitrary name, not referring to geojson
    // all of the features of the geojson, meaning all the states as individuals
    .data(state.geojson.features) // all of your countries, state refers to app state
    .join("path") 
    .attr("d", path) 
    .attr("class", "state") // how do i fill the countries to be red?
    .attr("fill", d => {

      const countryName= d.properties.admin;
      const countryCCVS = state.migration.find(e => e.Country === countryName)
      return countryCCVS !== undefined ? colorScale(countryCCVS['CCVS']) : "black"
      console.log(countryCCVS)
      // return colorScale(countryCCVS)
    })

    .on("mouseover", function(d) {
    d3.select(this)
    .attr("fill","red") // would need to do "mouseout"
      // when the mouse rolls over this feature, do this
      state.hover["state"] = d.properties.admin;
      draw(); // re-call the draw function when we set a new hoveredState
    }) 
    .on("mouseout", function(d) {
    d3.select(this)
    .attr("fill","transparent")
  state.hover["state"]= d.properties.admin;
  draw();
    })



  svg 

  // EXAMPLE 2: going from x, y => lat-long
  // this triggers any movement at all while on the svg
  svg.on("mousemove", () => {
    // we can use d3.mouse() to tell us the exact x and y positions of our cursor
    const [mx, my] = d3.mouse(svg.node());
    // projection can be inverted to return [lat, long] from [x, y] in pixels
    const proj = projection.invert([mx, my]);
    state.hover["longitude"] = proj[0];
    state.hover["latitude"] = proj[1];
    draw();
  });

  draw(); // calls the draw function
}

/**
 * DRAW FUNCTION
 * we call this everytime there is an update to the data/state
 * */
function draw() {
// filter the data for the selected IG and Selected Region
let filteredData = state.data;
// if there is a selectedIG, filter the data before mapping it to our elements
if (state.selectedIG !== "All" && state.selectedRegion != "All") {
  filteredData = state.data.filter(d => d.IG === state.selectedIG && d.Region === state.selectedRegion);
}

//**** */
const map = svg
.selectAll(".state")
.data(filteredData, d => d.name) // use `d.name` as the `key` to match between HTML and data elements
.join(
  enter =>
    // enter selections -- all data elements that don't have a `.dot` element attached to them yet
    enter
      .append("path")
      .attr("d", path) 
      .attr("class", "state")
      .attr("fill", d => {
        const countryName= d.properties.admin;
        const countryCCVS = state.migration.find(e => e.Country === countryName)
        return countryCCVS !== undefined ? colorScale(countryCCVS['CCVS']) : "black"
        console.log(countryCCVS)
        // return colorScale(countryCCVS)
      })
      .call(enter =>
        enter
          .transition() // initialize transition
          .delay(d => 200 * d.CCVS) // delay on each element
          .duration(200) // duration 500ms

      ),
  update =>
    update
    .call(update =>
      // update selections -- all data elements that match with a `.state` element
      update
        .transition()
        .duration(300)
    ),
  exit =>
    exit
    .call(exit =>
      // exit selections -- all the `.state` element that no longer match to HTML elements
      exit
        .transition()
        .delay(d => 100 * d.CCVS)
        .duration(400)
        .remove()
    )
);} 


  // return an array of [key, value] pairs
  hoverData = Object.entries(state.hover);

  d3.select("#hover-content")
    .selectAll("div.row")
    .data(hoverData)
    .join("div")
    .attr("class", "row")
    .html(
      d =>
        // each d is [key, value] pair
        d[1] // check if value exist
          ? `${d[0]}: ${d[1]}` // if they do, fill them in
          : null // otherwise, show nothing
    );
