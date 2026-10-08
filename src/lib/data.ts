// Dados mockados da POC. Coordenadas aproximadas do Bairro do Recife; programação fictícia.

export type Mobility =
  | "padrao"
  | "cadeirante"
  | "colo"
  | "reduzida"
  | "visual"
  | "sensorial";

export type Surface = "asfalto" | "paralelepipedo" | "calcada_estreita" | "escadaria";

export type Track = "Tecnologia" | "Negócios" | "Cidades" | "Economia Criativa";

export type Venue = {
  id: string;
  name: string;
  short: string;
  lat: number;
  lng: number;
  kind: "polo" | "hub" | "palco";
  accessible: boolean; // existe acesso universal (rampa/elevador)
  elevator: boolean;
  mainEntrance: "nivel" | "rampa" | "escada";
  universalAccess: string; // como chegar ao acesso universal
  amenities: string[];
  vertical?: string[]; // circulação entre andares
  baseCrowd: number; // 0..1 aglomeração típica do entorno
};

export const VENUES: Venue[] = [
  {
    id: "nerd",
    name: "NERD — Porto Digital",
    short: "NERD",
    lat: -8.06265,
    lng: -34.87235,
    kind: "polo",
    accessible: true,
    elevator: true,
    mainEntrance: "nivel",
    universalAccess: "Entrada principal em nível; elevador ao fundo do térreo atende os 4 andares.",
    amenities: ["Elevador", "Banheiro acessível", "Ar-condicionado", "Bebedouro"],
    baseCrowd: 0.45,
  },
  {
    id: "cesar",
    name: "CESAR School",
    short: "CESAR",
    lat: -8.05955,
    lng: -34.87345,
    kind: "polo",
    accessible: true,
    elevator: true,
    mainEntrance: "rampa",
    universalAccess: "Rampa na entrada principal pelo Cais do Apolo.",
    amenities: ["Elevador", "Banheiro acessível", "Fraldário"],
    baseCrowd: 0.55,
  },
  {
    id: "porto",
    name: "Porto Digital — Sede",
    short: "Porto Digital",
    lat: -8.06045,
    lng: -34.87265,
    kind: "polo",
    accessible: true,
    elevator: true,
    mainEntrance: "escada",
    universalAccess: "Escadaria na fachada tombada. Acesso com rampa pela lateral da Rua do Apolo, 30 m à esquerda.",
    amenities: ["Elevador", "Banheiro acessível"],
    baseCrowd: 0.6,
  },
  {
    id: "paco-alfandega",
    name: "Paço Alfândega (Liferay)",
    short: "Paço Alfândega",
    lat: -8.06595,
    lng: -34.87265,
    kind: "polo",
    accessible: true,
    elevator: true,
    mainEntrance: "escada",
    universalAccess: "Degraus na entrada da Rua da Alfândega. Acesso em nível pelo Cais da Alfândega (fundos); elevador ao lado das escadas rolantes.",
    amenities: ["Elevador", "Escada rolante", "Praça de alimentação", "Banheiro acessível", "Fraldário"],
    vertical: ["elevador", "escada rolante"],
    baseCrowd: 0.5,
  },
  {
    id: "paco-frevo",
    name: "Paço do Frevo",
    short: "Paço do Frevo",
    lat: -8.06125,
    lng: -34.87145,
    kind: "polo",
    accessible: true,
    elevator: true,
    mainEntrance: "nivel",
    universalAccess: "Entrada em nível pela Praça do Arsenal; elevador interno.",
    amenities: ["Elevador", "Audiodescrição do acervo", "Banheiro acessível"],
    baseCrowd: 0.75,
  },
  {
    id: "caixa",
    name: "Caixa Cultural Recife",
    short: "Caixa Cultural",
    lat: -8.06285,
    lng: -34.87065,
    kind: "polo",
    accessible: true,
    elevator: true,
    mainEntrance: "nivel",
    universalAccess: "Entrada em nível pela Av. Alfredo Lisboa (asfalto liso, de frente ao Marco Zero).",
    amenities: ["Elevador", "Banheiro acessível", "Sombra"],
    baseCrowd: 0.55,
  },
  {
    id: "cais-sertao",
    name: "Museu Cais do Sertão",
    short: "Cais do Sertão",
    lat: -8.06455,
    lng: -34.86995,
    kind: "polo",
    accessible: true,
    elevator: true,
    mainEntrance: "nivel",
    universalAccess: "Entrada em nível pela Av. Alfredo Lisboa. Não há atividades no térreo: suba pelo elevador (à direita da recepção) ou pela escada.",
    amenities: ["Elevador", "Escada", "Ar-condicionado", "Banheiro acessível"],
    vertical: ["elevador", "escada"],
    baseCrowd: 0.4,
  },
  {
    id: "moinho",
    name: "Moinho Recife",
    short: "Moinho",
    lat: -8.05415,
    lng: -34.87125,
    kind: "polo",
    accessible: true,
    elevator: true,
    mainEntrance: "nivel",
    universalAccess: "Entrada em nível pelo pátio. Salas espalhadas em 4 andares e alas diferentes: use os elevadores do hall central (as escadas da ala norte não têm corrimão duplo).",
    amenities: ["Elevadores", "Escadas", "Estacionamento", "Embarque de app", "Banheiro família"],
    vertical: ["elevador", "escada"],
    baseCrowd: 0.3,
  },
  {
    id: "armazens",
    name: "Armazéns do Porto (Accenture)",
    short: "Armazéns",
    lat: -8.05905,
    lng: -34.87015,
    kind: "polo",
    accessible: true,
    elevator: false,
    mainEntrance: "nivel",
    universalAccess: "Galpões térreos em nível, acesso pelo cais (asfalto).",
    amenities: ["Térreo", "Vista do rio", "Sombra"],
    baseCrowd: 0.4,
  },
  {
    id: "senai",
    name: "SENAI — Recife Antigo",
    short: "SENAI",
    lat: -8.05835,
    lng: -34.87215,
    kind: "polo",
    accessible: false,
    elevator: false,
    mainEntrance: "escada",
    universalAccess: "Prédio histórico sem rampa. Atividades do térreo são transmitidas no Armazéns (telão com Libras).",
    amenities: ["Transmissão no Armazéns"],
    baseCrowd: 0.35,
  },
  {
    id: "casa-zero",
    name: "Casa Zero (Porto Social)",
    short: "Casa Zero",
    lat: -8.05715,
    lng: -34.87175,
    kind: "polo",
    accessible: true,
    elevator: false,
    mainEntrance: "rampa",
    universalAccess: "Rampa removível na porta principal; atividades no térreo.",
    amenities: ["Térreo", "Espaço calmo", "Banheiro acessível"],
    baseCrowd: 0.25,
  },
  {
    id: "malakoff",
    name: "Torre Malakoff",
    short: "Malakoff",
    lat: -8.06015,
    lng: -34.87055,
    kind: "polo",
    accessible: false,
    elevator: false,
    mainEntrance: "escada",
    universalAccess: "Só o térreo tem acesso; o mirante é por escada estreita.",
    amenities: ["Térreo acessível", "Observatório (escada)"],
    baseCrowd: 0.45,
  },
  {
    id: "marco-zero",
    name: "Palco Marco Zero",
    short: "Marco Zero",
    lat: -8.06315,
    lng: -34.87105,
    kind: "palco",
    accessible: true,
    elevator: false,
    mainEntrance: "nivel",
    universalAccess: "Área aberta; espaço reservado para PcD à direita do palco.",
    amenities: ["Área PcD", "Intérprete de Libras no palco"],
    baseCrowd: 0.7,
  },
  {
    id: "hub-norte",
    name: "Embarque Norte (app/táxi) — Moinho",
    short: "Embarque Norte",
    lat: -8.05485,
    lng: -34.87205,
    kind: "hub",
    accessible: true,
    elevator: false,
    mainEntrance: "nivel",
    universalAccess: "Calçada rebaixada e piso liso até a baia de embarque.",
    amenities: ["Baia de embarque", "Fila organizada"],
    baseCrowd: 0.3,
  },
  {
    id: "hub-sul",
    name: "Embarque Sul (app/táxi) — Cais da Alfândega",
    short: "Embarque Sul",
    lat: -8.06705,
    lng: -34.87315,
    kind: "hub",
    accessible: true,
    elevator: false,
    mainEntrance: "nivel",
    universalAccess: "Baia de embarque com calçada rebaixada.",
    amenities: ["Baia de embarque"],
    baseCrowd: 0.55,
  },
  {
    id: "hub-onibus",
    name: "Parada de ônibus provisória — Av. Rio Branco",
    short: "Parada Rio Branco",
    lat: -8.06385,
    lng: -34.87395,
    kind: "hub",
    accessible: true,
    elevator: false,
    mainEntrance: "nivel",
    universalAccess: "Abrigo provisório com piso nivelado.",
    amenities: ["Linhas para Centro, Boa Viagem e Olinda"],
    baseCrowd: 0.6,
  },
];

