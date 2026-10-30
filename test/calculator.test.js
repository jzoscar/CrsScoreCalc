const test = require('node:test')
const assert = require('node:assert/strict')
const { calculateCRS, LANGUAGE_CONVERTERS } = require('../index.js')

test('Calculates CRS score for single applicant with Master degree & CLB 9+ & 3yr foreign work & 1yr CA work', () => {
  const result = calculateCRS({
    maritalStatus: 'single',
    age: '29',
    education: 'master',
    firstLangReading: '9',
    firstLangWriting: '9',
    firstLangSpeaking: '9',
    firstLangListening: '9',
    hasSecondLanguage: 'no',
    canadianWorkExperience: '1',
    foreignWorkExperience: '3',
    hasTradeCertificate: 'no',
    hasSiblingInCanada: 'no',
    canadianEducation: '1-2-year',
    arrangedEmployment: 'none',
    hasPnp: 'no'
  })

  assert.equal(result.sectionA.age, 110)
  assert.equal(result.sectionA.education, 135)
  assert.equal(result.sectionA.firstLanguage, 124)
  assert.equal(result.sectionA.canadianWork, 40)
  assert.equal(result.sectionA.total, 409)

  assert.equal(result.sectionB.total, 0)
  assert.equal(result.sectionC.total, 100)
  assert.equal(result.sectionD.total, 15)
  assert.equal(result.total, 524)
})

test('Calculates CRS score for married applicant with accompanying spouse', () => {
  const result = calculateCRS({
    maritalStatus: 'married',
    spouseIsCitizenOrPR: 'no',
    spouseAccompanying: 'yes',
    age: '30',
    education: 'bachelor',
    firstLangReading: '10',
    firstLangWriting: '10',
    firstLangSpeaking: '10',
    firstLangListening: '10',
    hasSecondLanguage: 'no',
    canadianWorkExperience: '2',
    foreignWorkExperience: '0',
    spouseEducation: 'bachelor',
    spouseLangReading: '9',
    spouseLangWriting: '9',
    spouseLangSpeaking: '9',
    spouseLangListening: '9',
    spouseCanadianWorkExperience: '1',
    hasTradeCertificate: 'no',
    hasSiblingInCanada: 'no',
    canadianEducation: 'none',
    arrangedEmployment: 'none',
    hasPnp: 'yes'
  })

  assert.equal(result.hasAccompanyingSpouse, true)
  assert.equal(result.sectionA.age, 95)
  assert.equal(result.sectionA.education, 112)
  assert.equal(result.sectionA.firstLanguage, 128)
  assert.equal(result.sectionA.canadianWork, 46)
  assert.equal(result.sectionA.total, 381)

  assert.equal(result.sectionB.education, 8)
  assert.equal(result.sectionB.language, 20)
  assert.equal(result.sectionB.canadianWork, 5)
  assert.equal(result.sectionB.total, 33)

  assert.equal(result.sectionC.total, 50)
  assert.equal(result.sectionD.total, 600)
  assert.equal(result.total, 1064)
})

test('Calculates French language bonus points (25 vs 50)', () => {
  const resFrenchOnly = calculateCRS({
    maritalStatus: 'single',
    age: '25',
    education: 'bachelor',
    firstLanguageType: 'french',
    firstLangReading: '7',
    firstLangWriting: '7',
    firstLangSpeaking: '7',
    firstLangListening: '7',
    hasSecondLanguage: 'no'
  })
  assert.equal(resFrenchOnly.sectionD.french, 25)

  const resBilingual = calculateCRS({
    maritalStatus: 'single',
    age: '25',
    education: 'bachelor',
    firstLanguageType: 'french',
    firstLangReading: '7',
    firstLangWriting: '7',
    firstLangSpeaking: '7',
    firstLangListening: '7',
    hasSecondLanguage: 'yes',
    secondLanguageType: 'english',
    secondLangReading: '5',
    secondLangWriting: '5',
    secondLangSpeaking: '5',
    secondLangListening: '5'
  })
  assert.equal(resBilingual.sectionD.french, 50)
})

