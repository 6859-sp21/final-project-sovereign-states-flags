//*********************************************************************
// HELPERS

function imageURLFromCountry(searchTerm, searchInto) {
  // Fix search term
  const searchToWikiFormat = new Map([
    ["Antigua Barbuda", "Antigua and Barbuda"],
    ["Cabo Verde", "Cape Verde"],
    ["eSwatini", "Eswatini"],
    ["Faeroe Islands", "Faroe Islands"],
    ["Fr. Polynesia", "French Polynesia"],
    ["Guinea-Bissau", "Guinea"],
    ["N. Mariana Islands", "Northern Mariana Islands"],
    ["Saint Vin. and Gren.", "Saint Vincent and the Grenadines"],
    ["São Tomé and Principe", "São Tomé and Príncipe"],
    ["U.S. Virgin Islands", "Virgin Islands"],
    ["Vatican", "Vatican City"],
  ]);
  searchTerm = searchTerm.replace('Is.', 'Islands');
  searchTerm = searchTerm.replace('St.', 'Saint');
  searchTerm = searchTerm.replace('Rep.', 'Republic');
  searchTerm = searchTerm.replace('Eq.', 'Equatorial');
  searchTerm = searchToWikiFormat.get(searchTerm) || searchTerm;
  
  let bestRes = DEFAULT_IMAGE_URL;
  if (searchInto.has(searchTerm)) {
    const geoIx = searchInto.get(searchTerm);
    return `data/svg/${geoIx}`;
  }
  
  return bestRes;
}

function calculateSimilarity(a, b, featureWeights) {
  let res = 0;
  // let normalizationFactorA = 0;
  // let normalizationFactorB = 0;
  for (const [feature, weight] of featureWeights) {
    if (feature in a && feature in b) {
      let calcSim = 0;
      if (discreteFeatures.includes(feature)) {
        calcSim = a[feature] === b[feature] ? 1 : 0;
      } else if (booleanFeatures.includes(feature)) {
        calcSim = +a[feature] * +b[feature] * 0.8 + (a[feature] === b[feature])*0.2;

        // // update normalization factors
        // if (+a[feature] > 0) normalizationFactorA++;
        // if (+b[feature] > 0) normalizationFactorB++;
      } else if (numericFeatures.includes(feature)) {
        calcSim = +a[feature] * +b[feature];
        if (calcSim > 0) {
           calcSim = calcSim / Math.pow(Math.max(+a[feature], +b[feature]), 2);
        }

        // // update normalization factors
        // if (+a[feature] > 0) normalizationFactorA++;
        // if (+b[feature] > 0) normalizationFactorB++;
      }
      res += (weight*calcSim);
    }
  }
  return res;
  // return res/Math.sqrt(normalizationFactorA*normalizationFactorB);
}

function getActiveCountry(flagData, searchTerm, allResults=false) {
  // projection.rotate([0, 0, 0]); // Bring active Country into view
  function positiveSearch(s, x) {
    const aliases = new Map([
      ["united states of america", "usa"],
    ]); // let it support multiple aliases?
    s = s.toLowerCase();
    x = x.toLowerCase();
    return s.includes(x) || (aliases.has(s) && aliases.get(s).includes(x));
  }
  const searchResults = d3.group(flagData, d => positiveSearch(d.name, searchTerm)).get(true);
  if (searchResults && searchResults.length > 0) {
    return allResults ? searchResults : searchResults[0];
  }
  return undefined;
  // return flagData[164]; // Default switzerland :)
}

function getDetailQueryData(flagData, detailQuery) {
  let res = new Map()
  for (let i = 0; i < flagData.length; i++) {
    if (flagData[i][detailQuery]) {
      let detailData;
      if (booleanFeatures.includes(detailQuery)) {
        detailData = Boolean(+flagData[i][detailQuery]);
      } else if (numericFeatures.includes(detailQuery) || unusedNumericFeatures.includes(detailQuery)) {
        detailData = +flagData[i][detailQuery];
      } else {
        detailData = flagData[i][detailQuery];
      }
      res.set(flagData[i].name, detailData);
    }
  }
  return res
}

//*********************************************************************
// reloads on flagData change

const _flagMetadataMap = async () => {
  const flagData = await _flagData();
  const featureWeights = await _featureWeights();
  const galleryNames = await _galleryNames();

  // return metadataFromJsonFile;
  let res = new Map()
  for (let i = 0; i < flagData.length; i++) {
    let similarities = new Map();
    let rawSimilarities = new Map();
    let maxSimilarity = 0;
    for (let j = 0; j < flagData.length; j++) {
      const similarityValue = calculateSimilarity(flagData[i], flagData[j], featureWeights);
      rawSimilarities.set(flagData[j].name, similarityValue);
      maxSimilarity = Math.max(maxSimilarity, similarityValue);
    }
    for (let j = 0; j < flagData.length; j++) {
      similarities.set(flagData[j].name, rawSimilarities.get(flagData[j].name)/maxSimilarity);
    }
    res.set(flagData[i].name, {
      name: flagData[i].name,
      similarities: similarities,
      raw_similarities: rawSimilarities,
      imageUrl: imageURLFromCountry(flagData[i].name, galleryNames)
    });
  }
  return res
}

