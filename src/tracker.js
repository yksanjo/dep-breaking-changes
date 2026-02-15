/**
 * Breaking Changes Tracker
 * Detects breaking changes and upcoming deprecations
 */

// Comprehensive breaking changes database
const BREAKING_CHANGES = {
  'react': {
    versions: [
      { version: '19.0.0', breaking: true, changes: ['React 19 requires Node.js 18+', 'createRef returns object', 'useId strategy changed'] },
      { version: '18.0.0', breaking: true, changes: ['Concurrent features enabled by default', 'Strict Mode double invocation', 'Suspense fallback changes'] },
      { version: '17.0.0', breaking: true, changes: ['No event delegation to document', 'JSX transform changed'] }
    ],
    deprecated: ['createClass', 'findDOMNode', 'render', 'unmountComponentAtNode']
  },
  'vue': {
    versions: [
      { version: '4.0.0', breaking: true, changes: ['Vue 4 requires Vue 3 compatible packages', 'Composition API required'] },
      { version: '3.0.0', breaking: true, changes: ['Composition API introduced', 'Lifecycle changes', 'Removed Filters'] }
    ],
    deprecated: ['$on', '$off', '$once', 'filter', 'inline-template', 'event bus']
  },
  'express': {
    versions: [
      { version: '5.0.0', breaking: true, changes: ['Async handlers must be awaited', 'Promise-based errors', 'Removed callback routes'] },
      { version: '4.0.0', breaking: true, changes: ['Removed express.bodyParser()', 'Use express.json()', 'Router changes'] }
    ],
    deprecated: ['express.bodyParser', 'express.json', 'express.urlencoded with bodyParser']
  },
  'next': {
    versions: [
      { version: '14.0.0', breaking: false, changes: ['App Router is now default', 'Server Actions stable'] },
      { version: '13.0.0', breaking: true, changes: ['Breaking changes in routing', 'Link component changes', 'getServerSideProps deprecated'] },
      { version: '12.0.0', breaking: true, changes: ['React 18 required', 'Middleware changes'] }
    ],
    deprecated: ['getServerSideProps', 'getStaticProps revalidate format']
  },
  'tailwindcss': {
    versions: [
      { version: '4.0.0', breaking: true, changes: ['CSS-first configuration', 'No more tailwind.config.js', 'New @import syntax'] },
      { version: '3.0.0', breaking: true, changes: ['JIT mode required', 'Some utility changes'] }
    ],
    deprecated: ['node-sass support', 'PostCSS 7 support']
  },
  'typescript': {
    versions: [
      { version: '5.0.0', breaking: true, changes: ['Breaking changes in type inference', 'export type changes'] },
      { version: '4.0.0', breaking: true, changes: ['Variance annotations', 'Labeled tuple types'] }
    ],
    deprecated: ['Function.bind this type']
  },
  'vite': {
    versions: [
      { version: '5.0.0', breaking: true, changes: ['Config format changes', 'Plugin API changes'] },
      { version: '4.0.0', breaking: true, changes: ['Node.js 14+ required', 'CSS changes'] }
    ],
    deprecated: ['@vitejs/plugin-react-refresh']
  },
  'webpack': {
    versions: [
      { version: '5.0.0', breaking: true, changes: ['Node.js polyfills removed', 'Mode required', 'File system caching'] },
      { version: '4.0.0', breaking: true, changes: ['Tree shaking improvements', 'Module type changes'] }
    ],
    deprecated: ['webpack.config.js module.exports', 'Node.js built-in polyfills']
  },
  'babel': {
    versions: [
      { version: '7.0.0', breaking: true, changes: ['Preset changes', 'Plugin ordering important'] }
    ],
    deprecated: ['babel-preset-es2015', 'babel-preset-latest']
  },
  'nestjs': {
    versions: [
      { version: '10.0.0', breaking: true, changes: ['Breaking changes in guards', 'Interceptor changes'] },
      { version: '9.0.0', breaking: true, changes: ['Microservice changes'] }
    ],
    deprecated: ['@nestjs/platform-express express adapter']
  },
  'prisma': {
    versions: [
      { version: '5.0.0', breaking: true, changes: ['Driver adapters required', 'Query batching changes'] },
      { version: '4.0.0', breaking: true, changes: ['Prisma Client changes', 'Schema changes'] }
    ],
    deprecated: ['prisma generate --endpoint']
  },
  'mongoose': {
    versions: [
      { version: '7.0.0', breaking: true, changes: ['MongoDB 6.0+ required', 'Query changes'] },
      { version: '6.0.0', breaking: true, changes: ['Strict query by default', 'Connection changes'] }
    ],
    deprecated: ['promise-based API']
  },
  'axios': {
    versions: [
      { version: '1.0.0', breaking: true, changes: ['Breaking changes in error handling', 'Cancel API changes'] }
    ],
    deprecated: ['axios.spread']
  },
  'graphql': {
    versions: [
      { version: '16.0.0', breaking: true, changes: ['Breaking validation changes'] },
      { version: '15.0.0', breaking: true, changes: ['Validation changes'] }
    ],
    deprecated: ['graphql print schema']
  },
  'lodash': {
    versions: [
      { version: '5.0.0', breaking: true, changes: ['Many deprecated methods removed', 'Immutable operations'] }
    ],
    deprecated: ['_.pluck', '_.nthArg']
  },
  'jest': {
    versions: [
      { version: '29.0.0', breaking: true, changes: ['Fake timers changes', 'ESM changes'] }
    ],
    deprecated: ['jest.resetModules']
  }
};

