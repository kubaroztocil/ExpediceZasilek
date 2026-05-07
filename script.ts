import {menu, PolozkaMenu} from "./data.js"; // import data.js
abstract class Zasilka {
    public id: number
    public typ: string
    public nazev: string
    public cena: number
    public mnozstvi: number;

    constructor(id: number, typ: string, nazev: string, cena: number, mnozstvi: number) {
        this.id = id;
        this.typ = typ;
        this.nazev = nazev;
        this.cena = cena;
        this.mnozstvi = mnozstvi; // Výchozí množství
    }
    abstract vypocitejCenu(): number;
}

// Potomek pro dopis
class DopisZasilka extends Zasilka {
    vypocitejCenu(): number {
        return this.cena * this.mnozstvi;
    }
}

// Potomek pro balík
class BalikZasilka extends Zasilka {
    public maxVaha: number;
    public krehky: boolean;
    public maxObjem: number;

constructor(
        id: number,
        typ: string,
        nazev: string,
        cena: number,
        maxVaha: number,
        maxObjem: number,
        mnozstvi: number = 1,
        krehky: boolean = false
    ) {
        super(id, typ, nazev, cena, mnozstvi);
        this.maxVaha = maxVaha;
        this.maxObjem = maxObjem;
        this.krehky = krehky;
    }
    vypocitejCenu(): number {
        let priplatek = 0;
        if (this.krehky === true) {
            priplatek = 25*this.maxVaha; // příplatek za křehké zboží
        } else {
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