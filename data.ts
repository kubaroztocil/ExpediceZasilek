export type dopis = {
    id: number;
    typ: string;
    nazev: string;
    cena: number;
}
export type balik = {
  id: number;
  typ: string;
  nazev: string;
  cena: number;
  MaxVaha: number;
  Size: number;
};

export const menu: (dopis|balik)[] = [
  { 
    id: 1, 
    typ: "dopis", 
    nazev: "Dopis", 
    cena: 45
  },
  { 
    id: 2, 
    typ: "XS_zasilka", 
    nazev: "XSZásilka", 
    cena: 50,
    MaxVaha: 0.5,
    Size: 1
  },
  {
    id: 3,
    typ: "S_zasilka",
    nazev: "S Zásilka",
    cena: 75,
    MaxVaha: 1
  },
  {
    id: 4,
    typ: "M_zasilka",
    nazev: "M Zásilka",
    cena: 125,
    MaxVaha: 5
  },
  {
    id: 5,
    typ: "L_zasilka",
    nazev: "L Zásilka",
    cena: 175,
    MaxVaha: 10
  },
  {
    id: 6,
    typ: "XL_zasilka",
    nazev: "XL Zásilka",
    cena: 250,
    MaxVaha: 20
  },
  {
    id: 7,
    typ: "XXL_zasilka",
    nazev: "XXL Zásilka",
    cena: 350,
    MaxVaha: 35
  }
];