export const venueById = (id: string) => VENUES.find((v) => v.id === id);

// Esquinas/pontos intermediários usados só para desenhar e calcular as rotas.
export const JUNCTIONS: { id: string; lat: number; lng: number }[] = [
  { id: "j-bomjesus-n", lat: -8.0612, lng: -34.8718 },
  { id: "j-bomjesus-s", lat: -8.0628, lng: -34.8720 },
  { id: "j-moeda", lat: -8.0622, lng: -34.8729 },
  { id: "j-riobranco", lat: -8.0634, lng: -34.8728 },
  { id: "j-apolo-n", lat: -8.0584, lng: -34.8728 },
  { id: "j-apolo-s", lat: -8.0606, lng: -34.8732 },
  { id: "j-caisapolo-n", lat: -8.0587, lng: -34.8741 },
  { id: "j-caisapolo-s", lat: -8.0622, lng: -34.8742 },
  { id: "j-alfredo-n", lat: -8.0578, lng: -34.8704 },
  { id: "j-alfredo-m", lat: -8.0600, lng: -34.8703 },
  { id: "j-alfredo-s", lat: -8.0620, lng: -34.8704 },
  { id: "j-alfandega", lat: -8.0650, lng: -34.8724 },
  { id: "j-cais-alfandega", lat: -8.0652, lng: -34.8738 },
  { id: "j-brum", lat: -8.0560, lng: -34.8714 },
];

