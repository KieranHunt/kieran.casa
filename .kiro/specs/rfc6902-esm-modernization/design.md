# Design Document

## Overview

This design outlines the modernization of the RFC6902 JSON Patch Generator tool by migrating from Babel standalone to esm.sh/tsx for JSX compilation. The migration will reduce the client-side JavaScript bundle size, improve loading performance, and simplify the development workflow while maintaining all existing functionality.

The key architectural change involves replacing the heavy Babel standalone library (~2.7MB) with the lightweight esm.sh/tsx script (~1KB) that leverages server-side compilation and edge caching.

## Architecture

### Current Architecture

```
Browser
├── HTML Page (Jekyll-generated)
├── Import Map (dependencies via esm.sh)
├── Babel Standalone (~2.7MB)
│   ├── JSX Transform Plugin
│   └── ES Module Transform
└── React Component (compiled client-side)
    ├── JSON Input Fields
    ├── Patch Generation Logic
    └── UI Components (Radix UI)
```

### New Architecture

```
Browser
├── HTML Page (Jekyll-generated)
├── Import Map (dependencies via esm.sh)
├── esm.sh/tsx Script (~1KB)
└── React Component (compiled server-side, cached at edge)
    ├── JSON Input Fields
    ├── Patch Generation Logic
    └── UI Components (Radix UI)

esm.sh Infrastructure
├── JSX Compilation Service
├── Edge Caching (Cloudflare)
└── Dependency Resolution
```

### Key Architectural Changes

1. **Compilation Location**: JSX compilation moves from browser to esm.sh servers
2. **Bundle Size**: Dramatic reduction from ~2.7MB Babel to ~1KB esm.sh/tsx
3. **Caching Strategy**: Compiled code cached at CDN edge for subsequent requests
4. **Development Experience**: Maintains hot-reload-like experience through esm.sh's development mode

## Components and Interfaces

### Core Components

#### 1. HTML Structure
- **Purpose**: Container for the React application with esm.sh/tsx integration
- **Key Changes**: 
  - Remove Babel standalone script tags
  - Add esm.sh/tsx script tag
  - Maintain existing import map structure
  - Keep `type="text/babel"` for JSX script compatibility

#### 2. Import Map Configuration
- **Purpose**: Define module resolution for dependencies
- **Interface**: Standard import map JSON structure
- **Dependencies**:
  - `react`: React library via esm.sh
  - `react-dom/client`: React DOM client via esm.sh
  - `rfc6902`: JSON Patch library via esm.sh
  - `json-ptr`: JSON Pointer library via esm.sh
  - `@radix-ui/*`: UI component libraries via esm.sh

#### 3. JsonPatchGenerator Component
- **Purpose**: Main React component for the tool
- **Interface**: No changes to component API
- **State Management**:
  - `beforeJson`: String state for "before" JSON input
  - `afterJson`: String state for "after" JSON input
  - `patch`: Array state for generated patch operations
  - `enhancedPatch`: Array state for UI-enhanced patch display
  - `error`: String state for error messages
  - `copied`: Boolean state for copy feedback

#### 4. Patch Generation Logic
- **Purpose**: Generate RFC6902 patches from JSON differences
- **Interface**: 
  ```javascript
  createEnhancedPatch(beforeObj, afterObj) => {
    patch: Array<PatchOperation>,
    enhanced: Array<EnhancedPatchOperation>
  }
  ```
- **Enhancement**: Adds `previousValue` and `removedValue` for better UI display

### Integration Points

#### 1. esm.sh/tsx Integration
- **Script Loading**: `<script type="module" src="https://esm.sh/tsx"></script>`
- **JSX Processing**: Automatic detection and compilation of `type="text/babel"` scripts
- **Development Mode**: Enhanced features when accessed via localhost
- **Production Mode**: Optimized compilation and caching for deployed sites

#### 2. Jekyll Integration
- **Build Process**: No changes required to Jekyll build
- **Asset Management**: All dependencies served via CDN
- **Development Server**: Compatible with Jekyll's development server

## Data Models

### PatchOperation
```typescript
interface PatchOperation {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
  path: string;
  value?: any;
  from?: string; // for move/copy operations
}
```

### EnhancedPatchOperation
```typescript
interface EnhancedPatchOperation extends PatchOperation {
  previousValue?: any; // for replace operations
  removedValue?: any;  // for remove operations
}
```

### Component State
```typescript
interface ComponentState {
  beforeJson: string;
  afterJson: string;
  patch: PatchOperation[];
  enhancedPatch: EnhancedPatchOperation[];
  error: string;
  copied: boolean;
}
```

## Error Handling

### Compilation Errors
- **Source**: esm.sh/tsx compilation failures
- **Handling**: Browser console errors, fallback to error display
- **User Experience**: Clear error messages for syntax issues

