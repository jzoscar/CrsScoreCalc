const CRS_CONFIG = {
  // Section A - Age
  agePoints: {
    withSpouse: {
      under18: 0,
      18: 90, 19: 95, 20: 100, 21: 100, 22: 100, 23: 100, 24: 100, 25: 100, 26: 100, 27: 100, 28: 100, 29: 100,
      30: 95, 31: 90, 32: 85, 33: 80, 34: 75, 35: 70, 36: 65, 37: 60, 38: 55, 39: 50,
      40: 45, 41: 35, 42: 25, 43: 15, 44: 5, 45: 0
    },
    withoutSpouse: {
      under18: 0,
      18: 99, 19: 105, 20: 110, 21: 110, 22: 110, 23: 110, 24: 110, 25: 110, 26: 110, 27: 110, 28: 110, 29: 110,
      30: 105, 31: 99, 32: 94, 33: 88, 34: 83, 35: 77, 36: 72, 37: 66, 38: 61, 39: 55,
      40: 50, 41: 39, 42: 28, 43: 17, 44: 6, 45: 0
    }
  },

  // Section A & B - Education Level
  educationPoints: {
    withSpouse: {
      none: 0,
      secondary: 28,
      oneYear: 84,
      twoYear: 91,
      bachelor: 112,
      twoOrMore: 119,
      master: 126,
      doctoral: 140
    },
    withoutSpouse: {
      none: 0,
      secondary: 30,
      oneYear: 90,
      twoYear: 98,
      bachelor: 120,
      twoOrMore: 128,
      master: 135,
      doctoral: 150
    },
    spouse: {
      none: 0,
      secondary: 2,
      oneYear: 6,
      twoYear: 7,
      bachelor: 8,
      twoOrMore: 9,
      master: 10,
      doctoral: 10
    }
  },

  // Section A - First Official Language (points per ability)
  firstLanguagePoints: {
    withSpouse: {
      less4: 0,
      clb4: 6, clb5: 6,
      clb6: 8,
      clb7: 16,
      clb8: 22,
      clb9: 29,
      clb10: 32
    },
    withoutSpouse: {
      less4: 0,
      clb4: 6, clb5: 6,
      clb6: 9,
      clb7: 17,
      clb8: 23,
      clb9: 31,
      clb10: 34
    }
  },

  // Section A - Second Official Language (points per ability)
  secondLanguagePoints: {
    withSpouse: {
      less4: 0,
      clb4: 0,
      clb5: 1, clb6: 1,
      clb7: 3, clb8: 3,
      clb9: 6, clb10: 6
    },
    withoutSpouse: {
      less4: 0,
      clb4: 0,
      clb5: 1, clb6: 1,
      clb7: 3, clb8: 3,
      clb9: 6, clb10: 6
    }
  },

  // Section B - Spouse Language (points per ability)
  spouseLanguagePoints: {
    less4: 0,
    clb4: 0,
    clb5: 1, clb6: 1,
    clb7: 3, clb8: 3,
    clb9: 5, clb10: 5
  },

  // Section A & B - Canadian Work Experience
  canadianWorkPoints: {
    withSpouse: {
      none: 0,
      1: 35,
      2: 46,
      3: 56,
      4: 63,
      5: 70
    },
    withoutSpouse: {
      none: 0,
      1: 40,
      2: 53,
      3: 64,
      4: 72,
      5: 80
    },
    spouse: {
      none: 0,
      1: 5,
      2: 7,
      3: 8,
      4: 9,
      5: 10
    }
  }
}

function getAgeKey(age) {
  const num = parseInt(age, 10)
  if (isNaN(num) || num < 18) return 'under18'
  if (num >= 45) return '45'
  return String(num)
}

function getClbKey(clb) {
  if (!clb) return 'less4'
  const str = String(clb).toLowerCase().trim()
  if (str === 'less4' || str === '<4' || str === '<5' || str === '0' || str === '1' || str === '2' || str === '3') return 'less4'
  const num = parseInt(str.replace(/\D/g, ''), 10)
  if (isNaN(num) || num < 4) return 'less4'
  if (num >= 10) return 'clb10'
  return `clb${num}`
}

function getClbLevel(clb) {
  if (!clb) return 0
  const str = String(clb).toLowerCase().trim()
  if (str.includes('less') || str.includes('<') || str === '0') return 0
  const num = parseInt(str.replace(/\D/g, ''), 10)
  return isNaN(num) ? 0 : num
}

function getWorkYearsKey(years) {
  const num = parseInt(years, 10)
  if (isNaN(num) || num <= 0) return 'none'
  if (num >= 5) return '5'
  return String(num)
}

/**
 * Main CRS Calculation Function (Updated with 2026 IRCC Labour Market Integration rules)
 */
