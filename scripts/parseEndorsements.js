import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load endorsements from JSON file
async function loadEndorsements() {
  const endorsementsFilePath = path.join(__dirname, '../src/data/endorsements-complete.json');
  const fileContent = await fs.readFile(endorsementsFilePath, 'utf-8');
  return JSON.parse(fileContent);
}

async function generateSQL(endorsementsData) {
  let sql = "-- Insert or update FAA endorsements\n";
  sql += "-- Uses ON CONFLICT to update existing endorsements\n\n";
  let displayOrder = 1;
  let currentSection = null;

  for (const section of endorsementsData.sections) {
    currentSection = section.id;
    displayOrder = 1;

    for (const endorsement of section.endorsements) {
      const expires = endorsement.expires || false;
      const expirationDays = endorsement.expirationDays || null;
      const notes = endorsement.notes || null;

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
  '${endorsement.number}',
  '${section.id}',
  '${section.title.replace(/'/g, "''")}',
  '${endorsement.title.replace(/'/g, "''")}',
  ${endorsement.farReference ? `'${endorsement.farReference.replace(/'/g, "''")}'` : 'NULL'},
  '${endorsement.endorsementText.replace(/'/g, "''")}',
  '${endorsement.category}',
  ${expires},
  ${expirationDays ? expirationDays : 'NULL'},
  ${notes ? `'${notes.replace(/'/g, "''")}'` : 'NULL'},
  ${displayOrder}
)
ON CONFLICT (endorsement_number) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  section_title = EXCLUDED.section_title,
  title = EXCLUDED.title,
  far_reference = EXCLUDED.far_reference,
  endorsement_text = EXCLUDED.endorsement_text,
  category = EXCLUDED.category,
  expires = EXCLUDED.expires,
  expiration_days = EXCLUDED.expiration_days,
  notes = EXCLUDED.notes,
  display_order = EXCLUDED.display_order,
  updated_at = now();\n\n`;

      displayOrder++;
    }
  }

  return sql;
}

async function main() {
  try {
    const endorsementsData = await loadEndorsements();
    const sql = await generateSQL(endorsementsData);
    const outputPath = path.join(__dirname, '../supabase/migrations/20251125161250_seed_endorsements.sql');
    await fs.writeFile(outputPath, sql, 'utf-8');
    
    // Count total endorsements
    let totalCount = 0;
    for (const section of endorsementsData.sections) {
      totalCount += section.endorsements.length;
    }
    
    console.log(`✅ Generated SQL file: ${outputPath}`);
    console.log(`\nTotal endorsements: ${totalCount}`);
    console.log(`Sections: ${endorsementsData.sections.length}`);
    if (endorsementsData.note) {
      console.log(`\nNote: ${endorsementsData.note}`);
    }
  } catch (error) {
    console.error('Error generating SQL:', error);
    process.exit(1);
  }
}

main();

