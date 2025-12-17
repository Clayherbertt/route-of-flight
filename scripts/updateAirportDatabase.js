import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(__dirname, '../src/data/airportCoordinates.json');

// Load existing airports to preserve any manually added ones
let airports = {};
if (fs.existsSync(outputPath)) {
  try {
    airports = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    console.log(`Loaded ${Object.keys(airports).length} existing airports`);
  } catch (error) {
    console.log('Starting with empty database');
    airports = {};
  }
}

// Helper function to parse CSV line with quoted fields
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

// Download and process OpenFlights database
async function downloadOpenFlights() {
  return new Promise((resolve, reject) => {
    const url = 'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat';
    console.log('\n📥 Downloading OpenFlights airport database...');
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Processing OpenFlights data...');
        
        const lines = data.split('\n');
        let processed = 0;
        let skipped = 0;
        
        lines.forEach((line) => {
          if (!line.trim()) return;
          
          const fields = parseCSVLine(line);
          
          // OpenFlights format:
          // 0: Airport ID
          // 1: Name
          // 2: City
          // 3: Country
          // 4: IATA (3-letter code)
          // 5: ICAO (4-letter code)
          // 6: Latitude
          // 7: Longitude
          // 8: Altitude
          // 9: Timezone
          // 10: DST
          // 11: Timezone name
          // 12: Type
          // 13: Source
          
          if (fields.length < 14) return;
          
          const icao = fields[5]?.replace(/^"|"$/g, '').trim();
          const iata = fields[4]?.replace(/^"|"$/g, '').trim();
          const lat = parseFloat(fields[6]);
          const lng = parseFloat(fields[7]);
          const name = fields[1]?.replace(/^"|"$/g, '').trim();
          const city = fields[2]?.replace(/^"|"$/g, '').trim();
          
          // Skip if no valid coordinates
          if (isNaN(lat) || isNaN(lng)) {
            skipped++;
            return;
          }
          
          // Add both ICAO and IATA codes if available
          const airportName = name || `${city || ''} Airport`.trim();
          const airportData = {
            lat: lat,
            lng: lng,
            name: airportName
          };
          
          let added = false;
          
          // Add ICAO code (4-letter code, preferred for US airports like KLAX)
          if (icao && icao.length >= 3 && icao !== '\\N' && icao !== '') {
            airports[icao.toUpperCase()] = airportData;
            added = true;
          }
          
          // Also add IATA code (3-letter code like LAX) if different from ICAO
          if (iata && iata.length === 3 && iata !== '\\N' && iata !== '' && iata.toUpperCase() !== icao?.toUpperCase()) {
            airports[iata.toUpperCase()] = airportData;
            added = true;
          }
          
          if (added) {
            processed++;
          } else {
            skipped++;
          }
        });
        
        console.log(`  ✅ Processed ${processed} airports from OpenFlights`);
        console.log(`  ⏭️  Skipped ${skipped} entries (missing codes or coordinates)`);
        resolve();
      });
    }).on('error', reject);
  });
}

