/**
 * Lista de países con sus estados y ciudades
 * Estructura jerárquica: countries > states > cities > districts > neighborhoods
 *
 * Los códigos utilizados siguen los estándares oficiales de cada país:
 * - ISO 3166-2: Códigos internacionales de subdivisión
 * - Códigos nacionales: Sistemas específicos de cada instituto estadístico
 */

const countries = [
  {
    label: "Colombia",
    value: "CO",
    id: "66d61979a546e02c6ce65a39",
    // DANE (Departamento Administrativo Nacional de Estadística)
    // Sistema: DIVIPOLA (Codificación de la División Política Administrativa)
    // Niveles: Departamentos → Municipios
    // Código: 5 dígitos (2 departamento + 3 municipio)
    statisticalInstitute: "DANE",
    codingSystem: "DIVIPOLA",
    adminLevels: ["Departamento", "Municipio"],
    states: [
      {
        label: "Antioquia",
        value: "05",
        cities: [
          {
            label: "Medellín",
            value: "05001",
            sID: "hq79WDaisL",
          },
          {
            label: "Abejorral",
            value: "05002",
            sID: "z976UKCPHi",
          },
          {
            label: "Abriaquí",
            value: "05004",
            sID: "ok7HWypiWX",
          },
          {
            label: "Alejandría",
            value: "05021",
            sID: "kB5sORBdY2",
          },
          {
            label: "Amagá",
            value: "05030",
            sID: "Ni1qs720iZ",
          },
          {
            label: "Amalfi",
            value: "05031",
            sID: "4SChpP9Sc3",
          },
          {
            label: "Andes",
            value: "05034",
            sID: "uqxIahbqq9",
          },
          {
            label: "Angelópolis",
            value: "05036",
            sID: "MO11JYtCAM",
          },
          {
            label: "Angostura",
            value: "05038",
            sID: "jBFmWZnBHD",
          },
          {
            label: "Anorí",
            value: "05040",
            sID: "4HhoWcq7PC",
          },
          {
            label: "Santa Fé De Antioquia",
            value: "05042",
            sID: "F6yzn1wj0A",
          },
          {
            label: "Anzá",
            value: "05044",
            sID: "0Wl2gSrHtp",
          },
          {
            label: "Apartadó",
            value: "05045",
            sID: "humNldYDJP",
          },
          {
            label: "Arboletes",
            value: "05051",
            sID: "HowbdwohPI",
          },
          {
            label: "Argelia",
            value: "05055",
            sID: "t3llTnFhpx",
          },
          {
            label: "Armenia",
            value: "05059",
            sID: "mbn9fcvSHM",
          },
          {
            label: "Barbosa",
            value: "05079",
            sID: "p46AjF8czz",
          },
          {
            label: "Belmira",
            value: "05086",
            sID: "nzR7nMNbaD",
          },
          {
            label: "Bello",
            value: "05088",
            sID: "Xit1MQIWG3",
          },
          {
            label: "Betania",
            value: "05091",
            sID: "bgHoCgpTqK",
          },
          {
            label: "Betulia",
            value: "05093",
            sID: "wuwVyq9tzf",
          },
          {
            label: "Ciudad Bolívar",
            value: "05101",
            sID: "HH5Kb5Zj3e",
          },
          {
            label: "Briceño",
            value: "05107",
            sID: "uAJdo7NR6g",
          },
          {
            label: "Buriticá",
            value: "05113",
            sID: "Ym8OtxNdJI",
          },
          {
            label: "Cáceres",
            value: "05120",
            sID: "VzesR73Knp",
          },
          {
            label: "Caicedo",
            value: "05125",
            sID: "y68qZTwVLR",
          },
          {
            label: "Caldas",
            value: "05129",
            sID: "4nCdkbtug3",
          },
          {
            label: "Campamento",
            value: "05134",
            sID: "jGTaacAbuP",
          },
          {
            label: "Cañasgordas",
            value: "05138",
            sID: "wkCkVn7GmC",
          },
          {
            label: "Caracolí",
            value: "05142",
            sID: "RtD2zJ4Ypq",
          },
          {
            label: "Caramanta",
            value: "05145",
            sID: "931hYWOtx4",
          },
          {
            label: "Carepa",
            value: "05147",
            sID: "f0nAvgddnE",
          },
          {
            label: "El Carmen De Viboral",
            value: "05148",
            sID: "FBnHqXgnIq",
          },
          {
            label: "Carolina",
            value: "05150",
            sID: "eBf2dIkz9o",
          },
          {
            label: "Caucasia",
            value: "05154",
            sID: "biMWoE8GR5",
          },
          {
            label: "Chigorodó",
            value: "05172",
            sID: "DmqDkkNDLw",
          },
          {
            label: "Cisneros",
            value: "05190",
            sID: "vJReRD9fFf",
          },
          {
            label: "Cocorná",
            value: "05197",
            sID: "jSKatl1YNu",
          },
          {
            label: "Concepción",
            value: "05206",
            sID: "7YAw7twZCL",
          },
          {
            label: "Concordia",
            value: "05209",
            sID: "HcJtgnL1Vr",
          },
          {
            label: "Copacabana",
            value: "05212",
            sID: "oQUwcPjeXC",
          },
          {
            label: "Dabeiba",
            value: "05234",
            sID: "figDPSuBif",
          },
          {
            label: "Donmatías",
            value: "05237",
            sID: "CzMmdM7vJL",
          },
          {
            label: "Ebéjico",
            value: "05240",
            sID: "fDkJfP0sWm",
          },
          {
            label: "El Bagre",
            value: "05250",
            sID: "tUxe0B7QA6",
          },
          {
            label: "Entrerríos",
            value: "05264",
            sID: "8geffa0DlV",
          },
          {
            label: "Envigado",
            value: "05266",
            sID: "LuKXwutIZS",
          },
          {
            label: "Fredonia",
            value: "05282",
            sID: "t8ppTYTrhi",
          },
          {
            label: "Frontino",
            value: "05284",
            sID: "t2ERu5tstJ",
          },
          {
            label: "Giraldo",
            value: "05306",
            sID: "QSf8ffifIE",
          },
          {
            label: "Girardota",
            value: "05308",
            sID: "WcyXgIW8NJ",
          },
          {
            label: "Gómez Plata",
            value: "05310",
            sID: "Jm1dz2xpHw",
          },
          {
            label: "Granada",
            value: "05313",
            sID: "tz5G3wLxmP",
          },
          {
            label: "Guadalupe",
            value: "05315",
            sID: "7UrTXJKZjO",
          },
          {
            label: "Guarne",
            value: "05318",
            sID: "HlgHiIePNi",
          },
          {
            label: "Guatapé",
            value: "05321",
            sID: "R6VZ7PDcE5",
          },
          {
            label: "Heliconia",
            value: "05347",
            sID: "tsM4bfIrIX",
          },
          {
            label: "Hispania",
            value: "05353",
            sID: "sCxirnJcrh",
          },
          {
            label: "Itagüí",
            value: "05360",
            sID: "bXK93yacqG",
          },
          {
            label: "Ituango",
            value: "05361",
            sID: "oWiSep0SkK",
          },
          {
            label: "Jardín",
            value: "05364",
            sID: "4UgdrWWuPv",
          },
          {
            label: "Jericó",
            value: "05368",
            sID: "vqhISMcksu",
          },
          {
            label: "La Ceja",
            value: "05376",
            sID: "PNHL4zNklJ",
          },
          {
            label: "La Estrella",
            value: "05380",
            sID: "tB3JkY7xgE",
          },
          {
            label: "La Pintada",
            value: "05390",
            sID: "rUBhsOw65g",
          },
          {
            label: "La Unión",
            value: "05400",
            sID: "AiyAineoaZ",
          },
          {
            label: "Liborina",
            value: "05411",
            sID: "SpwDMD6IjM",
          },
          {
            label: "Maceo",
            value: "05425",
            sID: "xc7OnKhhmO",
          },
          {
            label: "Marinilla",
            value: "05440",
            sID: "4S0cxukwUv",
          },
          {
            label: "Montebello",
            value: "05467",
            sID: "kwcfa8qaLO",
          },
          {
            label: "Murindó",
            value: "05475",
            sID: "HtrYnclXoB",
          },
          {
            label: "Mutatá",
            value: "05480",
            sID: "qPuaBeYPgL",
          },
          {
            label: "Nariño",
            value: "05483",
            sID: "iogrfXkP6Q",
          },
          {
            label: "Necoclí",
            value: "05490",
            sID: "iI32PsZU9l",
          },
          {
            label: "Nechí",
            value: "05495",
            sID: "0NfmXYx0XE",
          },
          {
            label: "Olaya",
            value: "05501",
            sID: "PawC349F6N",
          },
          {
            label: "Peñol",
            value: "05541",
            sID: "q3gKPNw3r7",
          },
          {
            label: "Peque",
            value: "05543",
            sID: "AZQz8zwHXk",
          },
          {
            label: "Pueblorrico",
            value: "05576",
            sID: "OhmL04ypa1",
          },
          {
            label: "Puerto Berrío",
            value: "05579",
            sID: "lxR65gDRYm",
          },
          {
            label: "Puerto Nare",
            value: "05585",
            sID: "etp1x4q8j4",
          },
          {
            label: "Puerto Triunfo",
            value: "05591",
            sID: "Z3suQaJldE",
          },
          {
            label: "Remedios",
            value: "05604",
            sID: "KBM5dAvTO0",
          },
          {
            label: "Retiro",
            value: "05607",
            sID: "vsjtJKpqt7",
          },
          {
            label: "Rionegro",
            value: "05615",
            sID: "7IXn0chNkW",
          },
          {
            label: "Sabanalarga",
            value: "05628",
            sID: "SgZqtmPbzV",
          },
          {
            label: "Sabaneta",
            value: "05631",
            sID: "5ITkrdtXIx",
          },
          {
            label: "Salgar",
            value: "05642",
            sID: "pFJbpXCT9V",
          },
          {
            label: "San Andrés De Cuerquía",
            value: "05647",
            sID: "s5k9rCLaQN",
          },
          {
            label: "San Carlos",
            value: "05649",
            sID: "QTFRrHTdCf",
          },
          {
            label: "San Francisco",
            value: "05652",
            sID: "CgDVGNpEkK",
          },
          {
            label: "San Jerónimo",
            value: "05656",
            sID: "8SujugZCfh",
          },
          {
            label: "San José De La Montaña",
            value: "05658",
            sID: "pAjI0zXNqo",
          },
          {
            label: "San Juan De Urabá",
            value: "05659",
            sID: "kpO3EWN4z7",
          },
          {
            label: "San Luis",
            value: "05660",
            sID: "undPhKwAHz",
          },
          {
            label: "San Pedro De Los Milagros",
            value: "05664",
            sID: "HyJvByzZJs",
          },
          {
            label: "San Pedro De Urabá",
            value: "05665",
            sID: "XL2rOKNeyK",
          },
          {
            label: "San Rafael",
            value: "05667",
            sID: "n7AynjtIUE",
          },
          {
            label: "San Roque",
            value: "05670",
            sID: "fIWiYEBPG8",
          },
          {
            label: "San Vicente Ferrer",
            value: "05674",
            sID: "XbVY2d9UHP",
          },
          {
            label: "Santa Bárbara",
            value: "05679",
            sID: "WCDBmlLJPu",
          },
          {
            label: "Santa Rosa De Osos",
            value: "05686",
            sID: "xxR7ASMMHg",
          },
          {
            label: "Santo Domingo",
            value: "05690",
            sID: "dkb0U8MBU8",
          },
          {
            label: "El Santuario",
            value: "05697",
            sID: "yHU0VMgkpE",
          },
          {
            label: "Segovia",
            value: "05736",
            sID: "0XJEg85aYv",
          },
          {
            label: "Sonsón",
            value: "05756",
            sID: "xpdCyeUSTz",
          },
          {
            label: "Sopetrán",
            value: "05761",
            sID: "1Z2aQByEj2",
          },
          {
            label: "Támesis",
            value: "05789",
            sID: "Sg56muN6NS",
          },
          {
            label: "Tarazá",
            value: "05790",
            sID: "veJH1VNQMe",
          },
          {
            label: "Tarso",
            value: "05792",
            sID: "8eG2b1GDbs",
          },
          {
            label: "Titiribí",
            value: "05809",
            sID: "SWuj827DNh",
          },
          {
            label: "Toledo",
            value: "05819",
            sID: "m6l2EFXO1T",
          },
          {
            label: "Turbo",
            value: "05837",
            sID: "381HjeGNka",
          },
          {
            label: "Uramita",
            value: "05842",
            sID: "GiVI4RN22B",
          },
          {
            label: "Urrao",
            value: "05847",
            sID: "wXW8ntafUV",
          },
          {
            label: "Valdivia",
            value: "05854",
            sID: "WOc0i1p4mn",
          },
          {
            label: "Valparaíso",
            value: "05856",
            sID: "BWgGhvTkDs",
          },
          {
            label: "Vegachí",
            value: "05858",
            sID: "0YgAzIr0Pm",
          },
          {
            label: "Venecia",
            value: "05861",
            sID: "7Te8ELRGDQ",
          },
          {
            label: "Vigía Del Fuerte",
            value: "05873",
            sID: "ng96QmJRnY",
          },
          {
            label: "Yalí",
            value: "05885",
            sID: "pLhkrr9qwf",
          },
          {
            label: "Yarumal",
            value: "05887",
            sID: "GtENrOCFxH",
          },
          {
            label: "Yolombó",
            value: "05890",
            sID: "xIcnX2Au63",
          },
          {
            label: "Yondó",
            value: "05893",
            sID: "UVnl0rcvgm",
          },
          {
            label: "Zaragoza",
            value: "05895",
            sID: "Rc0OzY4xI5",
          },
        ],
        sID: "ou4gsO2q9O",
      },
      {
        label: "Atlántico",
        value: "08",
        cities: [
          {
            label: "Barranquilla",
            value: "08001",
            sID: "EoiPbieAkw",
          },
          {
            label: "Baranoa",
            value: "08078",
            sID: "TOzVGDYNra",
          },
          {
            label: "Campo De La Cruz",
            value: "08137",
            sID: "TUPWpYKCy8",
          },
          {
            label: "Candelaria",
            value: "08141",
            sID: "ioJ99wBy3l",
          },
          {
            label: "Galapa",
            value: "08296",
            sID: "PLZ4D3ppFX",
          },
          {
            label: "Juan De Acosta",
            value: "08372",
            sID: "Zm0Wpkmcjv",
          },
          {
            label: "Luruaco",
            value: "08421",
            sID: "BvjxcAP3qB",
          },
          {
            label: "Malambo",
            value: "08433",
            sID: "4ayDEIBPVO",
          },
          {
            label: "Manatí",
            value: "08436",
            sID: "b1C14MR111",
          },
          {
            label: "Palmar De Varela",
            value: "08520",
            sID: "H0vINzWekF",
          },
          {
            label: "Piojó",
            value: "08549",
            sID: "4g3HfZzFly",
          },
          {
            label: "Polonuevo",
            value: "08558",
            sID: "22CfdrCHb7",
          },
          {
            label: "Ponedera",
            value: "08560",
            sID: "vCQgcfBv5f",
          },
          {
            label: "Puerto Colombia",
            value: "08573",
            sID: "iAUpgFwflS",
          },
          {
            label: "Repelón",
            value: "08606",
            sID: "kAyLO7TmAP",
          },
          {
            label: "Sabanagrande",
            value: "08634",
            sID: "SKCZPK81cH",
          },
          {
            label: "Sabanalarga",
            value: "08638",
            sID: "WpyfDmvSDV",
          },
          {
            label: "Santa Lucía",
            value: "08675",
            sID: "Pjy12RSo5f",
          },
          {
            label: "Santo Tomás",
            value: "08685",
            sID: "X2ec40dfT1",
          },
          {
            label: "Soledad",
            value: "08758",
            sID: "Uj3XIyIGt8",
          },
          {
            label: "Suan",
            value: "08770",
            sID: "fBRDh7VdCd",
          },
          {
            label: "Tubará",
            value: "08832",
            sID: "G8Wr7UPRWM",
          },
          {
            label: "Usiacurí",
            value: "08849",
            sID: "PUugyvdgeu",
          },
        ],
        sID: "F9jfeAJHKX",
      },
      {
        label: "Bogotá, D.C.",
        value: "11",
        cities: [
          {
            label: "Bogotá, D.C.",
            value: "11001",
            sID: "CCNdppA13E",
          },
        ],
        sID: "3xow1Uyuqn",
      },
      {
        label: "Bolívar",
        value: "13",
        cities: [
          {
            label: "Cartagena De Indias",
            value: "13001",
            sID: "goegMwHzkH",
          },
          {
            label: "Achí",
            value: "13006",
            sID: "enwbZCAVRe",
          },
          {
            label: "Altos Del Rosario",
            value: "13030",
            sID: "l19SUmBQzo",
          },
          {
            label: "Arenal",
            value: "13042",
            sID: "9alY3d6v28",
          },
          {
            label: "Arjona",
            value: "13052",
            sID: "ume5pzYdoY",
          },
          {
            label: "Arroyohondo",
            value: "13062",
            sID: "FjLFOUXCK7",
          },
          {
            label: "Barranco De Loba",
            value: "13074",
            sID: "nrqKisP14Y",
          },
          {
            label: "Calamar",
            value: "13140",
            sID: "WP4ZAj0cIb",
          },
          {
            label: "Cantagallo",
            value: "13160",
            sID: "8ZZdAhL57R",
          },
          {
            label: "Cicuco",
            value: "13188",
            sID: "oJ6DUlgND7",
          },
          {
            label: "Córdoba",
            value: "13212",
            sID: "jobLb8BB6x",
          },
          {
            label: "Clemencia",
            value: "13222",
            sID: "RQs5GVfNsQ",
          },
          {
            label: "El Carmen De Bolívar",
            value: "13244",
            sID: "ce6EzkVK3v",
          },
          {
            label: "El Guamo",
            value: "13248",
            sID: "JnFUA4Fx7S",
          },
          {
            label: "El Peñón",
            value: "13268",
            sID: "FpVqmYyerw",
          },
          {
            label: "Hatillo De Loba",
            value: "13300",
            sID: "EXd2HtIIAC",
          },
          {
            label: "Magangué",
            value: "13430",
            sID: "o5qNXDY6Rg",
          },
          {
            label: "Mahates",
            value: "13433",
            sID: "wp3Vo8sbKx",
          },
          {
            label: "Margarita",
            value: "13440",
            sID: "1nszppgbOS",
          },
          {
            label: "María La Baja",
            value: "13442",
            sID: "puwc526Shl",
          },
          {
            label: "Montecristo",
            value: "13458",
            sID: "iGuzqAcZMA",
          },
          {
            label: "Santa Cruz De Mompox",
            value: "13468",
            sID: "zGwnnCkTE6",
          },
          {
            label: "Morales",
            value: "13473",
            sID: "oxYTR8CtTx",
          },
          {
            label: "Norosí",
            value: "13490",
            sID: "YdJimWPULX",
          },
          {
            label: "Pinillos",
            value: "13549",
            sID: "bVwcwgUQj3",
          },
          {
            label: "Regidor",
            value: "13580",
            sID: "Fe0bNBh5uF",
          },
          {
            label: "Río Viejo",
            value: "13600",
            sID: "tX1CqM9X9b",
          },
          {
            label: "San Cristóbal",
            value: "13620",
            sID: "ogREjgm0N9",
          },
          {
            label: "San Estanislao",
            value: "13647",
            sID: "gJfMZDwBhS",
          },
          {
            label: "San Fernando",
            value: "13650",
            sID: "GfN5ZcEMoS",
          },
          {
            label: "San Jacinto",
            value: "13654",
            sID: "jP5sLLzYHn",
          },
          {
            label: "San Jacinto Del Cauca",
            value: "13655",
            sID: "QiF7tjgEMS",
          },
          {
            label: "San Juan Nepomuceno",
            value: "13657",
            sID: "pWDUm3PiIk",
          },
          {
            label: "San Martín De Loba",
            value: "13667",
            sID: "nWNZtQPg0s",
          },
          {
            label: "San Pablo",
            value: "13670",
            sID: "6XpJ8d4wR2",
          },
          {
            label: "Santa Catalina",
            value: "13673",
            sID: "H5GqTZGwzZ",
          },
          {
            label: "Santa Rosa",
            value: "13683",
            sID: "fA5Z5lgQz3",
          },
          {
            label: "Santa Rosa Del Sur",
            value: "13688",
            sID: "EpJqdLvlKo",
          },
          {
            label: "Simití",
            value: "13744",
            sID: "adHonKDp3k",
          },
          {
            label: "Soplaviento",
            value: "13760",
            sID: "Pw30111Gyl",
          },
          {
            label: "Talaigua Nuevo",
            value: "13780",
            sID: "vMNLlGyWov",
          },
          {
            label: "Tiquisio",
            value: "13810",
            sID: "HpknN2rcHB",
          },
          {
            label: "Turbaco",
            value: "13836",
            sID: "u1TCG3CEI6",
          },
          {
            label: "Turbaná",
            value: "13838",
            sID: "5rgxwxWWp5",
          },
          {
            label: "Villanueva",
            value: "13873",
            sID: "Wf09tAb3Uy",
          },
          {
            label: "Zambrano",
            value: "13894",
            sID: "08tzcUXkpl",
          },
        ],
        sID: "t75lmgnpVb",
      },
      {
        label: "Boyacá",
        value: "15",
        cities: [
          {
            label: "Tunja",
            value: "15001",
            sID: "bMau0gUEhA",
          },
          {
            label: "Almeida",
            value: "15022",
            sID: "bq3rlz7UGb",
          },
          {
            label: "Aquitania",
            value: "15047",
            sID: "32AebusAOz",
          },
          {
            label: "Arcabuco",
            value: "15051",
            sID: "JcouvTX7kN",
          },
          {
            label: "Belén",
            value: "15087",
            sID: "KxGjj4YdwD",
          },
          {
            label: "Berbeo",
            value: "15090",
            sID: "TVHymdV1Cw",
          },
          {
            label: "Betéitiva",
            value: "15092",
            sID: "X25SxT6emF",
          },
          {
            label: "Boavita",
            value: "15097",
            sID: "l21kcxqgUN",
          },
          {
            label: "Boyacá",
            value: "15104",
            sID: "ORHBAhsJBR",
          },
          {
            label: "Briceño",
            value: "15106",
            sID: "QBKAMDsedT",
          },
          {
            label: "Buenavista",
            value: "15109",
            sID: "MdA4cAl85b",
          },
          {
            label: "Busbanzá",
            value: "15114",
            sID: "ZHmjf1DJYJ",
          },
          {
            label: "Caldas",
            value: "15131",
            sID: "1HDlPvDdlV",
          },
          {
            label: "Campohermoso",
            value: "15135",
            sID: "lKTcGBXUhR",
          },
          {
            label: "Cerinza",
            value: "15162",
            sID: "SqNKLDN18Z",
          },
          {
            label: "Chinavita",
            value: "15172",
            sID: "Hi5eiqpPnr",
          },
          {
            label: "Chiquinquirá",
            value: "15176",
            sID: "zdC14toMv0",
          },
          {
            label: "Chiscas",
            value: "15180",
            sID: "MDsz71ReUc",
          },
          {
            label: "Chita",
            value: "15183",
            sID: "NLIdszHuzV",
          },
          {
            label: "Chitaraque",
            value: "15185",
            sID: "SQsKa9Yp5l",
          },
          {
            label: "Chivatá",
            value: "15187",
            sID: "S1lZHhKcQT",
          },
          {
            label: "Ciénega",
            value: "15189",
            sID: "WNayfy2Ks9",
          },
          {
            label: "Cómbita",
            value: "15204",
            sID: "GWAKaUuFqw",
          },
          {
            label: "Coper",
            value: "15212",
            sID: "zGesbaPJeq",
          },
          {
            label: "Corrales",
            value: "15215",
            sID: "ePDAIV2CIv",
          },
          {
            label: "Covarachía",
            value: "15218",
            sID: "dcZhjpTXP0",
          },
          {
            label: "Cubará",
            value: "15223",
            sID: "dREci61FlU",
          },
          {
            label: "Cucaita",
            value: "15224",
            sID: "eVepcKJF58",
          },
          {
            label: "Cuítiva",
            value: "15226",
            sID: "VgjpZ5KPrU",
          },
          {
            label: "Chíquiza",
            value: "15232",
            sID: "VHY6v9sN7F",
          },
          {
            label: "Chivor",
            value: "15236",
            sID: "kfuC8yhZFt",
          },
          {
            label: "Duitama",
            value: "15238",
            sID: "9yHur5ZrqF",
          },
          {
            label: "El Cocuy",
            value: "15244",
            sID: "PzX7wuuUmP",
          },
          {
            label: "El Espino",
            value: "15248",
            sID: "5x1AXGIEVz",
          },
          {
            label: "Firavitoba",
            value: "15272",
            sID: "0e6PmiS4N5",
          },
          {
            label: "Floresta",
            value: "15276",
            sID: "QMCQ8UmAvJ",
          },
          {
            label: "Gachantivá",
            value: "15293",
            sID: "WmMBFYIOwW",
          },
          {
            label: "Gámeza",
            value: "15296",
            sID: "otC1LjGbLX",
          },
          {
            label: "Garagoa",
            value: "15299",
            sID: "LMz25zYFFP",
          },
          {
            label: "Guacamayas",
            value: "15317",
            sID: "Qis0HIPL7y",
          },
          {
            label: "Guateque",
            value: "15322",
            sID: "7wmg70D2Nb",
          },
          {
            label: "Guayatá",
            value: "15325",
            sID: "HVXSl2ZLkQ",
          },
          {
            label: "Güicán De La Sierra",
            value: "15332",
            sID: "LWbg7wZGgc",
          },
          {
            label: "Iza",
            value: "15362",
            sID: "ssKGceKMKD",
          },
          {
            label: "Jenesano",
            value: "15367",
            sID: "F2Aqklh8LO",
          },
          {
            label: "Jericó",
            value: "15368",
            sID: "UWgzXTP5Mq",
          },
          {
            label: "Labranzagrande",
            value: "15377",
            sID: "zeaOSfVevl",
          },
          {
            label: "La Capilla",
            value: "15380",
            sID: "DFe8poUYaP",
          },
          {
            label: "La Victoria",
            value: "15401",
            sID: "f8uePGXUAk",
          },
          {
            label: "La Uvita",
            value: "15403",
            sID: "0sStjsooQA",
          },
          {
            label: "Villa De Leyva",
            value: "15407",
            sID: "ttu8nHhZwL",
          },
          {
            label: "Macanal",
            value: "15425",
            sID: "nbhaGrOWkF",
          },
          {
            label: "Maripí",
            value: "15442",
            sID: "MLMFLt4hMi",
          },
          {
            label: "Miraflores",
            value: "15455",
            sID: "PBjDTALzOD",
          },
          {
            label: "Mongua",
            value: "15464",
            sID: "psYQXAEsuH",
          },
          {
            label: "Monguí",
            value: "15466",
            sID: "EE8hRDv1Ic",
          },
          {
            label: "Moniquirá",
            value: "15469",
            sID: "pevoBEodET",
          },
          {
            label: "Motavita",
            value: "15476",
            sID: "ATauWR1fEi",
          },
          {
            label: "Muzo",
            value: "15480",
            sID: "vP9pTSQbfQ",
          },
          {
            label: "Nobsa",
            value: "15491",
            sID: "SgCqesdeFv",
          },
          {
            label: "Nuevo Colón",
            value: "15494",
            sID: "p0Uf7ZfErz",
          },
          {
            label: "Oicatá",
            value: "15500",
            sID: "RUSttxeQnQ",
          },
          {
            label: "Otanche",
            value: "15507",
            sID: "oMBlTLBi9Z",
          },
          {
            label: "Pachavita",
            value: "15511",
            sID: "693wcISpQn",
          },
          {
            label: "Páez",
            value: "15514",
            sID: "a2eP9WLmlr",
          },
          {
            label: "Paipa",
            value: "15516",
            sID: "YMJ20L2dgC",
          },
          {
            label: "Pajarito",
            value: "15518",
            sID: "MzlbErmVo1",
          },
          {
            label: "Panqueba",
            value: "15522",
            sID: "jxOcJz5NeZ",
          },
          {
            label: "Pauna",
            value: "15531",
            sID: "DT9CcWjyRH",
          },
          {
            label: "Paya",
            value: "15533",
            sID: "KtNZYkjbSC",
          },
          {
            label: "Paz De Río",
            value: "15537",
            sID: "Cz8BAPef70",
          },
          {
            label: "Pesca",
            value: "15542",
            sID: "l8nj7I6RJ8",
          },
          {
            label: "Pisba",
            value: "15550",
            sID: "6OA5p4c7gw",
          },
          {
            label: "Puerto Boyacá",
            value: "15572",
            sID: "YCtYyFEZof",
          },
          {
            label: "Quípama",
            value: "15580",
            sID: "UrsHR2yhIu",
          },
          {
            label: "Ramiriquí",
            value: "15599",
            sID: "0bCqOtzcxQ",
          },
          {
            label: "Ráquira",
            value: "15600",
            sID: "GkrjOeHRc1",
          },
          {
            label: "Rondón",
            value: "15621",
            sID: "xhC7ap7Cic",
          },
          {
            label: "Saboyá",
            value: "15632",
            sID: "kGv4MrnjIF",
          },
          {
            label: "Sáchica",
            value: "15638",
            sID: "E5TQXT8KHP",
          },
          {
            label: "Samacá",
            value: "15646",
            sID: "VQ4GZ8IKYt",
          },
          {
            label: "San Eduardo",
            value: "15660",
            sID: "rnKvyC6ejh",
          },
          {
            label: "San José De Pare",
            value: "15664",
            sID: "b3ZMzuoJw4",
          },
          {
            label: "San Luis De Gaceno",
            value: "15667",
            sID: "1uPrshpg6C",
          },
          {
            label: "San Mateo",
            value: "15673",
            sID: "TbrMjiRGA6",
          },
          {
            label: "San Miguel De Sema",
            value: "15676",
            sID: "BnXs1ywVjw",
          },
          {
            label: "San Pablo De Borbur",
            value: "15681",
            sID: "QhSzuReLa2",
          },
          {
            label: "Santana",
            value: "15686",
            sID: "J2rhEjITSe",
          },
          {
            label: "Santa María",
            value: "15690",
            sID: "KihgrcFgBA",
          },
          {
            label: "Santa Rosa De Viterbo",
            value: "15693",
            sID: "vPZw368NZ6",
          },
          {
            label: "Santa Sofía",
            value: "15696",
            sID: "B1fwruSvYj",
          },
          {
            label: "Sativanorte",
            value: "15720",
            sID: "TLxDTcyoeG",
          },
          {
            label: "Sativasur",
            value: "15723",
            sID: "We9bTYqTVE",
          },
          {
            label: "Siachoque",
            value: "15740",
            sID: "0XvxeI0VEw",
          },
          {
            label: "Soatá",
            value: "15753",
            sID: "VnVLLPtcNe",
          },
          {
            label: "Socotá",
            value: "15755",
            sID: "pYWzp4ddL9",
          },
          {
            label: "Socha",
            value: "15757",
            sID: "77KNqN1iuR",
          },
          {
            label: "Sogamoso",
            value: "15759",
            sID: "gEYTagP8E5",
          },
          {
            label: "Somondoco",
            value: "15761",
            sID: "NJpMOxdhuh",
          },
          {
            label: "Sora",
            value: "15762",
            sID: "TVnGZcDvPC",
          },
          {
            label: "Sotaquirá",
            value: "15763",
            sID: "D2vVbRHY7p",
          },
          {
            label: "Soracá",
            value: "15764",
            sID: "e5cAtf1bSa",
          },
          {
            label: "Susacón",
            value: "15774",
            sID: "zshKVXRCED",
          },
          {
            label: "Sutamarchán",
            value: "15776",
            sID: "TM63Gig4UJ",
          },
          {
            label: "Sutatenza",
            value: "15778",
            sID: "uEZjPFJsj5",
          },
          {
            label: "Tasco",
            value: "15790",
            sID: "HUxUwvhCOK",
          },
          {
            label: "Tenza",
            value: "15798",
            sID: "KIPEPpFqB3",
          },
          {
            label: "Tibaná",
            value: "15804",
            sID: "wxfILFs9l7",
          },
          {
            label: "Tibasosa",
            value: "15806",
            sID: "FkwpHStrQG",
          },
          {
            label: "Tinjacá",
            value: "15808",
            sID: "M59DyIGDSO",
          },
          {
            label: "Tipacoque",
            value: "15810",
            sID: "ArLTMfi3oP",
          },
          {
            label: "Toca",
            value: "15814",
            sID: "KkaGMwx7cN",
          },
          {
            label: "Togüí",
            value: "15816",
            sID: "wSO334OG9B",
          },
          {
            label: "Tópaga",
            value: "15820",
            sID: "oU9y75MACq",
          },
          {
            label: "Tota",
            value: "15822",
            sID: "8BPZog5kGP",
          },
          {
            label: "Tununguá",
            value: "15832",
            sID: "s1zThVMPpy",
          },
          {
            label: "Turmequé",
            value: "15835",
            sID: "shB5neucbm",
          },
          {
            label: "Tuta",
            value: "15837",
            sID: "1qgnGakMhK",
          },
          {
            label: "Tutazá",
            value: "15839",
            sID: "kqRW24qpa7",
          },
          {
            label: "Úmbita",
            value: "15842",
            sID: "UzptvHUaMs",
          },
          {
            label: "Ventaquemada",
            value: "15861",
            sID: "kgcKrBw1t3",
          },
          {
            label: "Viracachá",
            value: "15879",
            sID: "UkgoXWDxCt",
          },
          {
            label: "Zetaquira",
            value: "15897",
            sID: "BiLbIPeWl4",
          },
        ],
        sID: "qAZQRoBMLC",
      },
      {
        label: "Caldas",
        value: "17",
        cities: [
          {
            label: "Manizales",
            value: "17001",
            sID: "AJhtwAlZXT",
          },
          {
            label: "Aguadas",
            value: "17013",
            sID: "CUirsh3i5o",
          },
          {
            label: "Anserma",
            value: "17042",
            sID: "uJz9SlXgRz",
          },
          {
            label: "Aranzazu",
            value: "17050",
            sID: "Ep2KjYK5JR",
          },
          {
            label: "Belalcázar",
            value: "17088",
            sID: "hBAzKTbXoq",
          },
          {
            label: "Chinchiná",
            value: "17174",
            sID: "0BcFkPUQN5",
          },
          {
            label: "Filadelfia",
            value: "17272",
            sID: "LambwuJu1L",
          },
          {
            label: "La Dorada",
            value: "17380",
            sID: "tTMUgt1oUy",
          },
          {
            label: "La Merced",
            value: "17388",
            sID: "dcDIv6pM5r",
          },
          {
            label: "Manzanares",
            value: "17433",
            sID: "mJ4uImGfeW",
          },
          {
            label: "Marmato",
            value: "17442",
            sID: "CrP5ksKyae",
          },
          {
            label: "Marquetalia",
            value: "17444",
            sID: "FfAsvOESIy",
          },
          {
            label: "Marulanda",
            value: "17446",
            sID: "NV0cQDu0eD",
          },
          {
            label: "Neira",
            value: "17486",
            sID: "AwdcbsRISX",
          },
          {
            label: "Norcasia",
            value: "17495",
            sID: "Xtf6LQzcBN",
          },
          {
            label: "Pácora",
            value: "17513",
            sID: "DflkCzAaXF",
          },
          {
            label: "Palestina",
            value: "17524",
            sID: "0P2jit4PYS",
          },
          {
            label: "Pensilvania",
            value: "17541",
            sID: "ZW1t61zNec",
          },
          {
            label: "Riosucio",
            value: "17614",
            sID: "0Ta0f4sKqy",
          },
          {
            label: "Risaralda",
            value: "17616",
            sID: "eD3ulavaxq",
          },
          {
            label: "Salamina",
            value: "17653",
            sID: "HfDzjhobVi",
          },
          {
            label: "Samaná",
            value: "17662",
            sID: "GthTwliWNP",
          },
          {
            label: "San José",
            value: "17665",
            sID: "IaBoKA9Pyq",
          },
          {
            label: "Supía",
            value: "17777",
            sID: "Qlp3gVZSdV",
          },
          {
            label: "Victoria",
            value: "17867",
            sID: "95vtauLiBR",
          },
          {
            label: "Villamaría",
            value: "17873",
            sID: "Rf6Kiyknfv",
          },
          {
            label: "Viterbo",
            value: "17877",
            sID: "uQB7ANqSzN",
          },
        ],
        sID: "HcxnYcB8cp",
      },
      {
        label: "Caquetá",
        value: "18",
        cities: [
          {
            label: "Florencia",
            value: "18001",
            sID: "Fu0Qrt7QuE",
          },
          {
            label: "Albania",
            value: "18029",
            sID: "3nxGcFvubZ",
          },
          {
            label: "Belén De Los Andaquíes",
            value: "18094",
            sID: "eIYE93eN3b",
          },
          {
            label: "Cartagena Del Chairá",
            value: "18150",
            sID: "ZphAvQZTzj",
          },
          {
            label: "Curillo",
            value: "18205",
            sID: "UDpRMyKver",
          },
          {
            label: "El Doncello",
            value: "18247",
            sID: "JLeiO35n6m",
          },
          {
            label: "El Paujíl",
            value: "18256",
            sID: "ZvfnaONbHw",
          },
          {
            label: "La Montañita",
            value: "18410",
            sID: "FAMk4maMKp",
          },
          {
            label: "Milán",
            value: "18460",
            sID: "gzj9Nmtleg",
          },
          {
            label: "Morelia",
            value: "18479",
            sID: "8yy5Wod1hw",
          },
          {
            label: "Puerto Rico",
            value: "18592",
            sID: "28HUKUXjpq",
          },
          {
            label: "San José Del Fragua",
            value: "18610",
            sID: "4eXeCFUp59",
          },
          {
            label: "San Vicente Del Caguán",
            value: "18753",
            sID: "p7WmETWStm",
          },
          {
            label: "Solano",
            value: "18756",
            sID: "y5wEzuUkRa",
          },
          {
            label: "Solita",
            value: "18785",
            sID: "GxkwKoY93r",
          },
          {
            label: "Valparaíso",
            value: "18860",
            sID: "umAHRXjHLU",
          },
        ],
        sID: "nSraMIjdyL",
      },
      {
        label: "Cauca",
        value: "19",
        cities: [
          {
            label: "Popayán",
            value: "19001",
            sID: "xQCqh6sfxu",
          },
          {
            label: "Almaguer",
            value: "19022",
            sID: "3BKapoXCFg",
          },
          {
            label: "Argelia",
            value: "19050",
            sID: "nuHIU6E0Em",
          },
          {
            label: "Balboa",
            value: "19075",
            sID: "x590gm47i3",
          },
          {
            label: "Bolívar",
            value: "19100",
            sID: "u5AGuYExaK",
          },
          {
            label: "Buenos Aires",
            value: "19110",
            sID: "4ML137YmgP",
          },
          {
            label: "Cajibío",
            value: "19130",
            sID: "ILJW4D16x0",
          },
          {
            label: "Caldono",
            value: "19137",
            sID: "hsH8kwYMOT",
          },
          {
            label: "Caloto",
            value: "19142",
            sID: "0KPlel5Daf",
          },
          {
            label: "Corinto",
            value: "19212",
            sID: "vflhKfa3Li",
          },
          {
            label: "El Tambo",
            value: "19256",
            sID: "mkWFt9Jzq4",
          },
          {
            label: "Florencia",
            value: "19290",
            sID: "fS6Gq6Ntyk",
          },
          {
            label: "Guachené",
            value: "19300",
            sID: "XXPiS7Ylo3",
          },
          {
            label: "Guapi",
            value: "19318",
            sID: "w4QlEMLKPx",
          },
          {
            label: "Inzá",
            value: "19355",
            sID: "dLePJta6Py",
          },
          {
            label: "Jambaló",
            value: "19364",
            sID: "0C2Zpe4MyB",
          },
          {
            label: "La Sierra",
            value: "19392",
            sID: "bTynEq6kGx",
          },
          {
            label: "La Vega",
            value: "19397",
            sID: "RLSKe55T8x",
          },
          {
            label: "López De Micay",
            value: "19418",
            sID: "k5GER1vRqm",
          },
          {
            label: "Mercaderes",
            value: "19450",
            sID: "z0pVngZ5UO",
          },
          {
            label: "Miranda",
            value: "19455",
            sID: "Wp2OMlrhuD",
          },
          {
            label: "Morales",
            value: "19473",
            sID: "nKavvXne8l",
          },
          {
            label: "Padilla",
            value: "19513",
            sID: "rjdTRKLUTN",
          },
          {
            label: "Páez",
            value: "19517",
            sID: "lYxBHtsA3Q",
          },
          {
            label: "Patía",
            value: "19532",
            sID: "Fg8XSSkNDh",
          },
          {
            label: "Piamonte",
            value: "19533",
            sID: "k1sA51of6z",
          },
          {
            label: "Piendamó - Tunía",
            value: "19548",
            sID: "ZgWiKgG1UB",
          },
          {
            label: "Puerto Tejada",
            value: "19573",
            sID: "haufp8piNC",
          },
          {
            label: "Puracé",
            value: "19585",
            sID: "dQExjb4Viw",
          },
          {
            label: "Rosas",
            value: "19622",
            sID: "zGRFF6TCvP",
          },
          {
            label: "San Sebastián",
            value: "19693",
            sID: "6bVXeej3UR",
          },
          {
            label: "Santander De Quilichao",
            value: "19698",
            sID: "EUkJY7ROyM",
          },
          {
            label: "Santa Rosa",
            value: "19701",
            sID: "fef0MEhVW0",
          },
          {
            label: "Silvia",
            value: "19743",
            sID: "V795CVxiLy",
          },
          {
            label: "Sotará - Paispamba",
            value: "19760",
            sID: "VvC9oOVrDc",
          },
          {
            label: "Suárez",
            value: "19780",
            sID: "Z7e17mdXP1",
          },
          {
            label: "Sucre",
            value: "19785",
            sID: "1mJyoVDpUi",
          },
          {
            label: "Timbío",
            value: "19807",
            sID: "wHplPutF2g",
          },
          {
            label: "Timbiquí",
            value: "19809",
            sID: "K4eK8IsLW9",
          },
          {
            label: "Toribío",
            value: "19821",
            sID: "lYs2zYNkvH",
          },
          {
            label: "Totoró",
            value: "19824",
            sID: "JMNjczQgwy",
          },
          {
            label: "Villa Rica",
            value: "19845",
            sID: "PoyuuXbuO3",
          },
        ],
        sID: "Zh7152GxiW",
      },
      {
        label: "Cesar",
        value: "20",
        cities: [
          {
            label: "Valledupar",
            value: "20001",
            sID: "zhwIHNCMq0",
          },
          {
            label: "Aguachica",
            value: "20011",
            sID: "jR8ccgvkIx",
          },
          {
            label: "Agustín Codazzi",
            value: "20013",
            sID: "CrgaN0inqH",
          },
          {
            label: "Astrea",
            value: "20032",
            sID: "01N5G3DOSd",
          },
          {
            label: "Becerril",
            value: "20045",
            sID: "WcZ3sH8hiN",
          },
          {
            label: "Bosconia",
            value: "20060",
            sID: "jp47SZvEV8",
          },
          {
            label: "Chimichagua",
            value: "20175",
            sID: "MssMbaqL9V",
          },
          {
            label: "Chiriguaná",
            value: "20178",
            sID: "EtsX26ECTg",
          },
          {
            label: "Curumaní",
            value: "20228",
            sID: "Pyro2fgp3C",
          },
          {
            label: "El Copey",
            value: "20238",
            sID: "iBO81WO6t3",
          },
          {
            label: "El Paso",
            value: "20250",
            sID: "nHuM6Yvb0S",
          },
          {
            label: "Gamarra",
            value: "20295",
            sID: "Uwe0kywW06",
          },
          {
            label: "González",
            value: "20310",
            sID: "JQPrWvzOV9",
          },
          {
            label: "La Gloria",
            value: "20383",
            sID: "Xzkfo5aH5D",
          },
          {
            label: "La Jagua De Ibirico",
            value: "20400",
            sID: "dUGwD7DaYX",
          },
          {
            label: "Manaure Balcón Del Cesar",
            value: "20443",
            sID: "D5d35OZHwI",
          },
          {
            label: "Pailitas",
            value: "20517",
            sID: "WPQDl3sQEp",
          },
          {
            label: "Pelaya",
            value: "20550",
            sID: "PTITImx0hY",
          },
          {
            label: "Pueblo Bello",
            value: "20570",
            sID: "QqScQtiLwG",
          },
          {
            label: "Río De Oro",
            value: "20614",
            sID: "vPG9jTeVIw",
          },
          {
            label: "La Paz",
            value: "20621",
            sID: "ODCBAKfGlE",
          },
          {
            label: "San Alberto",
            value: "20710",
            sID: "28su3Xe5FW",
          },
          {
            label: "San Diego",
            value: "20750",
            sID: "fJk50geclc",
          },
          {
            label: "San Martín",
            value: "20770",
            sID: "CujMkDXQlO",
          },
          {
            label: "Tamalameque",
            value: "20787",
            sID: "QAWhdV4EIT",
          },
        ],
        sID: "cWalZJij2R",
      },
      {
        label: "Córdoba",
        value: "23",
        cities: [
          {
            label: "Montería",
            value: "23001",
            sID: "Uhp4l6X09Z",
          },
          {
            label: "Ayapel",
            value: "23068",
            sID: "sllK5vMSVV",
          },
          {
            label: "Buenavista",
            value: "23079",
            sID: "jsGyiWWoJm",
          },
          {
            label: "Canalete",
            value: "23090",
            sID: "ytt2Zr794O",
          },
          {
            label: "Cereté",
            value: "23162",
            sID: "z6VIPzz98q",
          },
          {
            label: "Chimá",
            value: "23168",
            sID: "hQnJt6vw9Q",
          },
          {
            label: "Chinú",
            value: "23182",
            sID: "9PkjJZfqyU",
          },
          {
            label: "Ciénaga De Oro",
            value: "23189",
            sID: "ACpn7sicM6",
          },
          {
            label: "Cotorra",
            value: "23300",
            sID: "sW5YWmrmAt",
          },
          {
            label: "La Apartada",
            value: "23350",
            sID: "9d76GCz5kj",
          },
          {
            label: "Lorica",
            value: "23417",
            sID: "oB1pjHvdej",
          },
          {
            label: "Los Córdobas",
            value: "23419",
            sID: "DvuCY7jOjk",
          },
          {
            label: "Momil",
            value: "23464",
            sID: "xzmN29P66q",
          },
          {
            label: "Montelíbano",
            value: "23466",
            sID: "w0aafVPJsF",
          },
          {
            label: "Moñitos",
            value: "23500",
            sID: "dYKuH7VN0R",
          },
          {
            label: "Planeta Rica",
            value: "23555",
            sID: "knMudlw3JS",
          },
          {
            label: "Pueblo Nuevo",
            value: "23570",
            sID: "ii7RxxcHgk",
          },
          {
            label: "Puerto Escondido",
            value: "23574",
            sID: "1DPUGRXSF3",
          },
          {
            label: "Puerto Libertador",
            value: "23580",
            sID: "h5iCc1eJQN",
          },
          {
            label: "Purísima De La Concepción",
            value: "23586",
            sID: "DxPxyJWsuo",
          },
          {
            label: "Sahagún",
            value: "23660",
            sID: "gxJ9DKhhYV",
          },
          {
            label: "San Andrés De Sotavento",
            value: "23670",
            sID: "pbxVoePmFg",
          },
          {
            label: "San Antero",
            value: "23672",
            sID: "lJVsWUcwDL",
          },
          {
            label: "San Bernardo Del Viento",
            value: "23675",
            sID: "DSk2yctHC8",
          },
          {
            label: "San Carlos",
            value: "23678",
            sID: "E8RpmDBCvq",
          },
          {
            label: "San José De Uré",
            value: "23682",
            sID: "diTSYlXMZt",
          },
          {
            label: "San Pelayo",
            value: "23686",
            sID: "bJdEbwBdMx",
          },
          {
            label: "Tierralta",
            value: "23807",
            sID: "WQs2Xl1CLB",
          },
          {
            label: "Tuchín",
            value: "23815",
            sID: "QnBX3aCBe0",
          },
          {
            label: "Valencia",
            value: "23855",
            sID: "wuokqxg4HL",
          },
        ],
        sID: "N3l4xQfh5w",
      },
      {
        label: "Cundinamarca",
        value: "25",
        cities: [
          {
            label: "Agua De Dios",
            value: "25001",
            sID: "0WRXTgvhQ5",
          },
          {
            label: "Albán",
            value: "25019",
            sID: "en3uLd3xcG",
          },
          {
            label: "Anapoima",
            value: "25035",
            sID: "xa6x0fSS2b",
          },
          {
            label: "Anolaima",
            value: "25040",
            sID: "5mFS70yMfb",
          },
          {
            label: "Arbeláez",
            value: "25053",
            sID: "RX9MkD6Zct",
          },
          {
            label: "Beltrán",
            value: "25086",
            sID: "I2PxyJtFDG",
          },
          {
            label: "Bituima",
            value: "25095",
            sID: "W9nqYrvW08",
          },
          {
            label: "Bojacá",
            value: "25099",
            sID: "vAl9JRNphC",
          },
          {
            label: "Cabrera",
            value: "25120",
            sID: "eBFftqd6Ly",
          },
          {
            label: "Cachipay",
            value: "25123",
            sID: "0GShyC4sKK",
          },
          {
            label: "Cajicá",
            value: "25126",
            sID: "Fg52DHhsLE",
          },
          {
            label: "Caparrapí",
            value: "25148",
            sID: "JNrzpDQ6nZ",
          },
          {
            label: "Cáqueza",
            value: "25151",
            sID: "38QGaGrZBF",
          },
          {
            label: "Carmen De Carupa",
            value: "25154",
            sID: "aHdqUbtG3M",
          },
          {
            label: "Chaguaní",
            value: "25168",
            sID: "fV09GEjthi",
          },
          {
            label: "Chía",
            value: "25175",
            sID: "Gxv5sZ2ZHa",
          },
          {
            label: "Chipaque",
            value: "25178",
            sID: "4Ig8G2fysC",
          },
          {
            label: "Choachí",
            value: "25181",
            sID: "IfzPUXGIhs",
          },
          {
            label: "Chocontá",
            value: "25183",
            sID: "7lIf4LzlXm",
          },
          {
            label: "Cogua",
            value: "25200",
            sID: "0HAEYHR9lb",
          },
          {
            label: "Cota",
            value: "25214",
            sID: "Z1Hc8ggGB0",
          },
          {
            label: "Cucunubá",
            value: "25224",
            sID: "z02XfwLoy5",
          },
          {
            label: "El Colegio",
            value: "25245",
            sID: "xycWLmHavR",
          },
          {
            label: "El Peñón",
            value: "25258",
            sID: "Gpw2NTQxYC",
          },
          {
            label: "El Rosal",
            value: "25260",
            sID: "Ne0gdK0rL5",
          },
          {
            label: "Facatativá",
            value: "25269",
            sID: "d2FgWKpTAR",
          },
          {
            label: "Fómeque",
            value: "25279",
            sID: "TGO8kZT05N",
          },
          {
            label: "Fosca",
            value: "25281",
            sID: "jdQGqpuSJU",
          },
          {
            label: "Funza",
            value: "25286",
            sID: "wctR5Hiluc",
          },
          {
            label: "Fúquene",
            value: "25288",
            sID: "3Cdl5AMnIT",
          },
          {
            label: "Fusagasugá",
            value: "25290",
            sID: "GAh6ntvOn9",
          },
          {
            label: "Gachalá",
            value: "25293",
            sID: "OTlCmgrgDO",
          },
          {
            label: "Gachancipá",
            value: "25295",
            sID: "vbWMF0vFOz",
          },
          {
            label: "Gachetá",
            value: "25297",
            sID: "DzJtitY3zH",
          },
          {
            label: "Gama",
            value: "25299",
            sID: "nJy8KqWG4g",
          },
          {
            label: "Girardot",
            value: "25307",
            sID: "m77whvrn4B",
          },
          {
            label: "Granada",
            value: "25312",
            sID: "n5uczkUHNx",
          },
          {
            label: "Guachetá",
            value: "25317",
            sID: "JVorkUJcgp",
          },
          {
            label: "Guaduas",
            value: "25320",
            sID: "R4LNFGKDTk",
          },
          {
            label: "Guasca",
            value: "25322",
            sID: "rsa8N5ZtAl",
          },
          {
            label: "Guataquí",
            value: "25324",
            sID: "73UYf4vwhU",
          },
          {
            label: "Guatavita",
            value: "25326",
            sID: "u5cpEiRHIV",
          },
          {
            label: "Guayabal De Síquima",
            value: "25328",
            sID: "iewlsLtBsR",
          },
          {
            label: "Guayabetal",
            value: "25335",
            sID: "vBjq8NDyvC",
          },
          {
            label: "Gutiérrez",
            value: "25339",
            sID: "SOBBQdMX4z",
          },
          {
            label: "Jerusalén",
            value: "25368",
            sID: "wgGb4QP7xz",
          },
          {
            label: "Junín",
            value: "25372",
            sID: "0aRxh8hdUD",
          },
          {
            label: "La Calera",
            value: "25377",
            sID: "QBG3LtEtO5",
          },
          {
            label: "La Mesa",
            value: "25386",
            sID: "XhGltO3WiK",
          },
          {
            label: "La Palma",
            value: "25394",
            sID: "zjwtPbfZEz",
          },
          {
            label: "La Peña",
            value: "25398",
            sID: "7cyke8E9SZ",
          },
          {
            label: "La Vega",
            value: "25402",
            sID: "rgs1fjnxnH",
          },
          {
            label: "Lenguazaque",
            value: "25407",
            sID: "9g3mxC6iIi",
          },
          {
            label: "Machetá",
            value: "25426",
            sID: "VH608O87ol",
          },
          {
            label: "Madrid",
            value: "25430",
            sID: "1yr1p2tFLN",
          },
          {
            label: "Manta",
            value: "25436",
            sID: "OP2KdxYL1l",
          },
          {
            label: "Medina",
            value: "25438",
            sID: "kdcdNjxeZk",
          },
          {
            label: "Mosquera",
            value: "25473",
            sID: "32wm3J2oq3",
          },
          {
            label: "Nariño",
            value: "25483",
            sID: "yqxMZTNJhp",
          },
          {
            label: "Nemocón",
            value: "25486",
            sID: "YbKUJ3Rm1H",
          },
          {
            label: "Nilo",
            value: "25488",
            sID: "DrIXy7ogBv",
          },
          {
            label: "Nimaima",
            value: "25489",
            sID: "fMWgYmDRIM",
          },
          {
            label: "Nocaima",
            value: "25491",
            sID: "eV7EGLvLpm",
          },
          {
            label: "Venecia",
            value: "25506",
            sID: "p8scxtaaZN",
          },
          {
            label: "Pacho",
            value: "25513",
            sID: "LFr4UD4zlG",
          },
          {
            label: "Paime",
            value: "25518",
            sID: "44puREcAdm",
          },
          {
            label: "Pandi",
            value: "25524",
            sID: "ed5LqaXTRk",
          },
          {
            label: "Paratebueno",
            value: "25530",
            sID: "JQkzDDNzh0",
          },
          {
            label: "Pasca",
            value: "25535",
            sID: "s5ZpteDBSh",
          },
          {
            label: "Puerto Salgar",
            value: "25572",
            sID: "JGElcRS1nW",
          },
          {
            label: "Pulí",
            value: "25580",
            sID: "jf9rXpbGyo",
          },
          {
            label: "Quebradanegra",
            value: "25592",
            sID: "6exsLS1Q5U",
          },
          {
            label: "Quetame",
            value: "25594",
            sID: "2dPonUHqZQ",
          },
          {
            label: "Quipile",
            value: "25596",
            sID: "iEAftTCa4n",
          },
          {
            label: "Apulo",
            value: "25599",
            sID: "SGVapMaIsH",
          },
          {
            label: "Ricaurte",
            value: "25612",
            sID: "Of4OsElfgx",
          },
          {
            label: "San Antonio Del Tequendama",
            value: "25645",
            sID: "4SMcmXx8l4",
          },
          {
            label: "San Bernardo",
            value: "25649",
            sID: "V4R5MB5vBk",
          },
          {
            label: "San Cayetano",
            value: "25653",
            sID: "GjDUAw5VMx",
          },
          {
            label: "San Francisco",
            value: "25658",
            sID: "vc5VlfsGEP",
          },
          {
            label: "San Juan De Rioseco",
            value: "25662",
            sID: "R6B28ZrMtl",
          },
          {
            label: "Sasaima",
            value: "25718",
            sID: "k6KzK7y7rS",
          },
          {
            label: "Sesquilé",
            value: "25736",
            sID: "aIWBNEOwHQ",
          },
          {
            label: "Sibaté",
            value: "25740",
            sID: "TDp7dzPAqE",
          },
          {
            label: "Silvania",
            value: "25743",
            sID: "Z9X4IBMPlV",
          },
          {
            label: "Simijaca",
            value: "25745",
            sID: "4fkZE9PbsO",
          },
          {
            label: "Soacha",
            value: "25754",
            sID: "bQEJ1rFSwn",
          },
          {
            label: "Sopó",
            value: "25758",
            sID: "Nii1odl1eg",
          },
          {
            label: "Subachoque",
            value: "25769",
            sID: "6akK8SjY96",
          },
          {
            label: "Suesca",
            value: "25772",
            sID: "C7dKKGfWmu",
          },
          {
            label: "Supatá",
            value: "25777",
            sID: "DpFacPD2Ru",
          },
          {
            label: "Susa",
            value: "25779",
            sID: "YOx6WErY73",
          },
          {
            label: "Sutatausa",
            value: "25781",
            sID: "STXhNtRjsv",
          },
          {
            label: "Tabio",
            value: "25785",
            sID: "Bc7ZpjCfkr",
          },
          {
            label: "Tausa",
            value: "25793",
            sID: "G6rdG8SNqO",
          },
          {
            label: "Tena",
            value: "25797",
            sID: "7oEz51yhzl",
          },
          {
            label: "Tenjo",
            value: "25799",
            sID: "0vXL7gtlug",
          },
          {
            label: "Tibacuy",
            value: "25805",
            sID: "dT7QToRlEF",
          },
          {
            label: "Tibirita",
            value: "25807",
            sID: "CMiOq6Yk19",
          },
          {
            label: "Tocaima",
            value: "25815",
            sID: "6sdLP6oi2G",
          },
          {
            label: "Tocancipá",
            value: "25817",
            sID: "Kos16TMfUd",
          },
          {
            label: "Topaipí",
            value: "25823",
            sID: "qTOAkhwG3A",
          },
          {
            label: "Ubalá",
            value: "25839",
            sID: "hUyIKWfLHo",
          },
          {
            label: "Ubaque",
            value: "25841",
            sID: "ppIStZannL",
          },
          {
            label: "Villa De San Diego De Ubaté",
            value: "25843",
            sID: "Dx8l5fmJ7q",
          },
          {
            label: "Une",
            value: "25845",
            sID: "PzVfNg1OIN",
          },
          {
            label: "Útica",
            value: "25851",
            sID: "h3ZqHneXHt",
          },
          {
            label: "Vergara",
            value: "25862",
            sID: "ikLRx1iKMz",
          },
          {
            label: "Vianí",
            value: "25867",
            sID: "YlzZpdty4D",
          },
          {
            label: "Villagómez",
            value: "25871",
            sID: "ernfk3HCCx",
          },
          {
            label: "Villapinzón",
            value: "25873",
            sID: "NKcvhNnTWz",
          },
          {
            label: "Villeta",
            value: "25875",
            sID: "c743Se4zyk",
          },
          {
            label: "Viotá",
            value: "25878",
            sID: "Zx1aLQ6REj",
          },
          {
            label: "Yacopí",
            value: "25885",
            sID: "UiO2GrJcFv",
          },
          {
            label: "Zipacón",
            value: "25898",
            sID: "RAhmx5NObg",
          },
          {
            label: "Zipaquirá",
            value: "25899",
            sID: "KIYOHc26Cb",
          },
        ],
        sID: "knXtcMsUcg",
      },
      {
        label: "Chocó",
        value: "27",
        cities: [
          {
            label: "Quibdó",
            value: "27001",
            sID: "d6mYaWD0aw",
          },
          {
            label: "Acandí",
            value: "27006",
            sID: "RG8nSGH534",
          },
          {
            label: "Alto Baudó",
            value: "27025",
            sID: "wCKfrwOR5S",
          },
          {
            label: "Atrato",
            value: "27050",
            sID: "8KxhrKx75S",
          },
          {
            label: "Bagadó",
            value: "27073",
            sID: "DfmCfSLDMU",
          },
          {
            label: "Bahía Solano",
            value: "27075",
            sID: "g7frub9Nh7",
          },
          {
            label: "Bajo Baudó",
            value: "27077",
            sID: "6zg0WblddU",
          },
          {
            label: "Bojayá",
            value: "27099",
            sID: "cQTBSDM4n7",
          },
          {
            label: "El Cantón Del San Pablo",
            value: "27135",
            sID: "BA7N7ZSgez",
          },
          {
            label: "Carmen Del Darién",
            value: "27150",
            sID: "1QZXM5KsST",
          },
          {
            label: "Cértegui",
            value: "27160",
            sID: "OD0RUKih6S",
          },
          {
            label: "Condoto",
            value: "27205",
            sID: "VPZDQHnqov",
          },
          {
            label: "El Carmen De Atrato",
            value: "27245",
            sID: "0vtEx5I3y6",
          },
          {
            label: "El Litoral Del San Juan",
            value: "27250",
            sID: "Ov74VSzALq",
          },
          {
            label: "Istmina",
            value: "27361",
            sID: "Eb78ICKdGj",
          },
          {
            label: "Juradó",
            value: "27372",
            sID: "5HjZqC9ocC",
          },
          {
            label: "Lloró",
            value: "27413",
            sID: "LDA2aGyQsd",
          },
          {
            label: "Medio Atrato",
            value: "27425",
            sID: "5zrtsrQ2xh",
          },
          {
            label: "Medio Baudó",
            value: "27430",
            sID: "0ib5I2zSLr",
          },
          {
            label: "Medio San Juan",
            value: "27450",
            sID: "W7Qc9D7g2E",
          },
          {
            label: "Nóvita",
            value: "27491",
            sID: "7YTEKsBi7y",
          },
          {
            label: "Nuquí",
            value: "27495",
            sID: "xCozJR9J3W",
          },
          {
            label: "Río Iró",
            value: "27580",
            sID: "yRSgTHI3vy",
          },
          {
            label: "Río Quito",
            value: "27600",
            sID: "rZQXcUunk2",
          },
          {
            label: "Riosucio",
            value: "27615",
            sID: "1kfhX1Z6Y9",
          },
          {
            label: "San José Del Palmar",
            value: "27660",
            sID: "jRbOooi12D",
          },
          {
            label: "Sipí",
            value: "27745",
            sID: "OGP2g8Ou49",
          },
          {
            label: "Tadó",
            value: "27787",
            sID: "04ynxS1zwJ",
          },
          {
            label: "Unguía",
            value: "27800",
            sID: "05rVXvoB9i",
          },
          {
            label: "Unión Panamericana",
            value: "27810",
            sID: "5t1appzAuR",
          },
        ],
        sID: "Q6MJw2FKPC",
      },
      {
        label: "Huila",
        value: "41",
        cities: [
          {
            label: "Neiva",
            value: "41001",
            sID: "KPsjgTg5Wj",
          },
          {
            label: "Acevedo",
            value: "41006",
            sID: "pOG7ERoznQ",
          },
          {
            label: "Agrado",
            value: "41013",
            sID: "akmwrHsdtS",
          },
          {
            label: "Aipe",
            value: "41016",
            sID: "hLFlmxGl9Q",
          },
          {
            label: "Algeciras",
            value: "41020",
            sID: "J0dgJiMGez",
          },
          {
            label: "Altamira",
            value: "41026",
            sID: "OLTukO6ffo",
          },
          {
            label: "Baraya",
            value: "41078",
            sID: "tEPeMtHP9e",
          },
          {
            label: "Campoalegre",
            value: "41132",
            sID: "stEvoKeoSq",
          },
          {
            label: "Colombia",
            value: "41206",
            sID: "K94Qm5J9Lz",
          },
          {
            label: "Elías",
            value: "41244",
            sID: "JVgeSwHY5w",
          },
          {
            label: "Garzón",
            value: "41298",
            sID: "uqauFUUnSn",
          },
          {
            label: "Gigante",
            value: "41306",
            sID: "XwNwmJtJ8O",
          },
          {
            label: "Guadalupe",
            value: "41319",
            sID: "kQwamdZotA",
          },
          {
            label: "Hobo",
            value: "41349",
            sID: "ETDkVIihar",
          },
          {
            label: "Íquira",
            value: "41357",
            sID: "x9eEM7xwjt",
          },
          {
            label: "Isnos",
            value: "41359",
            sID: "bDop2t1diM",
          },
          {
            label: "La Argentina",
            value: "41378",
            sID: "OqdDcxT4nj",
          },
          {
            label: "La Plata",
            value: "41396",
            sID: "euSK7KNDMs",
          },
          {
            label: "Nátaga",
            value: "41483",
            sID: "qapWXxkH2E",
          },
          {
            label: "Oporapa",
            value: "41503",
            sID: "scpnJPduNA",
          },
          {
            label: "Paicol",
            value: "41518",
            sID: "yjsisNPpBm",
          },
          {
            label: "Palermo",
            value: "41524",
            sID: "u1FpfS0jHD",
          },
          {
            label: "Palestina",
            value: "41530",
            sID: "40txLSkKfT",
          },
          {
            label: "Pital",
            value: "41548",
            sID: "lhmaCBj7rF",
          },
          {
            label: "Pitalito",
            value: "41551",
            sID: "jsRxImC5nI",
          },
          {
            label: "Rivera",
            value: "41615",
            sID: "N97PPIfhMT",
          },
          {
            label: "Saladoblanco",
            value: "41660",
            sID: "gudLdi3TKB",
          },
          {
            label: "San Agustín",
            value: "41668",
            sID: "izVGwJgzmC",
          },
          {
            label: "Santa María",
            value: "41676",
            sID: "7XCWibc626",
          },
          {
            label: "Suaza",
            value: "41770",
            sID: "GFjkUUZgFc",
          },
          {
            label: "Tarqui",
            value: "41791",
            sID: "V6ljTYgkPj",
          },
          {
            label: "Tesalia",
            value: "41797",
            sID: "LOc0JFj2LD",
          },
          {
            label: "Tello",
            value: "41799",
            sID: "DfoUAKXy7k",
          },
          {
            label: "Teruel",
            value: "41801",
            sID: "RIkQ6OpyWH",
          },
          {
            label: "Timaná",
            value: "41807",
            sID: "BgJLM4ZV3D",
          },
          {
            label: "Villavieja",
            value: "41872",
            sID: "jQoSQ4ugOk",
          },
          {
            label: "Yaguará",
            value: "41885",
            sID: "kmp3p7IOuO",
          },
        ],
        sID: "iif7dLXyAV",
      },
      {
        label: "La Guajira",
        value: "44",
        cities: [
          {
            label: "Riohacha",
            value: "44001",
            sID: "2lX7ZeiP3p",
          },
          {
            label: "Albania",
            value: "44035",
            sID: "BR62sgliJA",
          },
          {
            label: "Barrancas",
            value: "44078",
            sID: "aV32OSDJ3E",
          },
          {
            label: "Dibulla",
            value: "44090",
            sID: "qRHevP460u",
          },
          {
            label: "Distracción",
            value: "44098",
            sID: "55xTDu3MxG",
          },
          {
            label: "El Molino",
            value: "44110",
            sID: "feE3FqcjLF",
          },
          {
            label: "Fonseca",
            value: "44279",
            sID: "b4MCK9pvhH",
          },
          {
            label: "Hatonuevo",
            value: "44378",
            sID: "d2Qz8g9PUp",
          },
          {
            label: "La Jagua Del Pilar",
            value: "44420",
            sID: "kSPsC2P3zt",
          },
          {
            label: "Maicao",
            value: "44430",
            sID: "PIEeVIaBkO",
          },
          {
            label: "Manaure",
            value: "44560",
            sID: "lLa33R9CGt",
          },
          {
            label: "San Juan Del Cesar",
            value: "44650",
            sID: "Wdu9aCOao5",
          },
          {
            label: "Uribia",
            value: "44847",
            sID: "E9Ih3Og2oZ",
          },
          {
            label: "Urumita",
            value: "44855",
            sID: "GTR45Tt4XY",
          },
          {
            label: "Villanueva",
            value: "44874",
            sID: "AQaNASb1te",
          },
        ],
        sID: "Zmh7WixqVz",
      },
      {
        label: "Magdalena",
        value: "47",
        cities: [
          {
            label: "Santa Marta",
            value: "47001",
            sID: "WsCGbOOa50",
          },
          {
            label: "Algarrobo",
            value: "47030",
            sID: "8kbIV7BYIx",
          },
          {
            label: "Aracataca",
            value: "47053",
            sID: "tc74rEjEGJ",
          },
          {
            label: "Ariguaní",
            value: "47058",
            sID: "ncjrcT5jHb",
          },
          {
            label: "Cerro De San Antonio",
            value: "47161",
            sID: "LvCcqrtsAs",
          },
          {
            label: "Chivolo",
            value: "47170",
            sID: "nqDE5bGSwK",
          },
          {
            label: "Ciénaga",
            value: "47189",
            sID: "OwJxN5m5pM",
          },
          {
            label: "Concordia",
            value: "47205",
            sID: "f5lQYOp2tM",
          },
          {
            label: "El Banco",
            value: "47245",
            sID: "M1nWuQDD1W",
          },
          {
            label: "El Piñón",
            value: "47258",
            sID: "e9KbeeHBIA",
          },
          {
            label: "El Retén",
            value: "47268",
            sID: "xuVEW0VXr4",
          },
          {
            label: "Fundación",
            value: "47288",
            sID: "fO6lrof9pn",
          },
          {
            label: "Guamal",
            value: "47318",
            sID: "J3r84pew3o",
          },
          {
            label: "Nueva Granada",
            value: "47460",
            sID: "DfDlaDWUbF",
          },
          {
            label: "Pedraza",
            value: "47541",
            sID: "baeX6WGZhm",
          },
          {
            label: "Pijiño Del Carmen",
            value: "47545",
            sID: "GcQM6DDcTZ",
          },
          {
            label: "Pivijay",
            value: "47551",
            sID: "DVLiMmT2RY",
          },
          {
            label: "Plato",
            value: "47555",
            sID: "iWARGw1FfU",
          },
          {
            label: "Puebloviejo",
            value: "47570",
            sID: "fVBxLXZOJZ",
          },
          {
            label: "Remolino",
            value: "47605",
            sID: "JWE9Yy5gvn",
          },
          {
            label: "Sabanas De San Ángel",
            value: "47660",
            sID: "0UcdzOu26X",
          },
          {
            label: "Salamina",
            value: "47675",
            sID: "vkyf5fYsSL",
          },
          {
            label: "San Sebastián De Buenavista",
            value: "47692",
            sID: "79Xoqn41H1",
          },
          {
            label: "San Zenón",
            value: "47703",
            sID: "OzMdAviCJq",
          },
          {
            label: "Santa Ana",
            value: "47707",
            sID: "uKnEOvL9va",
          },
          {
            label: "Santa Bárbara De Pinto",
            value: "47720",
            sID: "6zKnxJDHcC",
          },
          {
            label: "Sitionuevo",
            value: "47745",
            sID: "PWPr9ZPUq5",
          },
          {
            label: "Tenerife",
            value: "47798",
            sID: "agqOojRjRx",
          },
          {
            label: "Zapayán",
            value: "47960",
            sID: "B5UZeZJh7x",
          },
          {
            label: "Zona Bananera",
            value: "47980",
            sID: "T0pDUvHdLD",
          },
        ],
        sID: "zwwgox39RV",
      },
      {
        label: "Meta",
        value: "50",
        cities: [
          {
            label: "Villavicencio",
            value: "50001",
            sID: "1vAnJ16mZ0",
          },
          {
            label: "Acacías",
            value: "50006",
            sID: "MVCpbVUnN7",
          },
          {
            label: "Barranca De Upía",
            value: "50110",
            sID: "4jck2tZgHj",
          },
          {
            label: "Cabuyaro",
            value: "50124",
            sID: "orNXCzOGci",
          },
          {
            label: "Castilla La Nueva",
            value: "50150",
            sID: "51ApfvDzYh",
          },
          {
            label: "Cubarral",
            value: "50223",
            sID: "hkJCkdY5AT",
          },
          {
            label: "Cumaral",
            value: "50226",
            sID: "jI1vkuSA9X",
          },
          {
            label: "El Calvario",
            value: "50245",
            sID: "R7S1NX6xns",
          },
          {
            label: "El Castillo",
            value: "50251",
            sID: "MnQcCe5F41",
          },
          {
            label: "El Dorado",
            value: "50270",
            sID: "7AZaaWWktr",
          },
          {
            label: "Fuente De Oro",
            value: "50287",
            sID: "i4QoR06oDN",
          },
          {
            label: "Granada",
            value: "50313",
            sID: "HOLF8CrDq4",
          },
          {
            label: "Guamal",
            value: "50318",
            sID: "k351zOVpai",
          },
          {
            label: "Mapiripán",
            value: "50325",
            sID: "R85jMzymLr",
          },
          {
            label: "Mesetas",
            value: "50330",
            sID: "GUChCjxvrl",
          },
          {
            label: "La Macarena",
            value: "50350",
            sID: "bM71z7sAV7",
          },
          {
            label: "Uribe",
            value: "50370",
            sID: "xJwR2lqGte",
          },
          {
            label: "Lejanías",
            value: "50400",
            sID: "8ITO2chdQM",
          },
          {
            label: "Puerto Concordia",
            value: "50450",
            sID: "OwBlG9SzdG",
          },
          {
            label: "Puerto Gaitán",
            value: "50568",
            sID: "Y7wGiXPwKy",
          },
          {
            label: "Puerto López",
            value: "50573",
            sID: "E0UFV37w3Z",
          },
          {
            label: "Puerto Lleras",
            value: "50577",
            sID: "3bW7G4kUzj",
          },
          {
            label: "Puerto Rico",
            value: "50590",
            sID: "0g5WfUAaPn",
          },
          {
            label: "Restrepo",
            value: "50606",
            sID: "QhdHT4El2h",
          },
          {
            label: "San Carlos De Guaroa",
            value: "50680",
            sID: "plida7yvqB",
          },
          {
            label: "San Juan De Arama",
            value: "50683",
            sID: "E4DNXHraJt",
          },
          {
            label: "San Juanito",
            value: "50686",
            sID: "toA4vnxbzj",
          },
          {
            label: "San Martín",
            value: "50689",
            sID: "v5gPnN5JOC",
          },
          {
            label: "Vistahermosa",
            value: "50711",
            sID: "elGsq0qLjr",
          },
        ],
        sID: "c6wOOSJrUB",
      },
      {
        label: "Nariño",
        value: "52",
        cities: [
          {
            label: "Pasto",
            value: "52001",
            sID: "om6kn0YZ4l",
          },
          {
            label: "Albán",
            value: "52019",
            sID: "HhKZ0PLlTL",
          },
          {
            label: "Aldana",
            value: "52022",
            sID: "fmIhuofJb3",
          },
          {
            label: "Ancuya",
            value: "52036",
            sID: "FehoQv3SH0",
          },
          {
            label: "Arboleda",
            value: "52051",
            sID: "8DixzJS8rb",
          },
          {
            label: "Barbacoas",
            value: "52079",
            sID: "zigPH5uCJz",
          },
          {
            label: "Belén",
            value: "52083",
            sID: "RRqbqE9W4z",
          },
          {
            label: "Buesaco",
            value: "52110",
            sID: "AIBfA3XaXr",
          },
          {
            label: "Colón",
            value: "52203",
            sID: "kNNwKuJIKf",
          },
          {
            label: "Consacá",
            value: "52207",
            sID: "iSZ2UCyVzg",
          },
          {
            label: "Contadero",
            value: "52210",
            sID: "7EKSAxZnjR",
          },
          {
            label: "Córdoba",
            value: "52215",
            sID: "hZltEOw7Xc",
          },
          {
            label: "Cuaspud Carlosama",
            value: "52224",
            sID: "inoi9HaTRp",
          },
          {
            label: "Cumbal",
            value: "52227",
            sID: "uXj6leE1JV",
          },
          {
            label: "Cumbitara",
            value: "52233",
            sID: "7RuUSBQ7ge",
          },
          {
            label: "Chachagüí",
            value: "52240",
            sID: "lcCXtTZZ3U",
          },
          {
            label: "El Charco",
            value: "52250",
            sID: "wwkJRZRknJ",
          },
          {
            label: "El Peñol",
            value: "52254",
            sID: "ecd3uERtfQ",
          },
          {
            label: "El Rosario",
            value: "52256",
            sID: "vpzgbApY0z",
          },
          {
            label: "El Tablón De Gómez",
            value: "52258",
            sID: "6ExwEiNafk",
          },
          {
            label: "El Tambo",
            value: "52260",
            sID: "3nJogoy9Yw",
          },
          {
            label: "Funes",
            value: "52287",
            sID: "a9wcHIhcyG",
          },
          {
            label: "Guachucal",
            value: "52317",
            sID: "eiQS0IH3jB",
          },
          {
            label: "Guaitarilla",
            value: "52320",
            sID: "YMIZsZMNg2",
          },
          {
            label: "Gualmatán",
            value: "52323",
            sID: "CqCFDTlFoN",
          },
          {
            label: "Iles",
            value: "52352",
            sID: "l3EicNpGM2",
          },
          {
            label: "Imués",
            value: "52354",
            sID: "tVUyFpvylB",
          },
          {
            label: "Ipiales",
            value: "52356",
            sID: "oyK5ZWvnjR",
          },
          {
            label: "La Cruz",
            value: "52378",
            sID: "OzWbkOlNqQ",
          },
          {
            label: "La Florida",
            value: "52381",
            sID: "k0ZAC0TXXC",
          },
          {
            label: "La Llanada",
            value: "52385",
            sID: "loVSTvdOaO",
          },
          {
            label: "La Tola",
            value: "52390",
            sID: "RQ0Y10W7XI",
          },
          {
            label: "La Unión",
            value: "52399",
            sID: "aq3l2BqhRZ",
          },
          {
            label: "Leiva",
            value: "52405",
            sID: "aEsXuYnAXZ",
          },
          {
            label: "Linares",
            value: "52411",
            sID: "fiYKqyQHPY",
          },
          {
            label: "Los Andes",
            value: "52418",
            sID: "bVrSRTofBj",
          },
          {
            label: "Magüí",
            value: "52427",
            sID: "AZzsyPV9kH",
          },
          {
            label: "Mallama",
            value: "52435",
            sID: "lq9afMEFgU",
          },
          {
            label: "Mosquera",
            value: "52473",
            sID: "XEQsrEgh5y",
          },
          {
            label: "Nariño",
            value: "52480",
            sID: "ttrcjYDto2",
          },
          {
            label: "Olaya Herrera",
            value: "52490",
            sID: "JB33mPRpip",
          },
          {
            label: "Ospina",
            value: "52506",
            sID: "XQ448YpVzj",
          },
          {
            label: "Francisco Pizarro",
            value: "52520",
            sID: "97h1HF9gbg",
          },
          {
            label: "Policarpa",
            value: "52540",
            sID: "89F0YXSyk9",
          },
          {
            label: "Potosí",
            value: "52560",
            sID: "uvzvtTcmrV",
          },
          {
            label: "Providencia",
            value: "52565",
            sID: "dI2VVjMzAa",
          },
          {
            label: "Puerres",
            value: "52573",
            sID: "e3hYClrx8v",
          },
          {
            label: "Pupiales",
            value: "52585",
            sID: "IJyzKL6MAn",
          },
          {
            label: "Ricaurte",
            value: "52612",
            sID: "9iDTtbgIxd",
          },
          {
            label: "Roberto Payán",
            value: "52621",
            sID: "OYDQhBHJTH",
          },
          {
            label: "Samaniego",
            value: "52678",
            sID: "ywyMa26xce",
          },
          {
            label: "Sandoná",
            value: "52683",
            sID: "5i6m6miehQ",
          },
          {
            label: "San Bernardo",
            value: "52685",
            sID: "vT8tXLyqUu",
          },
          {
            label: "San Lorenzo",
            value: "52687",
            sID: "eExXQaSLAz",
          },
          {
            label: "San Pablo",
            value: "52693",
            sID: "q8ei64nWsl",
          },
          {
            label: "San Pedro De Cartago",
            value: "52694",
            sID: "YLpNzyLFCO",
          },
          {
            label: "Santa Bárbara",
            value: "52696",
            sID: "LDAnxokpTQ",
          },
          {
            label: "Santacruz",
            value: "52699",
            sID: "GGDTnegRob",
          },
          {
            label: "Sapuyes",
            value: "52720",
            sID: "bF2lu1PiFA",
          },
          {
            label: "Taminango",
            value: "52786",
            sID: "HVQ8iOAM4i",
          },
          {
            label: "Tangua",
            value: "52788",
            sID: "KBGH7krFWp",
          },
          {
            label: "San Andrés De Tumaco",
            value: "52835",
            sID: "L25mVAN6fj",
          },
          {
            label: "Túquerres",
            value: "52838",
            sID: "mCmIWDLW2j",
          },
          {
            label: "Yacuanquer",
            value: "52885",
            sID: "XwEL7I5EXy",
          },
        ],
        sID: "PXCHqJj0FI",
      },
      {
        label: "Norte De Santander",
        value: "54",
        cities: [
          {
            label: "San José De Cúcuta",
            value: "54001",
            sID: "fOTzHLKbj3",
          },
          {
            label: "Ábrego",
            value: "54003",
            sID: "kVBSvVbvoJ",
          },
          {
            label: "Arboledas",
            value: "54051",
            sID: "OzL9sIP5xk",
          },
          {
            label: "Bochalema",
            value: "54099",
            sID: "WpqijM8ySs",
          },
          {
            label: "Bucarasica",
            value: "54109",
            sID: "nThi6G1Byn",
          },
          {
            label: "Cácota",
            value: "54125",
            sID: "h7CLfoJGw5",
          },
          {
            label: "Cáchira",
            value: "54128",
            sID: "6K8iFt9WDu",
          },
          {
            label: "Chinácota",
            value: "54172",
            sID: "aAsKrO298M",
          },
          {
            label: "Chitagá",
            value: "54174",
            sID: "XcO7rJCNlC",
          },
          {
            label: "Convención",
            value: "54206",
            sID: "bV0ze3M7g4",
          },
          {
            label: "Cucutilla",
            value: "54223",
            sID: "iefxLt8bck",
          },
          {
            label: "Durania",
            value: "54239",
            sID: "vi66Xy3kzk",
          },
          {
            label: "El Carmen",
            value: "54245",
            sID: "iElciMd4ga",
          },
          {
            label: "El Tarra",
            value: "54250",
            sID: "nbTfsg2KQP",
          },
          {
            label: "El Zulia",
            value: "54261",
            sID: "znpfxnPeWX",
          },
          {
            label: "Gramalote",
            value: "54313",
            sID: "zRgcf0Z8hx",
          },
          {
            label: "Hacarí",
            value: "54344",
            sID: "kU93tDd5lU",
          },
          {
            label: "Herrán",
            value: "54347",
            sID: "zYLeqCd9QP",
          },
          {
            label: "Labateca",
            value: "54377",
            sID: "aUAzs8B2ze",
          },
          {
            label: "La Esperanza",
            value: "54385",
            sID: "JrB5F320Z8",
          },
          {
            label: "La Playa",
            value: "54398",
            sID: "2ohEOVHLyh",
          },
          {
            label: "Los Patios",
            value: "54405",
            sID: "UzsxqxjcXd",
          },
          {
            label: "Lourdes",
            value: "54418",
            sID: "S40wWGM3wc",
          },
          {
            label: "Mutiscua",
            value: "54480",
            sID: "nSIIHXAOhT",
          },
          {
            label: "Ocaña",
            value: "54498",
            sID: "4InUXgzDWP",
          },
          {
            label: "Pamplona",
            value: "54518",
            sID: "Wye4DgZfQs",
          },
          {
            label: "Pamplonita",
            value: "54520",
            sID: "3EltfxoLdb",
          },
          {
            label: "Puerto Santander",
            value: "54553",
            sID: "qcX1fkT6tF",
          },
          {
            label: "Ragonvalia",
            value: "54599",
            sID: "v7pFnxGtqK",
          },
          {
            label: "Salazar",
            value: "54660",
            sID: "5osFuV6HkV",
          },
          {
            label: "San Calixto",
            value: "54670",
            sID: "kv5R9Jny4b",
          },
          {
            label: "San Cayetano",
            value: "54673",
            sID: "mCgJkBBEFc",
          },
          {
            label: "Santiago",
            value: "54680",
            sID: "c8erHCtnLk",
          },
          {
            label: "Sardinata",
            value: "54720",
            sID: "t07yWMCDnu",
          },
          {
            label: "Silos",
            value: "54743",
            sID: "N1Fnzw2OPp",
          },
          {
            label: "Teorama",
            value: "54800",
            sID: "GIwCX5rmsQ",
          },
          {
            label: "Tibú",
            value: "54810",
            sID: "tq7OheIoRB",
          },
          {
            label: "Toledo",
            value: "54820",
            sID: "9Prgsd39iw",
          },
          {
            label: "Villa Caro",
            value: "54871",
            sID: "swFUCsCQJw",
          },
          {
            label: "Villa Del Rosario",
            value: "54874",
            sID: "lxQi7gwI4T",
          },
        ],
        sID: "DYhHoUHlBC",
      },
      {
        label: "Quindío",
        value: "63",
        cities: [
          {
            label: "Armenia",
            value: "63001",
            sID: "BE7ObqJt2N",
          },
          {
            label: "Buenavista",
            value: "63111",
            sID: "HuPIINIY1u",
          },
          {
            label: "Calarcá",
            value: "63130",
            sID: "A1Nl1jzroF",
          },
          {
            label: "Circasia",
            value: "63190",
            sID: "p7eje9ie5L",
          },
          {
            label: "Córdoba",
            value: "63212",
            sID: "Zu41ZRjk6D",
          },
          {
            label: "Filandia",
            value: "63272",
            sID: "30HK9FoVDK",
          },
          {
            label: "Génova",
            value: "63302",
            sID: "6pQ7Ew7xrB",
          },
          {
            label: "La Tebaida",
            value: "63401",
            sID: "B9vHJxKtA8",
          },
          {
            label: "Montenegro",
            value: "63470",
            sID: "QnANPLTG0u",
          },
          {
            label: "Pijao",
            value: "63548",
            sID: "1rijEjR3WE",
          },
          {
            label: "Quimbaya",
            value: "63594",
            sID: "sxh6pvJcRr",
          },
          {
            label: "Salento",
            value: "63690",
            sID: "mhZmjdNiOv",
          },
        ],
        sID: "6miuSWv2yp",
      },
      {
        label: "Risaralda",
        value: "66",
        cities: [
          {
            label: "Pereira",
            value: "66001",
            sID: "alsiV0FunJ",
          },
          {
            label: "Apía",
            value: "66045",
            sID: "tUpSUtj6Al",
          },
          {
            label: "Balboa",
            value: "66075",
            sID: "Xa9MUoOivN",
          },
          {
            label: "Belén De Umbría",
            value: "66088",
            sID: "MoW7y5DYUS",
          },
          {
            label: "Dosquebradas",
            value: "66170",
            sID: "rzicpGXUCt",
          },
          {
            label: "Guática",
            value: "66318",
            sID: "SsjY0lRs2X",
          },
          {
            label: "La Celia",
            value: "66383",
            sID: "OPt4EDr8js",
          },
          {
            label: "La Virginia",
            value: "66400",
            sID: "4JToF3n9xV",
          },
          {
            label: "Marsella",
            value: "66440",
            sID: "ejqjt1LLwK",
          },
          {
            label: "Mistrató",
            value: "66456",
            sID: "TY7m4A9XJQ",
          },
          {
            label: "Pueblo Rico",
            value: "66572",
            sID: "NI7Icidqse",
          },
          {
            label: "Quinchía",
            value: "66594",
            sID: "ldYbWNnFA0",
          },
          {
            label: "Santa Rosa De Cabal",
            value: "66682",
            sID: "NPFvCHz429",
          },
          {
            label: "Santuario",
            value: "66687",
            sID: "BKnQzvJ9rL",
          },
        ],
        sID: "Rl4hObW6L1",
      },
      {
        label: "Santander",
        value: "68",
        cities: [
          {
            label: "Bucaramanga",
            value: "68001",
            sID: "EKnTYqYCnT",
          },
          {
            label: "Aguada",
            value: "68013",
            sID: "EG6UYcfiIZ",
          },
          {
            label: "Albania",
            value: "68020",
            sID: "0sXdQmEmUJ",
          },
          {
            label: "Aratoca",
            value: "68051",
            sID: "Z54uuYklLZ",
          },
          {
            label: "Barbosa",
            value: "68077",
            sID: "otiooElckb",
          },
          {
            label: "Barichara",
            value: "68079",
            sID: "mEUzUXd7vF",
          },
          {
            label: "Barrancabermeja",
            value: "68081",
            sID: "pTHcjL3yQI",
          },
          {
            label: "Betulia",
            value: "68092",
            sID: "tBhOoWm1T9",
          },
          {
            label: "Bolívar",
            value: "68101",
            sID: "gV6Cj2TJbS",
          },
          {
            label: "Cabrera",
            value: "68121",
            sID: "UJJzZ5nFAA",
          },
          {
            label: "California",
            value: "68132",
            sID: "7AzbPs11JZ",
          },
          {
            label: "Capitanejo",
            value: "68147",
            sID: "fP30V4BjAn",
          },
          {
            label: "Carcasí",
            value: "68152",
            sID: "gpmNvZQpcT",
          },
          {
            label: "Cepitá",
            value: "68160",
            sID: "yBkx0T0O18",
          },
          {
            label: "Cerrito",
            value: "68162",
            sID: "mDkzkEZpWn",
          },
          {
            label: "Charalá",
            value: "68167",
            sID: "LcIa2IC56G",
          },
          {
            label: "Charta",
            value: "68169",
            sID: "t1HwtemZK5",
          },
          {
            label: "Chima",
            value: "68176",
            sID: "1rDU1oa1F1",
          },
          {
            label: "Chipatá",
            value: "68179",
            sID: "VQl7WLFWuT",
          },
          {
            label: "Cimitarra",
            value: "68190",
            sID: "wwwGP4BTN0",
          },
          {
            label: "Concepción",
            value: "68207",
            sID: "tP3K3IFfxZ",
          },
          {
            label: "Confines",
            value: "68209",
            sID: "94d0as5QFi",
          },
          {
            label: "Contratación",
            value: "68211",
            sID: "yfniU47urJ",
          },
          {
            label: "Coromoro",
            value: "68217",
            sID: "Ltz9cazyuc",
          },
          {
            label: "Curití",
            value: "68229",
            sID: "4MKpMQ6KxW",
          },
          {
            label: "El Carmen De Chucurí",
            value: "68235",
            sID: "JxX85MYjxT",
          },
          {
            label: "El Guacamayo",
            value: "68245",
            sID: "uXf25RwV9k",
          },
          {
            label: "El Peñón",
            value: "68250",
            sID: "THeniKPKkO",
          },
          {
            label: "El Playón",
            value: "68255",
            sID: "hHKVeTnFdH",
          },
          {
            label: "Encino",
            value: "68264",
            sID: "piJKFPqhB9",
          },
          {
            label: "Enciso",
            value: "68266",
            sID: "y5v39fzemA",
          },
          {
            label: "Florián",
            value: "68271",
            sID: "IjtcHMj08b",
          },
          {
            label: "Floridablanca",
            value: "68276",
            sID: "taMM3KK1x5",
          },
          {
            label: "Galán",
            value: "68296",
            sID: "MHlpxurvvd",
          },
          {
            label: "Gámbita",
            value: "68298",
            sID: "uE0h6Y7mDa",
          },
          {
            label: "Girón",
            value: "68307",
            sID: "xDRp5OMm3b",
          },
          {
            label: "Guaca",
            value: "68318",
            sID: "htDdWgI0mS",
          },
          {
            label: "Guadalupe",
            value: "68320",
            sID: "ASY8Mequ5x",
          },
          {
            label: "Guapotá",
            value: "68322",
            sID: "8kMUiZ5vKY",
          },
          {
            label: "Guavatá",
            value: "68324",
            sID: "xkItQr02gR",
          },
          {
            label: "Güepsa",
            value: "68327",
            sID: "9pUjv8DS2n",
          },
          {
            label: "Hato",
            value: "68344",
            sID: "IBjB8LKHWt",
          },
          {
            label: "Jesús María",
            value: "68368",
            sID: "oDjzTp7Z4z",
          },
          {
            label: "Jordán",
            value: "68370",
            sID: "H6DiPHrhHK",
          },
          {
            label: "La Belleza",
            value: "68377",
            sID: "3JCMF7Eytw",
          },
          {
            label: "Landázuri",
            value: "68385",
            sID: "wBxrwS1RkQ",
          },
          {
            label: "La Paz",
            value: "68397",
            sID: "5FTu8XqhqJ",
          },
          {
            label: "Lebrija",
            value: "68406",
            sID: "1Bp0pYOYA9",
          },
          {
            label: "Los Santos",
            value: "68418",
            sID: "oLwaKHGv1S",
          },
          {
            label: "Macaravita",
            value: "68425",
            sID: "4r1YM6hKEr",
          },
          {
            label: "Málaga",
            value: "68432",
            sID: "071EBCuHQB",
          },
          {
            label: "Matanza",
            value: "68444",
            sID: "vUQtM8HsfL",
          },
          {
            label: "Mogotes",
            value: "68464",
            sID: "C2lKl2e8wy",
          },
          {
            label: "Molagavita",
            value: "68468",
            sID: "zZttwp5Ca3",
          },
          {
            label: "Ocamonte",
            value: "68498",
            sID: "IxjtHVszui",
          },
          {
            label: "Oiba",
            value: "68500",
            sID: "Z67CmWtj7s",
          },
          {
            label: "Onzaga",
            value: "68502",
            sID: "KtzubjXXaH",
          },
          {
            label: "Palmar",
            value: "68522",
            sID: "u8GAwKBDLv",
          },
          {
            label: "Palmas Del Socorro",
            value: "68524",
            sID: "3VNkzJFUVW",
          },
          {
            label: "Páramo",
            value: "68533",
            sID: "EIZe3ryglY",
          },
          {
            label: "Piedecuesta",
            value: "68547",
            sID: "ceyG5FfRO4",
          },
          {
            label: "Pinchote",
            value: "68549",
            sID: "7yPiBm8X7G",
          },
          {
            label: "Puente Nacional",
            value: "68572",
            sID: "O6nB5JluXJ",
          },
          {
            label: "Puerto Parra",
            value: "68573",
            sID: "7dK4IGetsO",
          },
          {
            label: "Puerto Wilches",
            value: "68575",
            sID: "n7j4mlWJTt",
          },
          {
            label: "Rionegro",
            value: "68615",
            sID: "lKskD4xzH8",
          },
          {
            label: "Sabana De Torres",
            value: "68655",
            sID: "aIGPdBc67C",
          },
          {
            label: "San Andrés",
            value: "68669",
            sID: "Gp7eh2OoKe",
          },
          {
            label: "San Benito",
            value: "68673",
            sID: "O2NWdHwYid",
          },
          {
            label: "San Gil",
            value: "68679",
            sID: "N2ZFrTGNIZ",
          },
          {
            label: "San Joaquín",
            value: "68682",
            sID: "oQ9FMwGbSF",
          },
          {
            label: "San José De Miranda",
            value: "68684",
            sID: "YL1Q2vk1Bs",
          },
          {
            label: "San Miguel",
            value: "68686",
            sID: "GaHI4ymHeb",
          },
          {
            label: "San Vicente De Chucurí",
            value: "68689",
            sID: "CjBr4CsKqJ",
          },
          {
            label: "Santa Bárbara",
            value: "68705",
            sID: "WR9T7l4bQm",
          },
          {
            label: "Santa Helena Del Opón",
            value: "68720",
            sID: "K81kK8oJIC",
          },
          {
            label: "Simacota",
            value: "68745",
            sID: "b5f4oGLA8x",
          },
          {
            label: "Socorro",
            value: "68755",
            sID: "jf9ft4lCad",
          },
          {
            label: "Suaita",
            value: "68770",
            sID: "EJLwEtSmdt",
          },
          {
            label: "Sucre",
            value: "68773",
            sID: "5j2V7NFsYz",
          },
          {
            label: "Suratá",
            value: "68780",
            sID: "U1YjCjfSHU",
          },
          {
            label: "Tona",
            value: "68820",
            sID: "hUe44EHKGF",
          },
          {
            label: "Valle De San José",
            value: "68855",
            sID: "23kH4DP23s",
          },
          {
            label: "Vélez",
            value: "68861",
            sID: "5HzssfYYWX",
          },
          {
            label: "Vetas",
            value: "68867",
            sID: "rPiVGXWu4J",
          },
          {
            label: "Villanueva",
            value: "68872",
            sID: "fXc2vQiyF8",
          },
          {
            label: "Zapatoca",
            value: "68895",
            sID: "UOPgJlvbly",
          },
        ],
        sID: "T4d91Jnqtx",
      },
      {
        label: "Sucre",
        value: "70",
        cities: [
          {
            label: "Sincelejo",
            value: "70001",
            sID: "ute7duWUAp",
          },
          {
            label: "Buenavista",
            value: "70110",
            sID: "OS9J19rwCK",
          },
          {
            label: "Caimito",
            value: "70124",
            sID: "effdaUmlnU",
          },
          {
            label: "Colosó",
            value: "70204",
            sID: "ywsEgMu25y",
          },
          {
            label: "Corozal",
            value: "70215",
            sID: "4WvRKSp5LL",
          },
          {
            label: "Coveñas",
            value: "70221",
            sID: "rT1wRk3Qhf",
          },
          {
            label: "Chalán",
            value: "70230",
            sID: "KTyPAXzkRh",
          },
          {
            label: "El Roble",
            value: "70233",
            sID: "rvICIVzMie",
          },
          {
            label: "Galeras",
            value: "70235",
            sID: "abZDYyu05V",
          },
          {
            label: "Guaranda",
            value: "70265",
            sID: "ZC3SM4vHFb",
          },
          {
            label: "La Unión",
            value: "70400",
            sID: "Ilwaa6gbLC",
          },
          {
            label: "Los Palmitos",
            value: "70418",
            sID: "eKFyVZ0UkT",
          },
          {
            label: "Majagual",
            value: "70429",
            sID: "Ndb92NU3e6",
          },
          {
            label: "Morroa",
            value: "70473",
            sID: "gc1zm2DQre",
          },
          {
            label: "Ovejas",
            value: "70508",
            sID: "5VtgQLytDy",
          },
          {
            label: "Palmito",
            value: "70523",
            sID: "zMyAIEz93v",
          },
          {
            label: "Sampués",
            value: "70670",
            sID: "7YKXNFZuYS",
          },
          {
            label: "San Benito Abad",
            value: "70678",
            sID: "YEoZcyhElv",
          },
          {
            label: "San Juan De Betulia",
            value: "70702",
            sID: "V7tfdoHUIY",
          },
          {
            label: "San Marcos",
            value: "70708",
            sID: "4rcHc86XH5",
          },
          {
            label: "San Onofre",
            value: "70713",
            sID: "A4PExyezIV",
          },
          {
            label: "San Pedro",
            value: "70717",
            sID: "Sz0ZyIwmBA",
          },
          {
            label: "San Luis De Sincé",
            value: "70742",
            sID: "pECY6Cuw4d",
          },
          {
            label: "Sucre",
            value: "70771",
            sID: "am169YIalW",
          },
          {
            label: "Santiago De Tolú",
            value: "70820",
            sID: "dq79g3oi8M",
          },
          {
            label: "San José De Toluviejo",
            value: "70823",
            sID: "FcRdtNKw5X",
          },
        ],
        sID: "yy6v9dXhBk",
      },
      {
        label: "Tolima",
        value: "73",
        cities: [
          {
            label: "Ibagué",
            value: "73001",
            sID: "MCtp2luU6a",
          },
          {
            label: "Alpujarra",
            value: "73024",
            sID: "v4FtEYcf7P",
          },
          {
            label: "Alvarado",
            value: "73026",
            sID: "zAREtckmJs",
          },
          {
            label: "Ambalema",
            value: "73030",
            sID: "HyV6BLS3BE",
          },
          {
            label: "Anzoátegui",
            value: "73043",
            sID: "uVKC3PZQBv",
          },
          {
            label: "Armero",
            value: "73055",
            sID: "QZT6tpLuAe",
          },
          {
            label: "Ataco",
            value: "73067",
            sID: "NJbrHFT757",
          },
          {
            label: "Cajamarca",
            value: "73124",
            sID: "0MoEhrQFNX",
          },
          {
            label: "Carmen De Apicalá",
            value: "73148",
            sID: "nQHtaOMnDZ",
          },
          {
            label: "Casabianca",
            value: "73152",
            sID: "dNo6k1YW7z",
          },
          {
            label: "Chaparral",
            value: "73168",
            sID: "9bxUtCpGVs",
          },
          {
            label: "Coello",
            value: "73200",
            sID: "aLjvHNHSjM",
          },
          {
            label: "Coyaima",
            value: "73217",
            sID: "CWWnqohGkO",
          },
          {
            label: "Cunday",
            value: "73226",
            sID: "OdBaE8Nhb0",
          },
          {
            label: "Dolores",
            value: "73236",
            sID: "PLSzH7722L",
          },
          {
            label: "Espinal",
            value: "73268",
            sID: "BQKlP27xk0",
          },
          {
            label: "Falan",
            value: "73270",
            sID: "YTC44LAJgU",
          },
          {
            label: "Flandes",
            value: "73275",
            sID: "T7eEcpVGOk",
          },
          {
            label: "Fresno",
            value: "73283",
            sID: "jL2hqJjrvJ",
          },
          {
            label: "Guamo",
            value: "73319",
            sID: "XwLAJg8kTs",
          },
          {
            label: "Herveo",
            value: "73347",
            sID: "DZPOEKJLMC",
          },
          {
            label: "Honda",
            value: "73349",
            sID: "05RcvMoFnK",
          },
          {
            label: "Icononzo",
            value: "73352",
            sID: "qNvpACw45G",
          },
          {
            label: "Lérida",
            value: "73408",
            sID: "JqFbnItreR",
          },
          {
            label: "Líbano",
            value: "73411",
            sID: "xYyQJ4iIY3",
          },
          {
            label: "San Sebastián De Mariquita",
            value: "73443",
            sID: "Yl4wnLVm7N",
          },
          {
            label: "Melgar",
            value: "73449",
            sID: "SsHIbv27jW",
          },
          {
            label: "Murillo",
            value: "73461",
            sID: "iTJiUCeAYw",
          },
          {
            label: "Natagaima",
            value: "73483",
            sID: "GoNjy118Pw",
          },
          {
            label: "Ortega",
            value: "73504",
            sID: "qaa6brLQnp",
          },
          {
            label: "Palocabildo",
            value: "73520",
            sID: "1vaKqqyh7H",
          },
          {
            label: "Piedras",
            value: "73547",
            sID: "CMVnOHew2N",
          },
          {
            label: "Planadas",
            value: "73555",
            sID: "hPVh9Gv2B8",
          },
          {
            label: "Prado",
            value: "73563",
            sID: "wC9E0msU2H",
          },
          {
            label: "Purificación",
            value: "73585",
            sID: "ThldrUScGQ",
          },
          {
            label: "Rioblanco",
            value: "73616",
            sID: "QlK2AXwi82",
          },
          {
            label: "Roncesvalles",
            value: "73622",
            sID: "YM7IlUP6Rh",
          },
          {
            label: "Rovira",
            value: "73624",
            sID: "yIJE6kwZQo",
          },
          {
            label: "Saldaña",
            value: "73671",
            sID: "RYtoS6habL",
          },
          {
            label: "San Antonio",
            value: "73675",
            sID: "HHDPweofFD",
          },
          {
            label: "San Luis",
            value: "73678",
            sID: "uqsrT7h8n3",
          },
          {
            label: "Santa Isabel",
            value: "73686",
            sID: "shphz9W0nb",
          },
          {
            label: "Suárez",
            value: "73770",
            sID: "l8YsPNWIBV",
          },
          {
            label: "Valle De San Juan",
            value: "73854",
            sID: "7coKIPkyGt",
          },
          {
            label: "Venadillo",
            value: "73861",
            sID: "eizlAisIix",
          },
          {
            label: "Villahermosa",
            value: "73870",
            sID: "XYJXpdHv2p",
          },
          {
            label: "Villarrica",
            value: "73873",
            sID: "ECkqpS83qS",
          },
        ],
        sID: "8fFEuFuQpe",
      },
      {
        label: "Valle Del Cauca",
        value: "76",
        cities: [
          {
            label: "Cali",
            value: "76001",
            sID: "PuYO74X6E3",
          },
          {
            label: "Alcalá",
            value: "76020",
            sID: "RUU7xCUP4p",
          },
          {
            label: "Andalucía",
            value: "76036",
            sID: "Vt372jemiB",
          },
          {
            label: "Ansermanuevo",
            value: "76041",
            sID: "fxIBdVoAwK",
          },
          {
            label: "Argelia",
            value: "76054",
            sID: "WJVw2Qe0ec",
          },
          {
            label: "Bolívar",
            value: "76100",
            sID: "1a5B6mx8MP",
          },
          {
            label: "Buenaventura",
            value: "76109",
            sID: "HzpebrGwfb",
          },
          {
            label: "Guadalajara De Buga",
            value: "76111",
            sID: "PBcCmK9U1C",
          },
          {
            label: "Bugalagrande",
            value: "76113",
            sID: "m6lL50gcX4",
          },
          {
            label: "Caicedonia",
            value: "76122",
            sID: "uaPUnIjo1W",
          },
          {
            label: "Calima",
            value: "76126",
            sID: "cGtEWmG0P5",
          },
          {
            label: "Candelaria",
            value: "76130",
            sID: "l40F7od7HK",
          },
          {
            label: "Cartago",
            value: "76147",
            sID: "EIRlurlrbK",
          },
          {
            label: "Dagua",
            value: "76233",
            sID: "qqXwmxju37",
          },
          {
            label: "El Águila",
            value: "76243",
            sID: "qyxJbJ6gJj",
          },
          {
            label: "El Cairo",
            value: "76246",
            sID: "v8D2YRy6md",
          },
          {
            label: "El Cerrito",
            value: "76248",
            sID: "fMscvags0U",
          },
          {
            label: "El Dovio",
            value: "76250",
            sID: "Vg6eokbKUk",
          },
          {
            label: "Florida",
            value: "76275",
            sID: "p9982VvTaA",
          },
          {
            label: "Ginebra",
            value: "76306",
            sID: "OYr3ouaJLi",
          },
          {
            label: "Guacarí",
            value: "76318",
            sID: "YpWVm08GxX",
          },
          {
            label: "Jamundí",
            value: "76364",
            sID: "60coPlzK0j",
          },
          {
            label: "La Cumbre",
            value: "76377",
            sID: "6vUgNk70lL",
          },
          {
            label: "La Unión",
            value: "76400",
            sID: "f6PKsyTDlH",
          },
          {
            label: "La Victoria",
            value: "76403",
            sID: "sFh2ZbuBIT",
          },
          {
            label: "Obando",
            value: "76497",
            sID: "t2iQwK9GBf",
          },
          {
            label: "Palmira",
            value: "76520",
            sID: "EuXDNBt3UD",
          },
          {
            label: "Pradera",
            value: "76563",
            sID: "rM0MjBqvml",
          },
          {
            label: "Restrepo",
            value: "76606",
            sID: "1bbDXEtqnB",
          },
          {
            label: "Riofrío",
            value: "76616",
            sID: "Yi4sgFnJRX",
          },
          {
            label: "Roldanillo",
            value: "76622",
            sID: "2MXp8ZJlr4",
          },
          {
            label: "San Pedro",
            value: "76670",
            sID: "f7dn80Y9aO",
          },
          {
            label: "Sevilla",
            value: "76736",
            sID: "nEE5xeDw46",
          },
          {
            label: "Toro",
            value: "76823",
            sID: "tH6TmIvTbw",
          },
          {
            label: "Trujillo",
            value: "76828",
            sID: "BJ5tjrKoMM",
          },
          {
            label: "Tuluá",
            value: "76834",
            sID: "lXHJj4TcyV",
          },
          {
            label: "Ulloa",
            value: "76845",
            sID: "F5fyxCUFBS",
          },
          {
            label: "Versalles",
            value: "76863",
            sID: "NI6CeBPn3T",
          },
          {
            label: "Vijes",
            value: "76869",
            sID: "7HYrRPupps",
          },
          {
            label: "Yotoco",
            value: "76890",
            sID: "0cXpcVOmt8",
          },
          {
            label: "Yumbo",
            value: "76892",
            sID: "ebWJM4LgNG",
          },
          {
            label: "Zarzal",
            value: "76895",
            sID: "X9HlxVvzwJ",
          },
        ],
        sID: "WSgLtF6INJ",
      },
      {
        label: "Arauca",
        value: "81",
        cities: [
          {
            label: "Arauca",
            value: "81001",
            sID: "FIjrfVRH84",
          },
          {
            label: "Arauquita",
            value: "81065",
            sID: "ViW4f2fTJa",
          },
          {
            label: "Cravo Norte",
            value: "81220",
            sID: "WTpoT3EZsL",
          },
          {
            label: "Fortul",
            value: "81300",
            sID: "hsvijPPQGM",
          },
          {
            label: "Puerto Rondón",
            value: "81591",
            sID: "F3fh2aaqcz",
          },
          {
            label: "Saravena",
            value: "81736",
            sID: "Qc9Dxp95GY",
          },
          {
            label: "Tame",
            value: "81794",
            sID: "EYsIsUbEKp",
          },
        ],
        sID: "jJPjHzmxtZ",
      },
      {
        label: "Casanare",
        value: "85",
        cities: [
          {
            label: "Yopal",
            value: "85001",
            sID: "Mkt4vqs9LS",
          },
          {
            label: "Aguazul",
            value: "85010",
            sID: "8l4JlKccTx",
          },
          {
            label: "Chámeza",
            value: "85015",
            sID: "m8E9TEGDTk",
          },
          {
            label: "Hato Corozal",
            value: "85125",
            sID: "42aA4ZSetG",
          },
          {
            label: "La Salina",
            value: "85136",
            sID: "cwzZLpXa0m",
          },
          {
            label: "Maní",
            value: "85139",
            sID: "ZUPcZ8Ds5X",
          },
          {
            label: "Monterrey",
            value: "85162",
            sID: "PLr5nM4f7S",
          },
          {
            label: "Nunchía",
            value: "85225",
            sID: "fmHCd9mz9j",
          },
          {
            label: "Orocué",
            value: "85230",
            sID: "SKc5a65fd8",
          },
          {
            label: "Paz De Ariporo",
            value: "85250",
            sID: "D3FCKL4xbA",
          },
          {
            label: "Pore",
            value: "85263",
            sID: "J9uU0qJYRT",
          },
          {
            label: "Recetor",
            value: "85279",
            sID: "vq24hOAr6B",
          },
          {
            label: "Sabanalarga",
            value: "85300",
            sID: "huSGchurB7",
          },
          {
            label: "Sácama",
            value: "85315",
            sID: "YaHLSOxVDD",
          },
          {
            label: "San Luis De Palenque",
            value: "85325",
            sID: "1apKzBXkZn",
          },
          {
            label: "Támara",
            value: "85400",
            sID: "vx5s7H4Z5C",
          },
          {
            label: "Tauramena",
            value: "85410",
            sID: "SoPPR9E1EN",
          },
          {
            label: "Trinidad",
            value: "85430",
            sID: "HnCt3rXxlf",
          },
          {
            label: "Villanueva",
            value: "85440",
            sID: "xIGd6cQeb3",
          },
        ],
        sID: "qlucqG1wKl",
      },
      {
        label: "Putumayo",
        value: "86",
        cities: [
          {
            label: "Mocoa",
            value: "86001",
            sID: "FWUxOqseqK",
          },
          {
            label: "Colón",
            value: "86219",
            sID: "0K26z2NXHH",
          },
          {
            label: "Orito",
            value: "86320",
            sID: "yFXIqxzsOa",
          },
          {
            label: "Puerto Asís",
            value: "86568",
            sID: "IIVX6thmjj",
          },
          {
            label: "Puerto Caicedo",
            value: "86569",
            sID: "y0nYBFlRVy",
          },
          {
            label: "Puerto Guzmán",
            value: "86571",
            sID: "BWK8M5zPit",
          },
          {
            label: "Puerto Leguízamo",
            value: "86573",
            sID: "VMqDA6lds5",
          },
          {
            label: "Sibundoy",
            value: "86749",
            sID: "D8bBDlCTTS",
          },
          {
            label: "San Francisco",
            value: "86755",
            sID: "tlqsIXI0iW",
          },
          {
            label: "San Miguel",
            value: "86757",
            sID: "5tLNnDloHp",
          },
          {
            label: "Santiago",
            value: "86760",
            sID: "aiMP1VdZfa",
          },
          {
            label: "Valle Del Guamuez",
            value: "86865",
            sID: "ZYKCCSd9qy",
          },
          {
            label: "Villagarzón",
            value: "86885",
            sID: "KlxGdSNzwG",
          },
        ],
        sID: "wJrSXPyIMf",
      },
      {
        label: "Archipiélago De San Andrés, Providencia Y Santa Catalina",
        value: "88",
        cities: [
          {
            label: "San Andrés",
            value: "88001",
            sID: "Rzkn7nBBOj",
          },
          {
            label: "Providencia",
            value: "88564",
            sID: "henlvo1OrK",
          },
        ],
        sID: "CdF9Mzol5C",
      },
      {
        label: "Amazonas",
        value: "91",
        cities: [
          {
            label: "Leticia",
            value: "91001",
            sID: "xBNJlXKX33",
          },
          {
            label: "El Encanto",
            value: "91263",
            sID: "JlAQHShexU",
          },
          {
            label: "La Chorrera",
            value: "91405",
            sID: "GS8S2rgjU9",
          },
          {
            label: "La Pedrera",
            value: "91407",
            sID: "VjtKLnp1ZV",
          },
          {
            label: "La Victoria",
            value: "91430",
            sID: "hA8GeXUK5u",
          },
          {
            label: "Mirití - Paraná",
            value: "91460",
            sID: "QMtnQAsua3",
          },
          {
            label: "Puerto Alegría",
            value: "91530",
            sID: "mtnJQbFmxS",
          },
          {
            label: "Puerto Arica",
            value: "91536",
            sID: "mwbDh0z9cr",
          },
          {
            label: "Puerto Nariño",
            value: "91540",
            sID: "923G4nheJB",
          },
          {
            label: "Puerto Santander",
            value: "91669",
            sID: "FMZxGVz2nE",
          },
          {
            label: "Tarapacá",
            value: "91798",
            sID: "VpQxSUGp8u",
          },
        ],
        sID: "BpgCPNFJai",
      },
      {
        label: "Guainía",
        value: "94",
        cities: [
          {
            label: "Inírida",
            value: "94001",
            sID: "XIPeBUFrYJ",
          },
          {
            label: "Barrancominas",
            value: "94343",
            sID: "WLqw2gAnMr",
          },
          {
            label: "San Felipe",
            value: "94883",
            sID: "pJknlcY65L",
          },
          {
            label: "Puerto Colombia",
            value: "94884",
            sID: "0XEdCdUypV",
          },
          {
            label: "La Guadalupe",
            value: "94885",
            sID: "6daEbRTQZW",
          },
          {
            label: "Cacahual",
            value: "94886",
            sID: "TBbTbEfUuR",
          },
          {
            label: "Pana Pana",
            value: "94887",
            sID: "IdENiYIXRN",
          },
          {
            label: "Morichal",
            value: "94888",
            sID: "acOFKuvsLD",
          },
        ],
        sID: "O6jqM3JuJo",
      },
      {
        label: "Guaviare",
        value: "95",
        cities: [
          {
            label: "San José Del Guaviare",
            value: "95001",
            sID: "7ZxR79uWMD",
          },
          {
            label: "Calamar",
            value: "95015",
            sID: "nwWXWDFa6w",
          },
          {
            label: "El Retorno",
            value: "95025",
            sID: "qz56sNG3ru",
          },
          {
            label: "Miraflores",
            value: "95200",
            sID: "52RW8Ag1oH",
          },
        ],
        sID: "b2ndfFLl7j",
      },
      {
        label: "Vaupés",
        value: "97",
        cities: [
          {
            label: "Mitú",
            value: "97001",
            sID: "eBrY8BsGKJ",
          },
          {
            label: "Carurú",
            value: "97161",
            sID: "feEeomA6Iv",
          },
          {
            label: "Pacoa",
            value: "97511",
            sID: "fQ4jXkIujj",
          },
          {
            label: "Taraira",
            value: "97666",
            sID: "XOXkbQHqhZ",
          },
          {
            label: "Papunahua",
            value: "97777",
            sID: "oRCBpiVJCx",
          },
          {
            label: "Yavaraté",
            value: "97889",
            sID: "gjAXU9WAbr",
          },
        ],
        sID: "OfLpkJcPpg",
      },
      {
        label: "Vichada",
        value: "99",
        cities: [
          {
            label: "Puerto Carreño",
            value: "99001",
            sID: "o0PFn4cyKp",
          },
          {
            label: "La Primavera",
            value: "99524",
            sID: "ZqTesvcr2f",
          },
          {
            label: "Santa Rosalía",
            value: "99624",
            sID: "HP3sWh1n22",
          },
          {
            label: "Cumaribo",
            value: "99773",
            sID: "tg6p3zUpUE",
          },
        ],
        sID: "mnE8X5gBFc",
      },
    ],
    sID: "RqwIbVusuX",
  },
  {
    label: "Argentina",
    value: "AR",
    id: "66d61975a546e02c6ce659eb",
    // INDEC (Instituto Nacional de Estadística y Censos)
    // Sistema: Código de unidades geoestadísticas
    // Niveles: Provincias → Departamentos/Partidos
    // Código: 5 dígitos (2 provincia + 3 departamento)
    statisticalInstitute: "INDEC",
    codingSystem: "Unidades Geoestadísticas",
    adminLevels: ["Provincia", "Departamento/Partido"],
    states: [
      {
        label: "Ciudad Autónoma de Buenos Aires",
        value: "CABA",
        cities: [
          {
            label: "Ciudad Autónoma de Buenos Aires",
            value: "CABA01",
            sID: "b3MwdF5qud",
          },
        ],
        sID: "DVYf2ahfug",
      },
      {
        label: "Buenos Aires",
        value: "BA",
        cities: [
          {
            label: "La Plata",
            value: "BA001",
            sID: "xx2WMISHpd",
          },
          {
            label: "Mar del Plata",
            value: "BA002",
            sID: "pOxUuf6ZL0",
          },
          {
            label: "Bahía Blanca",
            value: "BA003",
            sID: "ZeYyeIMj3H",
          },
          {
            label: "San Isidro",
            value: "BA004",
            sID: "6o8c6BSCnw",
          },
          {
            label: "Quilmes",
            value: "BA005",
            sID: "ScY0S4qES9",
          },
          {
            label: "Avellaneda",
            value: "BA006",
            sID: "YzCNGBjb7g",
          },
          {
            label: "Lanús",
            value: "BA007",
            sID: "J1AVdcUnlU",
          },
          {
            label: "San Miguel",
            value: "BA008",
            sID: "yaUb6qNmEx",
          },
          {
            label: "Morón",
            value: "BA009",
            sID: "C8CAnMi31e",
          },
          {
            label: "Lomas de Zamora",
            value: "BA010",
            sID: "LZZWVtAqYx",
          },
          {
            label: "Tandil",
            value: "BA011",
            sID: "mxm3athLN1",
          },
          {
            label: "Olavarría",
            value: "BA012",
            sID: "MflkdaevvO",
          },
          {
            label: "Pergamino",
            value: "BA013",
            sID: "32Nh7akd6J",
          },
          {
            label: "Junín",
            value: "BA014",
            sID: "bdJb2KKr8J",
          },
          {
            label: "Azul",
            value: "BA015",
            sID: "YoBpLzvNIw",
          },
        ],
        sID: "wRlWJKwryk",
      },
      {
        label: "Catamarca",
        value: "CA",
        cities: [
          {
            label: "San Fernando del Valle de Catamarca",
            value: "CA001",
            sID: "7NP1veClA5",
          },
          {
            label: "Andalgalá",
            value: "CA002",
            sID: "VRCgvvtkOE",
          },
          {
            label: "Belén",
            value: "CA003",
            sID: "ysoX19SQbZ",
          },
          {
            label: "Tinogasta",
            value: "CA004",
            sID: "l3bwFO5TjE",
          },
        ],
        sID: "srCVID7ewT",
      },
      {
        label: "Chaco",
        value: "CH",
        cities: [
          {
            label: "Resistencia",
            value: "CH001",
            sID: "TJqOXTqHy7",
          },
          {
            label: "Presidencia Roque Sáenz Peña",
            value: "CH002",
            sID: "QF1lfEjwP0",
          },
          {
            label: "Villa Ángela",
            value: "CH003",
            sID: "KmlZgGxwaT",
          },
          {
            label: "Barranqueras",
            value: "CH004",
            sID: "8BhEXeaikd",
          },
        ],
        sID: "LvgbcoNgKu",
      },
      {
        label: "Chubut",
        value: "CT",
        cities: [
          {
            label: "Rawson",
            value: "CT001",
            sID: "W0MHkxrOT1",
          },
          {
            label: "Comodoro Rivadavia",
            value: "CT002",
            sID: "a0LPvsuLFF",
          },
          {
            label: "Puerto Madryn",
            value: "CT003",
            sID: "TNA56K4Inw",
          },
          {
            label: "Trelew",
            value: "CT004",
            sID: "NXFpdwIMFq",
          },
          {
            label: "Esquel",
            value: "CT005",
            sID: "tTy1zTEIiU",
          },
        ],
        sID: "nmOExMQbu9",
      },
      {
        label: "Córdoba",
        value: "CB",
        cities: [
          {
            label: "Córdoba",
            value: "CB001",
            sID: "ZPpgwA9973",
          },
          {
            label: "Río Cuarto",
            value: "CB002",
            sID: "yxNFIKEY4l",
          },
          {
            label: "Villa María",
            value: "CB003",
            sID: "NvRnL4ZOwy",
          },
          {
            label: "Villa Carlos Paz",
            value: "CB004",
            sID: "ejOjbJ6rRn",
          },
          {
            label: "San Francisco",
            value: "CB005",
            sID: "l9k3z8kqcw",
          },
          {
            label: "Alta Gracia",
            value: "CB006",
            sID: "gQWw4pTkm0",
          },
          {
            label: "Río Tercero",
            value: "CB007",
            sID: "kMPIXiq1OB",
          },
          {
            label: "Bell Ville",
            value: "CB008",
            sID: "DXHcbKSAXm",
          },
          {
            label: "Jesús María",
            value: "CB009",
            sID: "piGmefAmZ3",
          },
        ],
        sID: "hHrqi7LttU",
      },
      {
        label: "Corrientes",
        value: "CR",
        cities: [
          {
            label: "Corrientes",
            value: "CR001",
            sID: "4dvYU7xVmg",
          },
          {
            label: "Goya",
            value: "CR002",
            sID: "4469H17URw",
          },
          {
            label: "Paso de los Libres",
            value: "CR003",
            sID: "oVxlHrGGPB",
          },
          {
            label: "Curuzú Cuatiá",
            value: "CR004",
            sID: "3a2riwbfyS",
          },
          {
            label: "Mercedes",
            value: "CR005",
            sID: "5SFjHk5oQp",
          },
        ],
        sID: "Qc6dIhBty0",
      },
      {
        label: "Entre Ríos",
        value: "ER",
        cities: [
          {
            label: "Paraná",
            value: "ER001",
            sID: "6tXN29mNBY",
          },
          {
            label: "Concordia",
            value: "ER002",
            sID: "qmbVYIxrGC",
          },
          {
            label: "Gualeguaychú",
            value: "ER003",
            sID: "bfMEyx3Bkb",
          },
          {
            label: "Concepción del Uruguay",
            value: "ER004",
            sID: "0445yqNst8",
          },
          {
            label: "Gualeguay",
            value: "ER005",
            sID: "y1rq0lBgwc",
          },
        ],
        sID: "YSkfdAex3Y",
      },
      {
        label: "Formosa",
        value: "FO",
        cities: [
          {
            label: "Formosa",
            value: "FO001",
            sID: "90dbx9FHXS",
          },
          {
            label: "Clorinda",
            value: "FO002",
            sID: "MKefopnMks",
          },
          {
            label: "Pirané",
            value: "FO003",
            sID: "h0jSUjDaCA",
          },
          {
            label: "El Colorado",
            value: "FO004",
            sID: "Wbpt2BRx6A",
          },
        ],
        sID: "Zy55lO5b9u",
      },
      {
        label: "Jujuy",
        value: "JY",
        cities: [
          {
            label: "San Salvador de Jujuy",
            value: "JY001",
            sID: "7rIxbw35iF",
          },
          {
            label: "San Pedro de Jujuy",
            value: "JY002",
            sID: "orhJuiq8u0",
          },
          {
            label: "Libertador General San Martín",
            value: "JY003",
            sID: "DEqI1eRfKl",
          },
          {
            label: "Palpalá",
            value: "JY004",
            sID: "AZrOlGS0cj",
          },
        ],
        sID: "Madx0XTBUv",
      },
      {
        label: "La Pampa",
        value: "LP",
        cities: [
          {
            label: "Santa Rosa",
            value: "LP001",
            sID: "YITaueSk3s",
          },
          {
            label: "General Pico",
            value: "LP002",
            sID: "J7TVbsP6mr",
          },
          {
            label: "General Acha",
            value: "LP003",
            sID: "GrYdzYuFK6",
          },
        ],
        sID: "uOOfDGYJk0",
      },
      {
        label: "La Rioja",
        value: "LR",
        cities: [
          {
            label: "La Rioja",
            value: "LR001",
            sID: "0TCVXEW76e",
          },
          {
            label: "Chilecito",
            value: "LR002",
            sID: "SKtVjTQqx6",
          },
          {
            label: "Aimogasta",
            value: "LR003",
            sID: "y7iJW6JteE",
          },
        ],
        sID: "ZOqjJkkrlP",
      },
      {
        label: "Mendoza",
        value: "MZ",
        cities: [
          {
            label: "Mendoza",
            value: "MZ001",
            sID: "4BoXkid2pK",
          },
          {
            label: "San Rafael",
            value: "MZ002",
            sID: "NQzn77VZgn",
          },
          {
            label: "Godoy Cruz",
            value: "MZ003",
            sID: "3wTFt2y9PD",
          },
          {
            label: "Las Heras",
            value: "MZ004",
            sID: "5nigX8bCHc",
          },
          {
            label: "Luján de Cuyo",
            value: "MZ005",
            sID: "B7BAs1VGmp",
          },
          {
            label: "Maipú",
            value: "MZ006",
            sID: "R9qmj2B9Ds",
          },
          {
            label: "San Martín",
            value: "MZ007",
            sID: "vBwgYnR7Pm",
          },
        ],
        sID: "HVxa6xNqyF",
      },
      {
        label: "Misiones",
        value: "MI",
        cities: [
          {
            label: "Posadas",
            value: "MI001",
            sID: "CSIZ8USax9",
          },
          {
            label: "Oberá",
            value: "MI002",
            sID: "TelMixERH1",
          },
          {
            label: "Eldorado",
            value: "MI003",
            sID: "4WdXWz0dds",
          },
          {
            label: "Puerto Iguazú",
            value: "MI004",
            sID: "YazyFBXHBd",
          },
          {
            label: "Apóstoles",
            value: "MI005",
            sID: "3T7f1iQ3Y4",
          },
        ],
        sID: "Ag7Wo8WNjb",
      },
      {
        label: "Neuquén",
        value: "NQ",
        cities: [
          {
            label: "Neuquén",
            value: "NQ001",
            sID: "lZlSzl46vp",
          },
          {
            label: "San Martín de los Andes",
            value: "NQ002",
            sID: "XsBaAhdwiB",
          },
          {
            label: "Cutral Có",
            value: "NQ003",
            sID: "3iJBycWufc",
          },
          {
            label: "Zapala",
            value: "NQ004",
            sID: "gYxOPfSHZ9",
          },
          {
            label: "Plottier",
            value: "NQ005",
            sID: "N3nFjRbCI7",
          },
        ],
        sID: "peDWSHRwxT",
      },
      {
        label: "Río Negro",
        value: "RN",
        cities: [
          {
            label: "Viedma",
            value: "RN001",
            sID: "VyJotL23A7",
          },
          {
            label: "San Carlos de Bariloche",
            value: "RN002",
            sID: "LsH68xtqLz",
          },
          {
            label: "General Roca",
            value: "RN003",
            sID: "c7wRCgwTFe",
          },
          {
            label: "Cipolletti",
            value: "RN004",
            sID: "IsaVXgOmdN",
          },
          {
            label: "El Bolsón",
            value: "RN005",
            sID: "Kiz4i86bwQ",
          },
        ],
        sID: "XTVFQiuI5y",
      },
      {
        label: "Salta",
        value: "SA",
        cities: [
          {
            label: "Salta",
            value: "SA001",
            sID: "BwSPV2nG4x",
          },
          {
            label: "San Ramón de la Nueva Orán",
            value: "SA002",
            sID: "DJ44T1Ead8",
          },
          {
            label: "Tartagal",
            value: "SA003",
            sID: "evWMLeO6aJ",
          },
          {
            label: "Metán",
            value: "SA004",
            sID: "lYiDYVTxRk",
          },
          {
            label: "Cafayate",
            value: "SA005",
            sID: "cCv1bxJDNW",
          },
        ],
        sID: "li0fEox58l",
      },
      {
        label: "San Juan",
        value: "SJ",
        cities: [
          {
            label: "San Juan",
            value: "SJ001",
            sID: "xFeRtkDBEj",
          },
          {
            label: "Rawson",
            value: "SJ002",
            sID: "xiXoveus2p",
          },
          {
            label: "Chimbas",
            value: "SJ003",
            sID: "8JbEm7AWPg",
          },
          {
            label: "Caucete",
            value: "SJ004",
            sID: "lmABJL2Wo3",
          },
        ],
        sID: "DRXuq9xQBN",
      },
      {
        label: "San Luis",
        value: "SL",
        cities: [
          {
            label: "San Luis",
            value: "SL001",
            sID: "eHQ0d3PGC2",
          },
          {
            label: "Villa Mercedes",
            value: "SL002",
            sID: "YXfWfjcvHu",
          },
          {
            label: "Merlo",
            value: "SL003",
            sID: "8neo0SjBQa",
          },
        ],
        sID: "OUnTlv1T8Z",
      },
      {
        label: "Santa Cruz",
        value: "SC",
        cities: [
          {
            label: "Río Gallegos",
            value: "SC001",
            sID: "waiom2WSje",
          },
          {
            label: "Caleta Olivia",
            value: "SC002",
            sID: "pR4jxCrGcy",
          },
          {
            label: "Puerto Deseado",
            value: "SC003",
            sID: "OO5ntEzA4Z",
          },
          {
            label: "El Calafate",
            value: "SC004",
            sID: "R6hx8WA0dX",
          },
        ],
        sID: "aeeLKEGdtv",
      },
      {
        label: "Santa Fe",
        value: "SF",
        cities: [
          {
            label: "Santa Fe",
            value: "SF001",
            sID: "uhtApLuFKh",
          },
          {
            label: "Rosario",
            value: "SF002",
            sID: "6hmLmltgID",
          },
          {
            label: "Rafaela",
            value: "SF003",
            sID: "PlXtaJ74eD",
          },
          {
            label: "Venado Tuerto",
            value: "SF004",
            sID: "lrWycVVBcH",
          },
          {
            label: "Reconquista",
            value: "SF005",
            sID: "9oaVQ3MEfO",
          },
          {
            label: "Santo Tomé",
            value: "SF006",
            sID: "6fZvxubrWI",
          },
        ],
        sID: "aelhowrX9R",
      },
      {
        label: "Santiago del Estero",
        value: "SE",
        cities: [
          {
            label: "Santiago del Estero",
            value: "SE001",
            sID: "wfOlAwjWmO",
          },
          {
            label: "La Banda",
            value: "SE002",
            sID: "XdrXaC7Vvc",
          },
          {
            label: "Termas de Río Hondo",
            value: "SE003",
            sID: "QVaqeoUzzd",
          },
          {
            label: "Frías",
            value: "SE004",
            sID: "s0p7dZh8Dv",
          },
        ],
        sID: "47fZ2DM0lW",
      },
      {
        label: "Tierra del Fuego",
        value: "TF",
        cities: [
          {
            label: "Ushuaia",
            value: "TF001",
            sID: "jZUBd7PwZP",
          },
          {
            label: "Río Grande",
            value: "TF002",
            sID: "9QcigxIvKp",
          },
          {
            label: "Tolhuin",
            value: "TF003",
            sID: "jtoews4hG5",
          },
        ],
        sID: "Mm6Jcm7O9K",
      },
      {
        label: "Tucumán",
        value: "TU",
        cities: [
          {
            label: "San Miguel de Tucumán",
            value: "TU001",
            sID: "OLQtLOdn6f",
          },
          {
            label: "Yerba Buena",
            value: "TU002",
            sID: "QxUH9yInAA",
          },
          {
            label: "Tafí Viejo",
            value: "TU003",
            sID: "jm3FKdB4KE",
          },
          {
            label: "Concepción",
            value: "TU004",
            sID: "jkaq9pdehK",
          },
          {
            label: "Monteros",
            value: "TU005",
            sID: "N6wA5BB6P8",
          },
        ],
        sID: "B1OnNirmVY",
      },
    ],
    sID: "h9M7rpSkby",
  },
  {
    label: "México",
    value: "MX",
    id: "66d61985a546e02c6ce65b11",
    // INEGI (Instituto Nacional de Estadística, Geografía e Informática)
    // Sistema: Clave geoestadística
    // Niveles: Estados → Municipios → Localidades
    // Código: Variable (2 estado + 3 municipio)
    statisticalInstitute: "INEGI",
    codingSystem: "Clave Geoestadística",
    adminLevels: ["Estado", "Municipio"],
    states: [
      {
        label: "Aguascalientes",
        value: "AGS",
        cities: [
          {
            label: "Aguascalientes",
            value: "AGS001",
            sID: "kZwhgzWKx0",
          },
          {
            label: "Calvillo",
            value: "AGS002",
            sID: "XwZtnyTvhp",
          },
        ],
        sID: "hbCamU9N42",
      },
      {
        label: "Baja California",
        value: "BC",
        cities: [
          {
            label: "Mexicali",
            value: "BC001",
            sID: "m5ivLzXt7X",
          },
          {
            label: "Tijuana",
            value: "BC002",
            sID: "ez93uuEf6t",
          },
          {
            label: "Ensenada",
            value: "BC003",
            sID: "C7I7Fk9f6q",
          },
          {
            label: "Tecate",
            value: "BC004",
            sID: "mcytaOpnDe",
          },
          {
            label: "Playas de Rosarito",
            value: "BC005",
            sID: "m2DrW8MggF",
          },
        ],
        sID: "APvVqnDpsj",
      },
      {
        label: "Baja California Sur",
        value: "BCS",
        cities: [
          {
            label: "La Paz",
            value: "BCS001",
            sID: "ipflKs5MiZ",
          },
          {
            label: "Los Cabos",
            value: "BCS002",
            sID: "KNz7csCyvc",
          },
          {
            label: "Cabo San Lucas",
            value: "BCS003",
            sID: "oa44OmhFdx",
          },
          {
            label: "San José del Cabo",
            value: "BCS004",
            sID: "pKIMWzAZyF",
          },
        ],
        sID: "aIkSk2JylE",
      },
      {
        label: "Campeche",
        value: "CAM",
        cities: [
          {
            label: "Campeche",
            value: "CAM001",
            sID: "rCqURaW7Qs",
          },
          {
            label: "Ciudad del Carmen",
            value: "CAM002",
            sID: "3UXfQ9XHVf",
          },
        ],
        sID: "QBhq4MUeR1",
      },
      {
        label: "Chiapas",
        value: "CHIS",
        cities: [
          {
            label: "Tuxtla Gutiérrez",
            value: "CHIS001",
            sID: "2Mf03AQP1R",
          },
          {
            label: "Tapachula",
            value: "CHIS002",
            sID: "UHXzHc8C8B",
          },
          {
            label: "San Cristóbal de las Casas",
            value: "CHIS003",
            sID: "FbSQOzQA0j",
          },
          {
            label: "Comitán",
            value: "CHIS004",
            sID: "vJyb8wM7PF",
          },
        ],
        sID: "1YpjvcZftB",
      },
      {
        label: "Chihuahua",
        value: "CHIH",
        cities: [
          {
            label: "Chihuahua",
            value: "CHIH001",
            sID: "23VNSDYtuv",
          },
          {
            label: "Ciudad Juárez",
            value: "CHIH002",
            sID: "RK4vCOQsvB",
          },
          {
            label: "Cuauhtémoc",
            value: "CHIH003",
            sID: "9AdVndrmcR",
          },
          {
            label: "Delicias",
            value: "CHIH004",
            sID: "4CVZDA5Eub",
          },
        ],
        sID: "kaZfl1Fh06",
      },
      {
        label: "Ciudad de México",
        value: "CDMX",
        cities: [
          {
            label: "Ciudad de México",
            value: "CDMX001",
            sID: "vuXDr8Aga9",
          },
        ],
        sID: "xlim5VvYJF",
      },
      {
        label: "Coahuila",
        value: "COAH",
        cities: [
          {
            label: "Saltillo",
            value: "COAH001",
            sID: "cfcRaiM6DY",
          },
          {
            label: "Torreón",
            value: "COAH002",
            sID: "CRmC2DREDj",
          },
          {
            label: "Monclova",
            value: "COAH003",
            sID: "M1aM8enSGu",
          },
          {
            label: "Piedras Negras",
            value: "COAH004",
            sID: "pjso5t6SpP",
          },
        ],
        sID: "Q4FIVu2qLd",
      },
      {
        label: "Colima",
        value: "COL",
        cities: [
          {
            label: "Colima",
            value: "COL001",
            sID: "PlS0INk1T5",
          },
          {
            label: "Manzanillo",
            value: "COL002",
            sID: "4EBzvjHGd6",
          },
          {
            label: "Tecomán",
            value: "COL003",
            sID: "G5NM92w5qa",
          },
        ],
        sID: "nKiCc8sMQq",
      },
      {
        label: "Durango",
        value: "DGO",
        cities: [
          {
            label: "Durango",
            value: "DGO001",
            sID: "LOCj5lzf2b",
          },
          {
            label: "Gómez Palacio",
            value: "DGO002",
            sID: "Tl6gCJuHFf",
          },
          {
            label: "Lerdo",
            value: "DGO003",
            sID: "jnxGIlXG2B",
          },
        ],
        sID: "FMUnR3XtWh",
      },
      {
        label: "Estado de México",
        value: "MEX",
        cities: [
          {
            label: "Toluca",
            value: "MEX001",
            sID: "WFebtGbfgV",
          },
          {
            label: "Ecatepec",
            value: "MEX002",
            sID: "RdYYHMphKX",
          },
          {
            label: "Naucalpan",
            value: "MEX003",
            sID: "PcdAeRSCKM",
          },
          {
            label: "Nezahualcóyotl",
            value: "MEX004",
            sID: "9Fw0GhzPJD",
          },
          {
            label: "Tlalnepantla",
            value: "MEX005",
            sID: "IrFpxa9FZ0",
          },
          {
            label: "Cuautitlán Izcalli",
            value: "MEX006",
            sID: "6aBobkm1kE",
          },
        ],
        sID: "djTVhHRJMp",
      },
      {
        label: "Guanajuato",
        value: "GTO",
        cities: [
          {
            label: "Guanajuato",
            value: "GTO001",
            sID: "OgLzitO6HC",
          },
          {
            label: "León",
            value: "GTO002",
            sID: "0pnF3HQbrP",
          },
          {
            label: "Irapuato",
            value: "GTO003",
            sID: "0xJRQWZu5R",
          },
          {
            label: "Celaya",
            value: "GTO004",
            sID: "aRqXHyOzyz",
          },
          {
            label: "Salamanca",
            value: "GTO005",
            sID: "8cVub0llhH",
          },
        ],
        sID: "4TuMDwc08X",
      },
      {
        label: "Guerrero",
        value: "GRO",
        cities: [
          {
            label: "Chilpancingo",
            value: "GRO001",
            sID: "wtzDISKPBV",
          },
          {
            label: "Acapulco",
            value: "GRO002",
            sID: "9J9cI5f1ai",
          },
          {
            label: "Zihuatanejo",
            value: "GRO003",
            sID: "qDq8qcUagE",
          },
          {
            label: "Iguala",
            value: "GRO004",
            sID: "lQyH8MGX8i",
          },
        ],
        sID: "wiLuXSRFuB",
      },
      {
        label: "Hidalgo",
        value: "HGO",
        cities: [
          {
            label: "Pachuca",
            value: "HGO001",
            sID: "C8MgaI7g7S",
          },
          {
            label: "Tulancingo",
            value: "HGO002",
            sID: "nyZRPS3rm1",
          },
          {
            label: "Tula",
            value: "HGO003",
            sID: "BA6jdJzJEO",
          },
        ],
        sID: "xWhnHWKgO1",
      },
      {
        label: "Jalisco",
        value: "JAL",
        cities: [
          {
            label: "Guadalajara",
            value: "JAL001",
            sID: "m4Gkc3jRPS",
          },
          {
            label: "Zapopan",
            value: "JAL002",
            sID: "FNUfxZalXC",
          },
          {
            label: "Tlaquepaque",
            value: "JAL003",
            sID: "xlDhKOdjuj",
          },
          {
            label: "Tonalá",
            value: "JAL004",
            sID: "c3QNqoWFBH",
          },
          {
            label: "Puerto Vallarta",
            value: "JAL005",
            sID: "kM4IshyGyk",
          },
        ],
        sID: "20xIJSkLLq",
      },
      {
        label: "Michoacán",
        value: "MICH",
        cities: [
          {
            label: "Morelia",
            value: "MICH001",
            sID: "SEqfhmgAnT",
          },
          {
            label: "Uruapan",
            value: "MICH002",
            sID: "lIFbBdKt5X",
          },
          {
            label: "Zamora",
            value: "MICH003",
            sID: "vkxGw1dKyR",
          },
          {
            label: "Lázaro Cárdenas",
            value: "MICH004",
            sID: "vRBxHxDsAy",
          },
        ],
        sID: "UPJS9iI1gq",
      },
      {
        label: "Morelos",
        value: "MOR",
        cities: [
          {
            label: "Cuernavaca",
            value: "MOR001",
            sID: "zISBxls8TK",
          },
          {
            label: "Cuautla",
            value: "MOR002",
            sID: "49pLFTSiZt",
          },
          {
            label: "Jiutepec",
            value: "MOR003",
            sID: "POwxVmDm8G",
          },
        ],
        sID: "WPRN0q8m5W",
      },
      {
        label: "Nayarit",
        value: "NAY",
        cities: [
          {
            label: "Tepic",
            value: "NAY001",
            sID: "fhZX1GUOot",
          },
          {
            label: "Xalisco",
            value: "NAY002",
            sID: "Ko3bbqmxGy",
          },
        ],
        sID: "d6I4rwHLUY",
      },
      {
        label: "Nuevo León",
        value: "NL",
        cities: [
          {
            label: "Monterrey",
            value: "NL001",
            sID: "1HDb9M5fds",
          },
          {
            label: "San Nicolás de los Garza",
            value: "NL002",
            sID: "XmesRaD41d",
          },
          {
            label: "Guadalupe",
            value: "NL003",
            sID: "4iFmLIpBYN",
          },
          {
            label: "Apodaca",
            value: "NL004",
            sID: "jkD2zzniRP",
          },
          {
            label: "San Pedro Garza García",
            value: "NL005",
            sID: "RRHGQLUuYm",
          },
        ],
        sID: "ztGkKkaT4s",
      },
      {
        label: "Oaxaca",
        value: "OAX",
        cities: [
          {
            label: "Oaxaca de Juárez",
            value: "OAX001",
            sID: "OkZwdiuiWZ",
          },
          {
            label: "San Juan Bautista Tuxtepec",
            value: "OAX002",
            sID: "k4WvZxP4ir",
          },
          {
            label: "Salina Cruz",
            value: "OAX003",
            sID: "mmzC6XfOoB",
          },
        ],
        sID: "YaR4IoCDKi",
      },
      {
        label: "Puebla",
        value: "PUE",
        cities: [
          {
            label: "Puebla de Zaragoza",
            value: "PUE001",
            sID: "UinKHQoEC9",
          },
          {
            label: "Tehuacán",
            value: "PUE002",
            sID: "DXMDefKHhp",
          },
          {
            label: "San Martín Texmelucan",
            value: "PUE003",
            sID: "zckKA4uyOG",
          },
        ],
        sID: "jTvYEBgvkH",
      },
      {
        label: "Querétaro",
        value: "QRO",
        cities: [
          {
            label: "Santiago de Querétaro",
            value: "QRO001",
            sID: "FE0knR6oJR",
          },
          {
            label: "San Juan del Río",
            value: "QRO002",
            sID: "112hmYQ02D",
          },
        ],
        sID: "bwWXk6nYKC",
      },
      {
        label: "Quintana Roo",
        value: "QROO",
        cities: [
          {
            label: "Chetumal",
            value: "QROO001",
            sID: "1SH8UFL5BK",
          },
          {
            label: "Cancún",
            value: "QROO002",
            sID: "EhnORiyFeg",
          },
          {
            label: "Playa del Carmen",
            value: "QROO003",
            sID: "XijX1qggA2",
          },
          {
            label: "Cozumel",
            value: "QROO004",
            sID: "Tb0NgE2zsY",
          },
        ],
        sID: "Y4OJH2io6q",
      },
      {
        label: "San Luis Potosí",
        value: "SLP",
        cities: [
          {
            label: "San Luis Potosí",
            value: "SLP001",
            sID: "mEqatyKe3T",
          },
          {
            label: "Soledad de Graciano Sánchez",
            value: "SLP002",
            sID: "EERAVaQU5e",
          },
          {
            label: "Ciudad Valles",
            value: "SLP003",
            sID: "fWW77MBrem",
          },
        ],
        sID: "2gTkrdKyec",
      },
      {
        label: "Sinaloa",
        value: "SIN",
        cities: [
          {
            label: "Culiacán",
            value: "SIN001",
            sID: "U429KralMq",
          },
          {
            label: "Mazatlán",
            value: "SIN002",
            sID: "KFxvi9ribc",
          },
          {
            label: "Los Mochis",
            value: "SIN003",
            sID: "AKeowQY5Ri",
          },
          {
            label: "Guasave",
            value: "SIN004",
            sID: "ElxCfxKOXn",
          },
        ],
        sID: "yrRHBT8tOm",
      },
      {
        label: "Sonora",
        value: "SON",
        cities: [
          {
            label: "Hermosillo",
            value: "SON001",
            sID: "tjf5psh6vC",
          },
          {
            label: "Ciudad Obregón",
            value: "SON002",
            sID: "mDCe6K5SGt",
          },
          {
            label: "Nogales",
            value: "SON003",
            sID: "AdZ9LgvXRU",
          },
          {
            label: "San Luis Río Colorado",
            value: "SON004",
            sID: "6AxdSEojEj",
          },
        ],
        sID: "3FS0GCOxcU",
      },
      {
        label: "Tabasco",
        value: "TAB",
        cities: [
          {
            label: "Villahermosa",
            value: "TAB001",
            sID: "TE8RWFDjam",
          },
          {
            label: "Cárdenas",
            value: "TAB002",
            sID: "5D9Vl8GMWv",
          },
          {
            label: "Comalcalco",
            value: "TAB003",
            sID: "s94S8POt36",
          },
        ],
        sID: "IRIaN2Z97K",
      },
      {
        label: "Tamaulipas",
        value: "TAMPS",
        cities: [
          {
            label: "Ciudad Victoria",
            value: "TAMPS001",
            sID: "vbbK2agOvc",
          },
          {
            label: "Reynosa",
            value: "TAMPS002",
            sID: "Ttl5S4F7fh",
          },
          {
            label: "Matamoros",
            value: "TAMPS003",
            sID: "KwAjPPksze",
          },
          {
            label: "Tampico",
            value: "TAMPS004",
            sID: "DvTNGMKm0F",
          },
          {
            label: "Nuevo Laredo",
            value: "TAMPS005",
            sID: "6urE9ZkFk3",
          },
        ],
        sID: "Ijgpyffkio",
      },
      {
        label: "Tlaxcala",
        value: "TLAX",
        cities: [
          {
            label: "Tlaxcala",
            value: "TLAX001",
            sID: "ENPL8ncUGO",
          },
          {
            label: "Apizaco",
            value: "TLAX002",
            sID: "2Ysk83NjOL",
          },
        ],
        sID: "eVmgces4Zn",
      },
      {
        label: "Veracruz",
        value: "VER",
        cities: [
          {
            label: "Xalapa",
            value: "VER001",
            sID: "WcY0BKOCBe",
          },
          {
            label: "Veracruz",
            value: "VER002",
            sID: "JnxdEcyzuh",
          },
          {
            label: "Coatzacoalcos",
            value: "VER003",
            sID: "7ue54p1qPy",
          },
          {
            label: "Poza Rica",
            value: "VER004",
            sID: "lJiWYSFCvl",
          },
          {
            label: "Córdoba",
            value: "VER005",
            sID: "alFbd9Jdw5",
          },
        ],
        sID: "E0uYYEaHWY",
      },
      {
        label: "Yucatán",
        value: "YUC",
        cities: [
          {
            label: "Mérida",
            value: "YUC001",
            sID: "0p8VlzdAk6",
          },
          {
            label: "Valladolid",
            value: "YUC002",
            sID: "nIX7FGB1jR",
          },
          {
            label: "Tizimín",
            value: "YUC003",
            sID: "dVslemFMd1",
          },
        ],
        sID: "EY0S5VqYc2",
      },
      {
        label: "Zacatecas",
        value: "ZAC",
        cities: [
          {
            label: "Zacatecas",
            value: "ZAC001",
            sID: "LO05QKofE6",
          },
          {
            label: "Fresnillo",
            value: "ZAC002",
            sID: "ATlLmxkVDY",
          },
        ],
        sID: "UF1whdhFFR",
      },
    ],
    sID: "YJFnST3dVC",
  },
  {
    label: "Perú",
    value: "PE",
    id: "66d61987a546e02c6ce65b33",
    // INEI (Instituto Nacional de Estadística e Informática)
    // Sistema: UBIGEO (Ubicación Geográfica)
    // Niveles: Departamentos → Provincias → Distritos
    // Código: 6 dígitos (2+2+2)
    statisticalInstitute: "INEI",
    codingSystem: "UBIGEO",
    adminLevels: ["Departamento", "Provincia", "Distrito"],
    states: [
      {
        label: "Arequipa Estado",
        value: "Arequipa Estado",
        cities: [
          {
            label: "Arequipa Ciudad",
            value: "Arequipa Ciudad",
            districts: [],
            sID: "Fcie3cvUbg",
          },
        ],
        sID: "LpgsPndqPb",
      },
      {
        label: "Cuzco Estado",
        value: "Cuzco Estado",
        cities: [
          {
            label: "Cuzco Ciudad",
            value: "Cuzco Ciudad",
            districts: [],
            sID: "fX1cnJGMRj",
          },
        ],
        sID: "jjwwaogjHp",
      },
      {
        label: "Ica Estado",
        value: "ICA Estado",
        cities: [
          {
            label: "Ica Ciudad",
            value: "Ica Ciudad",
            districts: [],
            sID: "o82fzeYQL9",
          },
        ],
        sID: "L3xkYHyOEt",
      },
      {
        label: "Lima Metropolitana  Estado",
        value: "Lima Estado",
        cities: [
          {
            label: "Lima Ciudad",
            value: "Lima Ciudad",
            districts: [],
            sID: "jZduIpkfRZ",
          },
        ],
        sID: "xtlocmhrRZ",
      },
      {
        label: "Loreto Estado",
        value: "Lo Estado",
        cities: [
          {
            label: "Iquitos Ciudad",
            value: "IQ Ciudad",
            districts: [],
            sID: "RufxGuMm7S",
          },
        ],
        sID: "YabHGyPZSr",
      },
    ],
    sID: "1CAr6UJIq1",
  },
  {
    label: "España",
    value: "ES",
    id: "66d6197ba546e02c6ce65a5f",
    // INE (Instituto Nacional de Estadística)
    // Sistema: Códigos INE
    // Niveles: Provincias → Municipios
    // Código: 5 dígitos para municipios (2 provincia + 3 municipio)
    // Nota: states representa provincias (no comunidades autónomas)
    statisticalInstitute: "INE",
    codingSystem: "Códigos INE",
    adminLevels: ["Provincia", "Municipio"],
    states: [
      {
        label: "Almería",
        value: "04",
        comunidadAutonoma: {
          nombre: "Andalucía",
          codigo: "01",
          sID: "7wV2J0odDm",
        },
        cities: [
          {
            label: "Almería",
            value: "04013",
            sID: "SnogceT5Oz",
          },
          {
            label: "Roquetas de Mar",
            value: "04079",
            sID: "dZzvDqQdyZ",
          },
          {
            label: "El Ejido",
            value: "04902",
            sID: "my3A8GvSKn",
          },
          {
            label: "Níjar",
            value: "04066",
            sID: "mrluJB4N6J",
          },
          {
            label: "Vícar",
            value: "04102",
            sID: "2CzV0cRodR",
          },
          {
            label: "Adra",
            value: "04003",
            sID: "uDwjFwIxZr",
          },
          {
            label: "Vera",
            value: "04100",
            sID: "E9oo3TmxQA",
          },
          {
            label: "Huércal de Almería",
            value: "04043",
            sID: "SNdYj69BUp",
          },
        ],
        sID: "kYSO2A5Mob",
      },
      {
        label: "Cádiz",
        value: "11",
        comunidadAutonoma: {
          nombre: "Andalucía",
          codigo: "01",
          sID: "7wV2J0odDm",
        },
        cities: [
          {
            label: "Cádiz",
            value: "11012",
            sID: "2SjSGFVllS",
          },
          {
            label: "Jerez de la Frontera",
            value: "11020",
            sID: "vEmOujmfvq",
          },
          {
            label: "Algeciras",
            value: "11004",
            sID: "CFcOX8OlmM",
          },
          {
            label: "San Fernando",
            value: "11031",
            sID: "WMT98WUik7",
          },
          {
            label: "El Puerto de Santa María",
            value: "11027",
            sID: "dtnQKYmja4",
          },
          {
            label: "Chiclana de la Frontera",
            value: "11015",
            sID: "bvGh8vmytp",
          },
          {
            label: "La Línea de la Concepción",
            value: "11022",
            sID: "jyoQYWBEa7",
          },
          {
            label: "Sanlúcar de Barrameda",
            value: "11032",
            sID: "N4UAA7nIad",
          },
          {
            label: "Arcos de la Frontera",
            value: "11006",
            sID: "g0T0afUo2S",
          },
          {
            label: "Puerto Real",
            value: "11028",
            sID: "Jdp2Vo4kN3",
          },
        ],
        sID: "O2ZX6vzHDI",
      },
      {
        label: "Córdoba",
        value: "14",
        comunidadAutonoma: {
          nombre: "Andalucía",
          codigo: "01",
          sID: "7wV2J0odDm",
        },
        cities: [
          {
            label: "Córdoba",
            value: "14021",
            sID: "93zMKm6aGR",
          },
          {
            label: "Lucena",
            value: "14038",
            sID: "UgZ56v06vq",
          },
          {
            label: "Puente Genil",
            value: "14054",
            sID: "T10KYHxY27",
          },
          {
            label: "Montilla",
            value: "14044",
            sID: "6aFuPgCPWm",
          },
          {
            label: "Priego de Córdoba",
            value: "14053",
            sID: "MX7mwHba4u",
          },
          {
            label: "Cabra",
            value: "14013",
            sID: "o32Op5FTWi",
          },
          {
            label: "Baena",
            value: "14005",
            sID: "VYEJKMEnul",
          },
          {
            label: "Palma del Río",
            value: "14050",
            sID: "XNrHBq98wL",
          },
        ],
        sID: "3hT24snKj0",
      },
      {
        label: "Granada",
        value: "18",
        comunidadAutonoma: {
          nombre: "Andalucía",
          codigo: "01",
          sID: "7wV2J0odDm",
        },
        cities: [
          {
            label: "Granada",
            value: "18087",
            sID: "dgQfnUfIeL",
          },
          {
            label: "Motril",
            value: "18140",
            sID: "pgsj5jw5AV",
          },
          {
            label: "Almuñécar",
            value: "18014",
            sID: "qMkwfpqsat",
          },
          {
            label: "Loja",
            value: "18122",
            sID: "Z7YuiJxoI3",
          },
          {
            label: "Baza",
            value: "18022",
            sID: "5MnRETzMdF",
          },
          {
            label: "Guadix",
            value: "18089",
            sID: "JH7GJD8Gpc",
          },
          {
            label: "Armilla",
            value: "18018",
            sID: "S4Kq7FqjUa",
          },
          {
            label: "Maracena",
            value: "18127",
            sID: "66Qzjmhopa",
          },
        ],
        sID: "5ECZBkwfiD",
      },
      {
        label: "Huelva",
        value: "21",
        comunidadAutonoma: {
          nombre: "Andalucía",
          codigo: "01",
          sID: "7wV2J0odDm",
        },
        cities: [
          {
            label: "Huelva",
            value: "21041",
            sID: "ndLgIGJajH",
          },
          {
            label: "Lepe",
            value: "21044",
            sID: "DmVe41n1Fg",
          },
          {
            label: "Almonte",
            value: "21004",
            sID: "E2lupnsPAD",
          },
          {
            label: "Moguer",
            value: "21051",
            sID: "oPKEsOPvQ9",
          },
          {
            label: "Isla Cristina",
            value: "21042",
            sID: "pxyJJWMJYQ",
          },
          {
            label: "Ayamonte",
            value: "21007",
            sID: "Aqj82OybVK",
          },
          {
            label: "Cartaya",
            value: "21019",
            sID: "ZUgGlEzVKl",
          },
        ],
        sID: "98pIhP5LUK",
      },
      {
        label: "Jaén",
        value: "23",
        comunidadAutonoma: {
          nombre: "Andalucía",
          codigo: "01",
          sID: "7wV2J0odDm",
        },
        cities: [
          {
            label: "Jaén",
            value: "23050",
            sID: "6lOmfDixZI",
          },
          {
            label: "Linares",
            value: "23055",
            sID: "tK4R6e1mxo",
          },
          {
            label: "Andújar",
            value: "23003",
            sID: "YvmQmgHCyu",
          },
          {
            label: "Úbeda",
            value: "23092",
            sID: "yDDmoGf0DR",
          },
          {
            label: "Martos",
            value: "23060",
            sID: "09hJ93NU98",
          },
          {
            label: "Alcalá la Real",
            value: "23002",
            sID: "PAGRP2fqkZ",
          },
          {
            label: "Villacarrillo",
            value: "23095",
            sID: "y5Wfi6Nsbu",
          },
          {
            label: "Baeza",
            value: "23009",
            sID: "BsKMSfGpnz",
          },
        ],
        sID: "bEhmJFdgY5",
      },
      {
        label: "Málaga",
        value: "29",
        comunidadAutonoma: {
          nombre: "Andalucía",
          codigo: "01",
          sID: "7wV2J0odDm",
        },
        cities: [
          {
            label: "Málaga",
            value: "29067",
            sID: "avXfiAqOWS",
          },
          {
            label: "Marbella",
            value: "29069",
            sID: "XerpvT1NOb",
          },
          {
            label: "Mijas",
            value: "29070",
            sID: "96veGTJZRt",
          },
          {
            label: "Vélez-Málaga",
            value: "29094",
            sID: "D3uhhqGwCN",
          },
          {
            label: "Fuengirola",
            value: "29054",
            sID: "ceeSs7y9WU",
          },
          {
            label: "Torremolinos",
            value: "29088",
            sID: "3Wvc2n5Z0M",
          },
          {
            label: "Estepona",
            value: "29051",
            sID: "QzR6CqGlej",
          },
          {
            label: "Benalmádena",
            value: "29019",
            sID: "GC1dpGRrux",
          },
          {
            label: "Rincón de la Victoria",
            value: "29075",
            sID: "UfcJuLejcK",
          },
          {
            label: "Antequera",
            value: "29015",
            sID: "j3VXY0mqrm",
          },
          {
            label: "Ronda",
            value: "29084",
            sID: "OQQDjKRD0y",
          },
        ],
        sID: "8YmwBMH8zq",
      },
      {
        label: "Sevilla",
        value: "41",
        comunidadAutonoma: {
          nombre: "Andalucía",
          codigo: "01",
          sID: "7wV2J0odDm",
        },
        cities: [
          {
            label: "Sevilla",
            value: "41091",
            sID: "tEMwaL3iDP",
          },
          {
            label: "Dos Hermanas",
            value: "41038",
            sID: "5tJqJANRep",
          },
          {
            label: "Alcalá de Guadaíra",
            value: "41004",
            sID: "cxjlONYuyw",
          },
          {
            label: "Utrera",
            value: "41095",
            sID: "mYTuQAE2VC",
          },
          {
            label: "Mairena del Aljarafe",
            value: "41056",
            sID: "PFQPpy9NHA",
          },
          {
            label: "La Rinconada",
            value: "41079",
            sID: "japtYb09px",
          },
          {
            label: "Écija",
            value: "41039",
            sID: "LAYq2x9LAi",
          },
          {
            label: "Los Palacios y Villafranca",
            value: "41075",
            sID: "xTDjOmY6YF",
          },
          {
            label: "Camas",
            value: "41020",
            sID: "XMxfL38nQu",
          },
          {
            label: "Carmona",
            value: "41024",
            sID: "gdmzdjTSDE",
          },
        ],
        sID: "jDBSlE4wgf",
      },
      {
        label: "Huesca",
        value: "22",
        comunidadAutonoma: {
          nombre: "Aragón",
          codigo: "02",
          sID: "icJx30gOqI",
        },
        cities: [
          {
            label: "Huesca",
            value: "22125",
            sID: "lqazJ1suKR",
          },
          {
            label: "Monzón",
            value: "22139",
            sID: "yUq8ZWEoSb",
          },
          {
            label: "Barbastro",
            value: "22044",
            sID: "l0pM3uXazb",
          },
          {
            label: "Jaca",
            value: "22130",
            sID: "IKcm17r0JB",
          },
          {
            label: "Fraga",
            value: "22113",
            sID: "i9xhYFfiTh",
          },
          {
            label: "Sabiñánigo",
            value: "22208",
            sID: "j16UI9ie55",
          },
        ],
        sID: "chRlxTulAZ",
      },
      {
        label: "Teruel",
        value: "44",
        comunidadAutonoma: {
          nombre: "Aragón",
          codigo: "02",
          sID: "icJx30gOqI",
        },
        cities: [
          {
            label: "Teruel",
            value: "44216",
            sID: "hrGk1kDzi6",
          },
          {
            label: "Alcañiz",
            value: "44015",
            sID: "G2qI2vS1Bx",
          },
          {
            label: "Andorra",
            value: "44024",
            sID: "2EfVCfrbNa",
          },
          {
            label: "Calamocha",
            value: "44054",
            sID: "wGp0nWSqtp",
          },
        ],
        sID: "cD9OXb7oa8",
      },
      {
        label: "Zaragoza",
        value: "50",
        comunidadAutonoma: {
          nombre: "Aragón",
          codigo: "02",
          sID: "icJx30gOqI",
        },
        cities: [
          {
            label: "Zaragoza",
            value: "50297",
            sID: "BhW5ffYZU4",
          },
          {
            label: "Calatayud",
            value: "50059",
            sID: "Iuzm8DKAPG",
          },
          {
            label: "Utebo",
            value: "50281",
            sID: "zKBkTcpmtU",
          },
          {
            label: "Ejea de los Caballeros",
            value: "50096",
            sID: "nQTl43JC2H",
          },
          {
            label: "Cuarte de Huerva",
            value: "50090",
            sID: "2VjzdA4vG8",
          },
          {
            label: "Tarazona",
            value: "50250",
            sID: "lVl1nNPDkV",
          },
          {
            label: "Caspe",
            value: "50083",
            sID: "8LBJ1c68Ud",
          },
        ],
        sID: "MBEyJgLFhx",
      },
      {
        label: "Asturias",
        value: "33",
        comunidadAutonoma: {
          nombre: "Asturias, Principado de",
          codigo: "03",
          sID: "rC1lC4XX46",
        },
        cities: [
          {
            label: "Oviedo",
            value: "33044",
            sID: "9O3eZYfCgu",
          },
          {
            label: "Gijón",
            value: "33024",
            sID: "3Tov2bCGU6",
          },
          {
            label: "Avilés",
            value: "33004",
            sID: "Ky4K4u9c6M",
          },
          {
            label: "Siero",
            value: "33066",
            sID: "pvfzJYfjdK",
          },
          {
            label: "Langreo",
            value: "33031",
            sID: "EFcGFHMEtw",
          },
          {
            label: "Mieres",
            value: "33037",
            sID: "SZm4vRiBEY",
          },
          {
            label: "Castrillón",
            value: "33012",
            sID: "NwId6gcpy4",
          },
          {
            label: "Llanera",
            value: "33033",
            sID: "O9dKS9DYsv",
          },
        ],
        sID: "e3MSFtFZ7t",
      },
      {
        label: "Balears, Illes",
        value: "07",
        comunidadAutonoma: {
          nombre: "Balears, Illes",
          codigo: "04",
          sID: "nTzqWxgwss",
        },
        cities: [
          {
            label: "Palma",
            value: "07040",
            sID: "oifI6V10Ly",
          },
          {
            label: "Calvià",
            value: "07011",
            sID: "7HGzFt2zIm",
          },
          {
            label: "Manacor",
            value: "07031",
            sID: "XteWIs9Pbw",
          },
          {
            label: "Eivissa",
            value: "07026",
            sID: "If57jyTmsd",
          },
          {
            label: "Inca",
            value: "07027",
            sID: "2Gwykv3xoV",
          },
          {
            label: "Llucmajor",
            value: "07030",
            sID: "GMvHByONgS",
          },
          {
            label: "Marratxí",
            value: "07032",
            sID: "W2BX7JzhCb",
          },
          {
            label: "Sant Antoni de Portmany",
            value: "07046",
            sID: "vxiHCvycWb",
          },
        ],
        sID: "XtSAZCyMgr",
      },
      {
        label: "Las Palmas",
        value: "35",
        comunidadAutonoma: {
          nombre: "Canarias",
          codigo: "05",
          sID: "r1XBwTpf7H",
        },
        cities: [
          {
            label: "Las Palmas de Gran Canaria",
            value: "35016",
            sID: "kUbfxIYK1u",
          },
          {
            label: "Telde",
            value: "35025",
            sID: "giRqOiGw3C",
          },
          {
            label: "Arucas",
            value: "35004",
            sID: "qnI3stmPX5",
          },
          {
            label: "Santa Lucía de Tirajana",
            value: "35023",
            sID: "QpdXlQDVpk",
          },
          {
            label: "San Bartolomé de Tirajana",
            value: "35019",
            sID: "lm4H5zhAqp",
          },
          {
            label: "Agüimes",
            value: "35002",
            sID: "dVYVT7Fcva",
          },
          {
            label: "Ingenio",
            value: "35011",
            sID: "MYBmncQHm0",
          },
        ],
        sID: "ciA2DFZ2Gv",
      },
      {
        label: "Santa Cruz de Tenerife",
        value: "38",
        comunidadAutonoma: {
          nombre: "Canarias",
          codigo: "05",
          sID: "r1XBwTpf7H",
        },
        cities: [
          {
            label: "Santa Cruz de Tenerife",
            value: "38038",
            sID: "ZO9bd6eUAG",
          },
          {
            label: "San Cristóbal de La Laguna",
            value: "38023",
            sID: "H3kOjzI6vW",
          },
          {
            label: "Arona",
            value: "38006",
            sID: "UauElKOcq2",
          },
          {
            label: "Adeje",
            value: "38001",
            sID: "WvAyZXboNF",
          },
          {
            label: "Granadilla de Abona",
            value: "38017",
            sID: "EpMiBSebuN",
          },
          {
            label: "Puerto de la Cruz",
            value: "38028",
            sID: "EycbYFvDOR",
          },
          {
            label: "Los Realejos",
            value: "38031",
            sID: "QBFbdmnHkN",
          },
          {
            label: "San Miguel de Abona",
            value: "38025",
            sID: "nOFmts953U",
          },
        ],
        sID: "QxyxOdROVb",
      },
      {
        label: "Cantabria",
        value: "39",
        comunidadAutonoma: {
          nombre: "Cantabria",
          codigo: "06",
          sID: "V2PSJVSLZ7",
        },
        cities: [
          {
            label: "Santander",
            value: "39075",
            sID: "TE3f7QJBDE",
          },
          {
            label: "Torrelavega",
            value: "39087",
            sID: "nMDOnTUDfi",
          },
          {
            label: "Camargo",
            value: "39020",
            sID: "v5liDFIpHQ",
          },
          {
            label: "Piélagos",
            value: "39055",
            sID: "HZvcVjJBlw",
          },
          {
            label: "El Astillero",
            value: "39010",
            sID: "q4LtwD3udT",
          },
          {
            label: "Castro-Urdiales",
            value: "39023",
            sID: "dQiP0i501U",
          },
          {
            label: "Laredo",
            value: "39035",
            sID: "B73VpWuFc2",
          },
        ],
        sID: "2IaeL9zbas",
      },
      {
        label: "Albacete",
        value: "02",
        comunidadAutonoma: {
          nombre: "Castilla-La Mancha",
          codigo: "08",
          sID: "dV3vtAkpWx",
        },
        cities: [
          {
            label: "Albacete",
            value: "02003",
            sID: "GDHFpcGlGP",
          },
          {
            label: "Hellín",
            value: "02038",
            sID: "pcj2BwMf16",
          },
          {
            label: "Villarrobledo",
            value: "02086",
            sID: "FQpvooAXG6",
          },
          {
            label: "Almansa",
            value: "02005",
            sID: "tePjFwi6C9",
          },
          {
            label: "La Roda",
            value: "02065",
            sID: "xgciYUBVOu",
          },
        ],
        sID: "zLc2Gd8vAq",
      },
      {
        label: "Ciudad Real",
        value: "13",
        comunidadAutonoma: {
          nombre: "Castilla-La Mancha",
          codigo: "08",
          sID: "dV3vtAkpWx",
        },
        cities: [
          {
            label: "Ciudad Real",
            value: "13034",
            sID: "9dOlx5Tj5M",
          },
          {
            label: "Puertollano",
            value: "13068",
            sID: "FzNMigyuC5",
          },
          {
            label: "Tomelloso",
            value: "13078",
            sID: "MmxJwSfmMf",
          },
          {
            label: "Alcázar de San Juan",
            value: "13007",
            sID: "ALqZb00IhQ",
          },
          {
            label: "Valdepeñas",
            value: "13086",
            sID: "wWpDb6iWXP",
          },
        ],
        sID: "mCzMsZnqxw",
      },
      {
        label: "Cuenca",
        value: "16",
        comunidadAutonoma: {
          nombre: "Castilla-La Mancha",
          codigo: "08",
          sID: "dV3vtAkpWx",
        },
        cities: [
          {
            label: "Cuenca",
            value: "16078",
            sID: "Tgc1FjWmm6",
          },
          {
            label: "Tarancón",
            value: "16200",
            sID: "AGGo1ak3Il",
          },
          {
            label: "Quintanar del Rey",
            value: "16178",
            sID: "Sos8GKX7bn",
          },
        ],
        sID: "LLEjxOKLnX",
      },
      {
        label: "Guadalajara",
        value: "19",
        comunidadAutonoma: {
          nombre: "Castilla-La Mancha",
          codigo: "08",
          sID: "dV3vtAkpWx",
        },
        cities: [
          {
            label: "Guadalajara",
            value: "19130",
            sID: "zAlSLKfhd4",
          },
          {
            label: "Azuqueca de Henares",
            value: "19055",
            sID: "z8DLKyD2l2",
          },
          {
            label: "Alovera",
            value: "19024",
            sID: "cRlwOSh5i6",
          },
          {
            label: "Cabanillas del Campo",
            value: "19068",
            sID: "COBXGKZu38",
          },
        ],
        sID: "7mKe6PCM8K",
      },
      {
        label: "Toledo",
        value: "45",
        comunidadAutonoma: {
          nombre: "Castilla-La Mancha",
          codigo: "08",
          sID: "dV3vtAkpWx",
        },
        cities: [
          {
            label: "Toledo",
            value: "45168",
            sID: "APQfr77xd8",
          },
          {
            label: "Talavera de la Reina",
            value: "45165",
            sID: "dX5eygQdaM",
          },
          {
            label: "Seseña",
            value: "45161",
            sID: "pixRcpuqgu",
          },
          {
            label: "Illescas",
            value: "45091",
            sID: "VnhLIURzcS",
          },
          {
            label: "Torrijos",
            value: "45180",
            sID: "pzIT5X2WK5",
          },
        ],
        sID: "E83SE59PYJ",
      },
      {
        label: "Ávila",
        value: "05",
        comunidadAutonoma: {
          nombre: "Castilla y León",
          codigo: "07",
          sID: "8bOpMK5gWQ",
        },
        cities: [
          {
            label: "Ávila",
            value: "05019",
            sID: "N8bheqNGNM",
          },
          {
            label: "Arévalo",
            value: "05013",
            sID: "kzvA8A7bhf",
          },
        ],
        sID: "yMLIKC71mM",
      },
      {
        label: "Burgos",
        value: "09",
        comunidadAutonoma: {
          nombre: "Castilla y León",
          codigo: "07",
          sID: "8bOpMK5gWQ",
        },
        cities: [
          {
            label: "Burgos",
            value: "09059",
            sID: "DUKDbVq14P",
          },
          {
            label: "Miranda de Ebro",
            value: "09207",
            sID: "gwf0kTvw5T",
          },
          {
            label: "Aranda de Duero",
            value: "09018",
            sID: "89PP4Bfb7I",
          },
        ],
        sID: "Ibb2dWLtid",
      },
      {
        label: "León",
        value: "24",
        comunidadAutonoma: {
          nombre: "Castilla y León",
          codigo: "07",
          sID: "8bOpMK5gWQ",
        },
        cities: [
          {
            label: "León",
            value: "24089",
            sID: "QZt9Oo9Ep7",
          },
          {
            label: "Ponferrada",
            value: "24115",
            sID: "hjnXFhMHzw",
          },
          {
            label: "San Andrés del Rabanedo",
            value: "24153",
            sID: "ZcbCIQC6Vj",
          },
          {
            label: "Villaquilambre",
            value: "24214",
            sID: "AydXFUafMi",
          },
        ],
        sID: "YaoaIyZlCl",
      },
      {
        label: "Palencia",
        value: "34",
        comunidadAutonoma: {
          nombre: "Castilla y León",
          codigo: "07",
          sID: "8bOpMK5gWQ",
        },
        cities: [
          {
            label: "Palencia",
            value: "34120",
            sID: "fxnnU12VK2",
          },
          {
            label: "Aguilar de Campoo",
            value: "34003",
            sID: "NnHgEW0l3n",
          },
        ],
        sID: "M5PaARQO8d",
      },
      {
        label: "Salamanca",
        value: "37",
        comunidadAutonoma: {
          nombre: "Castilla y León",
          codigo: "07",
          sID: "8bOpMK5gWQ",
        },
        cities: [
          {
            label: "Salamanca",
            value: "37274",
            sID: "IDNvB2yQce",
          },
          {
            label: "Béjar",
            value: "37045",
            sID: "3GXiY4sdr4",
          },
          {
            label: "Ciudad Rodrigo",
            value: "37100",
            sID: "2kGxzQQBgf",
          },
        ],
        sID: "8UUqGhezTj",
      },
      {
        label: "Segovia",
        value: "40",
        comunidadAutonoma: {
          nombre: "Castilla y León",
          codigo: "07",
          sID: "8bOpMK5gWQ",
        },
        cities: [
          {
            label: "Segovia",
            value: "40194",
            sID: "Zx6xxRuZdF",
          },
          {
            label: "Cuéllar",
            value: "40069",
            sID: "OXZ6zeuCiF",
          },
        ],
        sID: "ZAdtRM1LO2",
      },
      {
        label: "Soria",
        value: "42",
        comunidadAutonoma: {
          nombre: "Castilla y León",
          codigo: "07",
          sID: "8bOpMK5gWQ",
        },
        cities: [
          {
            label: "Soria",
            value: "42173",
            sID: "KCZ5WLi25d",
          },
          {
            label: "El Burgo de Osma-Ciudad de Osma",
            value: "42046",
            sID: "HSr7m1Smqa",
          },
        ],
        sID: "AUwOFcqlxj",
      },
      {
        label: "Valladolid",
        value: "47",
        comunidadAutonoma: {
          nombre: "Castilla y León",
          codigo: "07",
          sID: "8bOpMK5gWQ",
        },
        cities: [
          {
            label: "Valladolid",
            value: "47186",
            sID: "fEiL5fiVhp",
          },
          {
            label: "Medina del Campo",
            value: "47085",
            sID: "05vMqS7aje",
          },
          {
            label: "Laguna de Duero",
            value: "47074",
            sID: "jLyqCxcSO3",
          },
          {
            label: "Arroyo de la Encomienda",
            value: "47009",
            sID: "EZ4wsJrGCM",
          },
        ],
        sID: "O62kzShSNN",
      },
      {
        label: "Zamora",
        value: "49",
        comunidadAutonoma: {
          nombre: "Castilla y León",
          codigo: "07",
          sID: "8bOpMK5gWQ",
        },
        cities: [
          {
            label: "Zamora",
            value: "49275",
            sID: "jB0KtAKo0G",
          },
          {
            label: "Benavente",
            value: "49023",
            sID: "YbYZIXVUlf",
          },
          {
            label: "Toro",
            value: "49230",
            sID: "7GLBypPEFR",
          },
        ],
        sID: "Cec3A1ELgP",
      },
      {
        label: "Barcelona",
        value: "08",
        comunidadAutonoma: {
          nombre: "Cataluña",
          codigo: "09",
          sID: "rChpkebjct",
        },
        cities: [
          {
            label: "Barcelona",
            value: "08019",
            sID: "lilHplSCyP",
          },
          {
            label: "L'Hospitalet de Llobregat",
            value: "08101",
            sID: "aSfRwEu5Z1",
          },
          {
            label: "Badalona",
            value: "08015",
            sID: "Jsd2Z2LAKn",
          },
          {
            label: "Terrassa",
            value: "08279",
            sID: "vxmXFPM2qb",
          },
          {
            label: "Sabadell",
            value: "08187",
            sID: "tmSldgMowC",
          },
          {
            label: "Mataró",
            value: "08121",
            sID: "r8fw95o7m5",
          },
          {
            label: "Santa Coloma de Gramenet",
            value: "08245",
            sID: "lJHDn3QMOJ",
          },
          {
            label: "Cornellà de Llobregat",
            value: "08073",
            sID: "GlMH1qp9FM",
          },
          {
            label: "Sant Boi de Llobregat",
            value: "08266",
            sID: "rECHuHfdf1",
          },
          {
            label: "Manresa",
            value: "08113",
            sID: "vGnEALWuZh",
          },
          {
            label: "Rubí",
            value: "08184",
            sID: "46ipkK9GSJ",
          },
          {
            label: "Vilanova i la Geltrú",
            value: "08307",
            sID: "PXwZHLYO1O",
          },
        ],
        sID: "kW56qBMFog",
      },
      {
        label: "Girona",
        value: "17",
        comunidadAutonoma: {
          nombre: "Cataluña",
          codigo: "09",
          sID: "rChpkebjct",
        },
        cities: [
          {
            label: "Girona",
            value: "17079",
            sID: "YgFqPCwTXK",
          },
          {
            label: "Figueres",
            value: "17066",
            sID: "e5ThNl0808",
          },
          {
            label: "Blanes",
            value: "17019",
            sID: "Fw8ckYC7Kj",
          },
          {
            label: "Lloret de Mar",
            value: "17102",
            sID: "i4KTkZscYD",
          },
          {
            label: "Olot",
            value: "17114",
            sID: "zJIqyp8UkJ",
          },
        ],
        sID: "F58eWuBE5x",
      },
      {
        label: "Lleida",
        value: "25",
        comunidadAutonoma: {
          nombre: "Cataluña",
          codigo: "09",
          sID: "rChpkebjct",
        },
        cities: [
          {
            label: "Lleida",
            value: "25120",
            sID: "VSrqg0KLAy",
          },
          {
            label: "Tàrrega",
            value: "25217",
            sID: "SZHD6XzMfg",
          },
          {
            label: "Balaguer",
            value: "25033",
            sID: "NlTDeV7xyY",
          },
        ],
        sID: "WhbhXWijhj",
      },
      {
        label: "Tarragona",
        value: "43",
        comunidadAutonoma: {
          nombre: "Cataluña",
          codigo: "09",
          sID: "rChpkebjct",
        },
        cities: [
          {
            label: "Tarragona",
            value: "43148",
            sID: "DKd4bPEtZi",
          },
          {
            label: "Reus",
            value: "43123",
            sID: "v2iLYt736u",
          },
          {
            label: "Tortosa",
            value: "43155",
            sID: "bFLioMF2zf",
          },
          {
            label: "El Vendrell",
            value: "43163",
            sID: "KSZJIzRdLF",
          },
          {
            label: "Cambrils",
            value: "43038",
            sID: "nN1Ib8OLK9",
          },
        ],
        sID: "64BHmj2qCy",
      },
      {
        label: "Alicante/Alacant",
        value: "03",
        comunidadAutonoma: {
          nombre: "Comunitat Valenciana",
          codigo: "10",
          sID: "KEBmb8sFx7",
        },
        cities: [
          {
            label: "Alicante/Alacant",
            value: "03014",
            sID: "oRCk2iBjAd",
          },
          {
            label: "Elche/Elx",
            value: "03065",
            sID: "iv5BeSuKtn",
          },
          {
            label: "Torrevieja",
            value: "03133",
            sID: "e0xoP8cp0F",
          },
          {
            label: "Orihuela",
            value: "03099",
            sID: "bQikI29Ims",
          },
          {
            label: "Benidorm",
            value: "03031",
            sID: "tCGlCiCLMo",
          },
          {
            label: "Alcoy/Alcoi",
            value: "03009",
            sID: "zgwdmllXLm",
          },
          {
            label: "Sant Vicent del Raspeig",
            value: "03122",
            sID: "4LcLTbccd2",
          },
          {
            label: "Elda",
            value: "03063",
            sID: "mE8i38fZUG",
          },
          {
            label: "Dénia",
            value: "03059",
            sID: "c2j1IJzfgh",
          },
        ],
        sID: "FF1unf4aD7",
      },
      {
        label: "Castellón/Castelló",
        value: "12",
        comunidadAutonoma: {
          nombre: "Comunitat Valenciana",
          codigo: "10",
          sID: "KEBmb8sFx7",
        },
        cities: [
          {
            label: "Castellón de la Plana",
            value: "12040",
            sID: "UuMNHHyvgS",
          },
          {
            label: "Vila-real",
            value: "12135",
            sID: "cbFnswz3z1",
          },
          {
            label: "Burriana",
            value: "12032",
            sID: "n5HEKwmGyQ",
          },
          {
            label: "Onda",
            value: "12073",
            sID: "TOXIXaRXd7",
          },
          {
            label: "Vinaròs",
            value: "12140",
            sID: "CpdvE6J4Jq",
          },
        ],
        sID: "zSzmWM1kQU",
      },
      {
        label: "Valencia/València",
        value: "46",
        comunidadAutonoma: {
          nombre: "Comunitat Valenciana",
          codigo: "10",
          sID: "KEBmb8sFx7",
        },
        cities: [
          {
            label: "Valencia",
            value: "46250",
            sID: "Hv8AD3sPyK",
          },
          {
            label: "Gandía",
            value: "46131",
            sID: "L9UjEPUdlb",
          },
          {
            label: "Torrent",
            value: "46244",
            sID: "CsqBTmUNrl",
          },
          {
            label: "Paterna",
            value: "46190",
            sID: "6BLYjP2nHb",
          },
          {
            label: "Mislata",
            value: "46173",
            sID: "A1bJuJOh1g",
          },
          {
            label: "Sagunto/Sagunt",
            value: "46219",
            sID: "YiIbHHrGEL",
          },
          {
            label: "Burjassot",
            value: "46065",
            sID: "fe0EEMVvYm",
          },
          {
            label: "Alzira",
            value: "46026",
            sID: "3TfC5vrAsb",
          },
        ],
        sID: "el9VRth1U8",
      },
      {
        label: "Badajoz",
        value: "06",
        comunidadAutonoma: {
          nombre: "Extremadura",
          codigo: "11",
          sID: "INS5mjrLmb",
        },
        cities: [
          {
            label: "Badajoz",
            value: "06015",
            sID: "UndiM05kSv",
          },
          {
            label: "Mérida",
            value: "06083",
            sID: "wKa8YcOkRw",
          },
          {
            label: "Don Benito",
            value: "06043",
            sID: "y5IQUhKnYm",
          },
          {
            label: "Almendralejo",
            value: "06006",
            sID: "hfSulJYq1N",
          },
          {
            label: "Villanueva de la Serena",
            value: "06155",
            sID: "MRku8cqlDH",
          },
        ],
        sID: "JtTvW7RRec",
      },
      {
        label: "Cáceres",
        value: "10",
        comunidadAutonoma: {
          nombre: "Extremadura",
          codigo: "11",
          sID: "INS5mjrLmb",
        },
        cities: [
          {
            label: "Cáceres",
            value: "10037",
            sID: "uuWqlSArYp",
          },
          {
            label: "Plasencia",
            value: "10149",
            sID: "cWZGiZC6wT",
          },
          {
            label: "Navalmoral de la Mata",
            value: "10132",
            sID: "myMCUIsjHX",
          },
          {
            label: "Coria",
            value: "10066",
            sID: "7gPIO87Mv5",
          },
        ],
        sID: "fc7sowge7M",
      },
      {
        label: "A Coruña",
        value: "15",
        comunidadAutonoma: {
          nombre: "Galicia",
          codigo: "12",
          sID: "OGC5r0Micf",
        },
        cities: [
          {
            label: "A Coruña",
            value: "15030",
            sID: "OOgz9QNm1N",
          },
          {
            label: "Santiago de Compostela",
            value: "15078",
            sID: "9MxPuw0Qqk",
          },
          {
            label: "Ferrol",
            value: "15036",
            sID: "mK2anOIEdO",
          },
          {
            label: "Oleiros",
            value: "15058",
            sID: "ZlDNut2zrH",
          },
          {
            label: "Arteixo",
            value: "15004",
            sID: "Q35j06NY5I",
          },
          {
            label: "Culleredo",
            value: "15031",
            sID: "FUWH0GlzIj",
          },
        ],
        sID: "G43RVHNQT8",
      },
      {
        label: "Lugo",
        value: "27",
        comunidadAutonoma: {
          nombre: "Galicia",
          codigo: "12",
          sID: "OGC5r0Micf",
        },
        cities: [
          {
            label: "Lugo",
            value: "27028",
            sID: "dnCjZuFbkd",
          },
          {
            label: "Monforte de Lemos",
            value: "27029",
            sID: "Leoe9a25dq",
          },
          {
            label: "Viveiro",
            value: "27066",
            sID: "O9ZevZ5yMD",
          },
        ],
        sID: "fAX74BbwO6",
      },
      {
        label: "Ourense",
        value: "32",
        comunidadAutonoma: {
          nombre: "Galicia",
          codigo: "12",
          sID: "OGC5r0Micf",
        },
        cities: [
          {
            label: "Ourense",
            value: "32054",
            sID: "x027Yvru77",
          },
          {
            label: "Verín",
            value: "32083",
            sID: "xF1YqqVrBd",
          },
          {
            label: "O Carballiño",
            value: "32019",
            sID: "2gjfQi0YH9",
          },
        ],
        sID: "efxK1ULN1z",
      },
      {
        label: "Pontevedra",
        value: "36",
        comunidadAutonoma: {
          nombre: "Galicia",
          codigo: "12",
          sID: "OGC5r0Micf",
        },
        cities: [
          {
            label: "Vigo",
            value: "36057",
            sID: "4bbiERSykT",
          },
          {
            label: "Pontevedra",
            value: "36038",
            sID: "vjEELx8Iob",
          },
          {
            label: "Vilagarcía de Arousa",
            value: "3661",
            sID: "tPpdnna8iq",
          },
          {
            label: "Redondela",
            value: "36045",
            sID: "SRTYJy7j4M",
          },
          {
            label: "Cangas",
            value: "36008",
            sID: "hEp7klqZpl",
          },
        ],
        sID: "AtxjYAzbEC",
      },
      {
        label: "Madrid",
        value: "28",
        comunidadAutonoma: {
          nombre: "Madrid, Comunidad de",
          codigo: "13",
          sID: "yV4Bn5BTdQ",
        },
        cities: [
          {
            label: "Madrid",
            value: "28079",
            sID: "6GlfIHtNC7",
          },
          {
            label: "Móstoles",
            value: "28092",
            sID: "8Y1s1Mjiyk",
          },
          {
            label: "Alcalá de Henares",
            value: "28005",
            sID: "8HVUP6Mvft",
          },
          {
            label: "Fuenlabrada",
            value: "28058",
            sID: "4CTZJ9Zbzk",
          },
          {
            label: "Leganés",
            value: "28074",
            sID: "pp4SBUR34V",
          },
          {
            label: "Getafe",
            value: "28065",
            sID: "LA5Sy2agWA",
          },
          {
            label: "Alcorcón",
            value: "28007",
            sID: "j8QNmDdheV",
          },
          {
            label: "Torrejón de Ardoz",
            value: "28148",
            sID: "GzIFfvmhtH",
          },
          {
            label: "Parla",
            value: "28106",
            sID: "8FLC63wszE",
          },
          {
            label: "Alcobendas",
            value: "28006",
            sID: "mRCmKj3Hs5",
          },
          {
            label: "Las Rozas de Madrid",
            value: "28127",
            sID: "PXSHP0f9b9",
          },
          {
            label: "San Sebastián de los Reyes",
            value: "28130",
            sID: "t95RTtt8n6",
          },
          {
            label: "Pozuelo de Alarcón",
            value: "28115",
            sID: "N2fhQ804n5",
          },
          {
            label: "Rivas-Vaciamadrid",
            value: "28123",
            sID: "ups3TG9D1p",
          },
        ],
        sID: "ADU7Gc0Qxz",
      },
      {
        label: "Murcia",
        value: "30",
        comunidadAutonoma: {
          nombre: "Murcia, Región de",
          codigo: "14",
          sID: "akfhQR0Q2n",
        },
        cities: [
          {
            label: "Murcia",
            value: "30030",
            sID: "fWjvIz2N2j",
          },
          {
            label: "Cartagena",
            value: "30016",
            sID: "yEXwPQ4AQg",
          },
          {
            label: "Lorca",
            value: "30024",
            sID: "zmSoSoE20c",
          },
          {
            label: "Molina de Segura",
            value: "30026",
            sID: "myznMFEEBK",
          },
          {
            label: "Alcantarilla",
            value: "30004",
            sID: "B2DkNwjIKX",
          },
          {
            label: "Mazarrón",
            value: "30025",
            sID: "28c0HPRFlz",
          },
          {
            label: "Águilas",
            value: "30003",
            sID: "YXb8LRGekj",
          },
          {
            label: "Cieza",
            value: "30019",
            sID: "HvidlUuLDU",
          },
        ],
        sID: "KXZOavobGd",
      },
      {
        label: "Navarra",
        value: "31",
        comunidadAutonoma: {
          nombre: "Navarra, Comunidad Foral de",
          codigo: "15",
          sID: "W1PPBbxRIN",
        },
        cities: [
          {
            label: "Pamplona/Iruña",
            value: "31201",
            sID: "6CMQpdn2yM",
          },
          {
            label: "Tudela",
            value: "31258",
            sID: "7ZtKTQ6MGy",
          },
          {
            label: "Barañáin",
            value: "31050",
            sID: "OBQ73YTrv5",
          },
          {
            label: "Burlada/Burlata",
            value: "31064",
            sID: "F2hjbci0mb",
          },
          {
            label: "Zizur Mayor",
            value: "31272",
            sID: "x9M12H7kz5",
          },
          {
            label: "Estella-Lizarra",
            value: "31091",
            sID: "mfvo9bjBGM",
          },
        ],
        sID: "8NC1aL3FiM",
      },
      {
        label: "Araba/Álava",
        value: "01",
        comunidadAutonoma: {
          nombre: "País Vasco",
          codigo: "16",
          sID: "Tg5HXggQt8",
        },
        cities: [
          {
            label: "Vitoria-Gasteiz",
            value: "01059",
            sID: "xayrilWSlj",
          },
          {
            label: "Llodio",
            value: "01036",
            sID: "yOnp8HBnGn",
          },
        ],
        sID: "Ge9hf6DIZW",
      },
      {
        label: "Bizkaia",
        value: "48",
        comunidadAutonoma: {
          nombre: "País Vasco",
          codigo: "16",
          sID: "Tg5HXggQt8",
        },
        cities: [
          {
            label: "Bilbao",
            value: "48020",
            sID: "0jsdABUHC2",
          },
          {
            label: "Barakaldo",
            value: "48015",
            sID: "johbvVJ9RT",
          },
          {
            label: "Getxo",
            value: "48044",
            sID: "jNQg0a16fD",
          },
          {
            label: "Portugalete",
            value: "48078",
            sID: "gRnXB3G8MM",
          },
          {
            label: "Santurtzi",
            value: "48082",
            sID: "oBaNDNlIXL",
          },
          {
            label: "Basauri",
            value: "48016",
            sID: "1FQIpuMD20",
          },
          {
            label: "Leioa",
            value: "48059",
            sID: "ukU4peXrL5",
          },
          {
            label: "Durango",
            value: "48034",
            sID: "Z81JbjlK4n",
          },
        ],
        sID: "76f0CYlTbq",
      },
      {
        label: "Gipuzkoa",
        value: "20",
        comunidadAutonoma: {
          nombre: "País Vasco",
          codigo: "16",
          sID: "Tg5HXggQt8",
        },
        cities: [
          {
            label: "Donostia-San Sebastián",
            value: "20069",
            sID: "xsiPky6qAA",
          },
          {
            label: "Irun",
            value: "20055",
            sID: "ljAoXoEN5H",
          },
          {
            label: "Errenteria",
            value: "20053",
            sID: "OcMD2YDPsx",
          },
          {
            label: "Eibar",
            value: "20029",
            sID: "5nnACnQzwc",
          },
          {
            label: "Zarautz",
            value: "20079",
            sID: "fTV6cv3JIR",
          },
        ],
        sID: "b2rFRQ2O0V",
      },
      {
        label: "La Rioja",
        value: "26",
        comunidadAutonoma: {
          nombre: "Rioja, La",
          codigo: "17",
          sID: "mJNU0i2vO9",
        },
        cities: [
          {
            label: "Logroño",
            value: "26089",
            sID: "KsYFQF3OX4",
          },
          {
            label: "Calahorra",
            value: "26036",
            sID: "REO0d2XDjU",
          },
          {
            label: "Arnedo",
            value: "26015",
            sID: "rVSJJCgloN",
          },
          {
            label: "Haro",
            value: "26075",
            sID: "KNZZsH4kIe",
          },
        ],
        sID: "3eok6jLKYB",
      },
      {
        label: "Ceuta",
        value: "51",
        comunidadAutonoma: {
          nombre: "Ceuta",
          codigo: "18",
          sID: "jMstE01a4C",
        },
        cities: [
          {
            label: "Ceuta",
            value: "51001",
            sID: "IDBenBfVeV",
          },
        ],
        sID: "FhnRi3EnMw",
      },
      {
        label: "Melilla",
        value: "52",
        comunidadAutonoma: {
          nombre: "Melilla",
          codigo: "19",
          sID: "UFgpIzwkzy",
        },
        cities: [
          {
            label: "Melilla",
            value: "52001",
            sID: "INV7oVU8VW",
          },
        ],
        sID: "HsceKHtodG",
      },
    ],
    sID: "C3Ok8llCsK",
  },
];