export type Edge = {
  a: string;
  b: string;
  street: string;
  surface: Surface;
  narrow?: boolean;
};

export const EDGES: Edge[] = [
  // Eixo Bom Jesus / Moeda — histórico, paralelepípedo
  { a: "paco-frevo", b: "j-bomjesus-n", street: "Praça do Arsenal", surface: "paralelepipedo" },
  { a: "j-bomjesus-n", b: "j-bomjesus-s", street: "Rua do Bom Jesus", surface: "paralelepipedo", narrow: true },
  { a: "j-bomjesus-s", b: "nerd", street: "Rua do Bom Jesus", surface: "paralelepipedo" },
  { a: "nerd", b: "j-moeda", street: "Rua da Moeda", surface: "paralelepipedo", narrow: true },
  { a: "j-moeda", b: "j-riobranco", street: "Rua da Moeda", surface: "paralelepipedo" },
  { a: "j-bomjesus-s", b: "marco-zero", street: "Rua do Bom Jesus", surface: "paralelepipedo" },
  // Av. Rio Branco / Alfândega — asfalto
  { a: "j-riobranco", b: "marco-zero", street: "Av. Rio Branco", surface: "asfalto" },
  { a: "j-riobranco", b: "hub-onibus", street: "Av. Rio Branco", surface: "asfalto" },
  { a: "j-riobranco", b: "j-alfandega", street: "Rua da Alfândega", surface: "calcada_estreita", narrow: true },
  { a: "j-alfandega", b: "paco-alfandega", street: "Rua da Alfândega (entrada com degraus)", surface: "escadaria" },
  { a: "j-alfandega", b: "j-cais-alfandega", street: "Travessa da Alfândega", surface: "asfalto" },
  { a: "j-cais-alfandega", b: "paco-alfandega", street: "Cais da Alfândega (acesso em nível)", surface: "asfalto" },
  { a: "j-cais-alfandega", b: "hub-sul", street: "Cais da Alfândega", surface: "asfalto" },
  { a: "hub-onibus", b: "j-cais-alfandega", street: "Av. Martins de Barros", surface: "asfalto" },
  { a: "j-caisapolo-s", b: "hub-onibus", street: "Cais do Apolo", surface: "asfalto" },
  // Cais do Apolo / Rua do Apolo
  { a: "j-moeda", b: "j-apolo-s", street: "Rua da Moeda", surface: "paralelepipedo" },
  { a: "j-apolo-s", b: "porto", street: "Rua do Apolo (fachada com escadaria)", surface: "escadaria" },
  { a: "j-apolo-s", b: "j-apolo-n", street: "Rua do Apolo", surface: "paralelepipedo", narrow: true },
  { a: "j-apolo-n", b: "porto", street: "Rua do Apolo (rampa lateral)", surface: "calcada_estreita" },
  { a: "j-apolo-s", b: "j-caisapolo-s", street: "Travessa do Apolo", surface: "asfalto" },
  { a: "j-caisapolo-s", b: "j-caisapolo-n", street: "Cais do Apolo", surface: "asfalto" },
  { a: "j-caisapolo-n", b: "cesar", street: "Cais do Apolo", surface: "asfalto" },
  { a: "j-apolo-n", b: "cesar", street: "Rua Bione", surface: "paralelepipedo" },
  { a: "j-apolo-n", b: "senai", street: "Rua do Apolo", surface: "paralelepipedo" },
  { a: "j-caisapolo-n", b: "j-brum", street: "Av. Cais do Apolo", surface: "asfalto" },
  // Norte — Brum / Moinho
  { a: "senai", b: "casa-zero", street: "Rua de São Jorge", surface: "paralelepipedo", narrow: true },
  { a: "casa-zero", b: "j-brum", street: "Rua do Brum", surface: "asfalto" },
  { a: "j-brum", b: "hub-norte", street: "Rua do Brum", surface: "asfalto" },
  { a: "hub-norte", b: "moinho", street: "Pátio do Moinho", surface: "asfalto" },
  // Av. Alfredo Lisboa — cais, asfalto liso
  { a: "j-brum", b: "j-alfredo-n", street: "Av. Alfredo Lisboa", surface: "asfalto" },
  { a: "j-alfredo-n", b: "armazens", street: "Av. Alfredo Lisboa", surface: "asfalto" },
  { a: "armazens", b: "j-alfredo-m", street: "Av. Alfredo Lisboa", surface: "asfalto" },
  { a: "j-alfredo-m", b: "malakoff", street: "Praça do Arsenal (lado do cais)", surface: "asfalto" },
  { a: "j-alfredo-m", b: "j-alfredo-s", street: "Av. Alfredo Lisboa", surface: "asfalto" },
  { a: "j-alfredo-s", b: "caixa", street: "Av. Alfredo Lisboa", surface: "asfalto" },
  { a: "caixa", b: "marco-zero", street: "Praça Rio Branco", surface: "asfalto" },
  { a: "caixa", b: "cais-sertao", street: "Av. Alfredo Lisboa", surface: "asfalto" },
  { a: "marco-zero", b: "cais-sertao", street: "Praça Rio Branco → Cais", surface: "asfalto" },
  { a: "malakoff", b: "paco-frevo", street: "Praça do Arsenal", surface: "paralelepipedo" },
  { a: "j-alfredo-s", b: "paco-frevo", street: "Rua da Guia (calçada rebaixada)", surface: "asfalto" },
  { a: "senai", b: "j-alfredo-n", street: "Rua Mariz e Barros", surface: "paralelepipedo" },
  { a: "porto", b: "j-bomjesus-n", street: "Rua do Apolo → Bom Jesus", surface: "paralelepipedo", narrow: true },
];

