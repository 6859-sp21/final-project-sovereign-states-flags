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

const detailTableFeatures = [
  "bars", "stripes", "circles", "crosses", "saltires", "quarters", "sunstars", "crescent", "triangle", "icon", "animate", "text",
  "mainhue", "topleft", "botright",
  "colours", "red", "green", "blue", "gold", "white", "black", "orange",
];

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

// thing

  ["bars", "‖ Behind Bars ‖"],
  ["circles", "Going in Circles ◯"],
  ["saltires", "☓ Saltirewise ☓"],
  ["crescent", "☾ To the Moon"],
  ["triangle", "△ Triangles △"],
  ["icon", "Cultural Icons 🏰"],
  ["animate", "🍁 Look Alive! 🦅"],
])
const insightsContentMap = new Map([
  ["icon", `
• The <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_the_Soviet_Union" class="insight-hover" data-country="Russia">flag of the Soviet Union</a> features an iconic hammer and sickle design. The union of the hammer (workers) and the sickle (peasants) represents the victorious and enduring revolutionary alliance. The famous emblem is topped by a gold-bordered red star representing the Communist Party of the Soviet Union. </br>
• <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_the_People%27s_Republic_of_Kampuchea" class="insight-hover" data-country="Cambodia">Cambodia's flag</a>, used from 1979 to 1993 during the Cambodian–Vietnamese War, features a five-towered Angkor Wat silhouette in the center. It symbolizes the country's religion, being one of the most important pilgrimage sites for Buddhists in Cambodia and around the world. </br>
  `],
  ["animate", `
• The <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Canada" class="insight-hover" data-country="Canada">Canadian flag</a> features an animate red maple leaf. The maple leaf symbol traces its origins to the early 1700s, by when it had been adopted as an emblem by the French Canadians along the Saint Lawrence River. Jacques Viger, the first mayor of Montreal, described the maple as "the king of our forest; ... the symbol of the Canadian people." </br>
• The <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Albania" class="insight-hover" data-country="Albania">flag of Albania</a> features a silhouetted double-headed eagle. The design was inspired by the Byzantine imperial flag, and represents the sovereign state of Albania, prominent against the red which stands for bravery, strength, valour and bloodshed. </br>
  `],
  ["triangle", `
• The flags of 
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Jordan" class="insight-hover" data-country="Jordan">Jordan</a>, 
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Sudan" class="insight-hover" data-country="Sudan">Sudan</a>,
share a similar triangle and tricolour design. <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Jordan" class="insight-hover" data-country="Jordan">Jordan's</a> design features a red triangle, representing the Hashemite dynasty, and the Arab Revolt. <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Sudan" class="insight-hover" data-country="Sudan">Sudan's</a> design uses a green triangle as a distinguishing feature to the designs of
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Syria" class="insight-hover" data-country="Syria">Syria</a>, 
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Iraq" class="insight-hover" data-country="Iraq">Iraq</a>,
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Yemen" class="insight-hover" data-country="North Yemen">North Yemen</a>,
    which instead use green stars.
  `],
  ["crescent", `
• The flags of 
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Pakistan" class="insight-hover" data-country="Pakistan">Pakistan</a>, 
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_the_Comoros" class="insight-hover" data-country="Comoros">Comoros</a>, 
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Mauritania" class="insight-hover" data-country="Mauritania">Mauritania</a>, 
share a similar star and crescent design. Each of these countries, each with strong ties to Islam, indeed feature these symbols to celebrate the Islamic star and crescent.
• The flags of 
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Turkey" class="insight-hover" data-country="Turkey">Turkey</a>, 
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Tunisia" class="insight-hover" data-country="Tunisia">Tunisia</a>, 
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Singapore" class="insight-hover" data-country="Singapore">Singapore</a>, 
also share a similar star and crescent design, but attribute different meanings to the symbol. <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Tunisia" class="insight-hover" data-country="Tunisia">Tunisia's design</a> celebrates the Islamic star and crescent. <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Singapore" class="insight-hover" data-country="Singapore">Singapore's</a> star and crescent design represent their national ideals, and the idea of a young nation on the ascendant, respectively. <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Turkey" class="insight-hover" data-country="Turkey">Turkey's design</a> is based on an Ottoman legend about a dream of the founder of the Ottoman house, Osman I.
  `],
  ["saltires", `
• A saltire, also called Saint Andrew's Cross or the crux decussata, is a heraldic symbol in the form of a diagonal cross, like the shape of the letter X in Roman type. In its early use was not intended as representing a Christian cross symbol. The association with Saint Andrew is a development of the 15th to 16th centuries. The flags of 
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Burundi" class="insight-hover" data-country="Burundi">Burundi</a>, 
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Jamaica" class="insight-hover" data-country="Jamaica">Jamaica</a>, 
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_the_United_Kingdom" class="insight-hover" data-country="United Kingdom">United Kingdom</a>, 
all use saltires.
  `],
  ["circles", `
• The four circular jewels on the <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Bhutan" class="insight-hover" data-country="Bhutan">flag of Bhutan</a>, held in Druk's (the dragon's) claws, represent Bhutan's wealth and the security and protection of its people. </br>
• <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Mongolia" class="insight-hover" data-country="Mongolia">Mongolia's flag</a> has two circles; the first of which represents the sun in the Soyombo symbol — a geometric abstraction that represents fire, sun, moon, earth, water — and the second representing the duality of yin and yang. </br>
• The flags of 
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Bangladesh" class="insight-hover" data-country="Bangladesh">Bangladesh</a>, 
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Japan" class="insight-hover" data-country="Japan">Japan</a>, 
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Greenland" class="insight-hover" data-country="Greenland">Greenland</a>, 
which prominently feature a circle, each attribute different meanings to the symbol. To <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Bangladesh" class="insight-hover" data-country="Bangladesh">Bangladesh</a>, the red dot symbolizes the blood of the martyrs who gave away their life to bring about the nation's foundation. The red dot in <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Japan" class="insight-hover" data-country="Japan">Japan's flag</a> represents the sun, as does the red semicircle in <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Greenland" class="insight-hover" data-country="Greenland">Greenland's flag</a>, while its white semicircle represents the country's icebergs and pack ice.
  `],
  ["bars", `
• The tricolour flag design, which features three parallel bands of different colours, originated in the 16th century as a symbol of republicanism, liberty or indeed revolution. Using this design, the flags of 
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_France" class="insight-hover" data-country="France">France</a>, 
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Italy" class="insight-hover" data-country="Italy">Italy</a>, 
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Romania" class="insight-hover" data-country="Romania">Romania</a>, 
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Mexico" class="insight-hover" data-country="Mexico">Mexico</a>, 
    <a target="_blank" href="https://en.wikipedia.org/wiki/Flag_of_Ireland" class="insight-hover" data-country="Ireland">Ireland</a>, 
were all (except Ireland) first adopted with the formation of an independent republic in the period of the French Revolution to the Revolutions of 1848.
  `],


// thing

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
• You may notice the Nordic cross and the characteristic shift of its center towards the hoist side. The origins of this tradition can be traced back to 11 June 1748, when regulations for the Danish civil ensign for merchant ships specified: "the two first fields must be square in form and the two outer fields must be 6⁄4 lengths of those". </br>
  `],
])