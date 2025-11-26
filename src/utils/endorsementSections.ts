// Endorsement section definitions based on A-number ranges
export interface EndorsementSection {
  id: string
  title: string
  ranges: Array<{ start: number; end: number }>
  order: number
}

export const ENDORSEMENT_SECTIONS: EndorsementSection[] = [
  {
    id: 'prerequisites',
    title: 'Prerequisites for the Practical Test Endorsement',
    ranges: [{ start: 1, end: 2 }],
    order: 1
  },
  {
    id: 'student-pilot',
    title: 'Student Pilot Endorsements',
    ranges: [{ start: 3, end: 14 }],
    order: 2
  },
  {
    id: 'additional-student-sport-recreational',
    title: 'Additional Student Pilot Endorsements for Students Seeking Sport or Recreational Pilot Certificates',
    ranges: [{ start: 15, end: 16 }],
    order: 3
  },
  {
    id: 'sport-pilot',
    title: 'Sport Pilot Endorsements',
    ranges: [{ start: 17, end: 24 }],
    order: 4
  },
  {
    id: 'recreational-pilot',
    title: 'Recreational Pilot Endorsements',
    ranges: [{ start: 25, end: 31 }],
    order: 5
  },
  {
    id: 'private-pilot',
    title: 'Private Pilot Endorsements',
    ranges: [{ start: 32, end: 33 }],
    order: 6
  },
  {
    id: 'commercial-pilot',
    title: 'Commercial Pilot Endorsements',
    ranges: [{ start: 34, end: 37 }],
    order: 7
  },
  {
    id: 'instrument-rating',
    title: 'Instrument Rating Endorsements',
    ranges: [{ start: 38, end: 40 }],
    order: 8
  },
  {
    id: 'flight-instructor',
    title: 'Flight Instructor (other than Flight Instructor\'s with a sport pilot rating) Endorsements',
    ranges: [{ start: 41, end: 46 }],
    order: 9
  },
  {
    id: 'flight-instructor-sport',
    title: 'Flight Instructor with a Sport Pilot Rating Endorsement',
    ranges: [{ start: 47, end: 54 }],
    order: 10
  },
  {
    id: 'ground-instructor',
    title: 'Ground Instructor Endorsement',
    ranges: [{ start: 55, end: 55 }],
    order: 11
  },
  {
    id: 'sfar-73',
    title: 'Special Federal Aviation Regulation, SFAR 73, Robinson R–22/R–44 Special Training and Experience Requirements Endorsements',
    ranges: [{ start: 56, end: 64 }],
    order: 12
  },
  {
    id: 'additional-endorsements',
    title: 'Additional Endorsements',
    ranges: [{ start: 65, end: 88 }],
    order: 13
  },
  {
    id: 'efvs',
    title: 'Enhanced Flight Vision System (EFVS)',
    ranges: [{ start: 89, end: 92 }],
    order: 14
  }
]

/**
 * Extract the number from an endorsement number (e.g., "A.1" -> 1, "A.32" -> 32)
 */
export function getEndorsementNumber(endorsementNumber: string): number | null {
  const match = endorsementNumber.match(/A\.?(\d+)/i)
  if (match) {
    return parseInt(match[1], 10)
  }
  return null
}

/**
 * Get the section for a given endorsement number
 */
export function getSectionForEndorsement(endorsementNumber: string): EndorsementSection | null {
  const num = getEndorsementNumber(endorsementNumber)
  if (num === null) return null

  for (const section of ENDORSEMENT_SECTIONS) {
    for (const range of section.ranges) {
      if (num >= range.start && num <= range.end) {
        return section
      }
    }
  }
  return null
}

/**
 * Organize endorsements by section
 */
export function organizeEndorsementsBySection<T extends { endorsement_number: string }>(
  endorsements: T[]
): Map<string, T[]> {
  const organized = new Map<string, T[]>()

  // Initialize all sections
  ENDORSEMENT_SECTIONS.forEach(section => {
    organized.set(section.id, [])
  })

  // Add an "other" section for endorsements that don't match any range
  organized.set('other', [])

  // Organize endorsements
  endorsements.forEach(endorsement => {
    const section = getSectionForEndorsement(endorsement.endorsement_number)
    if (section) {
      organized.get(section.id)!.push(endorsement)
    } else {
      organized.get('other')!.push(endorsement)
    }
  })

  // Sort endorsements within each section by endorsement number
  organized.forEach((endorsements, sectionId) => {
    endorsements.sort((a, b) => {
      const numA = getEndorsementNumber(a.endorsement_number) || 0
      const numB = getEndorsementNumber(b.endorsement_number) || 0
      return numA - numB
    })
  })

  return organized
}

/**
 * Get section title by section ID
 */
export function getSectionTitle(sectionId: string): string {
  const section = ENDORSEMENT_SECTIONS.find(s => s.id === sectionId)
  return section?.title || sectionId
}