export type Activity = {
  id: string;
  title: string;
  venueId: string;
  room: string;
  floor: number;
  start: string; // "HH:MM"
  durationMin: number;
  capacity: number;
  popularity: number; // 0..1.3 — quão rápido lota
  track: Track;
  topics: string[];
  format: "Palestra" | "Workshop" | "Painel" | "Show" | "Experiência";
  libras?: boolean;
  audiodescricao?: boolean;
  legenda?: boolean;
};

export const ACTIVITIES: Activity[] = [
  // NERD
  { id: "a01", title: "Agentes de IA na prática: do protótipo à produção", venueId: "nerd", room: "Auditório", floor: 4, start: "10:00", durationMin: 60, capacity: 120, popularity: 1.25, track: "Tecnologia", topics: ["ia", "dev", "startups"], format: "Palestra", libras: true, legenda: true },
  { id: "a02", title: "Ideathon P&D: acessibilidade em centros históricos", venueId: "nerd", room: "Sala 2", floor: 2, start: "14:00", durationMin: 90, capacity: 40, popularity: 0.8, track: "Cidades", topics: ["acessibilidade", "design", "cidades"], format: "Workshop", libras: true },
  { id: "a03", title: "Design de produto com IA generativa", venueId: "nerd", room: "Auditório", floor: 4, start: "15:30", durationMin: 60, capacity: 120, popularity: 1.1, track: "Tecnologia", topics: ["design", "ia", "ux"], format: "Palestra", legenda: true },
  { id: "a04", title: "Mentorias relâmpago para startups", venueId: "nerd", room: "Sala 3", floor: 3, start: "17:00", durationMin: 90, capacity: 30, popularity: 0.9, track: "Negócios", topics: ["startups", "investimento", "carreira"], format: "Experiência" },
  // CESAR School
  { id: "a05", title: "Primeiro emprego em tech: como entrar em 2027", venueId: "cesar", room: "Auditório", floor: 1, start: "10:30", durationMin: 60, capacity: 200, popularity: 1.15, track: "Tecnologia", topics: ["carreira", "educacao", "iniciante"], format: "Painel", libras: true, legenda: true },
  { id: "a06", title: "Oficina: seu primeiro app com React", venueId: "cesar", room: "Lab 3", floor: 3, start: "14:00", durationMin: 120, capacity: 35, popularity: 1.2, track: "Tecnologia", topics: ["dev", "iniciante", "educacao"], format: "Workshop" },
  { id: "a07", title: "UX Writing: textos que guiam pessoas", venueId: "cesar", room: "Sala 5", floor: 2, start: "16:30", durationMin: 60, capacity: 60, popularity: 0.7, track: "Economia Criativa", topics: ["ux", "design", "escrita"], format: "Palestra", legenda: true },
  // Porto Digital sede
  { id: "a08", title: "Rodada de investimento anjo no Nordeste", venueId: "porto", room: "Sala Conselho", floor: 2, start: "11:00", durationMin: 60, capacity: 50, popularity: 1.0, track: "Negócios", topics: ["investimento", "startups", "negocios"], format: "Painel" },
  { id: "a09", title: "Governo digital: a prefs tá on", venueId: "porto", room: "Auditório", floor: 1, start: "15:00", durationMin: 60, capacity: 90, popularity: 0.75, track: "Cidades", topics: ["cidades", "governo", "dados"], format: "Palestra", libras: true },
  // Paço Alfândega
  { id: "a10", title: "Liferay Experience: portais que escalam", venueId: "paco-alfandega", room: "Mezanino", floor: 2, start: "10:00", durationMin: 60, capacity: 100, popularity: 0.65, track: "Tecnologia", topics: ["dev", "negocios", "dados"], format: "Palestra" },
  { id: "a11", title: "Cidades inteligentes: dados de mobilidade urbana", venueId: "paco-alfandega", room: "Térreo", floor: 1, start: "13:30", durationMin: 60, capacity: 150, popularity: 0.95, track: "Cidades", topics: ["cidades", "mobilidade", "dados", "ia"], format: "Painel", libras: true, legenda: true },
  { id: "a12", title: "Marketing para negócios criativos", venueId: "paco-alfandega", room: "Mezanino", floor: 2, start: "16:00", durationMin: 60, capacity: 100, popularity: 0.6, track: "Negócios", topics: ["negocios", "marketing", "criatividade"], format: "Palestra" },
  // Paço do Frevo
  { id: "a13", title: "Frevo, código e cultura: tecnologia na tradição", venueId: "paco-frevo", room: "Salão", floor: 2, start: "11:00", durationMin: 60, capacity: 80, popularity: 1.3, track: "Economia Criativa", topics: ["cultura", "musica", "patrimonio", "criatividade"], format: "Palestra", audiodescricao: true, libras: true },
  { id: "a14", title: "Aula-show de passo com sensores de movimento", venueId: "paco-frevo", room: "Térreo", floor: 1, start: "14:30", durationMin: 45, capacity: 60, popularity: 1.3, track: "Economia Criativa", topics: ["musica", "cultura", "xr", "hardware"], format: "Experiência", audiodescricao: true },
  { id: "a15", title: "Patrimônio digital: acervos com IA", venueId: "paco-frevo", room: "Salão", floor: 2, start: "16:30", durationMin: 60, capacity: 80, popularity: 0.9, track: "Economia Criativa", topics: ["patrimonio", "ia", "cultura"], format: "Palestra", libras: true },
  // Caixa Cultural
  { id: "a16", title: "Exposição imersiva: Recife em realidade estendida", venueId: "caixa", room: "Galeria", floor: 1, start: "09:30", durationMin: 600, capacity: 70, popularity: 0.85, track: "Economia Criativa", topics: ["xr", "arte", "patrimonio"], format: "Experiência", audiodescricao: true },
  { id: "a17", title: "Games pernambucanos: do jam ao Steam", venueId: "caixa", room: "Teatro", floor: 2, start: "13:00", durationMin: 60, capacity: 110, popularity: 1.0, track: "Economia Criativa", topics: ["games", "startups", "criatividade"], format: "Painel", legenda: true },
  { id: "a18", title: "Som e máquina: música experimental com IA", venueId: "caixa", room: "Teatro", floor: 2, start: "17:30", durationMin: 60, capacity: 110, popularity: 0.8, track: "Economia Criativa", topics: ["musica", "ia", "arte"], format: "Show", libras: true },
  // Moinho
  { id: "a19", title: "Hardware hacking: IoT para cidades", venueId: "moinho", room: "Galpão A", floor: 1, start: "10:00", durationMin: 120, capacity: 60, popularity: 0.7, track: "Tecnologia", topics: ["hardware", "cidades", "dev"], format: "Workshop" },
  { id: "a20", title: "IA para pequenos negócios", venueId: "moinho", room: "Palco Moinho", floor: 1, start: "13:30", durationMin: 60, capacity: 300, popularity: 0.75, track: "Negócios", topics: ["ia", "negocios", "iniciante"], format: "Palestra", libras: true, legenda: true },
  { id: "a21", title: "Agentes de IA: casos reais no Nordeste", venueId: "moinho", room: "Sala Silo (ala sul)", floor: 3, start: "15:00", durationMin: 60, capacity: 120, popularity: 0.6, track: "Tecnologia", topics: ["ia", "dev", "startups"], format: "Painel", libras: true, legenda: true },
  { id: "a22", title: "Pitch night: startups da região", venueId: "moinho", room: "Terraço", floor: 4, start: "18:00", durationMin: 90, capacity: 300, popularity: 0.85, track: "Negócios", topics: ["startups", "investimento", "negocios"], format: "Experiência", libras: true },
  { id: "a31", title: "UX acessível: testes com usuários reais", venueId: "moinho", room: "Sala Trigo (ala norte)", floor: 2, start: "15:30", durationMin: 60, capacity: 50, popularity: 0.55, track: "Tecnologia", topics: ["ux", "acessibilidade", "design"], format: "Workshop", libras: true, legenda: true },
  { id: "a32", title: "Mobilidade urbana com dados abertos", venueId: "moinho", room: "Sala Silo (ala sul)", floor: 3, start: "16:30", durationMin: 60, capacity: 120, popularity: 0.5, track: "Cidades", topics: ["mobilidade", "dados", "cidades"], format: "Palestra", legenda: true },
  // Cais do Sertão — nada no térreo
  { id: "a33", title: "Sertão conectado: internet e agro no interior", venueId: "cais-sertao", room: "Auditório", floor: 2, start: "14:00", durationMin: 60, capacity: 90, popularity: 0.7, track: "Negócios", topics: ["negocios", "dados", "comunidade"], format: "Painel", libras: true },
  { id: "a34", title: "Exposição imersiva: o som do sertão em XR", venueId: "cais-sertao", room: "Galeria 3", floor: 3, start: "10:00", durationMin: 540, capacity: 60, popularity: 0.8, track: "Economia Criativa", topics: ["xr", "musica", "cultura", "patrimonio"], format: "Experiência", audiodescricao: true },
  { id: "a35", title: "Economia criativa nordestina: do forró ao streaming", venueId: "cais-sertao", room: "Auditório", floor: 2, start: "16:00", durationMin: 60, capacity: 90, popularity: 0.85, track: "Economia Criativa", topics: ["musica", "cultura", "negocios", "criatividade"], format: "Palestra", libras: true, legenda: true },
  // Paço Alfândega — 3º andar
  { id: "a36", title: "Fintechs do Nordeste", venueId: "paco-alfandega", room: "Auditório", floor: 3, start: "14:30", durationMin: 60, capacity: 120, popularity: 0.75, track: "Negócios", topics: ["negocios", "investimento", "startups"], format: "Painel", legenda: true },
  // Armazéns
  { id: "a23", title: "Accenture: IA responsável em grandes empresas", venueId: "armazens", room: "Armazém 14", floor: 1, start: "11:00", durationMin: 60, capacity: 180, popularity: 0.9, track: "Tecnologia", topics: ["ia", "dados", "negocios"], format: "Palestra", legenda: true, libras: true },
  { id: "a24", title: "Carreira internacional remota", venueId: "armazens", room: "Armazém 14", floor: 1, start: "15:00", durationMin: 60, capacity: 180, popularity: 0.85, track: "Negócios", topics: ["carreira", "dev", "negocios"], format: "Painel", legenda: true },
  { id: "a25", title: "Transmissão ao vivo das atividades do SENAI", venueId: "armazens", room: "Telão", floor: 1, start: "13:00", durationMin: 240, capacity: 80, popularity: 0.3, track: "Tecnologia", topics: ["hardware", "educacao", "industria"], format: "Experiência", libras: true, legenda: true },
  // SENAI
  { id: "a26", title: "Indústria 4.0: robótica na prática", venueId: "senai", room: "Oficina 1", floor: 2, start: "13:00", durationMin: 120, capacity: 25, popularity: 1.0, track: "Tecnologia", topics: ["hardware", "industria", "educacao"], format: "Workshop" },
  // Casa Zero
  { id: "a27", title: "Inovação social e periferias", venueId: "casa-zero", room: "Térreo", floor: 1, start: "11:30", durationMin: 60, capacity: 50, popularity: 0.55, track: "Cidades", topics: ["comunidade", "diversidade", "cidades", "educacao"], format: "Painel", libras: true },
  { id: "a28", title: "Neurodiversidade no trabalho em tech", venueId: "casa-zero", room: "Térreo", floor: 1, start: "15:30", durationMin: 60, capacity: 50, popularity: 0.6, track: "Negócios", topics: ["diversidade", "carreira", "acessibilidade"], format: "Painel", libras: true, legenda: true },
  // Malakoff
  { id: "a29", title: "Astronomia e dados abertos no observatório", venueId: "malakoff", room: "Mirante", floor: 3, start: "16:00", durationMin: 60, capacity: 25, popularity: 0.9, track: "Tecnologia", topics: ["dados", "educacao", "ciencia"], format: "Experiência" },
  // Marco Zero
  { id: "a30", title: "Show de abertura: Manguebeat 2.0", venueId: "marco-zero", room: "Palco principal", floor: 0, start: "19:00", durationMin: 120, capacity: 5000, popularity: 1.0, track: "Economia Criativa", topics: ["musica", "cultura", "arte"], format: "Show", libras: true },
];

