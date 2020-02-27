/**
 * CONSTANTS AND GLOBALS
 * */
const width = window.innerWidth * 0.7, // establish the width constant
  height = window.innerHeight * 0.7, // establish the height constant
  margin = { top: 20, bottom: 50, left: 60, right: 40 }, // establish the margins of the svg
  radius = 3, // establish a radius for circles
  default_selection = "Select a Country"; // establish a default selection

/** these variables allow us to access anything we manipulate in
 * init() but need access to in draw().
 * All these variables are empty before we assign something to them.*/
let svg;   // listing variables that will be assigned later
let xScale;
let yScale;
let yAxis;
let area;

/* 
this extrapolated function allows us to replace the "G" with "B" min the case of billions.
we cannot do this in the .tickFormat() because we need to pass a function as an argument, 
and replace needs to act on the text (result of the function). 
*/
const formatBillions = (num) => d3.format(".2s")(num).replace(/G/, 'B')

/**
 * APPLICATION STATE
 * */
let state = {        // the automatic state of the data
  data: [],
  selectedCountry: null, // set to no particular country automatically
};

/**
 * LOAD DATA
 * */
d3.csv("../../data/populationOverTime.csv", d => ({
  year: new Date(d.Year, 0, 1),  // - Ellie - what is this doing? 
  country: d.Entity, // defining variable country as 'Entity'
  population: +d.Population, // defining variable population as 'Population'' - Ellie- what does the +d stand for?
})).then(raw_data => {
  console.log("raw_data", raw_data); // 
  state.data = raw_data; // Ellie 
  init(); // Ellie - what are we doing here?
});

/**
 * INITIALIZING FUNCTION
 * this will be run *one time* when the data finishes loading in
 * */
function init() {
  // SCALES
  xScale = d3
    .scaleTime() // defining the type of scale as Time
    .domain(d3.extent(state.data, d => d.year)) // setting the domain of the X scale as the minimum and maximum of the data 'Year'
    .range([margin.left, width - margin.right]); // setting the minimum and maximum values to correspond to the width of the container

  yScale = d3 
    .scaleLinear() // defining scale type as linear
    .domain([0, d3.max(state.data, d => d.population)]) // setting the y scale to have a minimum of 0 and a max based on the max population. Ellie - is this correct?
    .range([height - margin.bottom, margin.top]); // setting the min and max values to correspond to the width of the container

  // AXES
  const xAxis = d3.axisBottom(xScale); // defining the X axis
  yAxis = d3.axisLeft(yScale).tickFormat(formatBillions); // defining the Yaxis

  // UI ELEMENT SETUP
  const selectElement = d3.select("#dropdown").on("change", function() { // specifying a change should take place when element is selected
    console.log("new selected entity is", this.value); // testing the UI element set up
    // `this` === the selectElement
    // this.value holds the dropdown value a user just selected
    state.selectedCountry = this.value; // specifying the change to take place
    draw(); // re-draw the graph based on this new selection
  });

  // add in dropdown options from the unique values in the data
  selectElement
    .selectAll("option") // select all choices from menu
    .data([ 
      ...Array.from(new Set(state.data.map(d => d.country))),
      default_selection,
    ]) // set the default option to the default selection above, Ellie - what is the array stating? 
    .join("option") // this lets you specify exactly what happens to the DOM as data changes
    .attr("value", d => d) // specifying that the values should come from the data
    .text(d => d); // specifying the text should be from the country selected??

  // this ensures that the selected value is the same as what we have in state when we initialize the options
  selectElement.property("value", default_selection);

  // create an svg element in our main `d3-container` element
  svg = d3
    .select("#d3-container") // creating an svg element specified in the html
    .append("svg") //  adding the name "svg" to the element ? 
    .attr("width", width) // specifying the width of the element to be width as defined in globals
    .attr("height", height); // specifying the height to be equal to height as defined in globals 

  // add the xAxis
  svg
    .append("g") // ? the "g" element is used to group shapes together. Once grouped you can transform the whole group of shapes as if it was a single shape. 
    .attr("class", "axis x-axis") // ? applying the class style from the css of "axis x-axis" - but * i don't have this defined in CSS
    .attr("transform", `translate(80,${height - margin.top})`) // the transform helper allows you to transform an SVG or group of SVG elements. It can be followed by translate, scale, rotate and skew. Translate takes two options, tx refers to translation along the x-axis and ty along the y-axis. Here you are moving or 'translating' the axis to the specified distance. A translation in geometry means moving every point of a figure or space by the same distance in a given direction. Here when you change this value the XAxis will move over to the right by the specified amount.
    .call(xAxis) // drawing the x axis 
    .append("text") // change or style the text 
    .attr("class", "axis-label") // defining the axis label style and text below
    .attr("x", "50%") // setting the position of the text on the X axis?
    .attr("dy", "20em") // setting the font size
    .text("Year"); // Ellie - why is this not showing up? 

  // add the yAxis
  svg
    .append("g") // ? same as above 
    .attr("class", "axis y-axis") // same as above 
    .attr("transform", `translate(${margin.left},0)`) // same as above
    .call(yAxis) // draw the y axis
    .append("text") // change or style the text
    .attr("class", "axis-label") // add an axis label
    .attr("y", "50%") // move the axis label ? ellie
    .attr("dx", "-3em") // dictates the position of the axis label text --> e.g. moving it right/left
    .attr("writing-mode", "vertical-rl") // the direction of the words right to left
    .text("Population"); // the title of the axis


  draw(); // calls the draw function
}

