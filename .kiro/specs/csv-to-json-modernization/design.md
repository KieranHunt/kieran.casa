# Design Document

## Overview

This design document outlines the modernization of the CSV to JSON converter tool, transforming it from a vanilla JavaScript implementation to a modern React-based single-file application. The new implementation will follow the same architectural patterns as the RFC6902 and everyit-zone tools, using React 18, ESM.sh imports, Radix UI components, and Tailwind CSS styling.

## Architecture

### Single File Structure
The entire application will be contained within `csv-to-json/index.html` following the established pattern:

```html
---
layout: page
title: "CSV to JSON"
permalink: /csv-to-json/
---

<!-- React container -->
<div id="react-root"></div>

<!-- Import map for dependencies -->
<script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@18",
      "react-dom": "https://esm.sh/react-dom@18",
      "react-dom/client": "https://esm.sh/react-dom@18/client",
      "react/jsx-runtime": "https://esm.sh/react@18/jsx-runtime",
      "csv-parse": "https://esm.sh/csv-parse@6/sync",
      "@radix-ui/react-tooltip": "https://esm.sh/@radix-ui/react-tooltip@1?external=react,react-dom",
      "@radix-ui/react-icons": "https://esm.sh/@radix-ui/react-icons@1?external=react",
      "@radix-ui/react-form": "https://esm.sh/@radix-ui/react-form@0?external=react,react-dom",
      "@radix-ui/react-separator": "https://esm.sh/@radix-ui/react-separator@1?external=react,react-dom"
    }
  }
</script>

<!-- Babel for JSX compilation -->
<script src="https://unpkg.com/@babel/standalone@7/babel.min.js"></script>

<!-- JSX Component -->
<script type="text/babel" data-type="module">
  // React components and logic here
</script>
```

### Component Architecture

The application will be structured as a single main component with several sub-components:

1. **CsvToJsonConverter** (Main Component)
2. **CsvInput** (CSV input with drag & drop)
3. **JsonOutput** (JSON display with copy functionality)
4. **ConvertButton** (Conversion trigger)
5. **ErrorDisplay** (Error handling UI)

## Components and Interfaces

### Main Component: CsvToJsonConverter

```jsx
const CsvToJsonConverter = () => {
  const [csvData, setCsvData] = useState('');
  const [jsonData, setJsonData] = useState('');
  const [error, setError] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Component logic here
  
  return (
    <Tooltip.Provider>
      <div className="space-y-8">
        <CsvInput 
          value={csvData} 
          onChange={setCsvData} 
          onFileUpload={handleFileUpload}
          error={error}
        />
        <ConvertButton 
          onConvert={handleConvert} 
          disabled={!csvData.trim() || isConverting}
          isConverting={isConverting}
        />
        <JsonOutput 
          data={jsonData} 
          onCopy={handleCopy} 
          copied={copied}
          error={error}
        />
      </div>
    </Tooltip.Provider>
  );
};
```

### CsvInput Component