export const activityById = (id: string) => ACTIVITIES.find((a) => a.id === id);

// Arquétipos do autodiagnóstico — figuras da cultura e da história de Pernambuco.
export type Archetype = {
  id: string;
  name: string;
  figure: string;
  emoji: string;
  tagline: string;
  description: string;
  topics: string[];
  color: string;
};

export const ARCHETYPES: Archetype[] = [
  {
    id: "chico",
    name: "Disruptivo",
    figure: "Chico Science",
    emoji: "🦀",
    tagline: "Mistura tudo e cria o novo",
    description: "Como o Manguebeat, você conecta tecnologia, música e periferia. Gosta do que ainda não tem nome.",
    topics: ["ia", "startups", "games", "hardware", "musica", "criatividade"],
    color: "#E4572E",
  },
  {
    id: "ariano",
    name: "Guardião das Raízes",
    figure: "Ariano Suassuna",
    emoji: "📜",
    tagline: "Inova sem esquecer de onde veio",
    description: "Conservador no melhor sentido: valoriza cultura, patrimônio e histórias. Quer tecnologia a serviço da tradição.",
    topics: ["cultura", "patrimonio", "educacao", "arte", "escrita"],
    color: "#B5651D",
  },
  {
    id: "nassau",
    name: "Visionário Urbano",
    figure: "Maurício de Nassau",
    emoji: "🌉",
    tagline: "Pensa a cidade e os negócios em grande escala",
    description: "Constrói pontes — literais e de negócios. Interessa-se por cidades, investimento, dados e gestão.",
    topics: ["cidades", "negocios", "investimento", "dados", "mobilidade", "governo"],
    color: "#1F4E9C",
  },
  {
    id: "freire",
    name: "Curioso Aprendiz",
    figure: "Paulo Freire",
    emoji: "📚",
    tagline: "Aprende fazendo e ensina aprendendo",
    description: "Está começando ou recomeçando. Busca carreira, educação, comunidade e conteúdos mão na massa.",
    topics: ["educacao", "carreira", "iniciante", "comunidade", "diversidade", "dev"],
    color: "#2A9D8F",
  },
  {
    id: "nana",
    name: "Experimental",
    figure: "Naná Vasconcelos",
    emoji: "🥁",
    tagline: "Transforma qualquer coisa em instrumento",
    description: "Sensorial e inventivo: arte, som, XR, design e experiências que você sente com o corpo.",
    topics: ["arte", "musica", "xr", "design", "ux", "criatividade"],
    color: "#7B2CBF",
  },
  {
    id: "clarice",
    name: "Introspectiva",
    figure: "Clarice Lispector",
    emoji: "🪞",
    tagline: "Observa fundo antes de agir",
    description: "Prefere ambientes calmos e conversas profundas: UX, escrita, neurodiversidade e o lado humano da tecnologia.",
    topics: ["ux", "escrita", "diversidade", "acessibilidade", "design"],
    color: "#3D5A80",
  },
];