const _missImage = async () => {
  const flagData = await _flagData();
  const galleryNames = await _galleryNames();

  let res = [];
  for (let i = 0; i < flagData.length; i++) {
    const imageUrl = imageURLFromCountry(flagData[i].name, galleryNames);
    if (imageUrl === DEFAULT_IMAGE_URL) {
      res.push(flagData[i].name);
    }
  }
  return res
}

//*********************************************************************
// Visuals Classes

class SearchInput {
  constructor(flagData, dataJoinCallback) {
    // this.dataMap = dataMap;
    this.flagData = flagData;
    this.dataJoinCallback = dataJoinCallback;
  }
  setElement(bar, input, datalist) {
    if (this.bar && this.input) {
      return;
    }
    const chart = this; // necessary for inside the below event callbacks
    this.bar = bar;
    this.input = input;
    this.datalist = datalist;
    this.bar.node().classList.add('walkthroughReady');
    this.input
      // .on('input', function onEvent(e) {
      //   const searchTerm = input.property('value');
      //   console.log({searchTerm});
      //   // TODO: datajoin on satisfactory input (= unambiguously a particular country)
      // })
      .on('keyup', function onEvent(e) {
        const searchTerm = input.property('value');
        if (e.keyCode === 13) {
          if (searchTerm == "" || searchTerm == chart.lastSearch) return; // abort search

          const searchedCountry = getActiveCountry(chart.flagData, searchTerm);
          if (searchedCountry && searchedCountry != chart.lastSearch) chart.dataJoinCallback(searchedCountry); // Only if not undefined and already active
          chart.lastSearch = searchedCountry;
        }

        const autocompleteResults = getActiveCountry(chart.flagData, searchTerm, true);
        if (autocompleteResults) {
          // Sets up search input datalist options
          let options = "";
          let numOptions = 0, maxLength = 10;
          for (const country of autocompleteResults) {
            options += `<option value="${country["name"]}">`;
            numOptions += 1;
            if (numOptions >= maxLength) break;
          }
          chart.datalist.innerHTML = options;
        }
      })
      .on('focus', function onEvent(e) {
        bar.attr("class", "outline");
      })
      .on('blur', function onEvent(e) {
        bar.attr("class", "");
        const searchTerm = input.property('value');
        if (searchTerm == "" || searchTerm == chart.lastSearch) return; // abort search

        const searchedCountry = getActiveCountry(chart.flagData, searchTerm);
        if (searchedCountry && searchedCountry != chart.lastSearch) chart.dataJoinCallback(searchedCountry); // Only if not undefined
        chart.lastSearch = searchedCountry;
      });
    // this.baseText = this.e.append('p');
    // this.baseImage = this.e.append('img');
  }
  dataJoin(activeCountry) {
    if (this.input) {
      this.input.property("value", activeCountry.name);
    }
  }
  hide() {
    // this.g.attr("display", "none");
    // if (this.e) {
    //   this.e.style.backgroundImage = "";
    // }
  }
}

