type dopis = {
    id: number;
    typ: string; // může být pouze "dopis"
    nazev: string;
    cena: number;
}
type balik = {
  id: number;
  typ: string; // může být "XS_zasilka", "S_zasilka", "M_zasilka", "L_zasilka", "XL_zasilka" nebo "XXL_zasilka"
  nazev: string;
  cena: number;
  MaxVaha: number;
};

const menu: (dopis|balik)[] = [
  { 
    id: 100, 
    typ: "dopis", 
    nazev: "Dopis", 
    cena: 45
  },
  { 
    id: 200, 
    typ: "XS_zasilka", 
    nazev: "Zásilka", 
    cena: 50,
    MaxVaha: 0.5
  },
  {
    id: 300,
    typ: "S_zasilka",
    nazev: "Zásilka",
    cena: 75,
    MaxVaha: 1
  },
  {
    id: 400,
    typ: "M_zasilka",
    nazev: "Zásilka",
    cena: 125,
    MaxVaha: 5
  },
  {
    id: 500,
    typ: "L_zasilka",
    nazev: "Zásilka",
    cena: 175,
    MaxVaha: 10
  },
  {
    id: 600,
    typ: "XL_zasilka",
    nazev: "Zásilka",
    cena: 250,
    MaxVaha: 20
  },
  {
    id: 700,
    typ: "XXL_zasilka",
    nazev: "Zásilka",
    cena: 350,
    MaxVaha: 35
  }
];