export const archetypeById = (id?: string | null) => ARCHETYPES.find((a) => a.id === id);

export const MOBILITY_LABEL: Record<Mobility, { label: string; icon: string; hint: string }> = {
  padrao: { label: "Sem restrição", icon: "🚶", hint: "Rota mais rápida" },
  cadeirante: { label: "Cadeira de rodas", icon: "♿", hint: "Evita paralelepípedo, escadas e calçadas estreitas" },
  colo: { label: "Com criança de colo", icon: "👶", hint: "Evita aglomeração, prioriza sombra e fraldário" },
  reduzida: { label: "Mobilidade reduzida", icon: "🦯", hint: "Trajetos curtos, piso regular e pausas" },
  visual: { label: "Baixa visão / cegueira", icon: "👁️", hint: "Rotas simples, menos cruzamentos e guia por voz" },
  sensorial: { label: "Sensibilidade sensorial", icon: "🎧", hint: "Evita multidão e barulho" },
};

/** Rótulo combinado para múltipla escolha: "♿ Cadeira de rodas + 👶 Com criança de colo". */
export function mobilityText(ms: Mobility[], withIcon = true) {
  return ms.map((m) => `${withIcon ? MOBILITY_LABEL[m].icon + " " : ""}${MOBILITY_LABEL[m].label}`).join(" + ");
}

