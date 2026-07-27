export interface Country {
  code: string
  name: string
  nameTH: string
  states: string[]
}

export const COUNTRIES: Country[] = [
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

export function getCountry(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code)
}
