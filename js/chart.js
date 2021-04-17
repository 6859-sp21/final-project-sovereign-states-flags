var texts = ['foo', 'bar'];

var container = d3.create('g');

container
  .selectAll('text')
  .data(texts)
  .enter()
  .append('text')
  .text(function(d) { return d; })
  .attr('y', function(d,i) { return 50 * i })
  .on('click', function(d,i) {
    container
      .append("foreignObject")
      .attr("x", 0)
      // .attr("y", function() { return 50 * d })
      .attr("width", 140)
      .attr("height", 20)
      .html(function(d) {
        return `<input type="text" value="d, i = ${d} ${i}" />`
      })
  })

createWorld = async function() {
  const world = await _world();
  const countries = await _countries();
  const flagData = await _flagData();
  const flagMetadataMap = await _flagMetadataMap();

  const width = 975;
  const height = 975;

  // https://observablehq.com/@d3/zoom-to-bounding-box
  const zoom = d3.zoom()
      .scaleExtent([1, 64]);
  
  const chartLegendSVG = d3.create("svg")
      .attr("id", "chart-legend");

  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height]);
  
  const defs = svg.append("defs");
  
  defs.append("path")
    .attr("id", "outline")
    .attr("d", path(outline));
  
  defs.append("clipPath")
    .attr("id", "clip")
    .append("use")
    .attr("xlink:href", new URL("#outline", location));
  
  const g = svg.append("g")
    .attr("clip-path", `url(${new URL("#clip", location)})`);
  
  g.append("use")
    .attr("xlink:href", new URL("#outline", location))
    .attr("fill", "white")
    .attr("fill-opacity", "0.5");
  
  g.append("path")
    .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-linejoin", "round")
    .attr("d", path);
  
  g.append("use")
    .attr("xlink:href", new URL("#outline", location))
    .attr("fill", "none")
    .attr("stroke", "black");
  
  // Makes instances of visuals classes

  const searchInput = new SearchInput(flagData, dataJoin);
  const topCountries = new TopCountries(flagMetadataMap, flagData, dataJoin);
  const detailTable = new DetailTable(flagMetadataMap, dataJoin);
  const flagPreview = new FlagPreview(flagMetadataMap);

  const tooltipDiv = d3.create("div");
  const tooltip = new Tooltip(tooltipDiv);

  let chartLegend = {};

  function dataJoin(activeCountry, detailQuery) {
    const activeData = activeCountry && flagMetadataMap.get(activeCountry.name).similarities;
    const detailData = detailQuery && getDetailQueryData(flagData, detailQuery);
    const data = detailData || activeData || DEFAULT_DATA;

    // Event Handlers
    zoom.on("zoom", zoomed);
    svg.on("click", reset);

    // Update self
    const color = d3.scaleSequential()
      .domain(d3.extent(Array.from(data.values())))
      .interpolator(d3.interpolateYlGnBu)
      .unknown("#ccc");
  
    const states = g.selectAll("path")
      .data(countries.features)
      .join("path")
        .attr("fill", d => color(data.get(d.properties.name)))
        .on("click", clicked)
        // .on("mouseover", mouseovered)
        .on("mouseover", (event, d) => {
          flagPreview.show(d.properties.name);
          tooltip.show(event, d, data.has(d.properties.name), data.get(d.properties.name), color);
             
          return d3.select(event.currentTarget)
            .style("filter", "brightness(80%)");
        })
        .on("mousemove", (event, d) => {
          tooltip.move(event, d);
        })
        .on("mouseout", (event, count) => {
          tooltip.hide();
          
          return d3.select(event.currentTarget)
            .style("filter", "brightness(100%)")
        })
        .attr("d", path);

    // remove old chart legend, then make new one and update
    const {legendPart, legendImage} = chartLegend;
    legendPart && legendPart.remove();
    legendImage && legendImage.remove();
    activeTitle = activeCountry && `Similarity to ${activeCountry.name}`;
    chartLegend = legend({color, title: detailQuery || activeTitle || ""});

    svg.call(zoom);

    // Update others
    if (activeCountry) {
      searchInput.dataJoin(activeCountry);
      topCountries.dataJoin(activeCountry);
      detailTable.dataJoin(activeCountry);
    }

    // Helper functions
    function clicked(event, d) {
      const validClick = data.has(d.properties.name);
      if (!validClick) return;
      const searchTerm = d.properties.name;

      // // callbacks
      // (viewof searchTerm).value = d.properties.name;
      // (viewof searchTerm).dispatchEvent(new Event("input"));

      // // Clears detail query
      tooltip.hide();
      // (viewof detailQuery).value = "";
      // (viewof detailQuery).dispatchEvent(new Event("input"));
      const clickedCountry = getActiveCountry(flagData, searchTerm);
      dataJoin(clickedCountry);
    }
  
    function reset() {
      states.transition().style("fill", null);
      svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity,
        d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
      );
    }
  
    function zoomed(event) {
      const {transform} = event;
      g.attr("transform", transform);
      g.attr("stroke-width", 1 / transform.k);
    }
  }

  dataJoin(flagData[164]);
  
  return {
    searchInput: searchInput,
    topCountries: topCountries,
    detailTable: detailTable,
    flagPreview: flagPreview,
    tooltip: tooltipDiv.node(),
    chartLegendSVG: chartLegendSVG.node(),
    chartSVG: svg.node()
  };
}

d3.select("input#search").on('keydown', (event, d) => {
  if(event.key === 'Enter') {
    // data join
    container
      .append("foreignObject")
      .attr("x", 0)
      // .attr("y", function() { return 50 * i })
      .attr("width", 140)
      .attr("height", 20)
      .html(function(d) {
        return '<input type="text" value="Text goes here" />'
      })
  }
});

createWorld().then(res => {
  const {searchInput, topCountries, detailTable, flagPreview, tooltip, chartLegendSVG, chartSVG} = res;
  // chartSVG.append(flagPreview)
  searchInput.setElement(d3.select("#search"));
  topCountries.setElement(d3.select("#top-similar-countries"));
  detailTable.setElement(d3.select("#flag-details"), d3.select("#detail-top-cell"));
  flagPreview.setElement(document.getElementById("viz"));
  document.getElementById("mymap").appendChild(tooltip);
  document.getElementById("mymap").appendChild(chartLegendSVG);
  document.getElementById("mymap").appendChild(chartSVG);
});
// document.getElementById("mymap").appendChild(container.node());