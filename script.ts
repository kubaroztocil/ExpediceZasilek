import {menu, maxLimity, vozidla} from "./data.js"; // import data.js
// Vozidlo
class Vozidlo {
    id: number;
    nazev: string;
    maxObjem: number; // cm3
    zaplnenyObjem: number = 0;
    zasilky: Zasilka[] = [];

    constructor(id: number, nazev: string, maxObjem: number) {
        this.id = id;
        this.nazev = nazev;
        this.maxObjem = maxObjem;
    }

    // pridani zasilky do vozidla, kontrola objemu
    pridatZasilku(z: Zasilka): { ok: boolean; reason?: string } {
        let objm = 0;
        if (z instanceof Balik) objm = z.objem;
        // dopisy nemaji objem

        if (this.zaplnenyObjem + objm > this.maxObjem) {
            return { ok: false, reason: 'Nedostatek volného objemu ve vozidle' };
        }

        this.zasilky.push(z);
        this.zaplnenyObjem += objm;
        return { ok: true };
    }

    zbyvajiciObjem(): number {
        return Math.max(0, this.maxObjem - this.zaplnenyObjem);
    }
}
// Základní třída společných vlastností
abstract class Zasilka {
    id: number;
    typ: string;
    nazev: string;
    cena: number; // za 1 kus
    mnozstvi: number;

    constructor(id: number, typ: string, nazev: string, cena: number, mnozstvi = 1) {
        if (!nazev || nazev.trim() == "") throw new Error("Název nesmí být prázdný"); //chybobé hlášky
        if (cena < 0) throw new Error("Cena nesmí být záporná");
        if (mnozstvi <= 0) throw new Error("Množství musí být kladné číslo");
        this.id = id;
        this.typ = typ;
        this.nazev = nazev;
        this.cena = cena;
        this.mnozstvi = Math.round(mnozstvi); // zaokrouhlení na celé číslo
    }

    // pocitani ceny abstraktni
    abstract vypocitejCenu(): number;
}

// Dopis
class Dopis extends Zasilka {
    constructor(id: number, nazev: string, cena: number, mnozstvi = 1) {
        super(id, 'dopis', nazev, cena, mnozstvi);
    }

    vypocitejCenu(): number {
        return this.cena * this.mnozstvi;
    }
}


// Balík
class Balik extends Zasilka {
    sirka: number; // cm
    vyska: number;
    hloubka: number;
    vaha: number; // kg
    objem: number; // cm3
    kategorie: string; // hledání z menu
    krehka: boolean = false; // krehka
    isTooLarge: boolean = false; // true pokud překročí limity

    constructor(id: number, nazev: string, sirka: number, vyska: number, hloubka: number, vaha: number, mnozstvi: number, krehka: boolean = false) {

        super(id, 'balik', nazev, 0, mnozstvi);

        if (sirka <= 0 || vyska <= 0 || hloubka <= 0) throw new Error('Rozměry musí být kladné'); // kontrola rozměrů
        if (vaha <= 0) throw new Error('Váha musí být kladná'); // kontrola váhy

        this.sirka = sirka;     // cm
        this.vyska = vyska;     
        this.hloubka = hloubka; 
        this.vaha = vaha;       // kg
        this.krehka = krehka;

        
        this.objem = Math.round(sirka * vyska * hloubka); //spočítáme objem z rozměrů (cm3)

        if (this.vaha > maxLimity.maxVahaBalik || this.objem > maxLimity.maxObjemBalik) { //vetsi než max limity
            this.isTooLarge = true;
            this.kategorie = 'prilis-velky';
            this.cena = 0;
            console.warn('Zásilka překračuje povolený maximální rozměr nebo váhu (označeno jako příliš velké).');
            return; // ukonceni konstruktoru
        }

        this.kategorie = this.urciKategorii(); // určujeme kategorii
        const kateg = menu.find(kat => kat.typ === this.kategorie); // podle kategorie cena z menu
        if (kateg) this.cena = kateg.cena;
    }

