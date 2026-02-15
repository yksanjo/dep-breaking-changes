/**
 * Breaking Changes Tracker - Main Entry Point
 */

import { BreakingChangesTracker } from './tracker.js';

export { BreakingChangesTracker };

const isMain = process.argv[1]?.includes('index.js');
if (isMain) {
  console.log('Breaking Changes Tracker v1.0.0');
  console.log('Use: node src/cli.js <command>');
}
