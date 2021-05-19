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
  ["stripes", "Earn Your Stripes ⛿"],
])
const insightsContentMap = new Map([
  ["sunstars", `
• The 50 stars on the <a href="https://en.wikipedia.org/wiki/Flag_of_the_United_States" class="insight-hover" data-country="United States of America">U.S. flag</a> represent the 50 states of the United States of America. </br>
• The <a href="https://en.wikipedia.org/wiki/Flag_of_Brazil" class="insight-hover" data-country="Brazil">flag of Brazil</a> contains 27 stars, representing the Brazilian states and the Federal District. </br>
• <a href="https://en.wikipedia.org/wiki/Flag_of_Myanmar" class="insight-hover" data-country="Myanmar">Burma's (Myanmar's) flag</a> has 14 stars which represent each of the 14 member states of the Union of Burma. </br>
• The seven stars on the <a href="https://en.wikipedia.org/wiki/Flag_of_Venezuela" class="insight-hover" data-country="Venezuela">Venezuelan flag</a> represent the seven signatories to the Venezuelan declaration of independence. </br>
• <a href="https://en.wikipedia.org/wiki/Flag_of_China" class="insight-hover" data-country="China">China's flag</a> has 5 stars. The larger star symbolizes the Communist Party of China, and the four smaller stars that surround the big star symbolize the four social classes of China's New Democracy mentioned in Mao's "On the People's Democratic Dictatorship": the working class, the peasantry, the urban petite bourgeoisie, and the national bourgeoisie.
  `],
  ["stripes", `
• The 14 stripes on the <a href="https://en.wikipedia.org/wiki/Flag_of_Malaysia" class="insight-hover" data-country="Malaysia">flag of Malaysia</a> represent the equal status in the federation of its 13 member states and the federal territories. </br>
• The <a href="https://en.wikipedia.org/wiki/Flag_of_the_United_States" class="insight-hover" data-country="United States of America">U.S. flag</a> contains 13 stripes, representing the thirteen British colonies that declared independence from the Kingdom of Great Britain, and became the first states in the U.S. </br>
• The <a href="https://en.wikipedia.org/wiki/Flag_of_Liberia" class="insight-hover" data-country="Liberia">Liberian flag</a> has 11 stripes which represent each of the 11 signatories of the Liberian Declaration of Independence. </br>
• The nine stripes on the <a href="https://en.wikipedia.org/wiki/Flag_of_Greece" class="insight-hover" data-country="Greece">flag of Greece</a>, according to popular tradition, represent the nine syllables of its motto, Eleftheria i thanatos ("Freedom or Death"). </br>
• <a href="https://en.wikipedia.org/wiki/Flag_of_Uruguay" class="insight-hover" data-country="Uruguay">Uruguay's flag</a> has nine stripes. They represent the nine original departments (administrative subdivisions) of Uruguay, and the design takes inspiration from the 13 stripes of the U.S. flag.
  `],
])