export type Persona = {
  id: string;
  name: string;
  age: number;
  avatar: string;
  story: string;
  mobility: Mobility;
  archetypeId: string;
  interests: string[];
  arrival: "ônibus" | "carro" | "app" | "a pé";
  needs: string[];
};

// Contas demo: 3 proto-personas do time (Miro) + 4 perfis de acessibilidade.
export const PERSONAS: Persona[] = [
  {
    id: "lia",
    name: "Lia, estudante de ADS",
    age: 21,
    avatar: "🎒",
    story: "Vem de ônibus do Ibura. Quer ver o máximo de palestras e sempre subestima o tempo de caminhada.",
    mobility: "padrao",
    archetypeId: "freire",
    interests: ["ia", "carreira", "dev"],
    arrival: "ônibus",
    needs: [],
  },
  {
    id: "rafael",
    name: "Rafael, empreendedor",
    age: 34,
    avatar: "💼",
    story: "Vem de carro, tem janelas curtas entre reuniões e não sabe qual ponte usar.",
    mobility: "padrao",
    archetypeId: "nassau",
    interests: ["investimento", "startups", "negocios"],
    arrival: "carro",
    needs: [],
  },
  {
    id: "bia",
    name: "Bia, explorando o festival",
    age: 27,
    avatar: "🧭",
    story: "Primeira vez no REC'n'Play, sem agenda fixa. Quer descobrir coisas boas perto dela.",
    mobility: "padrao",
    archetypeId: "nana",
    interests: ["arte", "games", "cultura"],
    arrival: "app",
    needs: [],
  },
  {
    id: "joana",
    name: "Joana e Theo (8 meses)",
    age: 31,
    avatar: "👶",
    story: "Com o bebê no colo. Precisa evitar empurra-empurra, achar sombra e fraldário.",
    mobility: "colo",
    archetypeId: "ariano",
    interests: ["cultura", "patrimonio", "educacao"],
    arrival: "app",
    needs: ["fraldário", "sombra", "evitar aglomeração"],
  },
  {
    id: "marcos",
    name: "Marcos, cadeirante",
    age: 29,
    avatar: "♿",
    story: "Dev backend. O paralelepípedo da Rua da Moeda machuca a coluna; precisa saber onde fica a rampa.",
    mobility: "cadeirante",
    archetypeId: "chico",
    interests: ["ia", "dev", "acessibilidade"],
    arrival: "app",
    needs: ["rampa", "elevador", "piso liso"],
  },
  {
    id: "severino",
    name: "Seu Severino, 68",
    age: 68,
    avatar: "🧓",
    story: "Professor aposentado, anda de bengala. Cansa rápido no calor e quer trajetos curtos.",
    mobility: "reduzida",
    archetypeId: "ariano",
    interests: ["educacao", "cultura", "cidades"],
    arrival: "ônibus",
    needs: ["trajeto curto", "assento", "sombra"],
  },
  {
    id: "lucas",
    name: "Lucas, baixa visão",
    age: 24,
    avatar: "🦯",
    story: "Usa leitor de tela. A tag NFC funciona como um 'piso tátil digital' que diz onde ele está.",
    mobility: "visual",
    archetypeId: "clarice",
    interests: ["ux", "acessibilidade", "ia"],
    arrival: "ônibus",
    needs: ["audiodescrição", "guia por voz"],
  },
];