function calculateCRS(input = {}) {
  const isMarried = input.maritalStatus === 'married' || input.maritalStatus === 'common-law'
  const spouseIsCitizenOrPR = input.spouseIsCitizenOrPR === 'yes' || input.spouseIsCitizenOrPR === true
  const spouseAccompanying = input.spouseAccompanying === 'yes' || input.spouseAccompanying === true

  const hasAccompanyingSpouse = isMarried && !spouseIsCitizenOrPR && spouseAccompanying
  const spouseMode = hasAccompanyingSpouse ? 'withSpouse' : 'withoutSpouse'

  // Section A - Core Human Capital
  const ageKey = getAgeKey(input.age)
  const ageScore = CRS_CONFIG.agePoints[spouseMode][ageKey] || 0

  const eduKey = input.education || 'none'
  const educationScore = CRS_CONFIG.educationPoints[spouseMode][eduKey] || 0

  const firstLangScores = {
    reading: CRS_CONFIG.firstLanguagePoints[spouseMode][getClbKey(input.firstLangReading)] || 0,
    writing: CRS_CONFIG.firstLanguagePoints[spouseMode][getClbKey(input.firstLangWriting)] || 0,
    speaking: CRS_CONFIG.firstLanguagePoints[spouseMode][getClbKey(input.firstLangSpeaking)] || 0,
    listening: CRS_CONFIG.firstLanguagePoints[spouseMode][getClbKey(input.firstLangListening)] || 0
  }
  const firstLanguageTotal = firstLangScores.reading + firstLangScores.writing + firstLangScores.speaking + firstLangScores.listening

  let secondLangScores = { reading: 0, writing: 0, speaking: 0, listening: 0 }
  let secondLanguageTotal = 0
  if (input.hasSecondLanguage === 'yes' || input.hasSecondLanguage === true) {
    secondLangScores = {
      reading: CRS_CONFIG.secondLanguagePoints[spouseMode][getClbKey(input.secondLangReading)] || 0,
      writing: CRS_CONFIG.secondLanguagePoints[spouseMode][getClbKey(input.secondLangWriting)] || 0,
      speaking: CRS_CONFIG.secondLanguagePoints[spouseMode][getClbKey(input.secondLangSpeaking)] || 0,
      listening: CRS_CONFIG.secondLanguagePoints[spouseMode][getClbKey(input.secondLangListening)] || 0
    }
    const rawSecondTotal = secondLangScores.reading + secondLangScores.writing + secondLangScores.speaking + secondLangScores.listening
    const maxSecond = hasAccompanyingSpouse ? 22 : 24
    secondLanguageTotal = Math.min(rawSecondTotal, maxSecond)
  }

  // 2026 Labour Market Integration Factor (劳动力市场整合因素)
  // 1. Canadian Work Experience (Work-length + High-wage occupation points)
  const caWorkKey = getWorkYearsKey(input.canadianWorkExperience)
  const caWorkYears = parseInt(input.canadianWorkExperience, 10) || 0
  const caWorkLengthScore = CRS_CONFIG.canadianWorkPoints[spouseMode][caWorkKey] || 0

  let caHighWageScore = 0
  if (caWorkYears >= 1) {
    if (input.canadianHighWageExperience === 'wage-2x') {
      caHighWageScore = 70
    } else if (input.canadianHighWageExperience === 'wage-1.5x') {
      caHighWageScore = 40
    } else if (input.canadianHighWageExperience === 'wage-1.3x') {
      caHighWageScore = 20
    }
  }
  const canadianWorkTotal = caWorkLengthScore + caHighWageScore

  // 2. Qualifying Job Offer (2026: No LMIA required; based on High-wage occupation levels)
  let jobOfferScore = 0
  const hasJobOffer = input.hasJobOffer === 'yes' || input.hasJobOffer === true ||
    (input.arrangedEmployment && input.arrangedEmployment !== 'none')

  let effectiveJobOfferTier = input.jobOfferWageLevel || 'none'
  // Backward compatibility with legacy arrangedEmployment values if passed
  if (!input.jobOfferWageLevel && input.arrangedEmployment) {
    if (input.arrangedEmployment === 'noc-00') effectiveJobOfferTier = 'offer-2x'
    else if (input.arrangedEmployment === 'noc-0-1-2-3') effectiveJobOfferTier = 'offer-1.3x'
  }

  if (hasJobOffer) {
    if (effectiveJobOfferTier === 'offer-2x') {
      jobOfferScore = 100
    } else if (effectiveJobOfferTier === 'offer-1.5x') {
      jobOfferScore = 70
    } else if (effectiveJobOfferTier === 'offer-1.3x') {
      jobOfferScore = 50
    }
  }

  // 3. Compare Canadian Work Experience vs Job Offer (Take the higher one, Max 150 points)
  let selectedLmiFactor = 'canadianWork'
  let labourMarketIntegrationTotal = canadianWorkTotal

  if (jobOfferScore > canadianWorkTotal) {
    selectedLmiFactor = 'jobOffer'
    labourMarketIntegrationTotal = jobOfferScore
  }

  const maxLmi = hasAccompanyingSpouse ? 140 : 150
  labourMarketIntegrationTotal = Math.min(maxLmi, labourMarketIntegrationTotal)

  // Section A total includes Core Human Capital + Canadian Work Length (or LMI)
  const coreHumanCapitalTotal = ageScore + educationScore + firstLanguageTotal + secondLanguageTotal
  const sectionATotal = coreHumanCapitalTotal + caWorkLengthScore
  const maxSectionA = hasAccompanyingSpouse ? 460 : 500

  // Section B - Spouse Factors
  let spouseEducationScore = 0
  let spouseLanguageScore = 0
  let spouseCanadianWorkScore = 0
  let sectionBTotal = 0

  if (hasAccompanyingSpouse) {
    const spEduKey = input.spouseEducation || 'none'
    spouseEducationScore = CRS_CONFIG.educationPoints.spouse[spEduKey] || 0

    const spLangScores = {
      reading: CRS_CONFIG.spouseLanguagePoints[getClbKey(input.spouseLangReading)] || 0,
      writing: CRS_CONFIG.spouseLanguagePoints[getClbKey(input.spouseLangWriting)] || 0,
      speaking: CRS_CONFIG.spouseLanguagePoints[getClbKey(input.spouseLangSpeaking)] || 0,
      listening: CRS_CONFIG.spouseLanguagePoints[getClbKey(input.spouseLangListening)] || 0
    }
    spouseLanguageScore = spLangScores.reading + spLangScores.writing + spLangScores.speaking + spLangScores.listening

    const spWorkKey = getWorkYearsKey(input.spouseCanadianWorkExperience)
    spouseCanadianWorkScore = CRS_CONFIG.canadianWorkPoints.spouse[spWorkKey] || 0

    sectionBTotal = Math.min(40, spouseEducationScore + spouseLanguageScore + spouseCanadianWorkScore)
  }

  // Section C - Skill Transferability Factors (Unchanged: uses CA work length, NOT high-wage)
  const clbR = getClbLevel(input.firstLangReading)
  const clbW = getClbLevel(input.firstLangWriting)
  const clbS = getClbLevel(input.firstLangSpeaking)
  const clbL = getClbLevel(input.firstLangListening)

  const allClb7Plus = clbR >= 7 && clbW >= 7 && clbS >= 7 && clbL >= 7
  const allClb9Plus = clbR >= 9 && clbW >= 9 && clbS >= 9 && clbL >= 9
  const allClb5Plus = clbR >= 5 && clbW >= 5 && clbS >= 5 && clbL >= 5

  const foreignWorkYears = parseInt(input.foreignWorkExperience, 10) || 0

  let eduTier = 0
  if (['oneYear', 'twoYear'].includes(eduKey)) {
    eduTier = eduKey === 'oneYear' ? 1 : 2
  } else if (['bachelor', 'twoOrMore', 'master', 'doctoral'].includes(eduKey)) {
    eduTier = 2
  }

  let eduLangPoints = 0
  if (eduTier === 1) {
    if (allClb9Plus) eduLangPoints = 25
    else if (allClb7Plus) eduLangPoints = 13
  } else if (eduTier === 2) {
    if (allClb9Plus) eduLangPoints = 50
    else if (allClb7Plus) eduLangPoints = 25
  }

  let eduCaWorkPoints = 0
  if (eduTier === 1) {
    if (caWorkYears >= 2) eduCaWorkPoints = 25
    else if (caWorkYears >= 1) eduCaWorkPoints = 13
  } else if (eduTier === 2) {
    if (caWorkYears >= 2) eduCaWorkPoints = 50
    else if (caWorkYears >= 1) eduCaWorkPoints = 25
  }

  const educationTransferability = Math.min(50, eduLangPoints + eduCaWorkPoints)

  let foreignLangPoints = 0
  if (foreignWorkYears >= 3) {
    if (allClb9Plus) foreignLangPoints = 50
    else if (allClb7Plus) foreignLangPoints = 25
  } else if (foreignWorkYears >= 1) {
    if (allClb9Plus) foreignLangPoints = 25
    else if (allClb7Plus) foreignLangPoints = 13
  }

  let foreignCaWorkPoints = 0
  if (foreignWorkYears >= 3) {
    if (caWorkYears >= 2) foreignCaWorkPoints = 50
    else if (caWorkYears >= 1) foreignCaWorkPoints = 25
  } else if (foreignWorkYears >= 1) {
    if (caWorkYears >= 2) foreignCaWorkPoints = 25
    else if (caWorkYears >= 1) foreignCaWorkPoints = 13
  }

  const foreignWorkTransferability = Math.min(50, foreignLangPoints + foreignCaWorkPoints)

  const hasTradeCertificate = input.hasTradeCertificate === 'yes' || input.hasTradeCertificate === true
  let tradePoints = 0
  if (hasTradeCertificate) {
    if (allClb7Plus) tradePoints = 50
    else if (allClb5Plus) tradePoints = 25
  }

  const sectionCTotal = Math.min(100, educationTransferability + foreignWorkTransferability + tradePoints)

  // Section D - Additional Factors
  const siblingPoints = (input.hasSiblingInCanada === 'yes' || input.hasSiblingInCanada === true) ? 15 : 0

  let frenchPoints = 0
  const isFirstLangFrench = input.firstLanguageType === 'french'
  const isSecondLangFrench = input.secondLanguageType === 'french'

  let frenchCLB = { r: 0, w: 0, s: 0, l: 0 }
  let englishCLB = { r: 0, w: 0, s: 0, l: 0 }

  if (isFirstLangFrench) {
    frenchCLB = { r: clbR, w: clbW, s: clbS, l: clbL }
    if (input.hasSecondLanguage === 'yes' || input.hasSecondLanguage === true) {
      englishCLB = {
        r: getClbLevel(input.secondLangReading),
        w: getClbLevel(input.secondLangWriting),
        s: getClbLevel(input.secondLangSpeaking),
        l: getClbLevel(input.secondLangListening)
      }
    }
  } else if (isSecondLangFrench && (input.hasSecondLanguage === 'yes' || input.hasSecondLanguage === true)) {
    frenchCLB = {
      r: getClbLevel(input.secondLangReading),
      w: getClbLevel(input.secondLangWriting),
      s: getClbLevel(input.secondLangSpeaking),
      l: getClbLevel(input.secondLangListening)
    }
    englishCLB = { r: clbR, w: clbW, s: clbS, l: clbL }
  }

  const frenchNclc7Plus = frenchCLB.r >= 7 && frenchCLB.w >= 7 && frenchCLB.s >= 7 && frenchCLB.l >= 7
  const englishClb5Plus = englishCLB.r >= 5 && englishCLB.w >= 5 && englishCLB.s >= 5 && englishCLB.l >= 5

  if (frenchNclc7Plus) {
    frenchPoints = englishClb5Plus ? 50 : 25
  }

  let canadianEducationPoints = 0
  if (input.canadianEducation === '1-2-year') {
    canadianEducationPoints = 15
  } else if (input.canadianEducation === '3-plus-year') {
    canadianEducationPoints = 30
  }

  const pnpPoints = (input.hasPnp === 'yes' || input.hasPnp === true) ? 600 : 0

  const rawSectionD = siblingPoints + frenchPoints + canadianEducationPoints + pnpPoints
  const sectionDTotal = Math.min(600, rawSectionD)

  // Overall Total: Core (A) + Labour Market Integration + Spouse (B) + Transferability (C) + Additional (D)
  const grandTotal = Math.min(1200, coreHumanCapitalTotal + labourMarketIntegrationTotal + sectionBTotal + sectionCTotal + sectionDTotal)

  return {
    total: grandTotal,
    hasAccompanyingSpouse,
    spouseMode,
    sectionA: {
      total: sectionATotal,
      coreTotal: coreHumanCapitalTotal,
      max: maxSectionA,
      age: ageScore,
      education: educationScore,
      firstLanguage: firstLanguageTotal,
      firstLangBreakdown: firstLangScores,
      secondLanguage: secondLanguageTotal,
      secondLangBreakdown: secondLangScores,
      canadianWork: caWorkLengthScore
    },
    labourMarketIntegration: {
      total: labourMarketIntegrationTotal,
      max: maxLmi,
      selectedFactor: selectedLmiFactor,
      canadianWork: {
        total: canadianWorkTotal,
        workLengthPoints: caWorkLengthScore,
        highWagePoints: caHighWageScore,
        years: caWorkYears,
        highWageTier: input.canadianHighWageExperience || 'none'
      },
      jobOffer: {
        total: jobOfferScore,
        hasOffer: hasJobOffer,
        wageTier: effectiveJobOfferTier
      }
    },
    sectionB: {
      total: sectionBTotal,
      max: 40,
      education: spouseEducationScore,
      language: spouseLanguageScore,
      canadianWork: spouseCanadianWorkScore
    },
    sectionC: {
      total: sectionCTotal,
      max: 100,
      educationTransferability,
      eduLangPoints,
      eduCaWorkPoints,
      foreignWorkTransferability,
      foreignLangPoints,
      foreignCaWorkPoints,
      tradePoints
    },
    sectionD: {
      total: sectionDTotal,
      max: 600,
      sibling: siblingPoints,
      french: frenchPoints,
      canadianEducation: canadianEducationPoints,
      arrangedEmployment: jobOfferScore,
      pnp: pnpPoints
    }
  }
}

