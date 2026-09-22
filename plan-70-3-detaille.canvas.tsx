import { useState } from "react";
import {
  Callout, Card, CardBody, CardHeader, Checkbox, Divider, Grid, H1, H2,
  Pill, Row, Stack, Stat, Table, Text, useCanvasState,
} from "cursor/canvas";

// ??? Types ????????????????????????????????????????????????????????????????????
type Sport = "NAT" | "VÉLO" | "CAP" | "RENFO" | "BRICK" | "REPOS";

interface Session {
  sport: Sport;
  titre: string;
  duree: string;
  lignes: string[];
}

interface Jour {
  nom: string;
  seances: Session[];
}

interface Semaine {
  label: string;
  dates: string;
  volume: string;
  recuperation?: boolean;
  jours: Jour[];
}

interface BlocData {
  id: number;
  phase: string;
  dates: string;
  volumeRange: string;
  focus: string;
  semaines: Semaine[];
}

// ??? Session helpers ??????????????????????????????????????????????????????????

const REPOS: Session = {
  sport: "REPOS", titre: "Repos complet", duree: "—",
  lignes: ["Récupération totale, pas d'effort physique", "Option: foam roller 10' sur mollets, ischios, fléchisseurs de hanche"],
};

function natTech(total = "~1 800m"): Session {
  return {
    sport: "NAT", titre: "Technique & éducatifs", duree: "1h00",
    lignes: [
      `Éch: 200m libre + 4×50m éducatifs (ISO unilatéral D/G, catch-up, kick latéral)`,
      `Principal: 6×100m · focus rotation 45° + entrée de main dans l'axe · récup 20" actif`,
      `Fin: 4×50m fingertip-drag + 100m cool-down · Total ${total}`,
    ],
  };
}

function natEndTech(total = "~2 400m", dur = "1h30"): Session {
  return {
    sport: "NAT", titre: "Technique + endurance", duree: dur,
    lignes: [
      "Éch: 400m libre facile",
      "Principal: 8×100m Z2 · récup 15\" · 4×50m éducatifs intercalés toutes les 2 séries",
      `Fin: 2×200m continu Z2 + 100m cool-down · Total ${total}`,
    ],
  };
}

function natSeuil(serie = "10×100m @ CSS · récup 15\"", total = "~2 200m"): Session {
  return {
    sport: "NAT", titre: "Seuil / allure CSS", duree: "1h00",
    lignes: [
      "Éch: 400m (200m libre + 4×50m éducatifs)",
      `Principal: ${serie}`,
      `Fin: 200m cool-down · Total ${total} · CSS ~ allure 1'40\"-1'55\"/100m selon niveau`,
    ],
  };
}

function natEndSpec(total = "~2 600m"): Session {
  return {
    sport: "NAT", titre: "Endurance spécifique eau libre", duree: "1h00",
    lignes: [
      "Éch: 400m libre",
      "Principal: 3×600m · virages ouverts · respiration bilatérale · sighting toutes les 10 brasses · récup 45\"",
      `Fin: 200m cool-down · Total ${total} · Simuler les conditions eau libre`,
    ],
  };
}

function natLong(serie: string, total = "~3 200m"): Session {
  return {
    sport: "NAT", titre: "Longue / allure 70.3", duree: "1h15",
    lignes: [
      "Éch: 400m (200m libre + 4×50m progressifs)",
      `Principal: ${serie}`,
      `Fin: 200m cool-down · Total ${total}`,
    ],
  };
}

function natRecup(total = "~700m"): Session {
  return {
    sport: "NAT", titre: "Récup active", duree: "30'",
    lignes: [`${total} · éducatifs libres au choix · très facile Z1 · aucune intensité`],
  };
}

function natLegere(total = "~1 200m"): Session {
  return {
    sport: "NAT", titre: "Technique légère", duree: "45'",
    lignes: [
      "200m libre + 6×50m éducatifs variés (catch-up, ISO, 2 coups de bras / 1 coup de jambe)",
      `4×100m très facile Z1-Z2 · récup 20\" · Total ${total} · Pas de performance`,
    ],
  };
}

function veloZ2(duree: string, note = ""): Session {
  return {
    sport: "VÉLO", titre: "Endurance Z2", duree,
    lignes: [
      "10' Z1 activation · cadence libre",
      `Corps: Z2 continu · 65-75% FCmax · cadence 85-92 rpm · terrain plat${note ? " · " + note : ""}`,
      "5' Z1 retour calme · ravitaillement eau toutes les 20'",
    ],
  };
}

function veloRecup(): Session {
  return {
    sport: "VÉLO", titre: "Récup très facile Z1", duree: "45'",
    lignes: ["45' Z1 < 65% FCmax · cadence libre · terrain plat · aucune pression", "Jambes légères · pas d'objectif de vitesse"],
  };
}

function veloSweetspot(serie = "3×12'", recup = "4'"): Session {
  return {
    sport: "VÉLO", titre: "Sweet-spot", duree: "1h15",
    lignes: [
      "10' Z2 activation",
      `${serie} sweet-spot · 88-93% FTP (Z3 haut - Z4) · cadence 90-95 rpm · récup ${recup} Z2`,
      "10' Z2 retour calme",
    ],
  };
}

function veloSeuil(serie = "4×10'"): Session {
  return {
    sport: "VÉLO", titre: "Seuil / intervalles Z4", duree: "1h30",
    lignes: [
      "10' Z2 activation",
      `${serie} · Z4 (95-105% FTP) · maintenir la puissance · récup 4' Z2 entre chaque`,
      "15' Z2 retour calme",
    ],
  };
}

function veloLong(duree: string, blocs: string): Session {
  return {
    sport: "VÉLO", titre: "Sortie longue", duree,
    lignes: [
      "45' Z2 mise en route · terrain progressif · cadence 85-92 rpm",
      blocs,
      "Z2 retour calme · ravitaillement: eau 20', gel ou barre à 45', 1h30 et 2h30",
    ],
  };
}

function veloActivation(note = ""): Session {
  return {
    sport: "VÉLO", titre: "Activation légère", duree: "45'",
    lignes: [
      `45' Z2 facile${note ? " · " + note : ""}`,
      "Pas de blocs · terrain plat de préférence",
    ],
  };
}

function capZ2(duree: string, allure = "~6'45-7'15/km"): Session {
  return {
    sport: "CAP", titre: "Endurance Z2", duree,
    lignes: [
      "10' activation: marche vive + 4×30\" foulées légères",
      `Corps Z2 régulier · 65-75% FCmax · allure ${allure} · conversation fluide`,
      "5' retour calme en marchant · foulée légère, appui médio-pied",
    ],
  };
}

function capSeuil(serie = "4×8' Z4", echauff = "15'", cd = "10'"): Session {
  return {
    sport: "CAP", titre: "Seuil Z4", duree: "1h00",
    lignes: [
      `${echauff}' Z2 échauffement · foulées progressives`,
      `${serie} · 82-89% FCmax · récup 2' trot Z1 entre chaque · rythme tenu, respiration contrôlée`,
      `${cd}' Z2 retour calme`,
    ],
  };
}