class TopCountries {
  constructor(dataMap, flagData, dataJoinCallback, topCountryCallback) {
    this.dataMap = dataMap;
    this.flagData = flagData;
    this.dataJoinCallback = dataJoinCallback;
    this.topCountryCallback = topCountryCallback;
  }
  setElement(e) {
    if (this.e) {
      return;
    }
    this.e = e;
    this.baseText = this.e.append('h2');
    this.baseImage = this.e.append('img');
  }
  dataJoin(activeCountry) {
    if (this.e) {
      const data = this.dataMap.get(activeCountry.name).similarities;
      const chart = this;

      this.baseText
        .text(`${activeCountry.name}`)
        .attr("style", "margin:0px;");
      this.baseImage
        .attr("src", this.dataMap.has(activeCountry.name) ? this.dataMap.get(activeCountry.name).imageUrl : DEFAULT_IMAGE_URL)
        .attr("height", "90px")
        .attr("style", "padding:2px 0px;");

      this.e.selectAll('li') // select all list elements (orange circle above)
        .data(
          Array.from(data)
          .map(d => new Object({country: d[0], similarity: d[1]}))
          .filter(d => d.country !== activeCountry.name)
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0,5)
        )  // bind all our data values (blue circle above)
        .join('li')      // a selection that merges the "enter" and "update" states
          .text(d => "")
        .append('button')
          .text((d, i) => {
            d['i'] = i;
            return `${i+1}. ${d.country}: ${f2p(d.similarity)} similar`
          })
          .on("click", clicked)
          .attr("style", "width:100%;")
        .append('img')
          .attr("src", d => this.dataMap.has(d.country) ? this.dataMap.get(d.country).imageUrl : DEFAULT_IMAGE_URL)
          .attr("height", "90px")
          .attr("style", "display:block;margin-left:auto;margin-right:auto;");
    
      function clicked(event, d) {
        const searchTerm = d.country;
        const clickedCountry = getActiveCountry(chart.flagData, searchTerm);
        if (d.i == 0) chart.topCountryCallback(clickedCountry);
        chart.dataJoinCallback(clickedCountry);
        // (viewof searchTerm).value = d.country;
        // (viewof searchTerm).dispatchEvent(new Event("input"));
        
        // // Clears detail query
        // (viewof detailQuery).value = "";
        // (viewof detailQuery).dispatchEvent(new Event("input"));
        // dataJoin(activeData, d.country);
      }
    }
  }
  hide() {
    // this.g.attr("display", "none");
    // if (this.e) {
    //   this.e.style.backgroundImage = "";
    // }
  }
}

class DetailTable {
  constructor(dataMap, dataJoinCallback) {
    this.dataMap = dataMap;
    this.dataJoinCallback = dataJoinCallback;
  }
  setElement(table, topCell) {
    if (this.table && this.topCell) {
      return;
    }
    this.table = table;
    this.topCell = topCell;
  }
  dataJoin(activeCountry) {
    if (this.table && this.topCell) {
      const chart = this;
      const data = this.dataMap.get(activeCountry.name).similarities;
      // table of flag properties
      this.topCell
        .text(activeCountry.name);
      
      // Should only include relevant details in the detail table
      let detailAttributes = [];
      for (const [key, value] of Object.entries(activeCountry)) {
        if (discreteFeatures.includes(key) || booleanFeatures.includes(key) || numericFeatures.includes(key)) {
          detailAttributes.push([key, value]);
        }
      }
      console.log({detailAttributes});

      this.table.selectAll('tr.data-rows')
        .data(detailAttributes) // Slice from 1 since first row (name) is redundant
        .join('tr')
          .attr('class', 'data-rows')
          .html(d => `
  <td>${d[0]}</th>
  <td>${d[1]}</th>`)
          .on("click", clicked)
          .on("mouseover", (event, d) => d3.select(event.currentTarget)
              .style("background-color", "#999999"))
          .on("mouseout", (event, d) => d3.select(event.currentTarget)
              .style("background-color", ""));

      function clicked(event, d) {
        const detailQuery = d[0];
        chart.dataJoinCallback(undefined, detailQuery);
      }
    }
  }
  hide() {
    // this.g.attr("display", "none");
    if (this.table && this.topCell) {
      // this.e.style.backgroundImage = "";
    }
  }
}

class FlagPreview {
  constructor(dataMap) {
    this.dataMap = dataMap;
  }
  setElement(e) {
    if (this.e) {
      return;
    }
    this.e = e;
  }
  show(d) {
    if (this.e) {
      const country = d.toString();
      const safeURI = encodeURI(this.dataMap.has(country) ? this.dataMap.get(country).imageUrl : DEFAULT_IMAGE_URL)
      this.e.style.backgroundImage = `url("${safeURI}")`;
    }
  }
  hide() {
    // this.g.attr("display", "none");
    if (this.e) {
      this.e.style.backgroundImage = "";
    }
  }
}

class Tooltip {
  constructor(parent) {
    this.node = parent.append("div")
        .attr("class", "tooltip")
        .style("pointer-events", "none")
        .style("opacity", 0);
  }
  show(event, d, detailQuery, valid, dataValue, color) {
    function textColor(d) {
      return d3.hsl(color(d)).l > 0.5 ? "#000" : "#fff";
    }

    function formatDataValue(x) {
      return detailQuery ? `${detailQuery}: ${x}` : `${f2p(x)} similar`;
    }

    this.node.transition()
      .duration(200)
      .style("opacity", .9);
    this.node.html(`${d.properties.name}<br/>
${valid ? formatDataValue(dataValue) : "N/A"}`)
      .style("left", (event.pageX) + "px")
      .style("background", color(dataValue))
      .style("color", textColor(dataValue))
      .style("top", (event.pageY - 28) + "px");
  }
  move(event, d) {
    this.node.style("left", (event.pageX) + "px")
      .style("top", (event.pageY - 28) + "px");
  }
  hide() {
    this.node.transition()
      .duration(500)
      .style("opacity", 0);
  }
}