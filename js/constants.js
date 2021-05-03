const DEFAULT_IMAGE_URL = `data/svg/none.png`;
const URLs = {
  flag_csv: "data/flag.csv",
  gallery_names: "data/svg/gallery.json",
  feature_weights: "data/feature_weights.json",
  countries: "data/countries-50m.json"
};

const f4f = d3.format(".4f");
const f2p = d3.format(".2%");

const _featureWeights = async () => new Map(Object.entries(await d3.json(URLs.feature_weights)));
const _galleryNames = async () => new Map(Object.entries(await d3.json(URLs.gallery_names)));
const _world = async () => await d3.json(URLs.countries);
const _countries = async () => {
  const world = await _world();
  return topojson.feature(world, world.objects.countries);
}
const projection = d3.geoEqualEarth();
const path = d3.geoPath(projection);
const outline = ({type: "Sphere"});

const discreteFeatures = [
  // "name", "landmass", "zone", "language", "religion", 
  "mainhue", "topleft", "botright"];
const booleanFeatures = ["red", "green", "blue", "gold", "white", "black", "orange", "crescent", "triangle", "icon", "animate", "text"];
const numericFeatures = [
  // "area", "population", 
  "bars", "stripes", "colours", "circles", "crosses", "saltires", "quarters", "sunstars"];
const unusedDiscreteFeatures = [
  "name", "landmass", "zone", "language", "religion"];
const unusedNumericFeatures = [
  "area", "population"];

const DEFAULT_DATA = {
  get: () => 0,
  has: () => false,
  values: () => [0],
}

const insightsTitleMap = new Map([
  ["sunstars", "★ Seeing Stars ★"],
])
const insightsContentMap = new Map([
  ["sunstars", `
• The 50 stars on the <b>U.S. flag</b> represent the 50 states of the United States of America </br>
• The <b>flag of Brazil</b> contains 27 stars, representing the Brazilian states and the Federal District. </br>
• <b>Burma's (Myanmar's) flag</b> has 14 stars which represent each of the 14 member states of the Union of Burma. </br>
• The seven stars on the <b>Venezuelan flag</b> represent the seven signatories to the Venezuelan declaration of independence. </br>
• <b>China's flag</b> has 5 stars. The larger star symbolizes the Communist Party of China, and the four smaller stars that surround the big star symbolize the four social classes of China's New Democracy mentioned in Mao's "On the People's Democratic Dictatorship": the working class, the peasantry, the urban petite bourgeoisie, and the national bourgeoisie.
  `],
])