```jsx
const CsvInput = ({ value, onChange, onFileUpload, error }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 1) {
      setError('Please drop only one file at a time');
      return;
    }
    
    const file = files[0];
    if (!file.type.includes('text') && !file.name.endsWith('.csv')) {
      setError('Please drop a CSV or text file');
      return;
    }
    
    onFileUpload(file);
  }, [onFileUpload]);

  return (
    <Form.Field name="csvInput" className="flex flex-col gap-4">
      <Form.Label className="text-xl font-semibold text-slate-100">
        CSV Input
      </Form.Label>
      <div
        className={`relative ${isDragOver ? 'ring-2 ring-blue-400' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <Form.Control asChild>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-80 p-4 bg-slate-800 border-2 border-slate-600 rounded-lg text-slate-100 font-mono text-sm resize-none focus:border-slate-400 focus:outline-none transition-colors"
            placeholder="Paste CSV data here or drag and drop a CSV file..."
            spellCheck={false}
          />
        </Form.Control>
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-500/20 border-2 border-blue-400 border-dashed rounded-lg flex items-center justify-center">
            <p className="text-blue-200 font-medium">Drop CSV file here</p>
          </div>
        )}
      </div>
    </Form.Field>
  );
};
```

### JsonOutput Component

```jsx
const JsonOutput = ({ data, onCopy, copied, error }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-slate-100">JSON Output</h3>
      
      <div className="relative p-4 bg-slate-800 border-2 border-slate-600 rounded-lg min-h-[200px]">
        {data && (
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={onCopy}
                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {copied ? (
                  <CheckIcon className="w-5 h-5 text-green-400" />
                ) : (
                  <CopyIcon className="w-5 h-5" />
                )}
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="bg-slate-900 text-slate-100 px-2 py-1 rounded text-sm border border-slate-600">
                {copied ? 'Copied!' : 'Copy to clipboard'}
                <Tooltip.Arrow className="fill-slate-900" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        )}
        
        {error ? (
          <div className="flex items-center justify-center h-full text-red-400">
            <p>{error}</p>
          </div>
        ) : data ? (
          <pre className="text-slate-100 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
            {data}
          </pre>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 italic">
            <p>Converted JSON will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};
```

## Data Models

### CSV Processing Logic

The CSV processing will use the `csv-parse` library with intelligent JSON parsing:

```javascript
const processCSV = (csvText) => {
  try {
    // Parse CSV using csv-parse library
    const records = parse(csvText, {
      skip_empty_lines: true,
      trim: true
    });
    
    if (records.length === 0) {
      throw new Error('No data found in CSV');
    }
    
    // Use first row as headers
    const headers = records[0];
    const dataRows = records.slice(1);
    
    // Convert to objects with intelligent JSON parsing
    const jsonObjects = dataRows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        const value = row[index] || '';
        
        // Try to parse as JSON, fallback to string
        try {
          obj[header] = JSON.parse(value);
        } catch {
          obj[header] = value;
        }
      });
      return obj;
    });
    
    return JSON.stringify(jsonObjects, null, 2);
  } catch (error) {
    throw new Error(`CSV parsing failed: ${error.message}`);
  }
};
```

### File Upload Handling

```javascript
const handleFileUpload = async (file) => {
  try {
    setError('');
    setIsConverting(true);
    
    const text = await file.text();
    setCsvData(text);
    
    // Auto-convert after file upload
    const converted = processCSV(text);
    setJsonData(converted);
  } catch (error) {
    setError(error.message);
  } finally {
    setIsConverting(false);
  }
};
```

## Error Handling

### Error Types and Messages

1. **File Upload Errors**
   - Multiple files: "Please drop only one file at a time"
   - Invalid file type: "Please drop a CSV or text file"
   - File read error: "Failed to read file: [error message]"

2. **CSV Parsing Errors**
   - Empty input: "Please provide CSV data to convert"
   - Invalid CSV format: "CSV parsing failed: [specific error]"
   - No data rows: "No data found in CSV"

3. **Copy Errors**
   - Clipboard API failure: "Copy failed - please select text manually"

### Error Display Component

```jsx
const ErrorDisplay = ({ error, onDismiss }) => {
  if (!error) return null;
  
  return (
    <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200 flex items-center justify-between">
      <span>{error}</span>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="text-red-400 hover:text-red-200 ml-4"
        >
          ×
        </button>
      )}
    </div>
  );
};
```

## Testing Strategy

### Test Scenarios

Based on Requirement 9, the implementation will be tested against these scenarios:

#### Basic CSV Scenarios
1. **Simple CSV with headers**
   ```csv
   name,age,city
   John,25,New York
   Jane,30,Los Angeles
   ```

2. **CSV with quoted fields**
   ```csv
   name,description,price
   "Product A","A great product",19.99
   "Product B","Another product",29.99
   ```

3. **CSV with embedded JSON**
   ```csv
   name,metadata,active
   User1,"{""role"":""admin"",""permissions"":[""read"",""write""]}",true
   User2,"{""role"":""user"",""permissions"":[""read""]}",false
   ```

#### Edge Case Scenarios
4. **Empty CSV file**
5. **CSV with only headers**
6. **CSV with special characters and unicode**
7. **Very large CSV (1000+ rows)**
8. **Malformed CSV with inconsistent columns**

#### Drag and Drop Scenarios
9. **Single CSV file drop**
10. **Multiple file drop (should show error)**
11. **Non-CSV file drop (should show error)**
12. **Empty file drop**

#### Copy Functionality Scenarios
13. **Successful clipboard copy**
14. **Clipboard API failure (fallback behavior)**
15. **Copy with no JSON data**

### Testing Implementation

Each scenario will be manually tested during development, with results documented:

```javascript
const testScenarios = [
  {
    name: "Basic CSV with headers",
    input: "name,age,city\nJohn,25,New York\nJane,30,Los Angeles",
    expectedOutput: [
      {"name": "John", "age": "25", "city": "New York"},
      {"name": "Jane", "age": "30", "city": "Los Angeles"}
    ]
  },
  // Additional scenarios...
];
```

## Styling and Theme Consistency

### Tailwind Classes

The design will use the same Tailwind classes as RFC6902 for consistency:

- **Background**: `bg-slate-800` for input areas, `bg-slate-900` for tooltips
- **Borders**: `border-slate-600` for normal state, `border-slate-400` for focus
- **Text**: `text-slate-100` for primary text, `text-slate-400` for secondary
- **Buttons**: Consistent hover states and transitions
- **Spacing**: `space-y-8` for main sections, `space-y-4` for sub-sections

### Responsive Design

```css
/* Mobile-first responsive classes */
.grid-cols-1 lg:grid-cols-2  /* Two-column layout on large screens */
.text-sm md:text-base        /* Responsive text sizing */
.p-4 md:p-6                  /* Responsive padding */
```

### Animation and Transitions

```css
/* Consistent with other tools */
.transition-colors duration-200
.hover:scale-110
.animate-in fade-in-0 duration-200
```

## Performance Considerations

### Large File Handling

1. **Streaming for large files**: Use FileReader with progress events
2. **Debounced processing**: Delay conversion until user stops typing
3. **Memory management**: Clear large strings when not needed
4. **Progress indicators**: Show loading states for large conversions

### Optimization Strategies

```javascript
// Debounced conversion
const debouncedConvert = useCallback(
  debounce((csvText) => {
    if (csvText.trim()) {
      try {
        const result = processCSV(csvText);
        setJsonData(result);
        setError('');
      } catch (error) {
        setError(error.message);
        setJsonData('');
      }
    }
  }, 500),
  []
);
```

## Accessibility Features

### ARIA Labels and Descriptions

```jsx
<textarea
  aria-label="CSV input area"
  aria-describedby="csv-help-text"
  role="textbox"
