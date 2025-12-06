import { Word } from '../types';

// Helper to generate UUIDs
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const exportToCSV = (words: Word[]): void => {
  // Headers
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "English,French,Example,DateAdded,Correct,Errors\n";

  words.forEach(word => {
    // Escape quotes
    const escape = (text: string) => `"${(text || '').replace(/"/g, '""')}"`;
    
    const row = [
      escape(word.english),
      escape(word.french),
      escape(word.example || ''),
      escape(word.dateAdded),
      word.correctCount,
      word.errorCount
    ].join(",");
    csvContent += row + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "vocabulaire_export.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseCSV = (csvText: string): Word[] => {
  // Remove Byte Order Mark (BOM)
  const text = csvText.replace(/^\uFEFF/, '');
  
  if (!text.trim()) return [];

  // Detect separator based on first line
  const firstLineEnd = text.indexOf('\n');
  const firstLine = firstLineEnd === -1 ? text : text.substring(0, firstLineEnd);
  
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const separator = semicolonCount > commaCount ? ';' : ',';

  // --- STATE MACHINE PARSER ---
  // More robust than regex for CSVs with empty fields or quotes
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote ("") -> becomes literal quote (")
          currentField += '"';
          i++; 
        } else {
          // End of quoted field
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      // NOT in quotes
      if (char === '"') {
        inQuotes = true;
      } else if (char === separator) {
        // End of field
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\n' || char === '\r') {
        // End of row
        // Handle \r\n as a single newline
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        
        currentRow.push(currentField.trim());
        currentField = '';
        
        // Add row if not empty
        if (currentRow.length > 0 && currentRow.some(c => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
      } else {
        currentField += char;
      }
    }
  }

  // Push last remaining data
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(c => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  // --- CONVERSION TO WORDS ---
  const words: Word[] = [];
  const headerKeywords = ['english', 'anglais', 'french', 'francais', 'français', 'mot', 'word', 'traduction'];
  
  // Check if first row is header
  let startRowIndex = 0;
  if (rows.length > 0) {
     const firstRowStr = rows[0].join(' ').toLowerCase();
     const hasHeader = headerKeywords.some(k => firstRowStr.includes(k));
     if (hasHeader) startRowIndex = 1;
  }

  for (let j = startRowIndex; j < rows.length; j++) {
      const row = rows[j];
      // We need at least 2 columns: English, French.
      // row[0] = English, row[1] = French, row[2] = Example
      if (row.length >= 2) {
          const english = row[0];
          const french = row[1];
          const example = row[2] || '';
          
          if (english && french) {
               words.push({
                id: generateId(),
                english: english,
                french: french,
                example: example,
                dateAdded: new Date().toISOString(),
                correctCount: 0,
                errorCount: 0,
              });
          }
      }
  }
  
  return words;
};