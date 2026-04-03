const addDays = (dateValue, days) => {
  if (!dateValue || !Number.isFinite(days)) return ''
  const date = new Date(`${dateValue}T00:00:00`)
  if (Number.isNaN(date.getTime())) return ''
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export const BREEDS_BY_SPECIES = {
  COW: ['Gir', 'Sahiwal', 'Red Sindhi', 'Tharparkar', 'Holstein Friesian', 'Jersey', 'Kankrej', 'Hariana', 'Ongole', 'Rathi'],
  BUFFALO: ['Murrah', 'Jaffarabadi', 'Mehsana', 'Surti', 'Bhadawari', 'Nagpuri', 'Pandharpuri', 'Nili-Ravi'],
  GOAT: ['Jamunapari', 'Beetal', 'Barbari', 'Sirohi', 'Black Bengal', 'Osmanabadi', 'Malabari', 'Jakhrana'],
  SHEEP: ['Marwari', 'Nellore', 'Deccani', 'Magra', 'Chokla', 'Muzaffarnagri', 'Patanwadi', 'Mandya'],
  PIG: ['Large White Yorkshire', 'Landrace', 'Hampshire', 'Ghungroo', 'Niang Megha', 'Local Desi'],
  POULTRY: ['Kadaknath', 'Aseel', 'Vanaraja', 'Gramapriya', 'White Leghorn', 'Broiler'],
  HORSE: ['Marwari', 'Kathiawari', 'Manipuri', 'Spiti', 'Zanskari', 'Bhutia'],
  CAMEL: ['Bikaneri', 'Jaisalmeri', 'Kachchhi', 'Mewari'],
  RABBIT: ['New Zealand White', 'Soviet Chinchilla', 'Grey Giant', 'White Giant', 'Angora'],
  OTHERS: [],
}

export const getBreedOptions = (species) => BREEDS_BY_SPECIES[species] || []

export const VACCINE_LIBRARY = [
  {
    key: 'FMD',
    name: 'Foot and Mouth Disease (FMD) Vaccine',
    disease: 'Foot and Mouth Disease',
    species: ['COW', 'BUFFALO', 'GOAT', 'SHEEP', 'PIG'],
    nextDueDays: 180,
    withdrawalBySpecies: {
      COW: { milkDays: 3, meatDays: 21 },
      BUFFALO: { milkDays: 3, meatDays: 21 },
      GOAT: { milkDays: 0, meatDays: 14 },
      SHEEP: { milkDays: 0, meatDays: 14 },
      PIG: { milkDays: 0, meatDays: 14 },
    },
  },
  {
    key: 'HS',
    name: 'Haemorrhagic Septicaemia Vaccine',
    disease: 'Haemorrhagic Septicaemia',
    species: ['COW', 'BUFFALO'],
    nextDueDays: 365,
    withdrawalBySpecies: {
      COW: { milkDays: 2, meatDays: 21 },
      BUFFALO: { milkDays: 2, meatDays: 21 },
    },
  },
  {
    key: 'BQ',
    name: 'Black Quarter Vaccine',
    disease: 'Black Quarter',
    species: ['COW', 'BUFFALO'],
    nextDueDays: 365,
    withdrawalBySpecies: {
      COW: { milkDays: 2, meatDays: 21 },
      BUFFALO: { milkDays: 2, meatDays: 21 },
    },
  },
  {
    key: 'BRUCELLOSIS',
    name: 'Brucellosis S19 Vaccine',
    disease: 'Brucellosis',
    species: ['COW', 'BUFFALO'],
    nextDueDays: 0,
    withdrawalBySpecies: {
      COW: { milkDays: 7, meatDays: 30 },
      BUFFALO: { milkDays: 7, meatDays: 30 },
    },
  },
  {
    key: 'PPR',
    name: 'PPR Vaccine',
    disease: 'Peste des Petits Ruminants',
    species: ['GOAT', 'SHEEP'],
    nextDueDays: 1095,
    withdrawalBySpecies: {
      GOAT: { milkDays: 0, meatDays: 14 },
      SHEEP: { milkDays: 0, meatDays: 14 },
    },
  },
  {
    key: 'ET',
    name: 'Enterotoxaemia Vaccine',
    disease: 'Enterotoxaemia',
    species: ['GOAT', 'SHEEP'],
    nextDueDays: 365,
    withdrawalBySpecies: {
      GOAT: { milkDays: 0, meatDays: 14 },
      SHEEP: { milkDays: 0, meatDays: 14 },
    },
  },
  {
    key: 'SHEEP_POX',
    name: 'Sheep / Goat Pox Vaccine',
    disease: 'Sheep Pox / Goat Pox',
    species: ['GOAT', 'SHEEP'],
    nextDueDays: 365,
    withdrawalBySpecies: {
      GOAT: { milkDays: 0, meatDays: 14 },
      SHEEP: { milkDays: 0, meatDays: 14 },
    },
  },
  {
    key: 'RABIES',
    name: 'Rabies Vaccine',
    disease: 'Rabies',
    species: ['COW', 'BUFFALO', 'GOAT', 'SHEEP', 'PIG', 'HORSE', 'CAMEL', 'RABBIT', 'OTHERS'],
    nextDueDays: 365,
    withdrawalBySpecies: {},
  },
]

export const getVaccinesForSpecies = (species) =>
  VACCINE_LIBRARY.filter((vaccine) => vaccine.species.includes(species) || vaccine.species.includes('OTHERS'))

export const getVaccineProfile = (species, vaccineKey) => {
  const vaccine = VACCINE_LIBRARY.find((entry) => entry.key === vaccineKey)
  if (!vaccine) return null
  const withdrawal = vaccine.withdrawalBySpecies?.[species] || vaccine.withdrawalBySpecies?.OTHERS || { milkDays: 0, meatDays: 0 }
  return { ...vaccine, ...withdrawal }
}

export const buildVaccinationSuggestion = (species, vaccineKey, vaccinationDate) => {
  const profile = getVaccineProfile(species, vaccineKey)
  if (!profile) return null
  return {
    vaccineName: profile.name,
    disease: profile.disease,
    nextDueDate: profile.nextDueDays > 0 ? addDays(vaccinationDate, profile.nextDueDays) : '',
    milkWithdrawalDays: profile.milkDays || 0,
    meatWithdrawalDays: profile.meatDays || 0,
  }
}

export const AMR_DRUG_LIBRARY = [
  {
    key: 'OXYTETRACYCLINE',
    drugName: 'Oxytetracycline',
    activeIngredient: 'Oxytetracycline',
    drugClass: 'TETRACYCLINES',
    dosage: '10 mg/kg',
    routeOfAdministration: 'INJECTABLE',
    durationDays: 5,
    criticallyImportantAntibiotic: false,
    withdrawalBySpecies: {
      COW: { milkDays: 4, meatDays: 14 },
      BUFFALO: { milkDays: 4, meatDays: 14 },
      GOAT: { milkDays: 0, meatDays: 14 },
      SHEEP: { milkDays: 0, meatDays: 14 },
      PIG: { milkDays: 0, meatDays: 8 },
    },
  },
  {
    key: 'CEFTIOFUR',
    drugName: 'Ceftiofur',
    activeIngredient: 'Ceftiofur Sodium',
    drugClass: 'CEPHALOSPORINS',
    dosage: '1-2.2 mg/kg',
    routeOfAdministration: 'INJECTABLE',
    durationDays: 3,
    criticallyImportantAntibiotic: true,
    withdrawalBySpecies: {
      COW: { milkDays: 0, meatDays: 4 },
      BUFFALO: { milkDays: 0, meatDays: 4 },
      GOAT: { milkDays: 0, meatDays: 8 },
      SHEEP: { milkDays: 0, meatDays: 8 },
      PIG: { milkDays: 0, meatDays: 5 },
    },
  },
  {
    key: 'ENROFLOXACIN',
    drugName: 'Enrofloxacin',
    activeIngredient: 'Enrofloxacin',
    drugClass: 'FLUOROQUINOLONES',
    dosage: '5 mg/kg',
    routeOfAdministration: 'ORAL',
    durationDays: 5,
    criticallyImportantAntibiotic: true,
    withdrawalBySpecies: {
      COW: { milkDays: 4, meatDays: 14 },
      BUFFALO: { milkDays: 4, meatDays: 14 },
      GOAT: { milkDays: 0, meatDays: 14 },
      SHEEP: { milkDays: 0, meatDays: 14 },
      PIG: { milkDays: 0, meatDays: 10 },
      POULTRY: { milkDays: 0, meatDays: 8 },
    },
  },
  {
    key: 'AMOXICILLIN',
    drugName: 'Amoxicillin',
    activeIngredient: 'Amoxicillin Trihydrate',
    drugClass: 'BETA_LACTAMS',
    dosage: '10-15 mg/kg',
    routeOfAdministration: 'ORAL',
    durationDays: 5,
    criticallyImportantAntibiotic: false,
    withdrawalBySpecies: {
      COW: { milkDays: 3, meatDays: 14 },
      BUFFALO: { milkDays: 3, meatDays: 14 },
      GOAT: { milkDays: 0, meatDays: 10 },
      SHEEP: { milkDays: 0, meatDays: 10 },
      PIG: { milkDays: 0, meatDays: 7 },
    },
  },
  {
    key: 'TYLOSIN',
    drugName: 'Tylosin',
    activeIngredient: 'Tylosin Tartrate',
    drugClass: 'MACROLIDES',
    dosage: '10 mg/kg',
    routeOfAdministration: 'INJECTABLE',
    durationDays: 3,
    criticallyImportantAntibiotic: false,
    withdrawalBySpecies: {
      COW: { milkDays: 4, meatDays: 21 },
      BUFFALO: { milkDays: 4, meatDays: 21 },
      GOAT: { milkDays: 0, meatDays: 14 },
      SHEEP: { milkDays: 0, meatDays: 14 },
      PIG: { milkDays: 0, meatDays: 14 },
    },
  },
]

export const getDrugProfile = (drugKey, species) => {
  const drug = AMR_DRUG_LIBRARY.find((entry) => entry.key === drugKey)
  if (!drug) return null
  const withdrawal = drug.withdrawalBySpecies?.[species] || drug.withdrawalBySpecies?.OTHERS || { milkDays: 0, meatDays: 0 }
  return {
    ...drug,
    milkWithdrawalDays: withdrawal.milkDays || 0,
    meatWithdrawalDays: withdrawal.meatDays || 0,
  }
}

export const MRL_PARAMETER_LIBRARY = [
  { key: 'OXYTETRACYCLINE_MILK', parameterName: 'Oxytetracycline', sampleTypes: ['MILK'], category: 'Antibiotic', unit: 'ppb', mrlLimit: 100, mrlStandard: 'FSSAI' },
  { key: 'OXYTETRACYCLINE_MEAT', parameterName: 'Oxytetracycline', sampleTypes: ['MEAT'], category: 'Antibiotic', unit: 'ppb', mrlLimit: 200, mrlStandard: 'Codex' },
  { key: 'ENROFLOXACIN_MILK', parameterName: 'Enrofloxacin', sampleTypes: ['MILK'], category: 'Antibiotic', unit: 'ppb', mrlLimit: 100, mrlStandard: 'FSSAI' },
  { key: 'AMOXICILLIN_MILK', parameterName: 'Amoxicillin', sampleTypes: ['MILK'], category: 'Antibiotic', unit: 'ppb', mrlLimit: 4, mrlStandard: 'Codex' },
  { key: 'AFLATOXIN_M1', parameterName: 'Aflatoxin M1', sampleTypes: ['MILK'], category: 'Mycotoxin', unit: 'ppb', mrlLimit: 0.5, mrlStandard: 'FSSAI' },
  { key: 'LEAD_MEAT', parameterName: 'Lead', sampleTypes: ['MEAT'], category: 'Heavy Metal', unit: 'ppm', mrlLimit: 0.1, mrlStandard: 'FSSAI' },
  { key: 'CADMIUM_MEAT', parameterName: 'Cadmium', sampleTypes: ['MEAT'], category: 'Heavy Metal', unit: 'ppm', mrlLimit: 0.05, mrlStandard: 'FSSAI' },
]

export const getMrlParameterOptions = (sampleType) =>
  MRL_PARAMETER_LIBRARY.filter((item) => !sampleType || item.sampleTypes.includes(sampleType))

export const getMrlParameterProfile = (catalogKey) =>
  MRL_PARAMETER_LIBRARY.find((item) => item.key === catalogKey) || null

export const getWithdrawalSummary = (milkDays, meatDays) => {
  if (!milkDays && !meatDays) return 'No standard withdrawal advisory configured for this selection.'
  const parts = []
  if (milkDays) parts.push(`milk ${milkDays} day${milkDays === 1 ? '' : 's'}`)
  if (meatDays) parts.push(`meat ${meatDays} day${meatDays === 1 ? '' : 's'}`)
  return `Recommended withdrawal advisory: ${parts.join(', ')}.`
}