/>

<div id="csv-help-text" className="sr-only">
  Paste CSV data or drag and drop a CSV file to convert to JSON
</div>
```

### Keyboard Navigation

- Tab order: CSV input → Convert button → JSON output → Copy button
- Enter key triggers conversion when CSV input is focused
- Escape key clears error messages
- Copy button accessible via keyboard

### Screen Reader Support

```jsx
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {announcements}
</div>
```

## Integration Points

### Jekyll Layout Integration

The tool integrates with the existing Jekyll page layout system:

```yaml
---
layout: page
title: "CSV to JSON"
permalink: /csv-to-json/
---
```

### Consistent Navigation

The tool will inherit the site's navigation and styling through the page layout, ensuring it feels like part of the broader website ecosystem.

## Security Considerations

### File Upload Security

1. **File type validation**: Only accept text/csv files
2. **File size limits**: Reasonable limits to prevent DoS
3. **Content sanitization**: Escape HTML in error messages
4. **No server upload**: All processing happens client-side

### XSS Prevention

```javascript
// Sanitize error messages
const sanitizeError = (error) => {
  return error.replace(/[<>]/g, '');
};
```

This design provides a comprehensive foundation for implementing the modernized CSV to JSON converter while maintaining consistency with the existing tools and meeting all the specified requirements.