// Language test conversion helpers
const LANGUAGE_CONVERTERS = {
  ielts: {
    reading: (score) => {
      const s = parseFloat(score)
      if (s >= 8.0) return 10
      if (s >= 7.0) return 9
      if (s >= 6.5) return 8
      if (s >= 6.0) return 7
      if (s >= 5.0) return 6
      if (s >= 4.0) return 5
      if (s >= 3.5) return 4
      return 3
    },
    writing: (score) => {
      const s = parseFloat(score)
      if (s >= 7.5) return 10
      if (s >= 7.0) return 9
      if (s >= 6.5) return 8
      if (s >= 6.0) return 7
      if (s >= 5.5) return 6
      if (s >= 5.0) return 5
      if (s >= 4.0) return 4
      return 3
    },
    speaking: (score) => {
      const s = parseFloat(score)
      if (s >= 7.5) return 10
      if (s >= 7.0) return 9
      if (s >= 6.5) return 8
      if (s >= 6.0) return 7
      if (s >= 5.5) return 6
      if (s >= 5.0) return 5
      if (s >= 4.0) return 4
      return 3
    },
    listening: (score) => {
      const s = parseFloat(score)
      if (s >= 8.5) return 10
      if (s >= 8.0) return 9
      if (s >= 7.5) return 8
      if (s >= 6.0) return 7
      if (s >= 5.5) return 6
      if (s >= 5.0) return 5
      if (s >= 4.5) return 4
      return 3
    }
  },
  celpip: {
    reading: (score) => Math.min(10, Math.max(3, parseInt(score, 10) || 3)),
    writing: (score) => Math.min(10, Math.max(3, parseInt(score, 10) || 3)),
    speaking: (score) => Math.min(10, Math.max(3, parseInt(score, 10) || 3)),
    listening: (score) => Math.min(10, Math.max(3, parseInt(score, 10) || 3))
  },
  pte: {
    reading: (score) => {
      const s = parseInt(score, 10)
      if (s >= 88) return 10
      if (s >= 78) return 9
      if (s >= 69) return 8
      if (s >= 60) return 7
      if (s >= 51) return 6
      if (s >= 42) return 5
      if (s >= 33) return 4
      return 3
    },
    writing: (score) => {
      const s = parseInt(score, 10)
      if (s >= 90) return 10
      if (s >= 88) return 9
      if (s >= 79) return 8
      if (s >= 69) return 7
      if (s >= 60) return 6
      if (s >= 51) return 5
      if (s >= 41) return 4
      return 3
    },
    speaking: (score) => {
      const s = parseInt(score, 10)
      if (s >= 89) return 10
      if (s >= 84) return 9
      if (s >= 76) return 8
      if (s >= 68) return 7
      if (s >= 59) return 6
      if (s >= 51) return 5
      if (s >= 42) return 4
      return 3
    },
    listening: (score) => {
      const s = parseInt(score, 10)
      if (s >= 89) return 10
      if (s >= 82) return 9
      if (s >= 71) return 8
      if (s >= 60) return 7
      if (s >= 50) return 6
      if (s >= 39) return 5
      if (s >= 28) return 4
      return 3
    }
  },
  tef: {
    reading: (score) => {
      const s = parseInt(score, 10)
      if (s >= 263) return 10
      if (s >= 248) return 9
      if (s >= 233) return 8
      if (s >= 207) return 7
      if (s >= 181) return 6
      if (s >= 151) return 5
      if (s >= 121) return 4
      return 3
    },
    writing: (score) => {
      const s = parseInt(score, 10)
      if (s >= 393) return 10
      if (s >= 371) return 9
      if (s >= 349) return 8
      if (s >= 310) return 7
      if (s >= 271) return 6
      if (s >= 226) return 5
      if (s >= 181) return 4
      return 3
    },
    speaking: (score) => {
      const s = parseInt(score, 10)
      if (s >= 393) return 10
      if (s >= 371) return 9
      if (s >= 349) return 8
      if (s >= 310) return 7
      if (s >= 271) return 6
      if (s >= 226) return 5
      if (s >= 181) return 4
      return 3
    },
    listening: (score) => {
      const s = parseInt(score, 10)
      if (s >= 316) return 10
      if (s >= 298) return 9
      if (s >= 280) return 8
      if (s >= 249) return 7
      if (s >= 217) return 6
      if (s >= 181) return 5
      if (s >= 145) return 4
      return 3
    }
  },
  tcf: {
    reading: (score) => {
      const s = parseInt(score, 10)
      if (s >= 549) return 10
      if (s >= 523) return 9
      if (s >= 500) return 8
      if (s >= 453) return 7
      if (s >= 406) return 6
      if (s >= 375) return 5
      if (s >= 342) return 4
      return 3
    },
    writing: (score) => {
      const s = parseInt(score, 10)
      if (s >= 16) return 10
      if (s >= 14) return 9
      if (s >= 12) return 8
      if (s >= 10) return 7
      if (s >= 7) return 6
      if (s >= 6) return 5
      if (s >= 4) return 4
      return 3
    },
    speaking: (score) => {
      const s = parseInt(score, 10)
      if (s >= 16) return 10
      if (s >= 14) return 9
      if (s >= 12) return 8
      if (s >= 10) return 7
      if (s >= 7) return 6
      if (s >= 6) return 5
      if (s >= 4) return 4
      return 3
    },
    listening: (score) => {
      const s = parseInt(score, 10)
      if (s >= 549) return 10
      if (s >= 523) return 9
      if (s >= 503) return 8
      if (s >= 458) return 7
      if (s >= 398) return 6
      if (s >= 369) return 5
      if (s >= 331) return 4
      return 3
    }
  }
}

