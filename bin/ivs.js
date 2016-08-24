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
      example: '===',// TODO
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

        //   ██████╗ ██╗   ██╗███████╗██████╗  █████╗ ██╗     ██╗
        //  ██╔═══██╗██║   ██║██╔════╝██╔══██╗██╔══██╗██║     ██║
        //  ██║   ██║██║   ██║█████╗  ██████╔╝███████║██║     ██║
        //  ██║   ██║╚██╗ ██╔╝██╔══╝  ██╔══██╗██╔══██║██║     ██║
        //  ╚██████╔╝ ╚████╔╝ ███████╗██║  ██║██║  ██║███████╗███████╗
        //   ╚═════╝   ╚═══╝  ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝
        //
        // Now attempt to recognize characters in the image.
        OCR.recognize({ path: inputs.path, convertToGrayscale: true }).exec(function (err, rawTextFromInitialPass) {
          try {
            if (err) { return exits.error(err); }

            //   ██████╗██████╗
            //  ██╔════╝██╔══██╗
            //  ██║     ██████╔╝
            //  ██║     ██╔═══╝
            //  ╚██████╗██║
            //   ╚═════╝╚═╝
            //
            // Crop the CP part of the image.
            //
            // Figure out the appropriate path to a directory where the temporary image
            // will be written.
            // var tmpCPImg = path.resolve(os.tmpDir(), path.basename(inputs.path)+'-cp.crop.jpg');

            // DEBUG
            // --------------------------------------------------------------------------------------------------------------------
            var tmpCPImg = path.resolve('/Users/mikermcneil/Desktop', path.basename(inputs.path)+'-cp.crop.jpg');
            // console.log('tmpCPImg',tmpCPImg);
            // --------------------------------------------------------------------------------------------------------------------

            // Build dimensions.
            var cpCropWidth = image.width() * 0.33;
            var x0 = (image.width() / 2) - (cpCropWidth / 2);
            var x1 = (image.width() / 2) + (cpCropWidth / 2);
            var y0 = 75;
            var y1 = 155;
            // console.log('x0:',x0, 'x1:',x1, 'y0:',y0, 'y1:',y1, 'cpCropWidth:',cpCropWidth);

            // Do the cropping
            image.batch()
            .crop(x0, y0, x1, y1)
            .writeFile(tmpCPImg, function (err){
              try {
                if (err) { return exits.error(err); }

                // Now do another pass to get CP
                // (to experiment: `tesseract -psm 8 /Users/mikermcneil/Desktop/krabby.png-cp.crop.jpg foo`)
                OCR.recognize({ path: tmpCPImg, psm: 8 }).exec(function (err, cp) {
                  try {
                    if (err) { return exits.error(err); }

                    // console.log('raw cp:',cp);
                    cp = cp.replace(/[^0-9]/g,'');
                    cp = +cp;

                    // --•
                    // Some text was recognized successfully!
                    return exits.success({
                      rawTextFromInitialPass: rawTextFromInitialPass,
                      cp: cp
                    });
                  } catch (e) { return exits.error(e); }
                });//</OCR.recognize()>

              } catch (e) { return exits.error(e); }
            });//</OCR.recognize()>
          } catch (e) { return exits.error(e); }
        });//</image.batch()>
      } catch (e) { return exits.error(e); }
    });//</LWIP.open()>

  }


}).exec({
  success: function (ivReport){
    console.log('IVs:');
    console.log('\n• rawTextFromInitialPass:', ivReport.rawTextFromInitialPass);
    console.log('\n• CP', ivReport.cp);
  }
});
