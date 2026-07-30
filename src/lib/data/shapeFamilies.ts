export type ShapeFamilyCluster = {
	id: string;
	name: { en: string; de: string };
	description: { en: string; de: string };
	categoryId: number;
	shapes: Array<{
		name: string;
		tip: { en: string; de: string };
	}>;
};

export const SHAPE_FAMILIES: ShapeFamilyCluster[] = [
	{
		id: 'central_america',
		name: { en: 'Central America Strip', de: 'Zentralamerika-Streifen' },
		description: {
			en: 'The narrow land bridge connecting North & South America. Frequently confused due to their narrow, curved outlines.',
			de: 'Die schmale Landbrücke zwischen Nord- und Südamerika. Wird wegen der langen, geschwungenen Formen oft verwechselt.'
		},
		categoryId: 6, // North America
		shapes: [
			{
				name: 'Guatemala',
				tip: {
					en: 'Look for the boxy norte border touching Mexico and the narrow Pacific coastline.',
					de: 'Achte auf die quadratische Nordgrenze zu Mexiko und den schmalen Pazifikstreifen.'
				}
			},
			{
				name: 'Belize',
				tip: {
					en: 'Small rectangular strip on the Caribbean side tucked right into Guatemala’s top right corner.',
					de: 'Kleine rechteckige Form an der Karibikküste oben rechts neben Guatemala.'
				}
			},
			{
				name: 'Honduras',
				tip: {
					en: 'Wide triangular shape with a long northern Caribbean coastline.',
					de: 'Breite dreieckige Form mit langer Karibikküste im Norden.'
				}
			},
			{
				name: 'El Salvador',
				tip: {
					en: 'The smallest country in Central America; the only one with NO Caribbean coast.',
					de: 'Das kleinste Land Zentralamerikas; das einzige OHNE Karibikküste.'
				}
			},
			{
				name: 'Nicaragua',
				tip: {
					en: 'Large diamond shape featuring two massive inland lakes on its southwestern side.',
					de: 'Große Rautenform mit zwei riesigen Binnenseen im Südwesten.'
				}
			},
			{
				name: 'Costa Rica',
				tip: {
					en: 'Smooth hour-glass curve pinched between Nicaragua and Panama.',
					de: 'Schmale, geschwungene Form zwischen Nicaragua und Panama.'
				}
			},
			{
				name: 'Panama',
				tip: {
					en: 'Horizontal S-shaped curve connecting to South America.',
					de: 'Waagerechte S-Kurve als Verbindung nach Südamerika.'
				}
			}
		]
	},
	{
		id: 'balkan_cluster',
		name: { en: 'Balkan Cluster', de: 'Balkan-Cluster' },
		description: {
			en: 'Southeastern Europe’s intricate mosaic of countries with jagged mountain borders and Adriatic coastline.',
			de: 'Südosteuropas vielschichtiges Mosaik aus Ländern mit bergigen Grenzen und Adriaküste.'
		},
		categoryId: 2, // Europe
		shapes: [
			{
				name: 'Slovenia',
				tip: {
					en: 'Resembles a running chicken facing right towards Hungary.',
					de: 'Sieht aus wie ein rennendes Huhn, das nach rechts in Richtung Ungarn blickt.'
				}
			},
			{
				name: 'Croatia',
				tip: {
					en: 'Distinct crescent or boomerang shape wrapping around Bosnia and Herzegovina.',
					de: 'Markante Sichel- oder Bumerangform, die sich um Bosnien und Herzegowina schlingt.'
				}
			},
			{
				name: 'Bosnia and Herzegovina',
				tip: {
					en: 'Heart-shaped interior outline with just a tiny 20km coastline pinch.',
					de: 'Herzförmiger Umriss im Landesinneren mit einer winzigen 20km Meeresküste.'
				}
			},
			{
				name: 'Serbia',
				tip: {
					en: 'Elongated north-south shape sitting in the central Balkans.',
					de: 'Langgezogene Nord-Süd-Form im Zentrum des Balkans.'
				}
			},
			{
				name: 'Montenegro',
				tip: {
					en: 'Compact oval mountain territory with a deep fjord-like bay (Bay of Kotor).',
					de: 'Kompakte ovale Form mit der tief eingeschnittenen Bucht von Kotor.'
				}
			},
			{
				name: 'Albania',
				tip: {
					en: 'Tall, narrow vertical strip along the Ionian sea opposite the heel of Italy’s boot.',
					de: 'Schmaler vertikaler Streifen am Ionischen Meer gegenüber Italiens Stiefelabsatz.'
				}
			},
			{
				name: 'North Macedonia',
				tip: {
					en: 'Landlocked oval sitting directly north of Greece.',
					de: 'Ovale Binnenland-Form direkt nördlich von Griechenland.'
				}
			}
		]
	},
	{
		id: 'horn_of_africa',
		name: { en: 'Horn of Africa', de: 'Horn von Afrika' },
		description: {
			en: 'East Africa’s horn-shaped peninsula pointing into the Arabian Sea.',
			de: 'Ostafrikas hornförmige Halbinsel am Arabischen Meer.'
		},
		categoryId: 4, // Africa
		shapes: [
			{
				name: 'Somalia',
				tip: {
					en: 'Long, narrow 7-shaped horn wrapping around Ethiopia.',
					de: 'Langes, schmales Horn in Form einer 7, das sich um Äthiopien schlingt.'
				}
			},
			{
				name: 'Ethiopia',
				tip: {
					en: 'Large rugged landlocked heart shape in the center of the Horn.',
					de: 'Großes herzförmiges Binnenland im Zentrum des Horns.'
				}
			},
			{
				name: 'Eritrea',
				tip: {
					en: 'Narrow coastal ribbon hugging the southwestern Red Sea shore.',
					de: 'Schmales Küstenband entlang des Roten Meeres.'
				}
			},
			{
				name: 'Djibouti',
				tip: {
					en: 'Tiny wedge-shaped territory at the entrance to the Red Sea.',
					de: 'Winziger keilförmiger Staat am Eingang des Roten Meeres.'
				}
			}
		]
	},
	{
		id: 'nordic_baltic',
		name: { en: 'Nordic & Baltic Cluster', de: 'Nordische & Baltische Staaten' },
		description: {
			en: 'Northern Europe’s peninsulas and eastern Baltic Sea coastal states.',
			de: 'Nordeuropas Halbinseln und östliche Ostsee-Anrainerstaaten.'
		},
		categoryId: 2, // Europe
		shapes: [
			{
				name: 'Norway',
				tip: {
					en: 'Extremely long, thin country with a coastline carved by thousands of fjords.',
					de: 'Extrem langes, schmales Land mit von tausenden Fjorden zerklüfteter Küste.'
				}
			},
			{
				name: 'Sweden',
				tip: {
					en: 'Broad elongated Scandinavian spine bordering Norway to the west.',
					de: 'Breiter skandinavischer Rücken östlich von Norwegen.'
				}
			},
			{
				name: 'Finland',
				tip: {
					en: 'Resembles a figure standing with one arm raised (the Maiden of Finland).',
					de: 'Erinnert an eine stehende Figur mit erhobenem Arm.'
				}
			},
			{
				name: 'Estonia',
				tip: {
					en: 'Northernmost Baltic state featuring two large offshore islands (Saaremaa & Hiiumaa).',
					de: 'Nördlichster Baltenstaat mit zwei großen Inseln (Saaremaa & Hiiumaa).'
				}
			},
			{
				name: 'Latvia',
				tip: {
					en: 'Butterfly or insect shape nestled in the middle of the Baltic trio.',
					de: 'Schmetterlingsförmiges Land in der Mitte des Baltikums.'
				}
			},
			{
				name: 'Lithuania',
				tip: {
					en: 'Southernmost Baltic country shaped roughly like a miniature Africa.',
					de: 'Südlichster Baltenstaat, der grob wie ein kleines Afrika geformt ist.'
				}
			}
		]
	},
	{
		id: 'central_europe',
		name: { en: 'Central European Compact Lookalikes', de: 'Mitteleuropäische Doppelgänger' },
		description: {
			en: 'Compact landlocked countries in Central Europe often confused under fast round timers.',
			de: 'Kompakte Binnenländer in Mitteleuropa, die bei schnellen Runden leicht verwechselt werden.'
		},
		categoryId: 2, // Europe
		shapes: [
			{
				name: 'Austria',
				tip: {
					en: 'Famous schnitzel or guitar shape stretching east to west.',
					de: 'Berühmte Schnitzel- oder Gitarrenform, die sich von West nach Ost erstreckt.'
				}
			},
			{
				name: 'Switzerland',
				tip: {
					en: 'Compact, squarish alpine country tucked between France, Italy, and Germany.',
					de: 'Kompaktes, fast quadratisches Alpenland zwischen Frankreich, Italien und Deutschland.'
				}
			},
			{
				name: 'Slovakia',
				tip: {
					en: 'Elongated horizontal country sitting directly east of the Czech Republic.',
					de: 'Langgezogenes waagerechtes Land östlich der Tschechischen Republik.'
				}
			},
			{
				name: 'Hungary',
				tip: {
					en: 'Oval basin outline shaped like a wide kidney bean.',
					de: 'Ovale Form im Pannonischen Becken, ähnlich einer breiten Bohne.'
				}
			}
		]
	}
];
