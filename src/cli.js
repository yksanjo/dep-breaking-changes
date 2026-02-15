/**
 * Breaking Changes Tracker CLI
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { track } from './tracker.js';

const red = chalk.red;
const green = chalk.green;
const yellow = chalk.yellow;
const blue = chalk.blue;
const bold = chalk.bold;
const orange = chalk.hex('#f97316');

const program = new Command();

program
  .name('dep-breaking-changes')
  .description('Track breaking changes and deprecations in dependencies')
  .version('1.0.0');

program
  .command('scan')
  .description('Scan for breaking changes')
  .option('-p, --path <path>', 'Workspace path', process.cwd())
  .action(async (options) => {
    const spinner = ora('Scanning for breaking changes...').start();
    
    try {
      const results = await track({ workspacePath: options.path });
      spinner.succeed('Scan complete!');
      
      console.log('\n' + '='.repeat(60));
      console.log(bold('🟠 BREAKING CHANGES SUMMARY'));
      console.log('='.repeat(60));
      console.log(`Total Dependencies: ${results.summary.totalScanned}`);
      console.log(`Breaking Changes:    ${results.summary.breakingFound}`);
      console.log(`Deprecated APIs:     ${results.summary.deprecatedFound}`);
      console.log(`Upcoming Changes:   ${results.summary.upcomingChanges}`);
      console.log('='.repeat(60));
      
      if (results.breaking.length > 0) {
        console.log(bold('\n⚠️  BREAKING CHANGES FOUND:\n'));
        
        for (const b of results.breaking.slice(0, 15)) {
          console.log(orange(`🟠 ${b.package}@${b.version}`));
          console.log(`   Breaking in: ${b.breakingVersion}`);
          console.log(`   Changes: ${b.changes.join(', ')}`);
          console.log('');
        }
        
        if (results.breaking.length > 15) {
          console.log(yellow(`... and ${results.breaking.length - 15} more`));
        }
      }
      
      if (results.deprecated.length > 0) {
        console.log(bold('\n⚠️  DEPRECATED APIs:\n'));
        
        for (const d of results.deprecated.slice(0, 10)) {
          console.log(yellow(`🟡 ${d.package}@${d.version}`));
          console.log(`   Deprecated: ${d.deprecated.join(', ')}`);
          console.log('');
        }
      }
      
      if (results.upcoming.length > 0) {
        console.log(bold('\n📝 UPCOMING BREAKING CHANGES:\n'));
        
        for (const u of results.upcoming.slice(0, 10)) {
          console.log(blue(`🔵 ${u.package}@${u.currentVersion} → ${u.nextVersion}`));
          console.log(`   ${u.changes.join(', ')}`);
          console.log('');
        }
      }
      
      if (results.breaking.length === 0 && results.deprecated.length === 0) {
        console.log(green('\n✅ No breaking changes or deprecations found!'));
      }
      
    } catch (error) {
      spinner.fail('Scan failed!');
      console.error(red('Error:'), error.message);
    }
  });

program.parse();