function capLong(duree: string, detail: string): Session {
  return {
    sport: "CAP", titre: "Sortie longue", duree,
    lignes: [detail, "Foulée économique · hydratation toutes les 20' · tester gel si sortie >1h30"],
  };
}

function capProgressive(duree: string, detail: string): Session {
  return {
    sport: "CAP", titre: "Endurance progressive", duree,
    lignes: [detail, "Ne pas forcer la progression · elle doit venir naturellement"],
  };
}

function renfoGainage(): Session {
  return {
    sport: "RENFO", titre: "Gainage & bas du corps", duree: "30'",
    lignes: [
      "3×45\" planche frontale · récup 30\" | 3×30\"/côté planche latérale · récup 30\"",
      "3×15 pont fessier + extension jambe alternée · récup 30\"",
      "3×12 fentes alternées · 2×10 pompes lentes · récup 45\" entre séries",
    ],
  };
}

function renfoPPG(): Session {
  return {
    sport: "RENFO", titre: "PPG bas du corps", duree: "30'",
    lignes: [
      "3×15 squat goblet (KB ou haltères) · récup 45\" | 3×12 fentes marchées",
      "3×15 élévation de bassin unilatérale · 3×12 soulevé de terre jambe unique",
      "3×20 mollets (sur marche) · 2×45\" gainage frontal en fin",
    ],
  };
}

function renfoLeger(): Session {
  return {
    sport: "RENFO", titre: "Gainage léger", duree: "20'",
    lignes: [
      "2×45\" planche frontale · 2×30\" planche latérale",
      "2×15 pont fessier · 2×10 fentes · 2×10 pompes",
    ],
  };
}

function brickCourt(veloDur: string, capDur: string, veloBloc: string): Session {
  return {
    sport: "BRICK", titre: `Brick vélo ${veloDur} -> course ${capDur}`, duree: `${veloDur} + ${capDur}`,
    lignes: [
      `Vélo ${veloDur}: ${veloBloc}`,
      `T2 < 2' · enfiler baskets sans arrêt complet · penser à la transition`,
      `Course ${capDur}: démarrer Z2 (jambes lourdes = normal) · viser allure 70.3 à partir de 5'`,
    ],
  };
}

function brickLong(veloDur: string, capDur: string, veloDetail: string, capDetail: string): Session {
  return {
    sport: "BRICK", titre: `Brick long vélo ${veloDur} -> course ${capDur}`, duree: `${veloDur} + ${capDur}`,
    lignes: [
      `Vélo ${veloDur}: ${veloDetail}`,
      `T2 chronométrée · objectif progressif < 1'30\" · transition complète`,
      `Course ${capDur}: ${capDetail}`,
    ],
  };
}

// ??? Semaines de récupération helpers ????????????????????????????????????????

function semaineRecupB1(label: string, dates: string): Semaine {
  return {
    label, dates, volume: "6h00", recuperation: true,
    jours: [
      { nom: "Lun", seances: [REPOS] },
      { nom: "Mar", seances: [natLegere("~1 000m")] },
      { nom: "Mer", seances: [veloZ2("45'", "très facile Z1"), { sport: "RENFO", titre: "Mobilité", duree: "20'", lignes: ["Foam roller global 10' · étirements doux hanches, ischios, épaules 10'"] }] },
      { nom: "Jeu", seances: [{ sport: "CAP", titre: "Footing léger Z1-Z2", duree: "45'", lignes: ["45' Z1-Z2 très confortable · allure ~7'30-8'/km · pas d'objectif chrono"] }] },
      { nom: "Ven", seances: [REPOS] },
      { nom: "Sam", seances: [veloZ2("1h30", "terrain plat · sortie détendue")] },
      { nom: "Dim", seances: [capZ2("1h00", "~7'/km")] },
    ],
  };
}

function semaineRecupB2(label: string, dates: string): Semaine {
  return {
    label, dates, volume: "7h00", recuperation: true,
    jours: [
      { nom: "Lun", seances: [REPOS] },
      { nom: "Mar", seances: [natLegere("~1 200m")] },
      { nom: "Mer", seances: [veloZ2("1h00", "facile Z2"), renfoLeger()] },
      { nom: "Jeu", seances: [capZ2("45'", "~7'30/km")] },
      { nom: "Ven", seances: [REPOS] },
      { nom: "Sam", seances: [veloZ2("1h30")] },
      { nom: "Dim", seances: [capZ2("1h15")] },
    ],
  };
}

// ??? Blocs data ???????????????????????????????????????????????????????????????

