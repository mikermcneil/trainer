#!/usr/bin/env node

/**
 * Module dependencies
 */

var util = require('util');
var program = require('commander');
var chalk = require('chalk');
var _ = require('lodash');
var Process = require('machinepack-process');

var VERSION = require('../package.json').version;



program
// Set up `-v` usage
.version(VERSION)
// Allow unknown options.
.unknownOption = function NOOP(){};

// Set up commands
program.usage(chalk.gray('[options]')+' '+chalk.bold('<command>'))
.command('ivs', 'look up IVs based on a screenshot of one of your Pokemon')
.command('about', 'what is trainer?');


// Parse the CLI args / opts.
program.parse(process.argv);

// Make an aliaser function for use below.
var runAs = makeAliaser('trainer');


// $ trainer
//
// (i.e. with no CLI arguments...)
if (program.args.length === 0) {
  return runAs('about');
}



// $ trainer <command>
//
// (i.e. matched one of the overtly exposed commands)
var matchedCommand = !!program.runningCommand;
if (matchedCommand){
  return;
}




// $ trainer <*>
//
// (i.e. final handler)
(function unknownCommand(){

  // Display usage (i.e. "help"):
  program.outputHelp();
})();





/**
 * Helper fn
 * @param  {String} prefix [the filename prefix to use, e.g. "trainer"]
 */
function makeAliaser (prefix){

  process.argv.splice(process.argv.indexOf(program.args[0]),1);

  /**
   * @param  {String} aliasFor [string command to redirect to]
   * @param  {Dictionary} cliOpts [a dictionary of options to convert/escape as CLI opts]
   */
  return function _alias (aliasFor, cliOpts){

    if (_.isObject(cliOpts)) {
      _.each(cliOpts, function (val, inputCodeName) {
        var escapedAsCliOpt = Process.escapeCliOpt({ value: val }).execSync();
        process.argv.push('--'+inputCodeName+'='+escapedAsCliOpt);
      });
    }

    require('./'+prefix+'-'+aliasFor);
  };
}
