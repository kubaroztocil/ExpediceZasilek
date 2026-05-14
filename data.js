export const maxLimity = {
    maxVahaBalik: 1000,
    maxObjemBalik: 10000000
};
// menu baliku a dopisu
export const menu = [
    { id: 1, typ: 'dopis', nazev: 'Standardní dopis', cena: 40 },
    { id: 2, typ: 'doporuceny', nazev: 'Doporučený dopis', cena: 65 },
    { id: 3, typ: 'balik-maly', nazev: 'Malý balík', cena: 90, maxVaha: 2, maxObjem: 10000 }, // v kg a cm3
    { id: 4, typ: 'balik-stredni', nazev: 'Střední balík', cena: 150, maxVaha: 10, maxObjem: 30000 },
    { id: 5, typ: 'balik-velky', nazev: 'Velký balík', cena: 200, maxVaha: 20, maxObjem: 100000 },
    { id: 6, typ: 'balik-nadmerny', nazev: 'Nadměrný balík', cena: 350, maxVaha: 30, maxObjem: 1000000 }
];
export const vozidla = [
    { id: 1, nazev: 'Dodávka', maxObjem: 1000000 },
];
