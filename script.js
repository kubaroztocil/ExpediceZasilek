import { menu } from "./data.js"; // import data.js
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
    maxObjem;
    constructor(id, typ, nazev, cena, maxVaha, maxObjem, mnozstvi = 1, krehky = false) {
        super(id, typ, nazev, cena, mnozstvi);
        this.maxVaha = maxVaha;
        this.maxObjem = maxObjem;
        this.krehky = krehky;
    }
    vypocitejCenu() {
        let priplatek = 0;
        if (this.krehky === true) {
            priplatek = 25 * this.maxVaha; // příplatek za křehké zboží
        }
        else {
            priplatek = 0; // bez příplatku
        }
        return (this.cena + priplatek) * this.mnozstvi;
    }
}
console.log(menu); // test načtení dat z data.js
new DopisZasilka(1, 'dopis', 'Standardní dopis', 30, 2);
console.log(DopisZasilka);
new BalikZasilka(3, 'balik', 'Malý balík', 120, 2, 10000, 1, true);
console.log(BalikZasilka);