export const personaById = (id?: string | null) => PERSONAS.find((p) => p.id === id);

// Tags NFC físicas. A tag guarda só a URL /t/<id>; o significado fica aqui (e depois no Supabase).
export type TagPoint = {
  id: string;
  venueId: string;
  label: string;
  kind: "entrada" | "sala" | "escadaria" | "hub" | "encontro";
  floor?: number;
  note?: string;
};

export const TAGS: TagPoint[] = [
  { id: "nerd-terreo", venueId: "nerd", label: "NERD — Recepção (térreo)", kind: "entrada" },
  { id: "nerd-andar-2", venueId: "nerd", label: "NERD — 2º andar (Sala 2)", kind: "sala", floor: 2 },
  { id: "nerd-andar-3", venueId: "nerd", label: "NERD — 3º andar (Sala 3)", kind: "sala", floor: 3 },
  { id: "nerd-auditorio", venueId: "nerd", label: "NERD — Auditório (4º andar)", kind: "sala", floor: 4 },
  { id: "paco-frevo", venueId: "paco-frevo", label: "Paço do Frevo — Entrada", kind: "entrada" },
  { id: "cesar", venueId: "cesar", label: "CESAR School — Entrada", kind: "entrada" },
  { id: "moinho", venueId: "moinho", label: "Moinho Recife — Entrada", kind: "entrada" },
  { id: "moinho-andar-2", venueId: "moinho", label: "Moinho — 2º andar (Sala Trigo, ala norte)", kind: "sala", floor: 2 },
  { id: "moinho-andar-3", venueId: "moinho", label: "Moinho — 3º andar (Sala Silo, ala sul)", kind: "sala", floor: 3 },
  { id: "cais-sertao", venueId: "cais-sertao", label: "Cais do Sertão — Recepção (térreo)", kind: "entrada", note: "Não há atividades no térreo: elevador à direita da recepção." },
  { id: "paco-alfandega-3", venueId: "paco-alfandega", label: "Paço Alfândega — 3º andar (Auditório)", kind: "sala", floor: 3 },
  { id: "caixa", venueId: "caixa", label: "Caixa Cultural — Entrada", kind: "entrada" },
  { id: "armazens", venueId: "armazens", label: "Armazéns do Porto — Entrada", kind: "entrada" },
  { id: "casa-zero", venueId: "casa-zero", label: "Casa Zero — Entrada", kind: "entrada" },
  { id: "marco-zero", venueId: "marco-zero", label: "Marco Zero — Palco", kind: "entrada" },
  {
    id: "paco-alfandega-escadaria",
    venueId: "paco-alfandega",
    label: "Paço Alfândega — Escadaria principal",
    kind: "escadaria",
    note: "Ponto cego: a fachada tombada não pode ter placa. A tag indica o acesso em nível pelos fundos.",
  },
  {
    id: "porto-fachada",
    venueId: "porto",
    label: "Porto Digital — Fachada (escadaria)",
    kind: "escadaria",
    note: "A rampa fica 30 m à esquerda, na lateral da Rua do Apolo.",
  },
  { id: "senai", venueId: "senai", label: "SENAI — Entrada (sem rampa)", kind: "escadaria", note: "Sem acesso universal; a tag oferece a transmissão no Armazéns." },
  { id: "embarque-norte", venueId: "hub-norte", label: "Embarque Norte — Moinho", kind: "hub" },
  { id: "embarque-sul", venueId: "hub-sul", label: "Embarque Sul — Cais da Alfândega", kind: "hub" },
  { id: "encontro-1", venueId: "marco-zero", label: "Ponto de Encontro 1 — Marco Zero", kind: "encontro" },
];

export const tagById = (id: string) => TAGS.find((t) => t.id === id);
