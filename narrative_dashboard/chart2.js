export function chart2() {
  /**
   * CONSTANTS AND GLOBALS
   * */
  const width = window.innerWidth * 0.3,
  height = window.innerHeight * 0.3,
  margin = { top: 0, bottom: 0, left: 0, right: 0 };

  let svg;

  /**
   * APPLICATION STATE
   * */
  let state = {
    data: null,
    geojson: null,
    migration: null,
  };

  /**
   * LOAD DATA
   * Using a Promise.all([]), we can load more than one dataset at a time
   * */
  Promise.all([
    d3.json("../../data/worldmapgeojson.json"),
    d3.csv("../../data/narrative/projectdata.csv", d3.autoType),
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

  const colorScale = d3.scaleSequential(d3.interpolateBlues)
  .domain(d3.extent(state.migration.map(d => d['NMR'])))
  const projection = d3.geoMercator().fitSize([width, height], state.geojson);
  const path = d3.geoPath().projection(projection);

    svg = d3
      .select("#d3-container-2")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  
  svg
    .selectAll(".state") // arbitrary name, not referring to geojson
    // all of the features of the geojson, meaning all the states as individuals
    .data(state.geojson.features) // all of your countries, state refers to app state
    .join("path") 
    .attr("d", path) 
    .attr("class", "state") 
    .attr("fill", d => {

      const countryName= d.properties.admin;
      const countryCCVS = state.migration.find(e => e.Country === countryName)
      return countryCCVS !== undefined ? colorScale(countryCCVS['NMR']) : "black"
      console.log(countryCCVS)
      // return colorScale(countryCCVS)
    })
  }


  }
