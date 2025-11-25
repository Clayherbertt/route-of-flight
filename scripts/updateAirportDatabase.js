import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Download OpenFlights airport database
const url = 'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat';
const outputPath = path.join(__dirname, '../src/data/airportCoordinates.json');

console.log('Downloading OpenFlights airport database...');

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Processing airport data...');
    
    const lines = data.split('\n');
    const airports = {};
    let processed = 0;
    let skipped = 0;
    
    lines.forEach((line) => {
      if (!line.trim()) return;
      
      // Parse CSV line (handling quoted fields)
      const fields = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          fields.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      fields.push(current);
      
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
      
      const icao = fields[5]?.trim();
      const iata = fields[4]?.trim();
      const lat = parseFloat(fields[6]);
      const lng = parseFloat(fields[7]);
      const name = fields[1]?.trim();
      const city = fields[2]?.trim();
      const country = fields[3]?.trim();
      
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
      if (icao && icao.length >= 3 && icao !== '\\N') {
        airports[icao.toUpperCase()] = airportData;
        added = true;
      }
      
      // Also add IATA code (3-letter code like LAX) if different from ICAO
      if (iata && iata.length === 3 && iata !== '\\N' && iata.toUpperCase() !== icao?.toUpperCase()) {
        airports[iata.toUpperCase()] = airportData;
        added = true;
      }
      
      if (added) {
        processed++;
      } else {
        skipped++;
      }
    });
    
    console.log(`Processed ${processed} airports`);
    console.log(`Skipped ${skipped} entries (missing codes or coordinates)`);
    console.log(`Total airports in database: ${Object.keys(airports).length}`);
    
    // Write to JSON file
    const json = JSON.stringify(airports, null, 2);
    fs.writeFileSync(outputPath, json, 'utf8');
    
    console.log(`\n✅ Airport database updated successfully!`);
    console.log(`📁 Saved to: ${outputPath}`);
    console.log(`\nTop 10 airports by code:`);
    Object.keys(airports).slice(0, 10).forEach(code => {
      console.log(`  ${code}: ${airports[code].name}`);
    });
  });
}).on('error', (err) => {
  console.error('Error downloading airport database:', err);
  process.exit(1);
});

