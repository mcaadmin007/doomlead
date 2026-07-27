export interface Country {
  code: string
  name: string
  nameTH?: string
  states: string[]
}

const FEATURED_COUNTRIES: Country[] = [
  {
    code: 'TH', name: 'Thailand', nameTH: 'ไทย',
    states: [
      'Amnat Charoen','Ang Thong','Bangkok','Bueng Kan','Buri Ram',
      'Chachoengsao','Chai Nat','Chaiyaphum','Chanthaburi','Chiang Mai',
      'Chiang Rai','Chon Buri','Chumphon','Kalasin','Kamphaeng Phet',
      'Kanchanaburi','Khon Kaen','Krabi','Lampang','Lamphun','Loei',
      'Lopburi','Mae Hong Son','Maha Sarakham','Mukdahan','Nakhon Nayok',
      'Nakhon Pathom','Nakhon Phanom','Nakhon Ratchasima','Nakhon Sawan',
      'Nakhon Si Thammarat','Nan','Narathiwat','Nong Bua Lamphu','Nong Khai',
      'Nonthaburi','Pathum Thani','Pattani','Phang Nga','Phatthalung',
      'Phayao','Phetchabun','Phetchaburi','Phichit','Phitsanulok',
      'Phra Nakhon Si Ayutthaya','Phrae','Phuket','Prachin Buri',
      'Prachuap Khiri Khan','Ranong','Ratchaburi','Rayong','Roi Et',
      'Sa Kaeo','Sakon Nakhon','Samut Prakan','Samut Sakhon','Samut Songkhram',
      'Saraburi','Satun','Sing Buri','Si Sa Ket','Songkhla','Sukhothai',
      'Suphan Buri','Surat Thani','Surin','Tak','Trang','Trat',
      'Ubon Ratchathani','Udon Thani','Uthai Thani','Uttaradit','Yala','Yasothon',
    ],
  },
  {
    code: 'SG', name: 'Singapore', nameTH: 'สิงคโปร์',
    states: ['Central Region','East Region','North Region','North-East Region','West Region'],
  },
  {
    code: 'MY', name: 'Malaysia', nameTH: 'มาเลเซีย',
    states: ['Johor','Kedah','Kelantan','Kuala Lumpur','Labuan','Melaka','Negeri Sembilan','Pahang','Penang','Perak','Perlis','Putrajaya','Sabah','Sarawak','Selangor','Terengganu'],
  },
  {
    code: 'ID', name: 'Indonesia', nameTH: 'อินโดนีเซีย',
    states: ['Bali','Bandung','Jakarta','Makassar','Medan','Semarang','Surabaya','Yogyakarta'],
  },
  {
    code: 'VN', name: 'Vietnam', nameTH: 'เวียดนาม',
    states: ['Da Nang','Hai Phong','Hanoi','Ho Chi Minh City','Hue','Nha Trang'],
  },
  {
    code: 'PH', name: 'Philippines', nameTH: 'ฟิลิปปินส์',
    states: ['Cebu','Davao','Manila','Quezon City'],
  },
  {
    code: 'US', name: 'United States', nameTH: 'สหรัฐอเมริกา',
    states: ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'],
  },
  {
    code: 'GB', name: 'United Kingdom', nameTH: 'สหราชอาณาจักร',
    states: ['Birmingham','Bristol','Edinburgh','Glasgow','Leeds','Liverpool','London','Manchester','Sheffield'],
  },
  {
    code: 'AU', name: 'Australia', nameTH: 'ออสเตรเลีย',
    states: ['Australian Capital Territory','New South Wales','Northern Territory','Queensland','South Australia','Tasmania','Victoria','Western Australia'],
  },
  {
    code: 'JP', name: 'Japan', nameTH: 'ญี่ปุ่น',
    states: ['Aichi','Fukuoka','Hokkaido','Kanagawa','Kyoto','Osaka','Sapporo','Tokyo'],
  },
  {
    code: 'CN', name: 'China', nameTH: 'จีน',
    states: ['Beijing','Chengdu','Guangzhou','Hangzhou','Nanjing','Shanghai','Shenzhen','Wuhan'],
  },
  {
    code: 'KR', name: 'South Korea', nameTH: 'เกาหลีใต้',
    states: ['Busan','Daegu','Daejeon','Gwangju','Incheon','Seoul','Ulsan'],
  },
  {
    code: 'IN', name: 'India', nameTH: 'อินเดีย',
    states: ['Andhra Pradesh','Delhi','Gujarat','Karnataka','Kerala','Maharashtra','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal'],
  },
  {
    code: 'DE', name: 'Germany', nameTH: 'เยอรมนี',
    states: ['Baden-Württemberg','Bavaria','Berlin','Brandenburg','Bremen','Hamburg','Hesse','Lower Saxony','Mecklenburg-Vorpommern','North Rhine-Westphalia','Rhineland-Palatinate','Saarland','Saxony','Saxony-Anhalt','Schleswig-Holstein','Thuringia'],
  },
  {
    code: 'FR', name: 'France', nameTH: 'ฝรั่งเศส',
    states: ['Bordeaux','Lille','Lyon','Marseille','Nantes','Nice','Paris','Strasbourg','Toulouse'],
  },
  {
    code: 'AE', name: 'United Arab Emirates', nameTH: 'สหรัฐอาหรับเอมิเรตส์',
    states: ['Abu Dhabi','Ajman','Dubai','Fujairah','Ras Al Khaimah','Sharjah','Umm Al Quwain'],
  },
  {
    code: 'CA', name: 'Canada', nameTH: 'แคนาดา',
    states: ['Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador','Nova Scotia','Ontario','Prince Edward Island','Quebec','Saskatchewan'],
  },
]

