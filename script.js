import { menu, maxLimity, vozidla } from "./data.js"; // import data.js
// Vozidlo
class Vozidlo {
    id;
    nazev;
    maxObjem; // cm3
    zaplnenyObjem = 0;
    zasilky = [];
    constructor(id, nazev, maxObjem) {
        this.id = id;
        this.nazev = nazev;
        this.maxObjem = maxObjem;
    }
    // pridani zasilky do vozidla, kontrola objemu
    pridatZasilku(z) {
        let objm = 0;
        if (z instanceof Balik)
            objm = z.objem;
        // dopisy nemaji objem
        if (this.zaplnenyObjem + objm > this.maxObjem) {
            return { ok: false, reason: 'Nedostatek volného objemu ve vozidle' };
        }
        this.zasilky.push(z);
        this.zaplnenyObjem += objm;
        return { ok: true };
    }
    zbyvajiciObjem() {
        return Math.max(0, this.maxObjem - this.zaplnenyObjem);
    }
}
// Základní třída společných vlastností
class Zasilka {
    id;
    typ;
    nazev;
    cena; // za 1 kus
    mnozstvi;
    constructor(id, typ, nazev, cena, mnozstvi = 1) {
        if (!nazev || nazev.trim() == "")
            throw new Error("Název nesmí být prázdný"); //chybobé hlášky
        if (cena < 0)
            throw new Error("Cena nesmí být záporná");
        if (mnozstvi <= 0)
            throw new Error("Množství musí být kladné číslo");
        this.id = id;
        this.typ = typ;
        this.nazev = nazev;
        this.cena = cena;
        this.mnozstvi = Math.round(mnozstvi); // zaokrouhlení na celé číslo
    }
}
// Dopis
class Dopis extends Zasilka {
    constructor(id, nazev, cena, mnozstvi = 1) {
        super(id, 'dopis', nazev, cena, mnozstvi);
    }
    vypocitejCenu() {
        return this.cena * this.mnozstvi;
    }
}
// Balík
class Balik extends Zasilka {
    sirka; // cm
    vyska;
    hloubka;
    vaha; // kg
    objem; // cm3
    kategorie; // hledání z menu
    krehka = false; // krehka
    isTooLarge = false; // true pokud překročí limity
    constructor(id, nazev, sirka, vyska, hloubka, vaha, mnozstvi, krehka = false) {
        super(id, 'balik', nazev, 0, mnozstvi);
        if (sirka <= 0 || vyska <= 0 || hloubka <= 0)
            throw new Error('Rozměry musí být kladné'); // kontrola rozměrů
        if (vaha <= 0)
            throw new Error('Váha musí být kladná'); // kontrola váhy
        this.sirka = sirka; // cm
        this.vyska = vyska;
        this.hloubka = hloubka;
        this.vaha = vaha; // kg
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
        if (kateg)
            this.cena = kateg.cena;
    }
    urciKategorii() {
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
        if (this.vaha > maxVahaStredni)
            return 'balik-velky';
        if (this.vaha > maxVahaMaly)
            return 'balik-stredni';
        // podle objemu
        const maxObjemMaly = maly?.maxObjem ?? Infinity;
        const maxObjemStredni = stredni?.maxObjem ?? Infinity;
        const maxObjemVelky = velky?.maxObjem ?? Infinity;
        if (this.objem <= maxObjemMaly)
            return 'balik-maly';
        if (this.objem <= maxObjemStredni)
            return 'balik-stredni';
        if (this.objem <= maxObjemVelky)
            return 'balik-velky';
        // nadmerny balik
        const nadObj = menu.find(m => m.typ === 'balik-nadmerny');
        const maxObjemNad = nadObj?.maxObjem ?? Infinity;
        if (this.objem > maxObjemNad)
            return 'prilis-velky';
        return 'balik-nadmerny';
    }
    vypocitejCenu() {
        const perUnit = this.cena;
        const multiplier = this.krehka ? 1.3 : 1;
        return perUnit * multiplier * this.mnozstvi;
    }
}
//funkce pridani dopisu
function pridatDopis(nazev, druh, mnozstvi) {
    const typ = druh == 'dopis' ? 'dopis' : 'doporuceny';
    const pol = menu.find(m => m.typ == typ);
    if (!pol)
        throw new Error('Položka v menu nenalezena');
    return new Dopis(pol.id, nazev, pol.cena, mnozstvi);
}
// funkce pridani baliku
function pridatBalik(nazev, sirka, vyska, hloubka, vaha, mnozstvi, krehka = false) {
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
}
else {
    console.log(b.isTooLarge, b.kategorie, b.vypocitejCenu());
    // vytvoreni vozidla
    const vozidlo = vozidla[0];
    const v = new Vozidlo(vozidlo.id, vozidlo.nazev, vozidlo.maxObjem);
    const vysledek = v.pridatZasilku(b);
    if (!vysledek.ok) {
        console.log('Nepodařilo se přidat do vozidla:', vysledek.reason, 'volný objem:', v.zbyvajiciObjem());
    }
    else {
        console.log('Přidáno do vozidla', v.nazev, 'volný objem:', v.zbyvajiciObjem());
    }
}