export class BreakingChangesTracker {
  constructor(options = {}) {
    this.options = {
      workspacePath: options.workspacePath || process.cwd(),
      excludeDirs: options.excludeDirs || ['node_modules', '.git', 'dist'],
      ...options
    };
    
    this.results = {
      breaking: [],
      deprecated: [],
      upcoming: [],
      summary: {
        totalScanned: 0,
        breakingFound: 0,
        deprecatedFound: 0,
        upcomingChanges: 0
      }
    };
  }

  async track() {
    console.log('🔍 Tracking breaking changes...\n');
    
    const projects = this.findProjects();
    console.log(`📦 Found ${projects.length} projects\n`);
    
    for (const project of projects) {
      const dependencies = this.parseDependencies(project);
      
      for (const [pkg, version] of Object.entries(dependencies)) {
        this.results.summary.totalScanned++;
        
        const breaking = this.checkBreakingChanges(pkg, version);
        if (breaking.found.length > 0) {
          this.results.breaking.push(...breaking.found);
          this.results.summary.breakingFound += breaking.found.length;
        }
        
        if (breaking.deprecated.length > 0) {
          this.results.deprecated.push(...breaking.deprecated);
          this.results.summary.deprecatedFound += breaking.deprecated.length;
        }
        
        if (breaking.upcoming.length > 0) {
          this.results.upcoming.push(...breaking.upcoming);
          this.results.summary.upcomingChanges += breaking.upcoming.length;
        }
      }
    }
    
    return this.results;
  }

  findProjects() {
    const { readFileSync, existsSync, readdirSync, statSync } = require('fs');
    const { join, resolve } = require('path');
    
    const projects = [];
    const workspacePath = resolve(this.options.workspacePath);
    
    try {
      const entries = readdirSync(workspacePath);
      
      for (const entry of entries) {
        const fullPath = join(workspacePath, entry);
        
        if (!statSync(fullPath).isDirectory()) continue;
        if (this.options.excludeDirs.includes(entry)) continue;
        if (entry.startsWith('.')) continue;
        
        if (existsSync(join(fullPath, 'package.json'))) {
          projects.push({ name: entry, path: fullPath });
        }
      }
    } catch (error) {
      console.error('Error finding projects:', error.message);
    }
    
    return projects;
  }

  parseDependencies(project) {
    const { readFileSync, existsSync } = require('fs');
    const { join } = require('path');
    
    const pkgPath = join(project.path, 'package.json');
    if (!existsSync(pkgPath)) return {};
    
    try {
      const content = readFileSync(pkgPath, 'utf-8');
      const pkg = JSON.parse(content);
      
      return {
        ...pkg.dependencies,
        ...pkg.devDependencies
      };
    } catch {
      return {};
    }
  }

  checkBreakingChanges(packageName, version) {
    const result = { found: [], deprecated: [], upcoming: [] };
    const data = BREAKING_CHANGES[packageName.toLowerCase()];
    
    if (!data) return result;
    
    const currentMajor = this.extractMajor(version);
    
    for (const v of data.versions) {
      const vMajor = this.extractMajor(v.version);
      
      // Already at or past breaking version
      if (vMajor <= currentMajor && v.breaking) {
        result.found.push({
          package: packageName,
          version: version,
          breakingVersion: v.version,
          changes: v.changes,
          severity: 'high'
        });
      }
      
      // Coming up next
      if (vMajor === currentMajor + 1) {
        result.upcoming.push({
          package: packageName,
          currentVersion: version,
          nextVersion: v.version,
          changes: v.changes
        });
      }
    }
    
    // Check deprecated APIs
    if (data.deprecated) {
      result.deprecated.push({
        package: packageName,
        version: version,
        deprecated: data.deprecated,
        message: 'Uses deprecated APIs'
      });
    }
    
    return result;
  }

  extractMajor(version) {
    if (!version) return 0;
    const match = version.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }
}

export async function track(options = {}) {
  const tracker = new BreakingChangesTracker(options);
  return await tracker.track();
}
