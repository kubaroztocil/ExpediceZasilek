class Zasilka {
    id;
    typ;
    nazev;
    cena;
    mnozstvi;
    constructor(id, typ, nazev, cena, mnozstvi) {
        this.id = id;
        this.typ = typ;
        this.nazev = nazev;
        this.cena = cena;
        this.mnozstvi = mnozstvi; // Výchozí množství
    }
}
// Potomek pro dopis
class DopisZasilka extends Zasilka {
    vypocitejCenu() {
        return this.cena * this.mnozstvi;
    }
}
// Potomek pro balík
class BalikZasilka extends Zasilka {
    maxVaha;
    krehky;
    constructor(id, typ, nazev, cena, maxVaha, mnozstvi = 1, krehky = false) {
        super(id, typ, nazev, cena, mnozstvi);
        this.maxVaha = maxVaha;
        this.krehky = krehky;
    }
    vypocitejCenu() {
        let priplatek = 0;
        if (this.krehky === true) {
            priplatek = 50; // příplatek za křehké zboží
        }
        else {
            priplatek = 0; // bez příplatku
        }
        return (this.cena + priplatek) * this.mnozstvi;
    }
}
// Test: vytvoření dopisu a balíku
const dopis = new DopisZasilka(1, "dopis", "Dopis", 45, 2); // 2 dopisy
console.log("Cena za dopisy:", dopis.vypocitejCenu());
const balik1 = new BalikZasilka(2, "S_zasilka", "Automobil", 75, 1, 1, false); // nekřehký balík
console.log(`Cena za ${balik1.nazev}: ${balik1.vypocitejCenu()}`);
const balik2 = new BalikZasilka(3, "M_zasilka", "M Zásilka", 125, 5, 1, true); // křehký balík
console.log(`Cena za ${balik2.nazev}: ${balik2.vypocitejCenu()}`);
export {};
