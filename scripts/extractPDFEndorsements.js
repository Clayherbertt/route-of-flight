import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
// pdf-parse exports PDFParse class, need to instantiate it
const { PDFParse } = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extractEndorsements() {
  try {
    const pdfPath = path.join(__dirname, '../src/assets/Endorsements.pdf');
    const dataBuffer = await fs.readFile(pdfPath);
    const parser = new PDFParse({ data: dataBuffer });
    await parser.load();
    const data = await parser.getText();
    
    const text = data.text || data;
    
    // Write full text to a file for inspection
    await fs.writeFile(path.join(__dirname, '../src/assets/Endorsements-extracted.txt'), text, 'utf-8');
    
    // Extract endorsements A.17 through A.78
    const lines = text.split('\n');
    const endorsements = [];
    let currentEndorsement = null;
    let inEndorsement = false;
    let currentSection = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for section headers (all caps titles)
      if (line.match(/^[A-Z][A-Z\s]+$/) && line.length > 10 && !line.includes('ENDORSEMENT')) {
        if (line.includes('PREREQUISITES')) {
          currentSection = { id: 'prerequisites', title: line };
        } else if (line.includes('STUDENT PILOT')) {
          currentSection = { id: 'student-pilot', title: line };
        } else if (line.includes('SPORT') || line.includes('RECREATIONAL')) {
          currentSection = { id: 'additional-student-pilot', title: line };
        } else if (line.includes('PILOT CERTIFICATE') || line.includes('RATING')) {
          currentSection = { id: 'pilot-certificates', title: line };
        } else if (line.includes('AIRCRAFT RATING')) {
          currentSection = { id: 'aircraft-ratings', title: line };
        } else if (line.includes('COMPLEX') || line.includes('HIGH PERFORMANCE') || line.includes('TAILWHEEL')) {
          currentSection = { id: 'complex-high-performance', title: line };
        } else if (line.includes('INSTRUMENT')) {
          currentSection = { id: 'instrument-ratings', title: line };
        } else if (line.includes('TYPE RATING')) {
          currentSection = { id: 'type-ratings', title: line };
        } else if (line.includes('GLIDER')) {
          currentSection = { id: 'glider-operations', title: line };
        } else if (line.includes('KNOWLEDGE')) {
          currentSection = { id: 'knowledge-tests', title: line };
        } else if (line.includes('EXPERIMENTAL')) {
          currentSection = { id: 'experimental-aircraft', title: line };
        } else if (line.includes('NIGHT VISION') || line.includes('NVG')) {
          currentSection = { id: 'night-vision-goggles', title: line };
        } else if (line.includes('ENHANCED FLIGHT') || line.includes('EFVS')) {
          currentSection = { id: 'enhanced-flight-vision-system', title: line };
        } else if (currentSection === null && line.length > 10) {
          // Generic section
          currentSection = { id: 'additional-endorsements', title: line };
        }
      }
      
      // Look for endorsement numbers A.17 through A.92
      const endorsementMatch = line.match(/^A\.\s*([1-9][0-9]|[7][0-9]|[8][0-9]|[9][0-2])\s+(.+)$/);
      if (endorsementMatch) {
        const num = parseInt(endorsementMatch[1]);
        if (num >= 17 && num <= 92) {
          // Save previous endorsement if exists
          if (currentEndorsement) {
            endorsements.push(currentEndorsement);
          }
          
          // Start new endorsement
          currentEndorsement = {
            number: `A.${num}`,
            title: endorsementMatch[2],
            section: currentSection || { id: 'additional-endorsements', title: 'ADDITIONAL ENDORSEMENTS' },
            farReference: null,
            endorsementText: '',
            category: 'Additional Endorsements',
            expires: false,
            lines: [line]
          };
          inEndorsement = true;
          continue;
        }
      }
      
      // Look for FAR references
      if (inEndorsement && currentEndorsement) {
        const farMatch = line.match(/§\s*61\.\d+[\(\)a-z0-9\.\s]*/i) || line.match(/14\s*CFR|49\s*CFR/);
        if (farMatch && !currentEndorsement.farReference) {
          currentEndorsement.farReference = farMatch[0];
        }
        
        // Collect endorsement text (skip empty lines and headers)
        if (line && !line.match(/^[A-Z\s]+$/) && !line.match(/^A\.\s*\d+/)) {
          if (line.startsWith('I certify') || currentEndorsement.endorsementText.length > 0) {
            currentEndorsement.endorsementText += (currentEndorsement.endorsementText ? ' ' : '') + line;
            currentEndorsement.lines.push(line);
          }
        }
        
        // End endorsement on next A.X (beyond A.92) or section header
        if (line.match(/^A\.\s*([9][3-9]|\d{3,})/) || 
            (line.match(/^[A-Z][A-Z\s]+$/) && line.length > 10 && i > 0 && !line.includes('ENDORSEMENT'))) {
          if (currentEndorsement.endorsementText) {
            endorsements.push(currentEndorsement);
            currentEndorsement = null;
            inEndorsement = false;
          }
        }
      }
    }
    
    // Save last endorsement
    if (currentEndorsement && currentEndorsement.endorsementText) {
      endorsements.push(currentEndorsement);
    }
    
    console.log(`\n✅ Extracted ${endorsements.length} endorsements (A.17 - A.92)`);
    const a17to78 = endorsements.filter(e => {
      const num = parseInt(e.number.replace('A.', ''));
      return num >= 17 && num <= 78;
    });
    const a79to92 = endorsements.filter(e => {
      const num = parseInt(e.number.replace('A.', ''));
      return num >= 79 && num <= 92;
    });
    console.log(`  A.17 - A.78: ${a17to78.length} endorsements`);
    console.log(`  A.79 - A.92: ${a79to92.length} endorsements`);
    console.log('\nEndorsements found:');
    endorsements.forEach(e => {
      console.log(`  ${e.number}: ${e.title.substring(0, 60)}...`);
    });
    
    // Write to JSON file
    const outputPath = path.join(__dirname, '../src/data/endorsements-a17-a92.json');
    await fs.writeFile(outputPath, JSON.stringify(endorsements, null, 2), 'utf-8');
    console.log(`\n✅ Saved to: ${outputPath}`);
    
    return endorsements;
    
  } catch (error) {
    console.error('Error extracting PDF:', error);
    throw error;
  }
}

extractEndorsements().catch(console.error);