// Preset samples
const PRESETS = {
  graduate: {
    name: '🇨🇦 本地留学生毕业生',
    desc: '25岁 · 本科毕业 · 加拿大留学3年 · 1年境内经验 · 英语CLB 9',
    data: {
      maritalStatus: 'single',
      age: '25',
      education: 'bachelor',
      firstLanguageType: 'english',
      firstLangReading: '9',
      firstLangWriting: '9',
      firstLangSpeaking: '9',
      firstLangListening: '9',
      hasSecondLanguage: 'no',
      canadianWorkExperience: '1',
      canadianHighWageExperience: 'none',
      foreignWorkExperience: '0',
      hasTradeCertificate: 'no',
      hasSiblingInCanada: 'no',
      canadianEducation: '3-plus-year',
      hasJobOffer: 'no',
      jobOfferWageLevel: 'none',
      hasPnp: 'no'
    }
  },
  masterWorker: {
    name: '🌍 海外高学历白领',
    desc: '29岁 · 硕士学位 · 3年海外经验 · 1年加拿大高薪经验 · 英语CLB 9',
    data: {
      maritalStatus: 'single',
      age: '29',
      education: 'master',
      firstLanguageType: 'english',
      firstLangReading: '9',
      firstLangWriting: '9',
      firstLangSpeaking: '9',
      firstLangListening: '9',
      hasSecondLanguage: 'no',
      canadianWorkExperience: '1',
      canadianHighWageExperience: 'wage-1.5x',
      foreignWorkExperience: '3',
      hasTradeCertificate: 'no',
      hasSiblingInCanada: 'no',
      canadianEducation: '1-2-year',
      hasJobOffer: 'no',
      jobOfferWageLevel: 'none',
      hasPnp: 'no'
    }
  },
  marriedCouple: {
    name: '👫 双职工家庭申请',
    desc: '31岁 · 夫妻双方均本科 · 主申CLB 9 + 2年境内经验 · 配偶CLB 8 + 1年经验',
    data: {
      maritalStatus: 'married',
      spouseIsCitizenOrPR: 'no',
      spouseAccompanying: 'yes',
      age: '31',
      education: 'bachelor',
      firstLanguageType: 'english',
      firstLangReading: '9',
      firstLangWriting: '9',
      firstLangSpeaking: '9',
      firstLangListening: '9',
      hasSecondLanguage: 'no',
      canadianWorkExperience: '2',
      canadianHighWageExperience: 'none',
      foreignWorkExperience: '2',
      spouseEducation: 'bachelor',
      spouseLangReading: '8',
      spouseLangWriting: '8',
      spouseLangSpeaking: '8',
      spouseLangListening: '8',
      spouseCanadianWorkExperience: '1',
      hasTradeCertificate: 'no',
      hasSiblingInCanada: 'no',
      canadianEducation: 'none',
      hasJobOffer: 'no',
      jobOfferWageLevel: 'none',
      hasPnp: 'no'
    }
  },
  frenchBonus: {
    name: '🇫🇷 法语双语人才',
    desc: '28岁 · 本科 · 法语NCLC 7 + 英语CLB 6 · 享有最高50分额外加分',
    data: {
      maritalStatus: 'single',
      age: '28',
      education: 'bachelor',
      firstLanguageType: 'french',
      firstLangReading: '7',
      firstLangWriting: '7',
      firstLangSpeaking: '7',
      firstLangListening: '7',
      hasSecondLanguage: 'yes',
      secondLanguageType: 'english',
      secondLangReading: '6',
      secondLangWriting: '6',
      secondLangSpeaking: '6',
      secondLangListening: '6',
      canadianWorkExperience: '1',
      canadianHighWageExperience: 'none',
      foreignWorkExperience: '1',
      hasTradeCertificate: 'no',
      hasSiblingInCanada: 'no',
      canadianEducation: 'none',
      hasJobOffer: 'no',
      jobOfferWageLevel: 'none',
      hasPnp: 'no'
    }
  }
}

