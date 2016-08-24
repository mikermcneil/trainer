#!/usr/bin/env node
require('machine-as-script')({


  friendlyName: 'Get individual values (IVs)',


  description: 'Read a screenshot from the provided path on disk, process it, and return the Pokemon\'s IVs.',


  extendedDescription: 'For more on calculations, see: https://github.com/justinleewells/pogo-optimizer/tree/master/lib',


  sideEffects: 'cacheable',


  inputs: {

    path: {
      required: true,
      example: '/Users/ash/Desktop/bulbasaur.png',
      destination: 'The path to a screenshot of one of your Pokemon from Pokemon Go.',
      extendedDescription: 'If a relative path is specified, it will be resolved from the current working directory.',
    }

  },


  exits: {

    success: {
      outputFriendlyName: 'IVs',
      outputDescription: 'A report on this Pokemon\'s individual values (IVs).',
      outputExample: '===',// TODO
    },

  },


  // TO TEST:
  // ```
  // node ./bin/get-ivs --path='/Users/mikermcneil/Desktop/krabby.png'
  // ```
  fn: function(inputs, exits) {

    var path = require('path');
    var os = require('os');
    var LWIP = require('lwip');
    var OCR = require('machinepack-ocr');


    // Resolve path to make sure it is absolute.
    inputs.path = path.resolve(inputs.path);

    // Now preprocess the image.
    // (we'll create a modified copy of the image on disk)
    LWIP.open(inputs.path, function (err, image){
      if (err) { return exits.error(err); }
      try {

        // Figure out the appropriate path to a directory where the temporary image
        // will be written.
        var tmpPathForModifiedImg = path.resolve(os.tmpDir(), path.basename(inputs.path)+'-cp.crop.jpg');

        // DEBUG
        // --------------------------------------------------------------------------------------------------------------------
        // var tmpPathForModifiedImg = path.resolve('/Users/mikermcneil/Desktop', path.basename(inputs.path)+'-grayscale.tmp.jpg');
        // console.log('tmpPathForModifiedImg',tmpPathForModifiedImg);
        // --------------------------------------------------------------------------------------------------------------------


        // Make grayscale version of image.
        image.batch()
        // TODO: crop the CP part
        .saturate(-1) // https://github.com/EyalAr/lwip#saturate (<< Desaturating definitely improves recog, at least somewhat)
        // .darken(0.2) // https://github.com/EyalAr/lwip#darken (<< Darkening doesn't seem to make a difference.)
        // .sharpen(0.2) // https://github.com/EyalAr/lwip#sharpen (<< Sharpening MIGHT actually hurt recog a bit..)
        .writeFile(tmpPathForModifiedImg, function (err){
          try {
            if (err) { return exits.error(err); }

            // Now attempt to recognize characters in the image.
            OCR.recognize({ path: tmpPathForModifiedImg }).exec(function (err, text) {
              try {
                if (err) { return exits.error(err); }

                // --•
                // Some text was recognized successfully!
                return exits.success(text);

              } catch (e) { return exits.error(e); }
            });//</OCR.recognize()>
          } catch (e) { return exits.error(e); }
        });//</image.batch()>
      } catch (e) { return exits.error(e); }
    });//</LWIP.open()>

  }


}).exec();