test('Calculates 2026 Labour Market Integration high-wage Canadian work points', () => {
  // 1 yr CA work (40) + 1.3x (+20) = 60
  const res1_3x = calculateCRS({
    maritalStatus: 'single',
    age: '25',
    education: 'bachelor',
    firstLangReading: '9',
    firstLangWriting: '9',
    firstLangSpeaking: '9',
    firstLangListening: '9',
    canadianWorkExperience: '1',
    canadianHighWageExperience: 'wage-1.3x'
  })
  assert.equal(res1_3x.labourMarketIntegration.canadianWork.workLengthPoints, 40)
  assert.equal(res1_3x.labourMarketIntegration.canadianWork.highWagePoints, 20)
  assert.equal(res1_3x.labourMarketIntegration.canadianWork.total, 60)
  assert.equal(res1_3x.labourMarketIntegration.total, 60)

  // 1 yr CA work (40) + 1.5x (+40) = 80
  const res1_5x = calculateCRS({
    maritalStatus: 'single',
    age: '25',
    education: 'bachelor',
    firstLangReading: '9',
    firstLangWriting: '9',
    firstLangSpeaking: '9',
    firstLangListening: '9',
    canadianWorkExperience: '1',
    canadianHighWageExperience: 'wage-1.5x'
  })
  assert.equal(res1_5x.labourMarketIntegration.canadianWork.highWagePoints, 40)
  assert.equal(res1_5x.labourMarketIntegration.total, 80)

  // 5 yr CA work (80) + 2.0x (+70) = 150 (single max)
  const res2x = calculateCRS({
    maritalStatus: 'single',
    age: '25',
    education: 'bachelor',
    firstLangReading: '9',
    firstLangWriting: '9',
    firstLangSpeaking: '9',
    firstLangListening: '9',
    canadianWorkExperience: '5',
    canadianHighWageExperience: 'wage-2x'
  })
  assert.equal(res2x.labourMarketIntegration.canadianWork.highWagePoints, 70)
  assert.equal(res2x.labourMarketIntegration.total, 150)

  // With spouse: 5 yr CA work (70) + 2.0x (+70) = 140 (married max)
  const resMarried2x = calculateCRS({
    maritalStatus: 'married',
    spouseIsCitizenOrPR: 'no',
    spouseAccompanying: 'yes',
    age: '25',
    education: 'bachelor',
    firstLangReading: '9',
    firstLangWriting: '9',
    firstLangSpeaking: '9',
    firstLangListening: '9',
    canadianWorkExperience: '5',
    canadianHighWageExperience: 'wage-2x'
  })
  assert.equal(resMarried2x.labourMarketIntegration.canadianWork.workLengthPoints, 70)
  assert.equal(resMarried2x.labourMarketIntegration.canadianWork.highWagePoints, 70)
  assert.equal(resMarried2x.labourMarketIntegration.total, 140)
})

test('Calculates 2026 Job Offer points (no LMIA required) and Labour Market Integration either/or selection', () => {
  // Case 1: No CA work, but has Job Offer 2.0x (100 pts) -> picks Job Offer
  const resOfferOnly = calculateCRS({
    maritalStatus: 'single',
    age: '25',
    education: 'bachelor',
    firstLangReading: '9',
    firstLangWriting: '9',
    firstLangSpeaking: '9',
    firstLangListening: '9',
    canadianWorkExperience: '0',
    hasJobOffer: 'yes',
    jobOfferWageLevel: 'offer-2x'
  })
  assert.equal(resOfferOnly.labourMarketIntegration.jobOffer.total, 100)
  assert.equal(resOfferOnly.labourMarketIntegration.selectedFactor, 'jobOffer')
  assert.equal(resOfferOnly.labourMarketIntegration.total, 100)

  // Case 2: 1 yr CA work (40 pts) vs Job Offer 1.5x (70 pts) -> picks Job Offer (70 pts)
  const resOfferWins = calculateCRS({
    maritalStatus: 'single',
    age: '25',
    education: 'bachelor',
    firstLangReading: '9',
    firstLangWriting: '9',
    firstLangSpeaking: '9',
    firstLangListening: '9',
    canadianWorkExperience: '1',
    canadianHighWageExperience: 'none', // 40 pts
    hasJobOffer: 'yes',
    jobOfferWageLevel: 'offer-1.5x' // 70 pts
  })
  assert.equal(resOfferWins.labourMarketIntegration.canadianWork.total, 40)
  assert.equal(resOfferWins.labourMarketIntegration.jobOffer.total, 70)
  assert.equal(resOfferWins.labourMarketIntegration.selectedFactor, 'jobOffer')
  assert.equal(resOfferWins.labourMarketIntegration.total, 70)

  // Case 3: 2 yr CA work + 2.0x high wage (53 + 70 = 123 pts) vs Job Offer 2.0x (100 pts) -> picks Canadian Work (123 pts)
  const resWorkWins = calculateCRS({
    maritalStatus: 'single',
    age: '25',
    education: 'bachelor',
    firstLangReading: '9',
    firstLangWriting: '9',
    firstLangSpeaking: '9',
    firstLangListening: '9',
    canadianWorkExperience: '2',
    canadianHighWageExperience: 'wage-2x', // 53 + 70 = 123 pts
    hasJobOffer: 'yes',
    jobOfferWageLevel: 'offer-2x' // 100 pts
  })
  assert.equal(resWorkWins.labourMarketIntegration.canadianWork.total, 123)
  assert.equal(resWorkWins.labourMarketIntegration.jobOffer.total, 100)
  assert.equal(resWorkWins.labourMarketIntegration.selectedFactor, 'canadianWork')
  assert.equal(resWorkWins.labourMarketIntegration.total, 123)
})