/**
 * Busca un elemento en la estructura jerárquica de countries
 * @param {string[]} pathIds - Array de IDs que representan el path a buscar
 *   Ejemplo: ['CO'] busca el país Colombia
 *   Ejemplo: ['CO', '05'] busca el departamento Antioquia
 *   Ejemplo: ['CO', '05', '05001'] busca la ciudad Medellín
 * @param {boolean} returnChildren - Si true, retorna solo los hijos del elemento encontrado.
 *                                    Si false, retorna el elemento completo.
 * @returns {Object|Array|null} - El elemento encontrado (con o sin hijos) o null si no se encuentra
 */
function findLocationByPath(pathIds, returnChildren = false) {
  if (!pathIds || pathIds.length === 0) {
    return returnChildren ? countries : null;
  }

  // Buscar el país (primer nivel)
  const countryId = pathIds[0];
  let currentNode = countries.find(
    (c) => c.value === countryId || c.id === countryId,
  );

  if (!currentNode) {
    return null;
  }

  // Si solo buscamos el país
  if (pathIds.length === 1) {
    return returnChildren ? currentNode.states || [] : currentNode;
  }

  // Navegar por los niveles siguientes
  let currentLevel = currentNode.states || [];

  for (let i = 1; i < pathIds.length; i++) {
    const searchId = pathIds[i];
    currentNode = currentLevel.find((item) => item.value === searchId);

    if (!currentNode) {
      return null;
    }

    // Si llegamos al último ID del path
    if (i === pathIds.length - 1) {
      if (returnChildren) {
        // Retornar hijos según el nivel
        return (
          currentNode.cities ||
          currentNode.districts ||
          currentNode.neighborhoods ||
          []
        );
      } else {
        return currentNode;
      }
    }

    // Avanzar al siguiente nivel
    currentLevel =
      currentNode.cities ||
      currentNode.districts ||
      currentNode.neighborhoods ||
      [];

    if (currentLevel.length === 0) {
      // No hay más niveles disponibles
      return null;
    }
  }

  return null;
}

module.exports = { countries, findLocationByPath };
