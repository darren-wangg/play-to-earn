export interface NbaTeam {
  name: string;
  abbrev: string;
  logo: string;
}

// Logo URLs from cdn.nba.com (official NBA CDN)
const NBA_TEAMS: Record<string, NbaTeam> = {
  "Atlanta Hawks": {
    name: "Atlanta Hawks",
    abbrev: "ATL",
    logo: "https://cdn.nba.com/logos/nba/1610612737/global/L/logo.svg",
  },
  "Boston Celtics": {
    name: "Boston Celtics",
    abbrev: "BOS",
    logo: "https://cdn.nba.com/logos/nba/1610612738/global/L/logo.svg",
  },
  "Brooklyn Nets": {
    name: "Brooklyn Nets",
    abbrev: "BKN",
    logo: "https://cdn.nba.com/logos/nba/1610612751/global/L/logo.svg",
  },
  "Charlotte Hornets": {
    name: "Charlotte Hornets",
    abbrev: "CHA",
    logo: "https://cdn.nba.com/logos/nba/1610612766/global/L/logo.svg",
  },
  "Chicago Bulls": {
    name: "Chicago Bulls",
    abbrev: "CHI",
    logo: "https://cdn.nba.com/logos/nba/1610612741/global/L/logo.svg",
  },
  "Cleveland Cavaliers": {
    name: "Cleveland Cavaliers",
    abbrev: "CLE",
    logo: "https://cdn.nba.com/logos/nba/1610612739/global/L/logo.svg",
  },
  "Dallas Mavericks": {
    name: "Dallas Mavericks",
    abbrev: "DAL",
    logo: "https://cdn.nba.com/logos/nba/1610612742/global/L/logo.svg",
  },
  "Denver Nuggets": {
    name: "Denver Nuggets",
    abbrev: "DEN",
    logo: "https://cdn.nba.com/logos/nba/1610612743/global/L/logo.svg",
  },
  "Detroit Pistons": {
    name: "Detroit Pistons",
    abbrev: "DET",
    logo: "https://cdn.nba.com/logos/nba/1610612765/global/L/logo.svg",
  },
  "Golden State Warriors": {
    name: "Golden State Warriors",
    abbrev: "GSW",
    logo: "https://cdn.nba.com/logos/nba/1610612744/global/L/logo.svg",
  },
  "Houston Rockets": {
    name: "Houston Rockets",
    abbrev: "HOU",
    logo: "https://cdn.nba.com/logos/nba/1610612745/global/L/logo.svg",
  },
  "Indiana Pacers": {
    name: "Indiana Pacers",
    abbrev: "IND",
    logo: "https://cdn.nba.com/logos/nba/1610612754/global/L/logo.svg",
  },
  "Los Angeles Clippers": {
    name: "Los Angeles Clippers",
    abbrev: "LAC",
    logo: "https://cdn.nba.com/logos/nba/1610612746/global/L/logo.svg",
  },
  "Los Angeles Lakers": {
    name: "Los Angeles Lakers",
    abbrev: "LAL",
    logo: "https://cdn.nba.com/logos/nba/1610612747/global/L/logo.svg",
  },
  "Memphis Grizzlies": {
    name: "Memphis Grizzlies",
    abbrev: "MEM",
    logo: "https://cdn.nba.com/logos/nba/1610612763/global/L/logo.svg",
  },
  "Miami Heat": {
    name: "Miami Heat",
    abbrev: "MIA",
    logo: "https://cdn.nba.com/logos/nba/1610612748/global/L/logo.svg",
  },
  "Milwaukee Bucks": {
    name: "Milwaukee Bucks",
    abbrev: "MIL",
    logo: "https://cdn.nba.com/logos/nba/1610612749/global/L/logo.svg",
  },
  "Minnesota Timberwolves": {
    name: "Minnesota Timberwolves",
    abbrev: "MIN",
    logo: "https://cdn.nba.com/logos/nba/1610612750/global/L/logo.svg",
  },
  "New Orleans Pelicans": {
    name: "New Orleans Pelicans",
    abbrev: "NOP",
    logo: "https://cdn.nba.com/logos/nba/1610612740/global/L/logo.svg",
  },
  "New York Knicks": {
    name: "New York Knicks",
    abbrev: "NYK",
    logo: "https://cdn.nba.com/logos/nba/1610612752/global/L/logo.svg",
  },
  "Oklahoma City Thunder": {
    name: "Oklahoma City Thunder",
    abbrev: "OKC",
    logo: "https://cdn.nba.com/logos/nba/1610612760/global/L/logo.svg",
  },
  "Orlando Magic": {
    name: "Orlando Magic",
    abbrev: "ORL",
    logo: "https://cdn.nba.com/logos/nba/1610612753/global/L/logo.svg",
  },
  "Philadelphia 76ers": {
    name: "Philadelphia 76ers",
    abbrev: "PHI",
    logo: "https://cdn.nba.com/logos/nba/1610612755/global/L/logo.svg",
  },
  "Phoenix Suns": {
    name: "Phoenix Suns",
    abbrev: "PHX",
    logo: "https://cdn.nba.com/logos/nba/1610612756/global/L/logo.svg",
  },
  "Portland Trail Blazers": {
    name: "Portland Trail Blazers",
    abbrev: "POR",
    logo: "https://cdn.nba.com/logos/nba/1610612757/global/L/logo.svg",
  },
  "Sacramento Kings": {
    name: "Sacramento Kings",
    abbrev: "SAC",
    logo: "https://cdn.nba.com/logos/nba/1610612758/global/L/logo.svg",
  },
  "San Antonio Spurs": {
    name: "San Antonio Spurs",
    abbrev: "SAS",
    logo: "https://cdn.nba.com/logos/nba/1610612759/global/L/logo.svg",
  },
  "Toronto Raptors": {
    name: "Toronto Raptors",
    abbrev: "TOR",
    logo: "https://cdn.nba.com/logos/nba/1610612761/global/L/logo.svg",
  },
  "Utah Jazz": {
    name: "Utah Jazz",
    abbrev: "UTA",
    logo: "https://cdn.nba.com/logos/nba/1610612762/global/L/logo.svg",
  },
  "Washington Wizards": {
    name: "Washington Wizards",
    abbrev: "WAS",
    logo: "https://cdn.nba.com/logos/nba/1610612764/global/L/logo.svg",
  },
};

export function getTeam(name: string): NbaTeam {
  return (
    NBA_TEAMS[name] ?? {
      name,
      abbrev: name.slice(0, 3).toUpperCase(),
      logo: "",
    }
  );
}

export default NBA_TEAMS;
