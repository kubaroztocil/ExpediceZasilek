import {menu, maxLimity} from "./data.js"; // import data.js
// Základní třída společných vlastností
abstract class Zasilka {
    id: number;
    typ: string;
    nazev: string;
    cena: number; // cena za jeden kus
    mnozstvi: number;

    constructor(id: number, typ: string, nazev: string, cena: number, mnozstvi = 1) {
        if (!nazev || nazev.trim() === "") throw new Error("Název nesmí být prázdný"); //chybobé hlášky
        if (cena < 0) throw new Error("Cena nesmí být záporná");
        if (mnozstvi <= 0) throw new Error("Množství musí být kladné číslo");
        this.id = id;
        this.typ = typ;
        this.nazev = nazev;
        this.cena = cena;
        this.mnozstvi = Math.round(mnozstvi); // zaokrouhlení na celé číslo
    }

    // každá zásilka musí umět spočítat svou cenu
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
    vyska: number; // cm
    hloubka: number; // cm
    vaha: number; // kg
    objem: number; // cm3
    kategorie: string; // hledání z menu
    isTooLarge: boolean = false; // true pokud překročí globální limity

    constructor(id: number, nazev: string, sirka: number, vyska: number, hloubka: number, vaha: number, mnozstvi: number) {

        super(id, 'balik', nazev, 0, mnozstvi);

        if (sirka <= 0 || vyska <= 0 || hloubka <= 0) throw new Error('Rozměry musí být kladné'); // kontrola rozměrů
        if (vaha <= 0) throw new Error('Váha musí být kladná'); // kontrola váhy

        this.sirka = sirka;     // cm
        this.vyska = vyska;     
        this.hloubka = hloubka; 
        this.vaha = vaha;       // kg

        
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
            if (this.vaha > maxVahaNad) return 'prilis-velky';
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
        return this.cena * this.mnozstvi;
    }

}