### Runtime Errors
- **JSON Parsing**: Try-catch blocks around JSON.parse operations
- **Patch Generation**: Error boundaries around patch creation logic
- **Network Issues**: Graceful degradation for CDN unavailability

### Error Display Strategy
```javascript
try {
  const beforeObj = JSON.parse(beforeJson);
  const afterObj = JSON.parse(afterJson);
  // ... patch generation
} catch (err) {
  setError(`Error: ${err.message}`);
  setPatch([]);
  setEnhancedPatch([]);
}
```

## Testing Strategy

### Unit Testing Approach
- **Framework**: Browser-based testing using the actual esm.sh/tsx compilation
- **Test Environment**: Local Jekyll server with esm.sh/tsx integration
- **Coverage Areas**:
  - JSX compilation verification
  - Component rendering validation
  - Patch generation accuracy
  - Error handling robustness

### Integration Testing
- **esm.sh/tsx Integration**: Verify script loading and compilation
- **Dependency Resolution**: Test all import map entries
- **Jekyll Compatibility**: Ensure proper integration with Jekyll build
- **Cross-browser Compatibility**: Test in modern browsers

### Performance Testing
- **Bundle Size Comparison**: Measure before/after bundle sizes
- **Load Time Analysis**: Compare page load performance
- **Compilation Speed**: Measure JSX compilation time
- **Cache Effectiveness**: Verify edge caching behavior

### Test Cases Structure
```javascript
// Example test structure
describe('RFC6902 Tool with esm.sh/tsx', () => {
  describe('Compilation', () => {
    it('should compile JSX without errors');
    it('should render React components correctly');
  });
  
  describe('Functionality', () => {
    it('should generate correct patches');
    it('should handle JSON parsing errors');
    it('should copy patches to clipboard');
  });
  
  describe('Performance', () => {
    it('should load faster than Babel version');
    it('should have smaller bundle size');
  });
});
```

## Migration Strategy

### Phase 1: Preparation
1. **Backup Current Implementation**: Create backup of working Babel version
2. **Environment Setup**: Ensure Jekyll development environment is ready
3. **Dependency Verification**: Confirm all dependencies work with esm.sh

### Phase 2: Core Migration
1. **Remove Babel Dependencies**: Remove Babel standalone script tags
2. **Add esm.sh/tsx Script**: Include esm.sh/tsx loader
3. **Update Script Type**: Ensure JSX script uses `type="text/babel"`
4. **Test Basic Functionality**: Verify component renders and basic features work

### Phase 3: Validation and Testing
1. **Comprehensive Testing**: Run full test suite
2. **Performance Validation**: Measure and compare performance metrics
3. **Cross-browser Testing**: Verify compatibility across browsers
4. **Error Handling Verification**: Test error scenarios

### Phase 4: Deployment
1. **Staging Deployment**: Deploy to staging environment
2. **Production Validation**: Verify production behavior
3. **Monitoring Setup**: Monitor for any issues post-deployment
4. **Documentation Update**: Update any relevant documentation

## Performance Considerations

### Bundle Size Optimization
- **Before**: ~2.7MB Babel standalone + dependencies
- **After**: ~1KB esm.sh/tsx + cached compiled code
- **Savings**: ~99.96% reduction in compilation library size

### Loading Performance
- **First Load**: Compilation happens server-side, cached at edge
- **Subsequent Loads**: Served from CDN cache, near-instant loading
- **Development Mode**: Fast recompilation for localhost development

### Runtime Performance
- **No Client Compilation**: Eliminates browser compilation overhead
- **Optimized Code**: Server-side compilation can apply optimizations
- **Memory Usage**: Reduced memory footprint without Babel in browser

## Security Considerations

### Code Execution
- **JSX Source**: Code sent to esm.sh servers for compilation
- **Trust Model**: Relies on esm.sh infrastructure security
- **Content Security Policy**: May need CSP adjustments for esm.sh domains

### Dependency Security
- **CDN Dependencies**: All dependencies served via esm.sh CDN
- **Version Pinning**: Maintain specific version pins in import map
- **Integrity Checking**: Consider SRI hashes where supported

## Deployment Considerations

### Environment Requirements
- **Browser Support**: Modern browsers with ES6 module support
- **Network Access**: Requires access to esm.sh CDN
- **Jekyll Version**: Compatible with current Jekyll setup

### Rollback Strategy
- **Quick Rollback**: Keep Babel version as backup
- **Feature Flags**: Consider feature flag for gradual rollout
- **Monitoring**: Monitor error rates and performance metrics

### Production Readiness
- **CDN Reliability**: esm.sh backed by Cloudflare infrastructure
- **Caching Strategy**: Edge caching ensures good performance
- **Error Handling**: Graceful degradation for network issues