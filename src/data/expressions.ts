export interface Expression {
	/** Stable slug, used as key in localStorage. */
	id: string;
	/** Canonical Dutch form shown as an option. */
	nl: string;
	/** Literal translation. */
	literal: string;
	/** Real meaning. */
	sens: string;
	/** Register / context. */
	contexte: string;
	/** Natural French equivalent. */
	fr: string;
	/** Pitfall for French speakers. */
	piege: string;
	/** French situation used as the quiz prompt. */
	situation: string;
}

export const EXPRESSIONS: readonly Expression[] = [
	{
		id: "met-de-deur-in-huis-vallen",
		nl: "Met de deur in huis vallen",
		literal: "tomber dans la maison avec la porte",
		sens: "aller droit au but, sans préambule",
		contexte: "oral, un peu brusque. Souvent adouci : « Sorry dat ik met de deur in huis val… »",
		fr: "aller droit au but / mettre les pieds dans le plat",
		piege: "ce n'est pas « claquer la porte » ni « débarquer chez quelqu'un »",
		situation:
			"Tu appelles un collègue et, sans dire bonjour, tu poses tout de suite la question gênante.",
	},
	{
		id: "de-kat-uit-de-boom-kijken",
		nl: "De kat uit de boom kijken",
		literal: "regarder le chat (descendre) de l'arbre",
		sens: "observer d'abord, ne pas s'engager trop vite",
		contexte: "nouveau job, négociation, conflit. Neutre à légèrement critique si ça dure trop",
		fr: "voir venir / attendre de voir",
		piege: "ce n'est pas « surveiller » (ça, c'est « in de gaten houden »)",
		situation:
			"Premier jour en réunion. Tu ne dis presque rien : tu veux d'abord voir comment le groupe fonctionne.",
	},
	{
		id: "de-knoop-doorhakken",
		nl: "De knoop doorhakken",
		literal: "trancher le nœud",
		sens: "prendre enfin une décision, souvent après hésitation",
		contexte: "travail, couple, achat. Assez courant à l'oral et dans les médias",
		fr: "trancher / se décider",
		piege: "ce n'est pas « couper les ponts »",
		situation:
			"Vous hésitez depuis des semaines entre deux appartements. Aujourd'hui, il faut choisir.",
	},
	{
		id: "geen-blad-voor-de-mond-nemen",
		nl: "Geen blad voor de mond nemen",
		literal: "ne pas mettre de feuille devant la bouche",
		sens: "parler franchement, sans adoucir",
		contexte: "trait de caractère ou moment de franchise. Très « néerlandais »",
		fr: "ne pas mâcher ses mots",
		piege:
			"proche de « met de deur in huis vallen », mais ici c'est le ton cash, pas le fait de commencer sans intro",
		situation:
			"Elle dit toujours exactement ce qu'elle pense, même si ça pique. Pas de diplomatie.",
	},
	{
		id: "van-een-mug-een-olifant-maken",
		nl: "Van een mug een olifant maken",
		literal: "faire d'un moustique un éléphant",
		sens: "dramatiser un détail",
		contexte: "reproche fréquent, informel à semi-formel",
		fr: "faire une montagne d'un rien",
		piege: "image différente du français, même idée. Ne pas traduire « montagne / taupe »",
		situation: "Il a oublié un emoji dans un mail et quelqu'un en fait tout un scandale.",
	},
	{
		id: "iets-onder-de-knie-hebben",
		nl: "Iets onder de knie hebben",
		literal: "avoir quelque chose sous le genou",
		sens: "maîtriser une compétence",
		contexte: "apprentissage, sport, boulot. Très fréquent",
		fr: "avoir le coup / maîtriser",
		piege: "rien à voir avec « se mettre à genoux »",
		situation: "Après six mois, tu gères enfin les réunions en néerlandais sans paniquer.",
	},
	{
		id: "de-aap-komt-uit-de-mouw",
		nl: "De aap komt uit de mouw",
		literal: "le singe sort de la manche",
		sens: "la vérité ou l'intention réelle apparaît",
		contexte: "révélation, souvent un peu retorse. Médias, politique, boulot",
		fr: "le chat sort du sac",
		piege: "ce n'est pas « se ridiculiser »",
		situation:
			"Il prétendait aider « pour le bien de l'équipe ». En fait, il visait la promotion. Maintenant c'est clair.",
	},
	{
		id: "over-koetjes-en-kalfjes-praten",
		nl: "Over koetjes en kalfjes praten",
		literal: "parler de petites vaches et de veaux",
		sens: "conversation légère, sans sujet sérieux",
		contexte: "small talk, politesse, début de repas",
		fr: "parler de la pluie et du beau temps",
		piege: "ne pas traduire par des vaches. Pas forcément péjoratif",
		situation:
			"Chez des inconnus, tu restes sur le temps, les vacances, le train. Rien de personnel.",
	},
	{
		id: "iemand-een-hart-onder-de-riem-steken",
		nl: "Iemand een hart onder de riem steken",
		literal: "glisser un cœur sous la ceinture de quelqu'un",
		sens: "encourager, remonter le moral",
		contexte: "chaleureux, amis / famille / collègues proches",
		fr: "remonter le moral / soutenir",
		piege: "ce n'est pas « avoir du cœur » ni « se ceinturer »",
		situation: "Ton ami doute avant un oral. Tu lui dis qu'il est prêt, qu'il va y arriver.",
	},
	{
		id: "er-geen-kaas-van-gegeten-hebben",
		nl: "Er geen kaas van gegeten hebben",
		literal: "n'en avoir pas mangé le fromage",
		sens: "n'y connaître rien",
		contexte: "oral, un peu moqueur ou autodérision",
		fr: "n'y connaître rien / n'y entendre rien",
		piege: "pas une histoire de fromage. Construction fixe : « er geen kaas van gegeten hebben »",
		situation: "On te demande d'expliquer la fiscalité belge. Tu n'y connais absolument rien.",
	},
	{
		id: "iets-in-de-gaten-houden",
		nl: "Iets in de gaten houden",
		literal: "garder quelque chose dans les trous / ouvertures",
		sens: "surveiller, rester attentif à l'évolution",
		contexte: "ultra fréquent (enfants, mails, marché, deadline)",
		fr: "garder un œil sur",
		piege:
			"≠ « de kat uit de boom kijken » (attendre avant d'agir). Ici on suit quelque chose déjà en cours",
		situation: "Le colis est en retard. Tu checkes le suivi tous les jours.",
	},
	{
		id: "de-handdoek-in-de-ring-gooien",
		nl: "De handdoek in de ring gooien",
		literal: "jeter la serviette dans le ring",
		sens: "abandonner",
		contexte: "boxe → figuré. Projet, sport, relation",
		fr: "jeter l'éponge",
		piege: "image proche du français. Apprendre comme chunk, ne pas reconstruire",
		situation: "Après trois échecs pour réparer le vélo, tu arrêtes. C'est mort.",
	},
	{
		id: "met-de-gebakken-peren-zitten",
		nl: "Met de gebakken peren zitten",
		literal: "se retrouver avec les poires cuites",
		sens: "se retrouver coincé avec les conséquences, souvent à la place des autres",
		contexte: "reproche, injustice légère, boulot",
		fr: "se retrouver le bec dans l'eau / payer les pots cassés",
		piege: "l'idée n'est pas seulement « être dupe », c'est rester avec le problème",
		situation:
			"Tes colocs ont organisé la fête. Eux sont partis. Toi tu as la vaisselle et le propriétaire fâché.",
	},
	{
		id: "mosterd-na-de-maaltijd",
		nl: "Mosterd na de maaltijd",
		literal: "de la moutarde après le repas",
		sens: "trop tard pour servir à quelque chose",
		contexte: "conseil, info, excuse qui arrive après coup",
		fr: "trop tard / après la bataille",
		piege: "≠ « helaas pindakaas » (tant pis). Ici l'aide aurait servi plus tôt",
		situation: "L'examen est fini. Quelqu'un t'envoie enfin la fiche de révisions.",
	},
	{
		id: "helaas-pindakaas",
		nl: "Helaas pindakaas",
		literal: "malheureusement, beurre de cacahuète",
		sens: "tant pis ; c'est comme ça",
		contexte: "très oral, léger, un peu enfantin / humoristique. Pas un mail formel",
		fr: "tant pis / c'est ballot",
		piege: "aucune histoire de cacahuète. Juste une rime",
		situation:
			"Le concert est complet. Ton pote hausse les épaules : pas grave, on fera autre chose.",
	},
	{
		id: "nu-breekt-mijn-klomp",
		nl: "Nu breekt mijn klomp",
		literal: "maintenant mon sabot se casse",
		sens: "stupeur, « je n'en reviens pas »",
		contexte: "oral, expressif, un peu vieux jeu mais encore très compris / utilisé",
		fr: "ça alors / les bras m'en tombent",
		piege: "ce n'est pas de la colère, c'est de la surprise. « klomp » ≠ « claque »",
		situation: "Ton voisin silencieux gagne au loto. Tu n'en reviens pas.",
	},
	{
		id: "boter-bij-de-vis",
		nl: "Boter bij de vis",
		literal: "du beurre avec le poisson",
		sens: "on paie / on agit maintenant ; plus de promesses",
		contexte: "argent, deals, « on arrête de discuter »",
		fr: "cash / on passe à l'acte",
		piege: "≠ « met de deur in huis vallen » (parole directe). Ici : acte ou paiement",
		situation: "On a assez parlé du prix. Tu veux qu'on paie tout de suite et qu'on signe.",
	},
];

export const EXPRESSION_IDS: readonly string[] = EXPRESSIONS.map((e) => e.id);
