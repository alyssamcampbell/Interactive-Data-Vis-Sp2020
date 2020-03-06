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
  geojson: null, // Ellie why do we have these set to null? 
  extremes: null,
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
  d3.json("../data/us-state.json"), // loading both data sets together
  d3.csv("../data/usHeatExtremes.csv", d3.autoType),
]).then(([geojson, extremes]) => { // not sure what this is doing here
  state.geojson = geojson; 
  state.extremes = extremes; // how does it know to refer to things as extremes ??  it was not defined above as a variable
  console.log("state: ", state);
  init();
});

/**
 * INITIALIZING FUNCTION
 * this will be run *one time* when the data finishes loading in
 * */
function init() {
  // our projection and path are only defined once, and we don't need to access them in the draw function,
  // so they can be locally scoped to init()
  const projection = d3.geoAlbersUsa().fitSize([width, height], state.geojson); // creating the projection, defining the map type, and how it fits with the data
  const path = d3.geoPath().projection(projection); // defining the path for converting coordinates to pixel coordinates ?

  // create an svg element in our main `d3-container` element
  svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  svg
    .selectAll(".state") // selecting all the individual statets of geojson
    // all of the features of the geojson, meaning all the states as individuals
    .data(state.geojson.features)
    .join("path") // joining the path to the data
    .attr("d", path) // see above
    .attr("class", "state") // defining style for the state data should be drawn
    .attr("fill", "transparent") // fill
    .on("mouseover", d => {
      // when the mouse rolls over this feature, do this
      state.hover["state"] = d.properties.NAME; // input the name when mouse rolls over state
      draw(); // re-call the draw function when we set a new hoveredState
    });

  // EXAMPLE 1: going from Lat-Long => x, y
  // for how to position a dot
  const GradCenterCoord = { latitude: 40.7423, longitude: -73.9833 };
  svg
    .selectAll("circle")
    .data([GradCenterCoord])
    .join("circle")
    .attr("r", 20)
    .attr("fill", "steelblue")
    .attr("transform", d => {
      const [x, y] = projection([d.longitude, d.latitude]); // creating the lat and long coordinates into X and Y from the data set
      return `translate(${x}, ${y})`; // creating the X and Y
    });

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
  // return an array of [key, value] pairs
  hoverData = Object.entries(state.hover); // defining the variable as when it is being hovered upon 

  d3.select("#hover-content") // defining the svg element
    .selectAll("div.row") // ? 
    .data(hoverData) // selecting the data in the hoverData variable 
    .join("div") // ? 
    .attr("class", "row") // ?
    .html(
      d =>
        // each d is [key, value] pair
        d[1] // check if value exist
          ? `${d[0]}: ${d[1]}` // if they do, fill them in
          : null // otherwise, show nothing
    );
}