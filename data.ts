export interface PolozkaMenu {
    id: number;
    typ: 'dopis' | 'balik';
    nazev: string;
    cena: number;
    maxVaha?: number; // v kg
    maxObjem?: number; // v cm3
}

export const menu: PolozkaMenu[] = [
    { id: 1, typ: 'dopis', nazev: 'Standardní dopis', cena: 40 },
    { id: 2, typ: 'dopis', nazev: 'Doporučený dopis', cena: 65 },
    { id: 3, typ: 'balik', nazev: 'Malý balík', cena: 90, maxVaha: 2, maxObjem: 10000 }, // v kg a cm3
    { id: 4, typ: 'balik', nazev: 'Střední balík', cena: 150, maxVaha: 5, maxObjem: 30000 },
    { id: 5, typ: 'balik', nazev: 'Velký balík', cena: 200, maxVaha: 10, maxObjem: 100000 },
];

