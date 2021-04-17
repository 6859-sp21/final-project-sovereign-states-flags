const myrename = new Map([
  ["British Virgin Isles", "British Virgin Is."],
  ["Burkina", "Burkina Faso"],
  ["Burma", "Myanmar"],
  ["Cayman Islands", "Cayman Is."],
  ["Cape Verde Islands", "Cabo Verde"],
  ["Central African Republic", "Central African Rep."],
  ["Comorro Islands", "Comoros"],
  ["Congo", "Dem. Rep. Congo"],
  ["Cook Islands", "Cook Is."],
  ["Dominican Republic", "Dominican Rep."],
  ["Equatorial Guinea", "Eq. Guinea"],
  ["Falklands Malvinas", "Falkland Is."],
  ["Faeroes", "Faeroe Is."],
  // ["French Guiana", "?"],
  ["French Polynesia", "Fr. Polynesia"],
  // ["Gibraltar", "?"],
  ["Guinea Bissau", "Guinea-Bissau"],
  ["Ivory Coast", "Côte d'Ivoire"],
  ["Maldive Islands", "Maldives"],
  ["Marianas", "N. Mariana Is."],
  // ["Netherlands Antilles", "?"],
  ["Sao Tome", "São Tomé and Principe"],
  ["Saint Kitts Nevis", "St. Kitts and Nevis"],
  ["Saint Vincent", "St. Vin. and Gren."],
  ["Solomon Islands", "Solomon Is."],
  ["Surinam", "Suriname"],
  ["Swaziland", "eSwatini"],
  ["Trinidad Tobago", "Trinidad and Tobago"],
  ["Turks Caicos Islands", "Turks and Caicos Is."],
  // ["Tuvalu", ?],
  ["UAE", "United Arab Emirates"],
  ["USA", "United States of America"],
  ["US Virgin Isles", "U.S. Virgin Is."],
  ["UK", "United Kingdom"],
  ["USSR", "Russia"],
  ["Vatican City", "Vatican"],
  // ["Yugoslavia", "?"],
  // ["Zaire", "?"],
])

// const rename = new Map([
//   ["Antigua and Barbuda", "Antigua and Barb."],
//   ["Bolivia (Plurinational State of)", "Bolivia"],
//   ["Bosnia and Herzegovina", "Bosnia and Herz."],
//   ["Brunei Darussalam", "Brunei"],
//   ["Central African Republic", "Central African Rep."],
//   ["Democratic People's Republic of Korea", "North Korea"],
//   ["Iran (Islamic Republic of)", "Iran"],
//   ["Lao People's Democratic Republic", "Laos"],
//   ["Marshall Islands", "Marshall Is."],
//   ["Micronesia (Federated States of)", "Micronesia"],
//   ["Republic of Korea", "South Korea"],
//   ["Republic of Moldova", "Moldova"],
//   ["Russian Federation", "Russia"],
//   ["Saint Vincent and the Grenadines", "St. Vin. and Gren."],
//   ["Sao Tome and Principe", "São Tomé and Principe"],
//   ["South Sudan", "S. Sudan"],
//   ["Syrian Arab Republic", "Syria"],
//   ["The former Yugoslav Republic of Macedonia", "Macedonia"],
//   ["United Republic of Tanzania", "Tanzania"],
//   ["Venezuela (Bolivarian Republic of)", "Venezuela"],
//   ["Viet Nam", "Vietnam"]
// ]);

const _flagData = async () => await d3.csv(URLs.flag_csv, function(d) {
  d.name = d.name.replace("St-", "Saint-");
  d.name = d.name.replaceAll("-", " ");
  d.name = myrename.get(d.name) || d.name;
  // d.name = myrename.get(d.name) || rename.get(d.name) || d.name;
  return d;
});