test('Calculates arranged employment and sibling bonus points', () => {
  const resJob00 = calculateCRS({
    maritalStatus: 'single',
    age: '30',
    education: 'bachelor',
    firstLangReading: '7',
    firstLangWriting: '7',
    firstLangSpeaking: '7',
    firstLangListening: '7',
    hasJobOffer: 'yes',
    jobOfferWageLevel: 'offer-2x',
    hasSiblingInCanada: 'yes'
  })
  assert.equal(resJob00.labourMarketIntegration.jobOffer.total, 100)
  assert.equal(resJob00.sectionD.sibling, 15)

  const resJobGeneral = calculateCRS({
    maritalStatus: 'single',
    age: '30',
    education: 'bachelor',
    firstLangReading: '7',
    firstLangWriting: '7',
    firstLangSpeaking: '7',
    firstLangListening: '7',
    hasJobOffer: 'yes',
    jobOfferWageLevel: 'offer-1.3x',
    hasSiblingInCanada: 'no'
  })
  assert.equal(resJobGeneral.labourMarketIntegration.jobOffer.total, 50)
  assert.equal(resJobGeneral.sectionD.sibling, 0)
})

test('Skill transferability respects 100-point maximum cap', () => {
  const result = calculateCRS({
    maritalStatus: 'single',
    age: '28',
    education: 'master', // Tier 2
    firstLangReading: '9',
    firstLangWriting: '9',
    firstLangSpeaking: '9',
    firstLangListening: '9',
    canadianWorkExperience: '3', // 3 yrs CA
    foreignWorkExperience: '3', // 3 yrs Foreign
    hasTradeCertificate: 'yes' // Trade cert
  })
  // Edu+Lang = 50, Edu+CaWork = 50 -> subtotal capped at 50
  // Foreign+Lang = 50, Foreign+CaWork = 50 -> subtotal capped at 50
  // Trade = 50
  // Sum = 150 -> Capped at 100 for Section C!
  assert.equal(result.sectionC.educationTransferability, 50)
  assert.equal(result.sectionC.foreignWorkTransferability, 50)
  assert.equal(result.sectionC.tradePoints, 50)
  assert.equal(result.sectionC.total, 100)
})

test('Converts IELTS / PTE / CELPIP / TEF / TCF correctly', () => {
  // IELTS
  assert.equal(LANGUAGE_CONVERTERS.ielts.reading(8.0), 10)
  assert.equal(LANGUAGE_CONVERTERS.ielts.reading(7.0), 9)
  assert.equal(LANGUAGE_CONVERTERS.ielts.reading(6.5), 8)
  assert.equal(LANGUAGE_CONVERTERS.ielts.reading(6.0), 7)
  assert.equal(LANGUAGE_CONVERTERS.ielts.reading(5.0), 6)
  assert.equal(LANGUAGE_CONVERTERS.ielts.reading(4.0), 5)
  assert.equal(LANGUAGE_CONVERTERS.ielts.reading(3.5), 4)

  assert.equal(LANGUAGE_CONVERTERS.ielts.listening(8.5), 10)
  assert.equal(LANGUAGE_CONVERTERS.ielts.listening(8.0), 9)
  assert.equal(LANGUAGE_CONVERTERS.ielts.listening(7.5), 8)
  assert.equal(LANGUAGE_CONVERTERS.ielts.listening(6.0), 7)

  // PTE Core
  assert.equal(LANGUAGE_CONVERTERS.pte.reading(88), 10)
  assert.equal(LANGUAGE_CONVERTERS.pte.reading(78), 9)
  assert.equal(LANGUAGE_CONVERTERS.pte.writing(90), 10)
  assert.equal(LANGUAGE_CONVERTERS.pte.speaking(84), 9)

  // CELPIP
  assert.equal(LANGUAGE_CONVERTERS.celpip.reading(9), 9)
  assert.equal(LANGUAGE_CONVERTERS.celpip.writing(7), 7)

  // TEF
  assert.equal(LANGUAGE_CONVERTERS.tef.reading(263), 10)
  assert.equal(LANGUAGE_CONVERTERS.tef.listening(298), 9)

  // TCF
  assert.equal(LANGUAGE_CONVERTERS.tcf.reading(549), 10)
  assert.equal(LANGUAGE_CONVERTERS.tcf.writing(14), 9)
})