    urciKategorii(): string { //limity z menu pro kazdou velikost baliku
        const maly = menu.find(m => m.typ === 'balik-maly');
        const stredni = menu.find(m => m.typ === 'balik-stredni');
        const velky = menu.find(m => m.typ === 'balik-velky');

        // urcovani podl vahy
        const maxVahaMaly = maly?.maxVaha ?? Infinity;
        const maxVahaStredni = stredni?.maxVaha ?? Infinity;
        const maxVahaVelky = velky?.maxVaha ?? Infinity;

        if (this.vaha > maxVahaVelky) {
            const nad = menu.find(m => m.typ === 'balik-nadmerny');
            const maxVahaNad = nad?.maxVaha ?? Infinity;
             if (this.vaha > maxVahaNad) {
                    return 'prilis-velky';
             }
        return 'balik-nadmerny';
        }
        if (this.vaha > maxVahaStredni) return 'balik-velky';
        if (this.vaha > maxVahaMaly) return 'balik-stredni';

        // podle objemu
        const maxObjemMaly = maly?.maxObjem ?? Infinity;
        const maxObjemStredni = stredni?.maxObjem ?? Infinity;
        const maxObjemVelky = velky?.maxObjem ?? Infinity;

        if (this.objem <= maxObjemMaly) return 'balik-maly';
        if (this.objem <= maxObjemStredni) return 'balik-stredni';
        if (this.objem <= maxObjemVelky) return 'balik-velky';

        // nadmerny balik
        const nadObj = menu.find(m => m.typ === 'balik-nadmerny');
        const maxObjemNad = nadObj?.maxObjem ?? Infinity;
        if (this.objem > maxObjemNad) return 'prilis-velky';

        return 'balik-nadmerny';
    }

    vypocitejCenu(): number {
        const perUnit = this.cena;
        const multiplier = this.krehka ? 1.3 : 1;
        return perUnit * multiplier * this.mnozstvi;
    }
}

//funkce pridani dopisu
function pridatDopis(nazev: string, druh: 'dopis' | 'doporuceny', mnozstvi: number): Dopis {
    const typ = druh ==  'dopis' ? 'dopis' : 'doporuceny';
    const pol = menu.find(m => m.typ == typ);
    if (!pol) throw new Error('Položka v menu nenalezena');
    return new Dopis(pol.id, nazev, pol.cena, mnozstvi);
}

// funkce pridani baliku
function pridatBalik(nazev: string, sirka: number, vyska: number, hloubka: number, vaha: number, mnozstvi: number, krehka: boolean = false): Balik | null {
    const id = 100 + Math.floor(Math.random() * 900);
    // před vytvořením instance zkontrolujeme globální limity
    const objem = Math.round(sirka * vyska * hloubka);
    if (vaha > maxLimity.maxVahaBalik || objem > maxLimity.maxObjemBalik) {
        console.warn('Balík překračuje globální limity - nebude vytvořen.');
        return null;
    }
    return new Balik(id, nazev, sirka, vyska, hloubka, vaha, mnozstvi, krehka);
}

const bal = new Balik(1, 'Testovací balík', 50, 20, 10, 10, 1, true);
console.log(bal);

const b = pridatBalik('Obrovsky', 50, 20, 10, 20, 1);
if (b === null) {
    console.log('Balík nebyl vytvořen — překročen globální limit.');
} else {
    console.log(b.isTooLarge, b.kategorie, b.vypocitejCenu());

    // vytvoreni vozidla
    const vozidlo = vozidla[0];
    const v = new Vozidlo(vozidlo.id, vozidlo.nazev, vozidlo.maxObjem);
    const vysledek = v.pridatZasilku(b);
    if (!vysledek.ok) {
        console.log('Nepodařilo se přidat do vozidla:', vysledek.reason, 'volný objem:', v.zbyvajiciObjem());
    } else {
        console.log('Přidáno do vozidla', v.nazev, 'volný objem:', v.zbyvajiciObjem());
    }
}