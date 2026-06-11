export const maxLimity = {
    maxVahaBalik: 1000,
    maxObjemBalik: 100000000
};
// menu baliku a dopisu
export const menu = [
    { id: 1, typ: 'standardni', nazev: 'Standardní dopis', cena: 40 },
    { id: 2, typ: 'doporuceny', nazev: 'Doporučený dopis', cena: 65 },
    { id: 3, typ: 'balik-maly', nazev: 'Malý balík', cena: 90, maxVaha: 2, maxObjem: 10000 }, // v kg a cm3
    { id: 4, typ: 'balik-stredni', nazev: 'Střední balík', cena: 150, maxVaha: 10, maxObjem: 50000 },
    { id: 5, typ: 'balik-velky', nazev: 'Velký balík', cena: 200, maxVaha: 20, maxObjem: 500000 },
    { id: 6, typ: 'balik-nadmerny', nazev: 'Nadměrný balík', cena: 350, maxVaha: 30, maxObjem: 1500000 }
];
export const vozidla = [
    { id: 1, nazev: 'Dodávka', maxObjem: 10000000 },
];
