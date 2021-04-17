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

const DEFAULT_DATA = {
  get: () => 0,
  has: () => false,
  values: () => [0],
}