/**
 * DRAW FUNCTION
 * we call this everytime there is an update to the data/state
 * */
function draw() { // defining what should happen when data is updated 
  // filter the data for the selectedCountry
  let filteredData; //when I changed this to [] the data went away -- ellie? 
  if (state.selectedCountry !== null) { // if a certain country is selected - why are we using Null? Ellie
    filteredData = state.data.filter(d => d.country === state.selectedCountry); // if filtered, then give the value of the selected country
  }

  // update the scale domain (now that our data has changed)
  yScale.domain([0,d3.max(filteredData, d => d.population)]); // specifying how to update the domain of the y scale domain, setting it at minimum 0 and max of the population data? ellie?


  // re-draw our yAxis since our yScale is updated with the new data
  d3.select("g.y-axis") // select the y-axis from the g group of svg elements 
    .transition() // transition specify
    .duration(1000) // specify duration of transition 
    .call(yAxis.scale(yScale)); // this updates the yAxis' scale to be our newly updated one with the new data/to re-draw the y axis


  // we define our area function generator telling it how to access the x,y values for each point
  const areaFunc = d3
    .area() // defining the area function
    .x(d => xScale(d.year)) // defining the x? ellie
    .y0(d => yScale(0)) // defining the y minimum value as zero? ellie
    .y1(d => yScale(d.population)); // defining the y maximum value as equal to population data? ellie


  const dot = svg // creating svg element called 'dot'
    .selectAll(".dot") // select all svg element
    .data(filteredData, d => d.year) // use `d.year` as the `key` to match between HTML and data elements // ?? ellie don't understand the key part
    .join(
      enter =>
        // enter selections -- all data elements that don't have a `.dot` element attached to them yet // for the new data that is entering the page not already on there
        enter
          .append("circle") // create or chance a circle upon data entering
          .attr("class", "dot") // Note: this is important so we can identify it in future updates // create a dot for the style of the circle? 
          .attr("r", radius) // give it the pre-defined radius
          .attr("cy", height - margin.bottom) // initial value - to be transitioned -- should be at bottom of graph to start - height minus bottom margin
          .attr("cx", d => xScale(d.year)), // initially start at one dot per yaer, how far along on the year -- create dots for the year? not sure here ellie -- cx is how far on the x direction do you place center of circle, same with cy
        

      update => update,  // update the function
      exit => // exit
        exit.call(exit =>
          // exit selections -- all the `.dot` element that no longer match to HTML elements / e.g. take out the filtered data, what is leaving the screen
          exit
            .transition() // set transition for exit
            .delay(d => d.year) // have there be a delay of X ? ellie of what?
            .duration(500) // duration of 500 what ellie?
            .attr("cy", height - margin.bottom) // not sure here ellie help define
            .remove() // remove elements from screen
        )
    )
    // the '.join()' function leaves us with the 'Enter' + 'Update' selections together. // Ellie ? why do we do this or need this. 
    // Now we just need move them to the right place
    .call( // draw the selection? ellie? define the transition of above
      selection =>
        selection
          .transition() // initialize transition
          .duration(1000) // duration 1000ms / 1s
          .attr("cy", d => yScale(d.population)) // started from the bottom, now we're here --? Ellie, I don't get this.
    );

  const area = svg // creating the const area - ellie why are we doing this all the way down here?
    .selectAll("path.areacolor") // ellie - why is it called path.trend? what is it referring to here? and how does it recognize something we haven't defined?
    .data([filteredData]) // defining the data to use 
    .join(
      enter => // when the area data enters 
        enter
          .append("path") // we are going to modify the path? or should this be called area / ellie
          .attr("class", "areacolor") // we are going to style the area with whats below / should this be called area/ ellie- a: this can be called anything and is defined in the class 
          .attr("opacity", 1) // start them off as opacity 1 and fade them in
          .attr("fill","turquoise"), // fill the area blue
        
      update => update, // pass through the update selection

      exit => exit.remove()
    )
    .call(selection => // I don't understand why we are defining the transitions here and not on exit above, and what is the selection referring to here?? where has it been defined? a: the value 
    // the value of selection is arbitrary, it reads whatever above it -- you are chaining the code on top of everything above it could be g, a, 
      selection
        .transition() // sets the transition on the 'Enter' + 'Update' selections together.
        .duration(1000)
        .attr("opacity", 5) // end with an opacity of 5 from 1 above
        .attr("d", d => areaFunc(d)) // do this for the area
    );
}