// Download and process OurAirports database (more comprehensive, includes small airports)
async function downloadOurAirports() {
  return new Promise((resolve, reject) => {
    const url = 'https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/airports.csv';
    console.log('\n📥 Downloading OurAirports database (comprehensive coverage)...');
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Processing OurAirports data...');
        
        const lines = data.split('\n');
        if (lines.length < 2) {
          console.log('  ⚠️  No data found in OurAirports database');
          resolve();
          return;
        }
        
        // Parse header row
        const headers = parseCSVLine(lines[0]);
        const icaoIdx = headers.findIndex(h => h.toLowerCase() === 'ident');
        const iataIdx = headers.findIndex(h => h.toLowerCase() === 'iata_code');
        const latIdx = headers.findIndex(h => h.toLowerCase() === 'latitude_deg');
        const lngIdx = headers.findIndex(h => h.toLowerCase() === 'longitude_deg');
        const nameIdx = headers.findIndex(h => h.toLowerCase() === 'name');
        const typeIdx = headers.findIndex(h => h.toLowerCase() === 'type');
        
        if (icaoIdx === -1 || latIdx === -1 || lngIdx === -1) {
          console.log('  ⚠️  Could not find required columns in OurAirports database');
          resolve();
          return;
        }
        
        let processed = 0;
        let skipped = 0;
        let updated = 0;
        
        // Process data rows
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line.trim()) continue;
          
          const fields = parseCSVLine(line);
          if (fields.length < Math.max(icaoIdx, iataIdx || 0, latIdx, lngIdx, nameIdx || 0) + 1) continue;
          
          const icao = fields[icaoIdx]?.replace(/^"|"$/g, '').trim();
          const iata = iataIdx >= 0 ? fields[iataIdx]?.replace(/^"|"$/g, '').trim() : '';
          const lat = parseFloat(fields[latIdx]);
          const lng = parseFloat(fields[lngIdx]);
          const name = nameIdx >= 0 ? fields[nameIdx]?.replace(/^"|"$/g, '').trim() : '';
          const type = typeIdx >= 0 ? fields[typeIdx]?.replace(/^"|"$/g, '').trim().toLowerCase() : '';
          
          // Skip if no valid coordinates
          if (isNaN(lat) || isNaN(lng)) {
            skipped++;
            continue;
          }
          
          // Skip heliports and seaplane bases unless they have ICAO codes
          // (we want to include small airports but not every helipad)
          if (type === 'heliport' || type === 'seaplane_base') {
            if (!icao || icao.length < 3) {
              skipped++;
              continue;
            }
          }
          
          const airportData = {
            lat: lat,
            lng: lng,
            name: name || 'Unknown Airport'
          };
          
          let added = false;
          
          // Add ICAO code (OurAirports uses 'ident' as ICAO)
          if (icao && icao.length >= 3 && icao !== '\\N' && icao !== '') {
            const code = icao.toUpperCase();
            // Track if we're updating an existing entry
            if (airports[code]) {
              updated++;
            }
            airports[code] = airportData;
            added = true;
          }
          
          // Also add IATA code if available and different
          if (iata && iata.length === 3 && iata !== '\\N' && iata !== '' && iata.toUpperCase() !== icao?.toUpperCase()) {
            const code = iata.toUpperCase();
            if (airports[code]) {
              updated++;
            }
            airports[code] = airportData;
            added = true;
          }
          
          if (added) {
            processed++;
          } else {
            skipped++;
          }
        }
        
        console.log(`  ✅ Processed ${processed} airports from OurAirports`);
        console.log(`  🔄 Updated ${updated} existing entries`);
        console.log(`  ⏭️  Skipped ${skipped} entries (missing codes or coordinates)`);
        resolve();
      });
    }).on('error', (err) => {
      console.log(`  ⚠️  Error downloading OurAirports database: ${err.message}`);
      console.log('  Continuing with OpenFlights data only...');
      resolve(); // Don't reject, continue with what we have
    });
  });
}

// Main function
async function main() {
  console.log('🌍 Airport Database Updater');
  console.log('============================\n');
  
  const initialCount = Object.keys(airports).length;
  
  try {
    // Download and merge both databases
    await downloadOpenFlights();
    await downloadOurAirports();
    
    const finalCount = Object.keys(airports).length;
    const added = finalCount - initialCount;
    
    // Write to JSON file
    const json = JSON.stringify(airports, null, 2);
    fs.writeFileSync(outputPath, json, 'utf8');
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Airport database updated successfully!`);
    console.log(`📁 Saved to: ${outputPath}`);
    console.log(`📊 Total airports: ${finalCount.toLocaleString()}`);
    if (initialCount > 0) {
      console.log(`📈 Added/Updated: ${added.toLocaleString()} airports`);
    }
    console.log('\n📋 Sample airports:');
    const sampleCodes = Object.keys(airports).slice(0, 10);
    sampleCodes.forEach(code => {
      console.log(`  ${code}: ${airports[code].name}`);
    });
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('\n❌ Error updating airport database:', error);
    process.exit(1);
  }
}

main();

