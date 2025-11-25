import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function mergeEndorsements() {
  // Load existing endorsements (A.1-A.16, A.79-A.92)
  const existingPath = path.join(__dirname, '../src/data/endorsements-complete.json');
  const existing = JSON.parse(await fs.readFile(existingPath, 'utf-8'));
  
  // Load extracted A.17-A.92
  const extractedPath = path.join(__dirname, '../src/data/endorsements-a17-a92.json');
  const extracted = JSON.parse(await fs.readFile(extractedPath, 'utf-8'));
  
  // Clean up extracted endorsements
  const cleaned = extracted.map(e => {
    // Clean endorsement text - remove page numbers, formatting artifacts
    let cleanText = e.endorsementText
      .replace(/-- \d+ of \d+ --/g, '')
      .replace(/\d+\/\d+\/\d+\s+AC 61-65H/g, '')
      .replace(/Appendix A/g, '')
      .replace(/A-\d+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Clean FAR reference
    let cleanFar = e.farReference
      ? e.farReference.replace(/I have determined that\s*$/, '').trim()
      : null;
    
    // Extract FAR reference from title if not found
    if (!cleanFar || cleanFar.length < 5) {
      const farMatch = e.title.match(/§[§\s]*61\.\d+[\(\)a-z0-9\.\s,]*/i) || 
                      e.title.match(/SFAR\s+\d+/i) ||
                      e.title.match(/49\s*CFR|14\s*CFR/i);
      if (farMatch) {
        cleanFar = farMatch[0].trim();
      }
    }
    
    // Determine proper category based on content
    let category = e.category;
    if (e.title.toLowerCase().includes('sport pilot')) {
      category = 'Sport Pilot';
    } else if (e.title.toLowerCase().includes('recreational pilot')) {
      category = 'Recreational Pilot';
    } else if (e.title.toLowerCase().includes('private pilot')) {
      category = 'Private Pilot';
    } else if (e.title.toLowerCase().includes('commercial pilot')) {
      category = 'Commercial Pilot';
    } else if (e.title.toLowerCase().includes('airline transport') || e.title.toLowerCase().includes('atp')) {
      category = 'Airline Transport Pilot';
    } else if (e.title.toLowerCase().includes('flight instructor')) {
      category = 'Flight Instructor';
    } else if (e.title.toLowerCase().includes('instrument')) {
      category = 'Instrument Rating';
    } else if (e.title.toLowerCase().includes('complex')) {
      category = 'Complex Aircraft';
    } else if (e.title.toLowerCase().includes('high-performance') || e.title.toLowerCase().includes('high performance')) {
      category = 'High Performance';
    } else if (e.title.toLowerCase().includes('tailwheel')) {
      category = 'Tailwheel';
    } else if (e.title.toLowerCase().includes('pressurized')) {
      category = 'Pressurized Aircraft';
    } else if (e.title.toLowerCase().includes('type rating')) {
      category = 'Type Rating';
    } else if (e.title.toLowerCase().includes('r-22') || e.title.toLowerCase().includes('r-44')) {
      category = 'Helicopter - SFAR 73';
    } else if (e.title.toLowerCase().includes('flight review')) {
      category = 'Flight Review';
    } else if (e.title.toLowerCase().includes('proficiency check')) {
      category = 'Proficiency Check';
    }
    
    // Determine section based on category and content
    let sectionId = e.section.id;
    let sectionTitle = e.section.title;
    
    if (category.includes('Sport') || category.includes('Recreational')) {
      sectionId = 'sport-recreational-pilot';
      sectionTitle = 'SPORT AND RECREATIONAL PILOT CERTIFICATES';
    } else if (category.includes('Private') || category.includes('Commercial') || category.includes('Airline Transport')) {
      sectionId = 'pilot-certificates';
      sectionTitle = 'ADDITIONAL PILOT CERTIFICATES AND RATINGS';
    } else if (category.includes('Instrument')) {
      sectionId = 'instrument-ratings';
      sectionTitle = 'INSTRUMENT RATINGS';
    } else if (category.includes('Complex') || category.includes('High Performance') || category.includes('Tailwheel') || category.includes('Pressurized')) {
      sectionId = 'complex-high-performance';
      sectionTitle = 'COMPLEX, HIGH PERFORMANCE, AND TAILWHEEL ENDORSEMENTS';
    } else if (category.includes('Type Rating')) {
      sectionId = 'type-ratings';
      sectionTitle = 'TYPE RATINGS';
    } else if (category.includes('Flight Instructor')) {
      sectionId = 'flight-instructor';
      sectionTitle = 'FLIGHT INSTRUCTOR CERTIFICATES';
    } else if (category.includes('Helicopter')) {
      sectionId = 'helicopter-sfar';
      sectionTitle = 'HELICOPTER ENDORSEMENTS (SFAR 73)';
    } else if (category.includes('Flight Review') || category.includes('Proficiency')) {
      sectionId = 'currency-proficiency';
      sectionTitle = 'CURRENCY AND PROFICIENCY';
    }
    
    return {
      number: e.number,
      title: e.title.replace(/\t/g, ' ').replace(/\s+/g, ' ').trim(),
      farReference: cleanFar,
      endorsementText: cleanText,
      category: category,
      expires: false,
      expirationDays: null,
      notes: null,
      sectionId: sectionId,
      sectionTitle: sectionTitle
    };
  });
  
  // Organize into sections - use a map to track all endorsements by number
  const allEndorsementsMap = new Map();
  
  // Add existing endorsements (A.1-A.16, A.79-A.92)
  existing.sections.forEach(section => {
    section.endorsements.forEach(e => {
      allEndorsementsMap.set(e.number, {
        ...e,
        sectionId: section.id,
        sectionTitle: section.title
      });
    });
  });
  
  // Add/update with extracted endorsements (A.17-A.92)
  cleaned.forEach(endorsement => {
    // Always use the extracted version for A.17-A.92 to ensure we have the actual PDF content
    const num = parseInt(endorsement.number.replace('A.', ''));
    if (num >= 17) {
      allEndorsementsMap.set(endorsement.number, {
        number: endorsement.number,
        title: endorsement.title,
        farReference: endorsement.farReference,
        endorsementText: endorsement.endorsementText,
        category: endorsement.category,
        expires: endorsement.expires,
        expirationDays: endorsement.expirationDays,
        notes: endorsement.notes,
        sectionId: endorsement.sectionId,
        sectionTitle: endorsement.sectionTitle
      });
    }
  });
  
  // Organize into sections
  const sectionMap = new Map();
  allEndorsementsMap.forEach((endorsement, number) => {
    if (!sectionMap.has(endorsement.sectionId)) {
      sectionMap.set(endorsement.sectionId, {
        id: endorsement.sectionId,
        title: endorsement.sectionTitle,
        endorsements: []
      });
    }
    sectionMap.get(endorsement.sectionId).endorsements.push({
      number: endorsement.number,
      title: endorsement.title,
      farReference: endorsement.farReference,
      endorsementText: endorsement.endorsementText,
      category: endorsement.category,
      expires: endorsement.expires,
      expirationDays: endorsement.expirationDays,
      notes: endorsement.notes
    });
  });
  
  // Convert to array and sort endorsements within each section
  const completeSections = Array.from(sectionMap.values()).map(section => {
    section.endorsements.sort((a, b) => {
      const numA = parseInt(a.number.replace('A.', ''));
      const numB = parseInt(b.number.replace('A.', ''));
      return numA - numB;
    });
    return section;
  });
  
  // Sort sections by first endorsement number
  completeSections.sort((a, b) => {
    const numA = parseInt(a.endorsements[0]?.number.replace('A.', '') || '999');
    const numB = parseInt(b.endorsements[0]?.number.replace('A.', '') || '999');
    return numA - numB;
  });
  
  const complete = {
    sections: completeSections
  };
  
  // Save complete file
  await fs.writeFile(existingPath, JSON.stringify(complete, null, 2), 'utf-8');
  
  // Count total
  let total = 0;
  completeSections.forEach(s => total += s.endorsements.length);
  
  console.log(`\n✅ Merged all endorsements!`);
  console.log(`Total endorsements: ${total}`);
  console.log(`Sections: ${completeSections.length}`);
  console.log(`Saved to: ${existingPath}`);
  
  return complete;
}

mergeEndorsements().catch(console.error);

