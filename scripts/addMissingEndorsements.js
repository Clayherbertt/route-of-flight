import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate placeholder INSERT statements for A.17 - A.78
async function generateMissingEndorsements() {
  let sql = '\n-- Placeholder endorsements A.17 - A.78 (to be filled in from complete PDF)\n\n';
  
  // Common sections that likely exist in A.17-A.78 based on typical FAA endorsement structure
  const sections = [
    { id: 'pilot-certificates', title: 'ADDITIONAL PILOT CERTIFICATES AND RATINGS', start: 17, end: 30 },
    { id: 'aircraft-ratings', title: 'AIRCRAFT RATINGS', start: 31, end: 45 },
    { id: 'complex-high-performance', title: 'COMPLEX, HIGH PERFORMANCE, AND TAILWHEEL ENDORSEMENTS', start: 46, end: 55 },
    { id: 'instrument-ratings', title: 'INSTRUMENT RATINGS', start: 56, end: 70 },
    { id: 'type-ratings', title: 'TYPE RATINGS', start: 71, end: 78 },
  ];

  let displayOrder = 1;
  let currentSection = null;
  let sectionDisplayOrder = 1;

  for (let num = 17; num <= 78; num++) {
    // Determine which section this endorsement belongs to
    let section = sections.find(s => num >= s.start && num <= s.end);
    if (!section) {
      // Default section for any gaps
      section = { id: 'additional-endorsements', title: 'ADDITIONAL ENDORSEMENTS', start: 17, end: 78 };
    }

    // Reset display order when entering a new section
    if (currentSection !== section.id) {
      currentSection = section.id;
      sectionDisplayOrder = 1;
    }

    sql += `INSERT INTO public.endorsements (
  endorsement_number,
  section_id,
  section_title,
  title,
  far_reference,
  endorsement_text,
  category,
  expires,
  expiration_days,
  notes,
  display_order
) VALUES (
  'A.${num}',
  '${section.id}',
  '${section.title}',
  '[PLACEHOLDER] Endorsement A.${num} - To be filled in from complete PDF',
  NULL,
  'This endorsement text needs to be added from the complete FAA Sample Endorsements PDF document (A.${num}).',
  'Placeholder',
  false,
  NULL,
  'This is a placeholder entry. Please update with the actual endorsement text from the FAA Sample Endorsements document.',
  ${sectionDisplayOrder}
);

`;

    sectionDisplayOrder++;
  }

  return sql;
}

async function main() {
  try {
    const placeholderSQL = await generateMissingEndorsements();
    
    // Read the existing seed file
    const seedFilePath = path.join(__dirname, '../supabase/migrations/20251125161250_seed_endorsements.sql');
    const existingContent = await fs.readFile(seedFilePath, 'utf-8');
    
    // Find where A.16 ends and A.79 begins
    const a16End = existingContent.indexOf("'A.16'");
    const a79Start = existingContent.indexOf("'A.79'");
    
    if (a16End === -1 || a79Start === -1) {
      console.error('Could not find A.16 or A.79 in seed file');
      process.exit(1);
    }
    
    // Find the end of the A.16 INSERT statement
    const a16InsertEnd = existingContent.indexOf(');', a16End) + 2;
    
    // Insert the placeholder SQL between A.16 and A.79
    const newContent = 
      existingContent.substring(0, a16InsertEnd) + 
      '\n' + 
      placeholderSQL + 
      existingContent.substring(a16InsertEnd);
    
    // Write the updated file
    await fs.writeFile(seedFilePath, newContent, 'utf-8');
    
    console.log('✅ Added placeholder entries for A.17 - A.78');
    console.log(`✅ Updated seed file: ${seedFilePath}`);
    console.log('\nNote: These are placeholder entries. You will need to update them with the actual endorsement text from the complete PDF.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();