const blocs: BlocData[] = [

  // ?? BLOC 1 · S1-S4 · Fondations Phase 1 ????????????????????????????????????
  {
    id: 1, phase: "Fondations & technique — Phase 1", dates: "21 sept – 19 oct 2026",
    volumeRange: "9h -> 10h | S4 récup 6h",
    focus: "Base aérobie Z2 pure et technique de nage. Aucune séance à haute intensité. Installer les gestes (rotation, catch, respiration bilatérale) pendant que le volume est encore léger.",
    semaines: [
      {
        label: "S1", dates: "21 – 27 sept", volume: "9h00",
        jours: [
          { nom: "Lun", seances: [REPOS] },
          { nom: "Mar", seances: [natTech()] },
          { nom: "Mer", seances: [veloZ2("1h00"), renfoGainage()] },
          { nom: "Jeu", seances: [capZ2("1h00")] },
          { nom: "Ven", seances: [natEndTech()] },
          { nom: "Sam", seances: [veloLong("2h15", "Sortie continue Z2 · terrain roulant · garder Z2 tout le long · cadence 85-95 rpm")] },
          { nom: "Dim", seances: [capProgressive("1h30", "10' activation · 1h Z2 · 20' légèrement progressif (Z2+) · retour calme"), renfoPPG()] },
        ],
      },
      {
        label: "S2", dates: "28 sept – 4 oct", volume: "9h30",
        jours: [
          { nom: "Lun", seances: [REPOS] },
          { nom: "Mar", seances: [natTech("~1 900m")] },
          { nom: "Mer", seances: [veloZ2("1h00", "2×10' terrain légèrement vallonné (rester en Z2)"), renfoGainage()] },
          { nom: "Jeu", seances: [capZ2("1h00")] },
          { nom: "Ven", seances: [natEndTech("~2 500m")] },
          { nom: "Sam", seances: [veloLong("2h20", "Sortie Z2 · 2×10' terrain légèrement vallonné (rester en Z2, pas de forçage) · Z2 retour")] },
          { nom: "Dim", seances: [capProgressive("1h45", "10' activation · 1h Z2 · 25' progressif Z2 -> Z2 soutenu · 10' retour"), renfoPPG()] },
        ],
      },
      {
        label: "S3", dates: "5 – 11 oct", volume: "10h00",
        jours: [
          { nom: "Lun", seances: [REPOS] },
          { nom: "Mar", seances: [natTech("~2 000m")] },
          { nom: "Mer", seances: [veloZ2("1h00", "2×15' Z2 soutenu (haut de Z2)"), renfoGainage()] },
          { nom: "Jeu", seances: [capZ2("1h00")] },
          { nom: "Ven", seances: [natEndTech("~2 600m")] },
          { nom: "Sam", seances: [veloLong("2h30", "1h Z2 plat · 2×15' Z2 soutenu (haut de Z2, jamais sweet-spot) · Z2 retour")] },
          { nom: "Dim", seances: [capProgressive("2h00", "10' activation · 1h Z2 · 30' progressif Z2 -> Z3 bas · 20' retour Z2"), renfoPPG()] },
        ],
      },
      semaineRecupB1("S4", "12 – 19 oct"),
    ],
  },

  // ?? BLOC 2 · S5-S8 · Fondations Phase 2 ????????????????????????????????????
  {
    id: 2, phase: "Fondations & technique — Phase 2", dates: "20 oct – 16 nov 2026",
    volumeRange: "10h -> 11h | S8 récup 7h",
    focus: "Volume aérobie en hausse · consolidation technique nage · premières montées plus longues à vélo (toujours Z2) · course longue qui dépasse 2h.",
    semaines: [
      {
        label: "S5", dates: "20 – 26 oct", volume: "10h00",
        jours: [
          { nom: "Lun", seances: [REPOS] },
          { nom: "Mar", seances: [natTech("~2 000m")] },
          { nom: "Mer", seances: [veloZ2("1h15"), renfoGainage()] },
          { nom: "Jeu", seances: [capZ2("1h00")] },
          { nom: "Ven", seances: [natEndTech("~2 600m")] },
          { nom: "Sam", seances: [veloLong("2h30", "Sortie Z2 continue · terrain légèrement vallonné · garder Z2 constant")] },
          { nom: "Dim", seances: [capProgressive("1h45", "15' activation · 1h Z2 · 20' progressif · 10' retour"), renfoPPG()] },
        ],
      },
      {
        label: "S6", dates: "27 oct – 2 nov", volume: "10h30",
        jours: [
          { nom: "Lun", seances: [REPOS] },
          { nom: "Mar", seances: [natTech("~2 100m")] },
          { nom: "Mer", seances: [veloZ2("1h15", "2×10' terrain légèrement soutenu Z2+"), renfoGainage()] },
          { nom: "Jeu", seances: [capZ2("1h00")] },
          { nom: "Ven", seances: [natEndTech("~2 700m")] },
          { nom: "Sam", seances: [veloLong("2h45", "45' Z2 · 2×15' terrain vallonné Z2 soutenu · Z2 retour")] },
          { nom: "Dim", seances: [capProgressive("2h00", "15' activation · 1h15 Z2 · 25' progressif Z2 -> Z3 bas · 10' retour"), renfoPPG()] },
        ],
      },
      {
        label: "S7", dates: "3 – 9 nov", volume: "11h00",
        jours: [
          { nom: "Lun", seances: [REPOS] },
          { nom: "Mar", seances: [natTech("~2 200m")] },
          { nom: "Mer", seances: [veloZ2("1h15", "2×15' Z2 soutenu sur terrain varié"), renfoGainage()] },
          { nom: "Jeu", seances: [capZ2("1h15", "~6'30-7'/km")] },
          { nom: "Ven", seances: [natEndTech("~2 800m")] },
          { nom: "Sam", seances: [veloLong("3h00", "1h Z2 · 2×20' Z2 soutenu terrain varié · Z2 retour")] },
          { nom: "Dim", seances: [capProgressive("2h00", "15' activation · 1h20 Z2 · 25' progressif · 10' retour Z2"), renfoPPG()] },
        ],
      },
      semaineRecupB2("S8", "10 – 16 nov"),
    ],
  },

  // ?? BLOC 3 · S9-S12 · Transition Fondations -> Base ?????????????????????????
  {
    id: 3, phase: "Transition Fondations -> Base", dates: "17 nov – 14 déc 2026",
    volumeRange: "11h -> 12h | S12 récup 7h30",
    focus: "Introduction du sweet-spot vélo (88-93% FTP) et du seuil nage (CSS). Premières allures tempo en course. Premier brick très court (vélo 1h -> course 15') en S11.",
    semaines: [
      {
        label: "S9", dates: "17 – 23 nov", volume: "11h00",
        jours: [
          { nom: "Lun", seances: [REPOS] },
          { nom: "Mar", seances: [natSeuil("8×100m @ CSS · récup 15\"", "~2 000m")] },
          { nom: "Mer", seances: [veloSweetspot("3×10'", "4'"), renfoLeger()] },
          { nom: "Jeu", seances: [capZ2("1h00")] },
          { nom: "Ven", seances: [natEndTech("~2 800m")] },
          { nom: "Sam", seances: [veloLong("3h00", "45' Z2 · 2×20' allure 70.3 Z3 (75-80% FTP) · récup 5' · Z2 retour")] },
          { nom: "Dim", seances: [capProgressive("1h45", "15' activation · 1h Z2 · 20' allure tempo Z3 bas · 10' retour"), renfoLeger()] },
        ],
      },
      {
        label: "S10", dates: "24 – 30 nov", volume: "11h30",
        jours: [
          { nom: "Lun", seances: [REPOS] },
          { nom: "Mar", seances: [natSeuil("10×100m @ CSS · récup 15\"", "~2 200m")] },
          { nom: "Mer", seances: [veloSweetspot("3×12'", "4'"), renfoLeger()] },
          { nom: "Jeu", seances: [capSeuil("3×8' Z4")] },
          { nom: "Ven", seances: [natEndTech("~3 000m")] },
          { nom: "Sam", seances: [veloLong("3h00", "45' Z2 · 3×15' allure 70.3 Z3 · récup 5' · Z2 retour")] },
          { nom: "Dim", seances: [capProgressive("2h00", "15' activation · 1h15 Z2 · 25' allure tempo · 10' retour"), renfoLeger()] },
        ],
      },
      {
        label: "S11", dates: "1 – 7 déc", volume: "12h00",
        jours: [
          { nom: "Lun", seances: [REPOS] },
          { nom: "Mar", seances: [natSeuil("5×200m @ CSS+5\" · récup 30\"", "~2 400m")] },
          { nom: "Mer", seances: [veloSweetspot("3×15'", "4'"), renfoLeger()] },
          { nom: "Jeu", seances: [capSeuil("4×8' Z4")] },
          { nom: "Ven", seances: [natEndTech("~3 000m")] },
          { nom: "Sam", seances: [brickCourt("1h00", "15'", "10' Z2 · 40' allure 70.3 Z3 · 10' Z2 — 1er brick !")] },
          { nom: "Dim", seances: [capProgressive("2h00", "15' activation · 1h20 Z2 · 25' allure tempo · 10' retour"), renfoPPG()] },
        ],
      },
      {
        label: "S12", dates: "8 – 14 déc", volume: "7h30", recuperation: true,
        jours: [
          { nom: "Lun", seances: [REPOS] },
          { nom: "Mar", seances: [natLegere("~1 200m")] },
          { nom: "Mer", seances: [veloZ2("1h00"), renfoLeger()] },
          { nom: "Jeu", seances: [capZ2("45'", "~7'/km")] },
          { nom: "Ven", seances: [REPOS] },
          { nom: "Sam", seances: [veloZ2("1h45", "détendue Z2 facile")] },
          { nom: "Dim", seances: [capZ2("1h15")] },
        ],
      },
    ],
  },

  // ?? BLOC 4 · S13-S16 · Base Volume ?????????????????????????????????????????
  {
    id: 4, phase: "Base / Volume", dates: "15 déc 2026 – 11 jan 2027",
    volumeRange: "12h30 -> 13h30 | S16 récup 8h",
    focus: "Sweet-spot vélo consolidé (3-4×12-15'). Seuil natation 10×100m ou 5-6×200m @ CSS. Seuil course 4-5×8' Z4. Brick (vélo 1h15 -> course 20') en S15.",
    semaines: [
      {
        label: "S13", dates: "15 – 21 déc", volume: "12h30",
        jours: [
          { nom: "Lun", seances: [veloRecup()] },
          { nom: "Mar", seances: [natSeuil("10×100m @ CSS · récup 15\"", "~2 200m")] },
          { nom: "Mer", seances: [veloSweetspot("3×12' 88-93% FTP", "4'"), renfoLeger()] },
          { nom: "Jeu", seances: [capSeuil("4×8' Z4", "15'", "10'")] },
          { nom: "Ven", seances: [natEndTech("~3 000m")] },
          { nom: "Sam", seances: [veloLong("3h00", "45' Z2 · 2×25' allure 70.3 Z3 · récup 5' · Z2 retour")] },
          { nom: "Dim", seances: [capLong("1h30", "15' activation · 1h Z2 · 15' allure 70.3 Z3 bas · 10' retour"), renfoLeger()] },
        ],
      },
      {
        label: "S14", dates: "22 – 28 déc", volume: "13h00",
        jours: [
          { nom: "Lun", seances: [veloRecup()] },
          { nom: "Mar", seances: [natSeuil("4×(3×100m @ CSS · récup 15\") · 2' entre blocs", "~2 400m")] },
          { nom: "Mer", seances: [veloSweetspot("3×15'", "4'"), renfoLeger()] },
          { nom: "Jeu", seances: [capSeuil("5×7' Z4", "15'", "10'")] },
          { nom: "Ven", seances: [natEndTech("~3 200m")] },
          { nom: "Sam", seances: [veloLong("3h15", "45' Z2 · 3×20' allure 70.3 Z3 · récup 5' · Z2 retour")] },
          { nom: "Dim", seances: [capLong("1h45", "15' activation · 1h15 Z2 · 20' allure 70.3 Z3 bas · 10' retour"), renfoLeger()] },
        ],
      },
      {
        label: "S15", dates: "29 déc – 4 jan", volume: "13h30",
        jours: [
          { nom: "Lun", seances: [veloRecup()] },
          { nom: "Mar", seances: [natSeuil("6×200m @ CSS+5\" · récup 30\"", "~2 600m")] },
          { nom: "Mer", seances: [veloSweetspot("4×12'", "3'30\""), renfoLeger()] },
          { nom: "Jeu", seances: [capSeuil("4×10' Z4", "15'", "10'")] },
          { nom: "Ven", seances: [natEndTech("~3 200m")] },
          { nom: "Sam", seances: [brickCourt("1h15", "20'", "10' Z2 · 55' allure 70.3 Z3 · 10' Z2")] },
          { nom: "Dim", seances: [capLong("2h00", "15' activation · 1h20 Z2 · 20' allure 70.3 · 10' retour"), renfoPPG()] },
        ],
      },
      {
        label: "S16", dates: "5 – 11 jan", volume: "8h00", recuperation: true,
        jours: [
          { nom: "Lun", seances: [REPOS] },
          { nom: "Mar", seances: [{ sport: "NAT", titre: "Technique facile", duree: "45'", lignes: ["400m éch · 6×100m allure facile Z2 · 4×50m éducatifs · 200m CD · Total ~1 400m"] }] },
          { nom: "Mer", seances: [veloZ2("1h15", "facile Z2"), renfoLeger()] },
          { nom: "Jeu", seances: [capZ2("1h00")] },
          { nom: "Ven", seances: [REPOS] },
          { nom: "Sam", seances: [veloZ2("1h45")] },
          { nom: "Dim", seances: [capZ2("1h15")] },
        ],
      },
    ],
  },

  // ?? BLOC 5 · S17-S20 · Base -> Build ?????????????????????????????????????????
  {
    id: 5, phase: "Base -> Build spécifique", dates: "12 jan – 8 fév 2027",
    volumeRange: "14h -> 15h | S20 récup 9h",
    focus: "Brick hebdomadaire le jeudi (vélo 1h + course 20'). Sortie vélo longue monte à 3h30-3h45. Course longue 1h45-2h. Introduction Z4 vélo (seuil).",
    semaines: [
      {
        label: "S17", dates: "12 – 18 jan", volume: "14h00",
        jours: [
          { nom: "Lun", seances: [natRecup()] },
          { nom: "Mar", seances: [natSeuil("10×100m @ CSS · récup 15\"", "~2 400m")] },
          { nom: "Mer", seances: [veloSweetspot("3×15' 88-93% FTP", "4'"), renfoLeger()] },
          { nom: "Jeu", seances: [brickCourt("1h00", "20'", "10' Z2 · 40' allure 70.3 Z3 · 10' Z2")] },
          { nom: "Ven", seances: [natEndSpec("~2 600m")] },
          { nom: "Sam", seances: [veloLong("3h30", "45' Z2 · 3×20' allure 70.3 Z3 · récup 5' · Z2 retour")] },
          { nom: "Dim", seances: [capLong("1h45", "15' activation · 1h15 Z2 · 20' allure 70.3 · 10' retour"), renfoLeger()] },
        ],
      },
      {
        label: "S18", dates: "19 – 25 jan", volume: "14h30",
        jours: [
          { nom: "Lun", seances: [natRecup()] },
          { nom: "Mar", seances: [natSeuil("5×200m @ CSS+5\" · récup 30\"", "~2 400m")] },
          { nom: "Mer", seances: [veloSweetspot("4×12'", "3'30\""), renfoLeger()] },
          { nom: "Jeu", seances: [brickCourt("1h00", "20'", "10' Z2 · 40' allure 70.3 · 10' Z2")] },
          { nom: "Ven", seances: [natEndSpec("~2 800m")] },
          { nom: "Sam", seances: [veloLong("3h30", "45' Z2 · 4×15' allure 70.3 Z3 · récup 5' · Z2 retour")] },
          { nom: "Dim", seances: [capLong("2h00", "15' activation · 1h30 Z2 · 20' allure 70.3 · 10' retour"), renfoLeger()] },
        ],
      },
      {
        label: "S19", dates: "26 jan – 1er fév", volume: "15h00",
        jours: [
          { nom: "Lun", seances: [natRecup()] },
          { nom: "Mar", seances: [natSeuil("3×(4×100m @ CSS · récup 15\") · 2' entre blocs", "~2 600m")] },
          { nom: "Mer", seances: [veloSeuil("3×10'"), renfoLeger()] },
          { nom: "Jeu", seances: [brickCourt("1h15", "20'", "10' Z2 · 55' allure 70.3 · 10' Z2")] },
          { nom: "Ven", seances: [natEndSpec("~3 000m")] },
          { nom: "Sam", seances: [veloLong("3h45", "45' Z2 · 3×25' allure 70.3 Z3 · récup 5' · Z2 retour")] },
          { nom: "Dim", seances: [capLong("2h00", "15' activation · 1h30 Z2 · 20' allure 70.3 · 10' retour"), renfoPPG()] },
        ],
      },
      {
        label: "S20", dates: "2 – 8 fév", volume: "9h00", recuperation: true,
        jours: [
          { nom: "Lun", seances: [REPOS] },
          { nom: "Mar", seances: [{ sport: "NAT", titre: "Technique facile", duree: "45'", lignes: ["400m éch · 6×100m facile Z2 · 4×50m éducatifs · 200m CD · Total ~1 400m"] }] },
          { nom: "Mer", seances: [veloZ2("1h15"), renfoLeger()] },
          { nom: "Jeu", seances: [capZ2("1h00")] },
          { nom: "Ven", seances: [REPOS] },
          { nom: "Sam", seances: [veloZ2("2h00", "facile · pas de blocs d'intensité")] },
          { nom: "Dim", seances: [capZ2("1h15")] },
        ],
      },
    ],
  },

  // ?? BLOC 6 · S21-S24 · Build Spécifique + Course Test ??????????????????????
  {
    id: 6, phase: "Build spécifique + Course Test", dates: "9 fév – 8 mars 2027",
    volumeRange: "15h -> 16h | S24 récup 9h + course test",
    focus: "Allure 70.3 sur chaque discipline. Brick long (vélo 3h -> course 40') toutes les 2 semaines. Course test sprint ou M en S24 pour valider matériel, transitions et nutrition.",
    semaines: [
      {
        label: "S21", dates: "9 – 15 fév", volume: "15h00",
        jours: [
          { nom: "Lun", seances: [natRecup()] },
          { nom: "Mar", seances: [natSeuil("6×200m @ CSS+5\" · récup 20\"", "~2 800m")] },
          { nom: "Mer", seances: [veloSeuil("3×12'"), renfoLeger()] },
          { nom: "Jeu", seances: [brickCourt("1h15", "25'", "10' Z2 · 55' allure 70.3 Z3 · 10' Z2")] },
          { nom: "Ven", seances: [natEndSpec("~3 000m")] },
          { nom: "Sam", seances: [brickLong("3h00", "40'", "45' Z2 · 2×30' allure 70.3 · blocs de 30' · 15' CD", "15' Z2 (jambes de bois) -> 20' allure 70.3 -> 5' retour")] },
          { nom: "Dim", seances: [capZ2("1h00", "récup active post-brick")] },
        ],
      },
      {
        label: "S22", dates: "16 – 22 fév", volume: "15h30",
        jours: [
          { nom: "Lun", seances: [natRecup()] },
          { nom: "Mar", seances: [natSeuil("3×(4×100m @ CSS · récup 15\") · 2' entre blocs", "~2 800m")] },
          { nom: "Mer", seances: [veloSeuil("4×10'"), renfoLeger()] },
          { nom: "Jeu", seances: [brickCourt("1h15", "25'", "10' Z2 · 55' allure 70.3 · 10' Z2")] },
          { nom: "Ven", seances: [natEndSpec("~3 000m")] },
          { nom: "Sam", seances: [veloLong("3h30", "45' Z2 · 3×30' allure 70.3 Z3 · récup 5' · Z2 retour")] },
          { nom: "Dim", seances: [capLong("2h00", "15' activation · 1h30 Z2 · 20' allure 70.3 · 10' retour"), renfoLeger()] },
        ],
      },
      {
        label: "S23", dates: "23 fév – 1er mars", volume: "16h00",
        jours: [
          { nom: "Lun", seances: [natRecup()] },
          { nom: "Mar", seances: [natLong("4×600m @ allure cible 70.3 · récup 45\"", "~3 200m")] },
          { nom: "Mer", seances: [veloSeuil("4×12'"), renfoLeger()] },
          { nom: "Jeu", seances: [brickCourt("1h30", "30'", "15' Z2 · 1h allure 70.3 · 15' Z2")] },
          { nom: "Ven", seances: [natEndSpec("~3 000m")] },
          { nom: "Sam", seances: [brickLong("3h30", "45'", "45' Z2 · 2h15 allure 70.3 · 15' CD · ravitaillement identique J-course", "15' Z2 -> 25' allure 70.3 -> 5' Z2 retour · T2 < 1'30\"")] },
          { nom: "Dim", seances: [capZ2("1h00", "récup post-brick")] },
        ],
      },
      {
        label: "S24", dates: "2 – 8 mars", volume: "9h + course test", recuperation: true,
        jours: [
          { nom: "Lun", seances: [REPOS] },
          { nom: "Mar", seances: [{ sport: "NAT", titre: "Activation pré-course", duree: "45'", lignes: ["400m éch · 8×100m @ allure 70.3 facile · 4×50m éducatifs · 200m CD · Total ~1 600m"] }] },
          { nom: "Mer", seances: [veloActivation("2×3' @ allure 70.3 · garder les jambes réactives"), renfoLeger()] },
          { nom: "Jeu", seances: [{ sport: "CAP", titre: "Activation légère", duree: "30'", lignes: ["30' Z1-Z2 facile · 4×30\" strides @ allure course · 5' marche retour"] }] },
          { nom: "Ven", seances: [{ sport: "NAT", titre: "Activation pré-course", duree: "20'", lignes: ["500m très facile · test combinaison · reconnaissance zone nage si possible"] }] },
          { nom: "Sam", seances: [REPOS] },
          { nom: "Dim", seances: [{ sport: "BRICK", titre: "COURSE TEST — Sprint ou M", duree: "~2-3h", lignes: ["Triathlon sprint ou M · validation matériel, transitions T1/T2, allures", "Tester stratégie nutrition exacte (gels, barres, eau) · noter sensations et temps de transitions", "Objectif: apprendre et valider · pas de performance max · gestion pacing"] }] },
        ],
      },
    ],
  },

  // ?? BLOC 7 · S25-S28 · Build Intensification ???????????????????????????????
  {
    id: 7, phase: "Build spécifique — intensification", dates: "9 mars – 5 avr 2027",
    volumeRange: "15h30 -> 16h30 | S28 récup 10h",
    focus: "Pic de volume vélo (4h en S26-S27). Course longue 2h. Bricks longs chaque semaine. Allure 70.3 bien consolidée sur chaque discipline.",
    semaines: [
      {
        label: "S25", dates: "9 – 15 mars", volume: "15h30",
        jours: [
          { nom: "Lun", seances: [natRecup("~700m — récup après course test")] },
          { nom: "Mar", seances: [natSeuil("8×200m @ CSS · récup 20\"", "~3 000m")] },
          { nom: "Mer", seances: [veloSeuil("4×12'"), renfoLeger()] },
          { nom: "Jeu", seances: [brickCourt("1h30", "30'", "15' Z2 · 1h allure 70.3 · 15' Z2")] },
          { nom: "Ven", seances: [natEndSpec("~3 000m")] },
          { nom: "Sam", seances: [brickLong("3h30", "45'", "45' Z2 · 2h15 allure 70.3 · 15' CD · tester nutrition J-course", "15' Z2 -> 25' allure 70.3 -> 5' retour · T2 < 1'30\"")] },
          { nom: "Dim", seances: [capZ2("1h15", "récup active post-brick")] },
        ],
      },
      {
        label: "S26", dates: "16 – 22 mars", volume: "16h00",
        jours: [
          { nom: "Lun", seances: [natRecup()] },
          { nom: "Mar", seances: [natLong("4×700m @ allure 70.3 · récup 45\"", "~3 400m")] },
          { nom: "Mer", seances: [veloSeuil("5×10'"), renfoLeger()] },
          { nom: "Jeu", seances: [brickCourt("1h30", "30'", "15' Z2 · 1h allure 70.3 · 15' Z2")] },
          { nom: "Ven", seances: [natEndSpec("~3 200m")] },
          { nom: "Sam", seances: [veloLong("4h00", "45' Z2 · 3×30' allure 70.3 Z3 · récup 5' · Z2 retour · ravitaillement toutes les 45'")] },
          { nom: "Dim", seances: [capLong("2h00", "15' activation · 1h30 Z2 · 20' allure 70.3 · 10' retour"), renfoLeger()] },
        ],
      },
      {
        label: "S27", dates: "23 – 29 mars", volume: "16h30",
        jours: [
          { nom: "Lun", seances: [natRecup()] },
          { nom: "Mar", seances: [natLong("5×600m @ allure 70.3 · récup 40\"", "~3 600m")] },
          { nom: "Mer", seances: [veloSeuil("5×12'"), renfoLeger()] },
          { nom: "Jeu", seances: [brickCourt("1h30", "30'", "15' Z2 · 1h allure 70.3 · 15' Z2")] },
          { nom: "Ven", seances: [natEndSpec("~3 200m")] },
          { nom: "Sam", seances: [brickLong("4h00", "45'", "45' Z2 · 2h45 allure 70.3 · 15' CD · ravitaillement J-course exact", "15' Z2 -> 25' allure 70.3 -> 5' retour · T2 < 1'30\"")] },
          { nom: "Dim", seances: [capZ2("1h15", "récup active")] },
        ],
      },
      {
        label: "S28", dates: "30 mars – 5 avr", volume: "10h00", recuperation: true,
        jours: [
          { nom: "Lun", seances: [REPOS] },
          { nom: "Mar", seances: [{ sport: "NAT", titre: "Technique facile", duree: "45'", lignes: ["400m éch · 8×100m allure confort Z2 · 4×50m éducatifs · 200m CD · Total ~1 600m"] }] },
          { nom: "Mer", seances: [veloZ2("1h30"), renfoLeger()] },
          { nom: "Jeu", seances: [capZ2("1h00")] },
          { nom: "Ven", seances: [REPOS] },
          { nom: "Sam", seances: [veloZ2("2h00")] },
          { nom: "Dim", seances: [capZ2("1h30")] },
        ],
      },
    ],
  },

  // ?? BLOC 8 · S29-S32 · Pic + Affûtage Phase 1 ??????????????????????????????
  {
    id: 8, phase: "Pic de charge + Affûtage Phase 1", dates: "6 avr – 3 mai 2027",
    volumeRange: "17h (pic S29-30) -> 12h (-30%) ? 9h (-45%)",
    focus: "Deux semaines de pic maximum avec dernières grandes sorties. Puis réduction progressive: -30% en S31 (intensité maintenue), -45% en S32 (séances raccourcies). Commencer à valider la liste matériel.",
    semaines: [
      {
        label: "S29", dates: "6 – 12 avr", volume: "17h00",
        jours: [
          { nom: "Lun", seances: [natRecup()] },
          { nom: "Mar", seances: [natLong("5×700m @ allure 70.3 · récup 40\"", "~3 800m")] },
          { nom: "Mer", seances: [veloSeuil("5×12'"), renfoLeger()] },
          { nom: "Jeu", seances: [brickCourt("1h30", "30'", "15' Z2 · 1h allure 70.3 · 15' Z2")] },
          { nom: "Ven", seances: [natEndSpec("~3 200m")] },
          { nom: "Sam", seances: [brickLong("4h00", "45'", "45' Z2 · 3h allure 70.3 · 15' CD · TESTER nutrition et hydratation J-course exactes", "15' Z2 -> 25' allure 70.3 -> 5' retour · T2 < 1'30\"")] },
          { nom: "Dim", seances: [capLong("2h00", "15' activation · 1h30 Z2 · 20' allure 70.3 · 10' retour"), renfoLeger()] },
        ],
      },
      {
        label: "S30", dates: "13 – 19 avr", volume: "17h00",
        jours: [
          { nom: "Lun", seances: [natRecup()] },
          { nom: "Mar", seances: [natLong("2×1 900m continu @ allure 70.3 · récup 1'30\" — simulation distance course", "~4 200m")] },
          { nom: "Mer", seances: [veloSeuil("4×12'"), renfoLeger()] },
          { nom: "Jeu", seances: [brickCourt("1h30", "30'", "15' Z2 · 1h allure 70.3 · 15' Z2")] },
          { nom: "Ven", seances: [natEndSpec("~3 200m")] },
          { nom: "Sam", seances: [veloLong("4h00", "45' Z2 · 3×35' allure 70.3 · récup 5' · Z2 retour — dernière grande sortie vélo")] },
          { nom: "Dim", seances: [capLong("2h00", "15' activation · 1h30 Z2 · 20' allure 70.3 · 10' retour — dernière longue course"), renfoPPG()] },
        ],
      },
      {
        label: "S31", dates: "20 – 26 avr", volume: "12h00",
        jours: [
          { nom: "Lun", seances: [REPOS] },
          { nom: "Mar", seances: [{ sport: "NAT", titre: "Allure 70.3 courte", duree: "45'", lignes: ["400m éch · 5×300m @ allure 70.3 · récup 30\" · 200m CD · Total ~2 100m · Fraîcheur > Volume"] }] },
          { nom: "Mer", seances: [veloSweetspot("2×12' sweet-spot court", "4'"), renfoLeger()] },
          { nom: "Jeu", seances: [{ sport: "CAP", titre: "Seuil court -30%", duree: "50'", lignes: ["15' Z2 · 3×8' Z4 · récup 2' · 10' Z2 · maintien intensité, baisse volume"] }] },
          { nom: "Ven", seances: [{ sport: "NAT", titre: "Endurance courte", duree: "45'", lignes: ["400m éch · 6×200m @ allure 70.3 · récup 20\" · 200m CD · Total ~2 000m"] }] },
          { nom: "Sam", seances: [veloLong("2h45", "45' Z2 · 2×20' allure 70.3 · récup 5' · Z2 retour — -30% vs pic")] },
          { nom: "Dim", seances: [capLong("1h30", "10' activation · 1h Z2 · 20' allure 70.3 · retour — -25% vs pic")] },
        ],
      },
      {
        label: "S32", dates: "27 avr – 3 mai", volume: "9h00",
        jours: [
          { nom: "Lun", seances: [REPOS] },
          { nom: "Mar", seances: [{ sport: "NAT", titre: "Réveil musculaire", duree: "40'", lignes: ["400m éch · 4×200m @ allure 70.3 · 200m CD · Total ~1 600m · Légèreté des bras"] }] },
          { nom: "Mer", seances: [{ sport: "VÉLO", titre: "Réveil musculaire", duree: "45'", lignes: ["10' Z1 · 2×8' sweet-spot · récup 3' · 10' Z2 · court et ciblé"] }, renfoLeger()] },
          { nom: "Jeu", seances: [{ sport: "CAP", titre: "Réveil musculaire", duree: "45'", lignes: ["15' Z2 · 3×6' Z4 · récup 2' · 10' Z2 · maintien réactivité neuromusculaire"] }] },
          { nom: "Ven", seances: [{ sport: "NAT", titre: "Technique courte", duree: "35'", lignes: ["300m éch · 4×200m @ allure 70.3 · 200m CD · Total ~1 400m"] }] },
          { nom: "Sam", seances: [veloLong("2h00", "45' Z2 · 2×15' allure 70.3 · récup 5' · Z2 retour — -50% vs pic")] },
          { nom: "Dim", seances: [capZ2("1h15", "~6'45/km · garder les jambes légères")] },
        ],
      },
    ],
  },

  // ?? AFFÛTAGE FINAL · S33-S34 ????????????????????????????????????????????????
  {
    id: 9, phase: "Affûtage final & Course", dates: "4 – 17 mai 2027",
    volumeRange: "S33: 6h (-65%) · S34: 5h + COURSE 16 mai",
    focus: "Fraîcheur maximale. Aucune fatigue accumulée. Réveils musculaires très courts sur les 3 sports. Logistique, sommeil, nutrition. Rien de nouveau le jour J.",
    semaines: [
      {
        label: "S33", dates: "4 – 10 mai", volume: "6h00",
        jours: [
          { nom: "Lun", seances: [REPOS] },
          { nom: "Mar", seances: [{ sport: "NAT", titre: "Réveil musculaire court", duree: "30'", lignes: ["300m éch · 3×200m @ allure 70.3 · 200m CD · Total ~1 200m · Focus: fluidité et glisse"] }] },
          { nom: "Mer", seances: [{ sport: "VÉLO", titre: "Activation courte", duree: "45'", lignes: ["10' Z1 · 1×10' allure 70.3 · 2×3' légèrement plus vif · 10' Z2 · garder la vivacité"] }, renfoLeger()] },
          { nom: "Jeu", seances: [{ sport: "CAP", titre: "Activation légère", duree: "40'", lignes: ["15' Z2 · 4×3' @ allure 70.3 · récup 90\" · 10' Z2 · Jambes réactives, pas fatiguées"] }] },
          { nom: "Ven", seances: [{ sport: "NAT", titre: "Très facile", duree: "25'", lignes: ["~800m total très facile · éducatifs · sensation de glisse · aucun effort"] }] },
          { nom: "Sam", seances: [{ sport: "VÉLO", titre: "Sortie légère + check matériel", duree: "1h00", lignes: ["45' Z2 très facile · contrôle vélo: transmission, pneus, cale-pieds, compteur", "5' course à pied pour test transition T1/T2 · vérifier équipement sac"] }] },
          { nom: "Dim", seances: [{ sport: "CAP", titre: "Footing facile", duree: "45'", lignes: ["45' Z2 très confortable · ~7'/km · focus: sommeil ce soir, hydratation++, repas testé"] }] },
        ],
      },
      {
        label: "S34", dates: "11 – 17 mai", volume: "5h + COURSE",
        jours: [
          { nom: "Lun", seances: [{ sport: "NAT", titre: "Entretien léger", duree: "30'", lignes: ["~1 000m · éducatifs + quelques 100m @ allure · légèreté totale · dernier effort nage"] }] },
          { nom: "Mar", seances: [{ sport: "VÉLO", titre: "Entretien léger", duree: "30'", lignes: ["30' Z1-Z2 · terrain plat · 2×2' allure 70.3 · garder les sensations de puissance"] }] },
          { nom: "Mer", seances: [{ sport: "CAP", titre: "Entretien léger", duree: "30'", lignes: ["30' Z2 facile · 4×20\" strides @ allure cible · 5' marche retour · dernier effort course"] }] },
          { nom: "Jeu", seances: [REPOS] },
          { nom: "Ven", seances: [{ sport: "REPOS", titre: "Repos + logistique", duree: "—", lignes: ["Préparation sacs transition T1 et T2 · liste de contrôle matériel · recognition parcours si possible · SOMMEIL++"] }] },
          { nom: "Sam", seances: [{ sport: "BRICK", titre: "Activations pré-course", duree: "20' total", lignes: ["Vélo 10' très facile · 2×1' allure course · Course 5' très facile · 2×30\" strides", "Nage 5' facile si bassin disponible · Focus: calme et visualisation du parcours"] }] },
          { nom: "Dim", seances: [{ sport: "BRICK", titre: "COURSE — 70.3 · 16 MAI 2027", duree: "~5-6h", lignes: ["Nage 1 900m · Vélo 90 km · Course 21,1 km · T1 + T2", "Partir conservateur sur le vélo · tenir l'allure cible en course", "Nutrition: plan validé à l'entraînement · rien de nouveau · PROFITER !"] }] },
        ],
      },
    ],
  },
];