// Browser Interaction & UI Controller
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    let currentStep = 1
    const totalSteps = 6

    const form = document.querySelector('#crs-form')
    const stepCards = document.querySelectorAll('.wizard-step')
    const progressTabs = document.querySelectorAll('.step-tab')
    const progressBarFill = document.querySelector('#progress-bar-fill')
    const prevBtn = document.querySelector('#prev-step-btn')
    const nextBtn = document.querySelector('#next-step-btn')
    const stepIndicator = document.querySelector('#step-indicator-text')

    // Results Elements
    const grandScoreEl = document.querySelector('#total-crs-score')
    const scoreRankBadge = document.querySelector('#score-rank-badge')
    const secAScoreEl = document.querySelector('#score-sec-a')
    const secBScoreEl = document.querySelector('#score-sec-b')
    const secCScoreEl = document.querySelector('#score-sec-c')
    const secDScoreEl = document.querySelector('#score-sec-d')

    const barA = document.querySelector('#bar-sec-a')
    const barB = document.querySelector('#bar-sec-b')
    const barC = document.querySelector('#bar-sec-c')
    const barD = document.querySelector('#bar-sec-d')

    const spouseStepTab = document.querySelector('.step-tab[data-step="5"]')
    const spouseStepCard = document.querySelector('.wizard-step[data-step="5"]')

    // Helper: Check if spouse is accompanying
    function isSpouseAccompanying() {
      const marital = form.elements['maritalStatus']?.value
      const isCitizen = form.elements['spouseIsCitizenOrPR']?.value === 'yes'
      const isAccomp = form.elements['spouseAccompanying']?.value === 'yes'
      return (marital === 'married' || marital === 'common-law') && !isCitizen && isAccomp
    }

    // Dynamic visibility toggles
    function updateVisibility() {
      const marital = form.elements['maritalStatus']?.value
      const isMarried = marital === 'married' || marital === 'common-law'
      const spouseSubFields = document.querySelector('#spouse-subfields')
      if (spouseSubFields) {
        spouseSubFields.style.display = isMarried ? 'block' : 'none'
      }

      const isCitizen = form.elements['spouseIsCitizenOrPR']?.value === 'yes'
      const spouseAccompField = document.querySelector('#spouse-accompanying-field')
      if (spouseAccompField) {
        spouseAccompField.style.display = (isMarried && !isCitizen) ? 'block' : 'none'
      }

      const hasAccompSpouse = isSpouseAccompanying()
      if (spouseStepTab) {
        if (hasAccompSpouse) {
          spouseStepTab.style.display = 'flex'
          spouseStepTab.classList.remove('is-disabled')
        } else {
          spouseStepTab.style.display = 'none'
        }
      }

      const secondLangBlock = document.querySelector('#second-lang-block')
      const hasSecondLang = form.elements['hasSecondLanguage']?.value === 'yes'
      if (secondLangBlock) {
        secondLangBlock.style.display = hasSecondLang ? 'block' : 'none'
      }

      // Canadian High Wage Box visibility
      const caWorkVal = form.elements['canadianWorkExperience']?.value
      const caYears = parseInt(caWorkVal, 10) || 0
      const caHighWageBox = document.querySelector('#canadian-high-wage-box')
      if (caHighWageBox) {
        caHighWageBox.style.display = (caYears >= 1) ? 'block' : 'none'
      }

      // Job Offer Details visibility
      const hasJobOfferVal = form.elements['hasJobOffer']?.value === 'yes'
      const jobOfferDetails = document.querySelector('#job-offer-details')
      if (jobOfferDetails) {
        jobOfferDetails.style.display = hasJobOfferVal ? 'block' : 'none'
      }
    }

    // Read form values
    function getFormData() {
      const formData = new FormData(form)
      const data = {}
      for (const [key, value] of formData.entries()) {
        data[key] = value
      }
      return data
    }

    // Update Scores
    function updateScoreDisplay() {
      const data = getFormData()
      const result = calculateCRS(data)

      // Total
      grandScoreEl.textContent = result.total

      // Status Badge & Benchmark analysis
      if (result.total >= 530) {
        scoreRankBadge.textContent = '🌟 极具竞争力 (可直通全类别/常规抽选)'
        scoreRankBadge.className = 'rank-badge badge-excellent'
      } else if (result.total >= 490) {
        scoreRankBadge.textContent = '✨ 良好 (CEC / 热门类别定向抽选极大概率)'
        scoreRankBadge.className = 'rank-badge badge-good'
      } else if (result.total >= 430) {
        scoreRankBadge.textContent = '🎯 潜力区间 (法语/STEM/医疗/技工定向极佳)'
        scoreRankBadge.className = 'rank-badge badge-average'
      } else {
        scoreRankBadge.textContent = '💡 建议提升 (可通过法语加分、PNP或境内经验提升)'
        scoreRankBadge.className = 'rank-badge badge-need-boost'
      }

      // Sections
      secAScoreEl.textContent = `${result.sectionA.coreTotal} / ${result.hasAccompanyingSpouse ? 390 : 420}`
      secBScoreEl.textContent = `${result.sectionB.total} / 40`
      secCScoreEl.textContent = `${result.sectionC.total} / 100`
      secDScoreEl.textContent = `${result.sectionD.total} / 600`

      // Progress bars
      const maxCoreA = result.hasAccompanyingSpouse ? 390 : 420
      if (barA) barA.style.width = `${Math.min(100, (result.sectionA.coreTotal / maxCoreA) * 100)}%`
      if (barB) barB.style.width = `${Math.min(100, (result.sectionB.total / 40) * 100)}%`
      if (barC) barC.style.width = `${Math.min(100, (result.sectionC.total / 100) * 100)}%`
      if (barD) barD.style.width = `${Math.min(100, (result.sectionD.total / 600) * 100)}%`

      // Detailed breakdown rendering
      renderBreakdown(result)
    }

    function renderBreakdown(result) {
      const container = document.querySelector('#detailed-breakdown-list')
      if (!container) return

      const lmi = result.labourMarketIntegration
      const items = [
        { cat: '核心因素 A', label: '申请人年龄', points: result.sectionA.age },
        { cat: '核心因素 A', label: '最高学历水平', points: result.sectionA.education },
        { cat: '核心因素 A', label: '第一官方语言能力', points: result.sectionA.firstLanguage },
        { cat: '核心因素 A', label: '第二官方语言能力', points: result.sectionA.secondLanguage }
      ]

      // Labour Market Integration item (2026 rule)
      if (lmi.selectedFactor === 'canadianWork') {
        items.push({
          cat: '劳动力整合 (2026)',
          label: `加拿大工作经验工龄分 (${lmi.canadianWork.years}年)`,
          points: lmi.canadianWork.workLengthPoints
        })
        if (lmi.canadianWork.highWagePoints > 0) {
          items.push({
            cat: '劳动力整合 (2026)',
            label: '加拿大高薪职业经验额外加分',
            points: lmi.canadianWork.highWagePoints
          })
        }
      } else {
        items.push({
          cat: '劳动力整合 (2026)',
          label: '加拿大有效聘约 (Job Offer 高薪加分)',
          points: lmi.jobOffer.total
        })
      }

      // Section B
      items.push(
        { cat: '配偶因素 B', label: '配偶学历', points: result.sectionB.education },
        { cat: '配偶因素 B', label: '配偶语言能力', points: result.sectionB.language },
        { cat: '配偶因素 B', label: '配偶加拿大工作经验', points: result.sectionB.canadianWork }
      )

      // Section C
      items.push(
        { cat: '交叉迁移 C', label: '学历 + 语言/境内经验', points: result.sectionC.educationTransferability },
        { cat: '交叉迁移 C', label: '海外经验 + 语言/境内经验', points: result.sectionC.foreignWorkTransferability },
        { cat: '交叉迁移 C', label: '技工职业资格证书', points: result.sectionC.tradePoints }
      )

      // Section D
      items.push(
        { cat: '附加加分 D', label: '加拿大直系兄弟姐妹', points: result.sectionD.sibling },
        { cat: '附加加分 D', label: '法语双语高分奖励', points: result.sectionD.french },
        { cat: '附加加分 D', label: '加拿大本地留学学历', points: result.sectionD.canadianEducation },
        { cat: '附加加分 D', label: '省提名项目 (PNP 获邀)', points: result.sectionD.pnp }
      )

      container.innerHTML = items
        .filter(item => item.points > 0 || item.cat.includes('核心因素') || item.cat.includes('劳动力整合'))
        .map(item => `
          <div class="breakdown-item">
            <div class="breakdown-meta">
              <span class="breakdown-category-badge">${item.cat}</span>
              <span class="breakdown-name">${item.label}</span>
            </div>
            <span class="breakdown-pts">+${item.points} 分</span>
          </div>
        `).join('')
    }

    // Step Navigation
    function showStep(stepNumber) {
      // Validate bounds
      if (stepNumber < 1) stepNumber = 1
      if (stepNumber > totalSteps) stepNumber = totalSteps

      // If skipping spouse step when not accompanying
      if (stepNumber === 5 && !isSpouseAccompanying()) {
        stepNumber = currentStep < 5 ? 6 : 4
      }

      currentStep = stepNumber

      // Toggle step cards
      stepCards.forEach(card => {
        const step = parseInt(card.dataset.step, 10)
        card.classList.toggle('active', step === currentStep)
      })

      // Toggle step tabs
      progressTabs.forEach(tab => {
        const step = parseInt(tab.dataset.step, 10)
        tab.classList.toggle('active', step === currentStep)
        tab.classList.toggle('completed', step < currentStep)
      })

      // Progress bar fill
      const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100
      if (progressBarFill) {
        progressBarFill.style.width = `${progressPercent}%`
      }

      // Indicator text
      if (stepIndicator) {
        const hasSpouse = isSpouseAccompanying()
        const effectiveTotal = hasSpouse ? 6 : 5
        let displayCurrent = currentStep
        if (!hasSpouse && currentStep === 6) {
          displayCurrent = 5
        }
        stepIndicator.textContent = `第 ${displayCurrent} / ${effectiveTotal} 步`
      }

      // Prev / Next button states
      if (prevBtn) {
        prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible'
      }

      if (nextBtn) {
        if (currentStep === totalSteps) {
          nextBtn.innerHTML = `<span>完成并查看全面报告</span> <span aria-hidden="true">✓</span>`
          nextBtn.className = 'btn-wizard btn-finish'
        } else {
          nextBtn.innerHTML = `<span>下一步</span> <span aria-hidden="true">→</span>`
          nextBtn.className = 'btn-wizard btn-next'
        }
      }

      // Scroll form to top smoothly
      const wizardContainer = document.querySelector('#wizard-container')
      if (wizardContainer) {
        wizardContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }

    // Event: Prev button
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        let prev = currentStep - 1
        if (prev === 5 && !isSpouseAccompanying()) {
          prev = 4
        }
        showStep(prev)
      })
    }

    // Event: Next button
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentStep === totalSteps) {
          const resultPanel = document.querySelector('#score-result-card')
          if (resultPanel) {
            resultPanel.scrollIntoView({ behavior: 'smooth' })
          }
          return
        }
        let next = currentStep + 1
        if (next === 5 && !isSpouseAccompanying()) {
          next = 6
        }
        showStep(next)
      })
    }

    // Event: Click on progress tabs
    progressTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetStep = parseInt(tab.dataset.step, 10)
        if (targetStep === 5 && !isSpouseAccompanying()) {
          return
        }
        showStep(targetStep)
      })
    })

    // Event: Form changes
    form.addEventListener('input', () => {
      updateVisibility()
      updateScoreDisplay()
    })
    form.addEventListener('change', () => {
      updateVisibility()
      updateScoreDisplay()
    })

    // Preset button click handlers
    document.querySelectorAll('[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.preset
        const preset = PRESETS[key]
        if (!preset) return

        Object.entries(preset.data).forEach(([name, val]) => {
          const field = form.elements[name]
          if (field) {
            field.value = val
          }
        })

        updateVisibility()
        updateScoreDisplay()
        showStep(1)

        // Show preset toast notice
        const notice = document.querySelector('#preset-notice')
        if (notice) {
          notice.textContent = `已载入案例：${preset.name}`
          notice.classList.add('show')
          setTimeout(() => notice.classList.remove('show'), 3000)
        }
      })
    })

    // Reset button
    const resetBtn = document.querySelector('#reset-all-btn')
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.reset()
        updateVisibility()
        updateScoreDisplay()
        showStep(1)
      })
    }

    // Copy score summary button
    const copyBtn = document.querySelector('#copy-score-btn')
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const data = getFormData()
        const res = calculateCRS(data)
        const lmi = res.labourMarketIntegration
        const lmiDesc = lmi.selectedFactor === 'canadianWork'
          ? `境内工作经验计分 (${lmi.canadianWork.total}分 = 工龄${lmi.canadianWork.workLengthPoints}分 + 高薪${lmi.canadianWork.highWagePoints}分)`
          : `Job Offer 聘约加分 (${lmi.jobOffer.total}分)`

        const summaryText = `🇨🇦 加拿大移民 Express Entry CRS 算分结果：
【总分】：${res.total} / 1200 分
• 核心人力资本（A项）：${res.sectionA.coreTotal} / ${res.hasAccompanyingSpouse ? 390 : 420} 分
• 劳动力市场整合（2026新规）：${lmi.total} / ${lmi.max} 分 [${lmiDesc}]
• 配偶加分因素（B项）：${res.sectionB.total} / 40 分
• 技能交叉转移（C项）：${res.sectionC.total} / 100 分
• 额外附加加分（D项）：${res.sectionD.total} / 600 分
（计算器版本：2026 最新官方标准算法 · 劳动力市场整合与无LMIA聘约规则）`

        navigator.clipboard.writeText(summaryText).then(() => {
          copyBtn.textContent = '✓ 已复制成绩单'
          setTimeout(() => { copyBtn.textContent = '📋 复制我的积分报告' }, 2000)
        }).catch(() => {
          alert(summaryText)
        })
      })
    }

    // Initialize Default View
    updateVisibility()
    updateScoreDisplay()
    showStep(1)
  })
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CRS_CONFIG,
    calculateCRS,
    LANGUAGE_CONVERTERS,
    PRESETS,
    getAgeKey,
    getClbKey,
    getClbLevel
  }
}