// ISO 3166-1 countries. Featured countries above retain their province/state
// lists, while every other country remains searchable at country level.
const ISO_COUNTRIES = `
AD|Andorra
AF|Afghanistan
AG|Antigua and Barbuda
AL|Albania
AM|Armenia
AO|Angola
AR|Argentina
AT|Austria
AZ|Azerbaijan
BA|Bosnia and Herzegovina
BB|Barbados
BD|Bangladesh
BE|Belgium
BF|Burkina Faso
BG|Bulgaria
BH|Bahrain
BI|Burundi
BJ|Benin
BN|Brunei
BO|Bolivia
BR|Brazil
BS|Bahamas
BT|Bhutan
BW|Botswana
BY|Belarus
BZ|Belize
CD|Democratic Republic of the Congo
CF|Central African Republic
CG|Republic of the Congo
CH|Switzerland
CI|Côte d'Ivoire
CL|Chile
CM|Cameroon
CO|Colombia
CR|Costa Rica
CU|Cuba
CV|Cabo Verde
CY|Cyprus
CZ|Czechia
DJ|Djibouti
DK|Denmark
DM|Dominica
DO|Dominican Republic
DZ|Algeria
EC|Ecuador
EE|Estonia
EG|Egypt
ER|Eritrea
ES|Spain
ET|Ethiopia
FI|Finland
FJ|Fiji
FM|Micronesia
GA|Gabon
GD|Grenada
GE|Georgia
GH|Ghana
GM|Gambia
GN|Guinea
GQ|Equatorial Guinea
GR|Greece
GT|Guatemala
GW|Guinea-Bissau
GY|Guyana
HN|Honduras
HR|Croatia
HT|Haiti
HU|Hungary
IE|Ireland
IL|Israel
IQ|Iraq
IR|Iran
IS|Iceland
IT|Italy
JM|Jamaica
JO|Jordan
KE|Kenya
KG|Kyrgyzstan
KH|Cambodia
KI|Kiribati
KM|Comoros
KN|Saint Kitts and Nevis
KP|North Korea
KW|Kuwait
KZ|Kazakhstan
LA|Laos
LB|Lebanon
LC|Saint Lucia
LI|Liechtenstein
LK|Sri Lanka
LR|Liberia
LS|Lesotho
LT|Lithuania
LU|Luxembourg
LV|Latvia
LY|Libya
MA|Morocco
MC|Monaco
MD|Moldova
ME|Montenegro
MG|Madagascar
MH|Marshall Islands
MK|North Macedonia
ML|Mali
MM|Myanmar
MN|Mongolia
MR|Mauritania
MT|Malta
MU|Mauritius
MV|Maldives
MW|Malawi
MX|Mexico
MZ|Mozambique
NA|Namibia
NE|Niger
NG|Nigeria
NI|Nicaragua
NL|Netherlands
NO|Norway
NP|Nepal
NR|Nauru
NZ|New Zealand
OM|Oman
PA|Panama
PE|Peru
PG|Papua New Guinea
PK|Pakistan
PL|Poland
PS|Palestine
PT|Portugal
PW|Palau
PY|Paraguay
QA|Qatar
RO|Romania
RS|Serbia
RU|Russia
RW|Rwanda
SA|Saudi Arabia
SB|Solomon Islands
SC|Seychelles
SD|Sudan
SE|Sweden
SI|Slovenia
SK|Slovakia
SL|Sierra Leone
SM|San Marino
SN|Senegal
SO|Somalia
SR|Suriname
SS|South Sudan
ST|São Tomé and Príncipe
SV|El Salvador
SY|Syria
SZ|Eswatini
TD|Chad
TG|Togo
TJ|Tajikistan
TL|Timor-Leste
TM|Turkmenistan
TN|Tunisia
TO|Tonga
TR|Türkiye
TT|Trinidad and Tobago
TV|Tuvalu
TZ|Tanzania
UA|Ukraine
UG|Uganda
UY|Uruguay
UZ|Uzbekistan
VA|Vatican City
VC|Saint Vincent and the Grenadines
VE|Venezuela
VU|Vanuatu
WS|Samoa
XK|Kosovo
YE|Yemen
ZA|South Africa
ZM|Zambia
ZW|Zimbabwe
`
  .trim()
  .split('\n')
  .map((line): Country => {
    const [code, name] = line.split('|')
    return { code, name, states: [] }
  })

const countriesByCode = new Map(
  [...ISO_COUNTRIES, ...FEATURED_COUNTRIES].map(country => [country.code, country])
)

export const COUNTRIES: Country[] = Array.from(countriesByCode.values())
  .sort((a, b) => a.name.localeCompare(b.name))

export function getCountry(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code)
}