// ??? Render helpers ???????????????????????????????????????????????????????????

const SPORT_TONES: Record<Sport, "neutral" | "info" | "success" | "warning" | "added" | "renamed"> = {
  NAT: "info", VÉLO: "success", CAP: "warning", RENFO: "renamed", BRICK: "added", REPOS: "neutral",
};

function SportBadge({ sport }: { sport: Sport }) {
  return <Pill tone={SPORT_TONES[sport]} size="sm">{sport}</Pill>;
}

interface WeekCardProps {
  s: Semaine;
  checked: Record<string, boolean>;
  onToggle: (key: string) => void;
}

function sessionKey(semaineLabel: string, jourNom: string, idx: number): string {
  return `${semaineLabel}__${jourNom}__${idx}`;
}

function WeekCard({ s, checked, onToggle }: WeekCardProps) {
  const totalSessions = s.jours.reduce((acc, j) => acc + j.seances.length, 0);
  const doneSessions = s.jours.reduce((acc, j) =>
    acc + j.seances.filter((_, si) => !!checked[sessionKey(s.label, j.nom, si)]).length, 0
  );
  const allDone = doneSessions === totalSessions;

  const rows = s.jours.flatMap((jour) =>
    jour.seances.map((sess, i) => {
      const key = sessionKey(s.label, jour.nom, i);
      const done = !!checked[key];
      return [
        <Checkbox checked={done} onChange={() => onToggle(key)} />,
        i === 0
          ? <Text size="small" weight="semibold" tone={done ? "tertiary" : "primary"}>{jour.nom}</Text>
          : <Text size="small" tone="tertiary" style={{ paddingLeft: 6 }}>+</Text>,
        <SportBadge sport={sess.sport} />,
        <Text size="small" weight="medium" tone={done ? "tertiary" : "primary"}
          style={{ textDecoration: done ? "line-through" : "none" }}>
          {sess.titre}
        </Text>,
        <Text size="small" tone="tertiary" style={{ whiteSpace: "nowrap" }}>{sess.duree}</Text>,
        <Stack gap={2}>
          {sess.lignes.map((l, li) => (
            <Text key={li} size="small" tone={done ? "quaternary" : "secondary"}>{l}</Text>
          ))}
        </Stack>,
      ];
    })
  );

  return (
    <Card collapsible defaultOpen={!s.recuperation}>
      <CardHeader trailing={
        <Row gap={8} align="center">
          <Text size="small" tone={allDone ? "secondary" : "tertiary"} weight={allDone ? "semibold" : "normal"}>
            {doneSessions}/{totalSessions} séances
          </Text>
          <Text size="small" tone="tertiary">{s.dates}</Text>
          <Pill size="sm" tone={s.recuperation ? "info" : allDone ? "success" : "neutral"} active={s.recuperation || allDone}>
            {s.recuperation ? "RÉCUPÉRATION" : allDone ? "Terminée !" : s.volume}
          </Pill>
        </Row>
      }>
        {s.label}{s.recuperation ? " — Semaine de récupération" : ` · ${s.volume}`}
      </CardHeader>
      <CardBody>
        {s.recuperation && (
          <Callout tone="info" title="Volume -40 à -50% · Intensité supprimée">
            Laisser les adaptations physiologiques se consolider. Réduire encore si fatigue persistante. Sommeil et nutrition au premier plan.
          </Callout>
        )}
        <Table
          headers={["", "Jour", "Sport", "Séance", "Durée", "Structure & détails de l'effort"]}
          rows={rows}
          columnAlign={["left", "left", "left", "left", "right", "left"]}
          striped
          style={{ marginTop: s.recuperation ? 12 : 0 }}
        />
      </CardBody>
    </Card>
  );
}

