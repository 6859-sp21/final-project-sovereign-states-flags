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
  ["crosses", "✞ A Cross to Bear"],
  ["quarters", "▚ Close Quarters ▞"],
])
const insightsContentMap = new Map([
  ["bars", `
  https://en.wikipedia.org/wiki/Tricolour_(flag)
  `],
  ["quarters", `
• The Union Flag appears in the canton (upper flagstaff-side quarter) of the flags of several nations and territories that are former British possessions or dominions. Four former British colonies in Oceania which are now independent countries incorporate the Union Jack as part of their national flags: <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Australia" class="insight-hover" data-country="Australia">Australia</a>, <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_New_Zealand" class="insight-hover" data-country="New Zealand">New Zealand</a>, <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Tuvalu" class="insight-hover" data-country="Tuvalu">Tuvalu</a>, <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Fiji" class="insight-hover" data-country="Fiji">Fiji</a>. <br>
• British Overseas Territories, whose flags incorporate the Union Jack: 
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Bermuda" class="insight-hover" data-country="Bermuda">Bermuda</a>, 
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_the_British_Virgin_Islands" class="insight-hover" data-country="British Virgin Is.">British Virgin Is.</a>, 
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_the_Cayman_Islands" class="insight-hover" data-country="Cayman Is.">Cayman Is.</a>, 
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_the_Falkland_Islands" class="insight-hover" data-country="Falkland Is.">Falkland Is.</a>, 
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Montserrat" class="insight-hover" data-country="Montserrat">Montserrat</a>, 
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Saint_Helena" class="insight-hover" data-country="Saint Helena">Saint Helena</a>, 
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_the_Turks_and_Caicos_Islands" class="insight-hover" data-country="Turks and Caicos Is.">Turks and Caicos Is.</a>
  `],
  ["sunstars", `
• The 50 stars on the <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_the_United_States" class="insight-hover" data-country="United States of America">U.S. flag</a> represent the 50 states of the United States of America. </br>
• The <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Brazil" class="insight-hover" data-country="Brazil">flag of Brazil</a> contains 27 stars, representing the Brazilian states and the Federal District. </br>
• <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Myanmar" class="insight-hover" data-country="Myanmar">Burma's (Myanmar's) flag</a> has 14 stars which represent each of the 14 member states of the Union of Burma. </br>
• The seven stars on the <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Venezuela" class="insight-hover" data-country="Venezuela">Venezuelan flag</a> represent the seven signatories to the Venezuelan declaration of independence. </br>
• <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_China" class="insight-hover" data-country="China">China's flag</a> has 5 stars. The larger star symbolizes the Communist Party of China, and the four smaller stars that surround the big star symbolize the four social classes of China's New Democracy mentioned in Mao's "On the People's Democratic Dictatorship": the working class, the peasantry, the urban petite bourgeoisie, and the national bourgeoisie.
  `],
  ["stripes", `
• The 14 stripes on the <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Malaysia" class="insight-hover" data-country="Malaysia">flag of Malaysia</a> represent the equal status in the federation of its 13 member states and the federal territories. </br>
• The <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_the_United_States" class="insight-hover" data-country="United States of America">U.S. flag</a> contains 13 stripes, representing the thirteen British colonies that declared independence from the Kingdom of Great Britain, and became the first states in the U.S. </br>
• The <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Liberia" class="insight-hover" data-country="Liberia">Liberian flag</a> has 11 stripes which represent each of the 11 signatories of the Liberian Declaration of Independence. </br>
• The nine stripes on the <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Greece" class="insight-hover" data-country="Greece">flag of Greece</a>, according to popular tradition, represent the nine syllables of its motto, Eleftheria i thanatos ("Freedom or Death"). </br>
• <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Uruguay" class="insight-hover" data-country="Uruguay">Uruguay's flag</a> has nine stripes. They represent the nine original departments (administrative subdivisions) of Uruguay, and the design takes inspiration from the 13 stripes of the U.S. flag.
  `],
  ["crosses", `
• The flags of <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Denmark" class="insight-hover" data-country="Denmark">Denmark</a>, <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Finland" class="insight-hover" data-country="Finland">Finland</a>, <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Sweden" class="insight-hover" data-country="Sweden">Sweden</a>, <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_the_Faroe_Islands" class="insight-hover" data-country="Faeroe Is.">Faeroe Is.</a>, <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Iceland" class="insight-hover" data-country="Iceland">Iceland</a>, <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Norway" class="insight-hover" data-country="Norway">Norway</a>, all bear the design of the Nordic or Scandinavian cross. The cross design represents Christianity and today, the Nordic cross design is used in the national flags of all independent Nordic countries.</br>
• You may notice the Nordic cross and the characteristic shift of its center towards the hoist side. The origins of this property can be traced back to 11 June 1748, when regulations for the Danish civil ensign for merchant ships specified: "the two first fields must be square in form and the two outer fields must be 6⁄4 lengths of those". </br>
  `],
])