// ??? Main component ???????????????????????????????????????????????????????????

export default function Plan703() {
  const [blocId, setBlocId] = useState(1);
  const [checked, setChecked] = useCanvasState<Record<string, boolean>>("sessions-checked", {});
  const bloc = blocs.find((b) => b.id === blocId)!;

  function toggleSession(key: string) {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function resetBloc() {
    const keysToRemove = bloc.semaines.flatMap((s) =>
      s.jours.flatMap((j) => j.seances.map((_, si) => sessionKey(s.label, j.nom, si)))
    );
    setChecked((prev) => {
      const next = { ...prev };
      keysToRemove.forEach((k) => delete next[k]);
      return next;
    });
  }

  // Global progress across all 34 weeks
  const totalAll = blocs.reduce((a, b) => a + b.semaines.reduce((c, s) =>
    c + s.jours.reduce((d, j) => d + j.seances.length, 0), 0), 0);
  const doneAll = Object.values(checked).filter(Boolean).length;

  // Progress for current bloc
  const blocSessions = bloc.semaines.reduce((a, s) =>
    a + s.jours.reduce((b, j) => b + j.seances.length, 0), 0);
  const blocDone = bloc.semaines.reduce((a, s) =>
    a + s.jours.reduce((b, j) =>
      b + j.seances.filter((_, si) => !!checked[sessionKey(s.label, j.nom, si)]).length, 0), 0);

  return (
    <Stack gap={20} style={{ padding: 20, maxWidth: 1200 }}>

      {/* Header */}
      <Stack gap={4}>
        <H1>Préparation Half-Ironman 70.3 — Plan détaillé</H1>
        <Text tone="secondary">
          34 semaines · 21 septembre 2026 → 16 mai 2027 · 8 blocs de 4 semaines (3 build + 1 récup) + affûtage final
        </Text>
      </Stack>

      {/* Stats */}
      <Grid columns={4} gap={12}>
        <Stat value="34" label="Semaines totales" />
        <Stat value="~405h" label="Volume cumulé estimé" />
        <Stat value="17h" label="Semaines de pic (S29-30)" />
        <Stat value="16 mai 2027" label="Jour J" tone="info" />
      </Grid>

      {/* Progress global */}
      <Card variant="borderless">
        <CardBody>
          <Row gap={16} align="center" justify="space-between">
            <Stack gap={4}>
              <Text weight="semibold">Progression globale</Text>
              <Text size="small" tone="secondary">{doneAll} séances cochées sur {totalAll} au total</Text>
            </Stack>
            <Row gap={8} align="center">
              <Pill size="sm" tone="success" active={doneAll > 0}>
                {doneAll} / {totalAll}
              </Pill>
              <Text size="small" tone="tertiary">
                {totalAll > 0 ? Math.round((doneAll / totalAll) * 100) : 0}%
              </Text>
            </Row>
          </Row>
        </CardBody>
      </Card>

      {/* Légende sports */}
      <Row gap={8} wrap align="center">
        <Text size="small" tone="tertiary" weight="medium">Légende :</Text>
        {(["NAT", "VÉLO", "CAP", "RENFO", "BRICK", "REPOS"] as Sport[]).map((s) => (
          <Pill key={s} tone={SPORT_TONES[s]} size="sm">{s}</Pill>
        ))}
        <Text size="small" tone="tertiary"> · Z2 = 65-75% FCmax · Z3 = 75-82% · Z4 = 82-89% (seuil) · CSS = Critical Swim Speed</Text>
      </Row>

      <Divider />

      {/* Tab navigation */}
      <Row gap={8} wrap>
        {blocs.map((b) => (
          <Pill key={b.id} active={b.id === blocId} onClick={() => setBlocId(b.id)}>
            {b.id <= 8 ? `Bloc ${b.id}` : "Affûtage + Course"}
          </Pill>
        ))}
      </Row>

      {/* Bloc overview */}
      <Grid columns="1fr 2fr" gap={16} align="start">
        <Stack gap={10}>
          <H2>{bloc.id <= 8 ? `Bloc ${bloc.id} / 8` : "Affûtage final"}</H2>
          <Text weight="semibold">{bloc.phase}</Text>
          <Text tone="secondary" size="small">{bloc.dates}</Text>
          <Pill size="sm">{bloc.volumeRange}</Pill>
          <Row gap={8} align="center">
            <Text size="small" tone="secondary">{blocDone}/{blocSessions} séances ce bloc</Text>
            {blocDone > 0 && (
              <Pill size="sm" tone="neutral" onClick={resetBloc}>Remettre à zéro</Pill>
            )}
          </Row>
        </Stack>
        <Callout tone="neutral" title="Objectif du bloc">
          {bloc.focus}
        </Callout>
      </Grid>

      {/* Weeks */}
      <Stack gap={10}>
        {bloc.semaines.map((semaine) => (
          <WeekCard key={semaine.label} s={semaine} checked={checked} onToggle={toggleSession} />
        ))}
      </Stack>

    </Stack>
  );
}
