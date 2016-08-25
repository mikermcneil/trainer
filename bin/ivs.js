#!/usr/bin/env node
require('machine-as-script')({


  args: ['path'],


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
    var _ = require('lodash');
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


                    //  ██████╗ ██╗   ██╗███████╗████████╗    ██████╗ ██████╗ ██╗ ██████╗███████╗
                    //  ██╔══██╗██║   ██║██╔════╝╚══██╔══╝    ██╔══██╗██╔══██╗██║██╔════╝██╔════╝
                    //  ██║  ██║██║   ██║███████╗   ██║       ██████╔╝██████╔╝██║██║     █████╗
                    //  ██║  ██║██║   ██║╚════██║   ██║       ██╔═══╝ ██╔══██╗██║██║     ██╔══╝
                    //  ██████╔╝╚██████╔╝███████║   ██║       ██║     ██║  ██║██║╚██████╗███████╗
                    //  ╚═════╝  ╚═════╝ ╚══════╝   ╚═╝       ╚═╝     ╚═╝  ╚═╝╚═╝ ╚═════╝╚══════╝
                    //
                    LWIP.open(inputs.path, function (err, image){
                      if (err) { return exits.error(err); }
                      // var tmpStardustToPowerUpImg = path.resolve(os.tmpDir(), path.basename(inputs.path)+'-stardust-to-power-up.crop.jpg');
                      var tmpStardustToPowerUpImg = path.resolve('/Users/mikermcneil/Desktop', path.basename(inputs.path)+'-stardust-to-power-up.crop.jpg');
                      // console.log('tmpStardustToPowerUpImg',tmpStardustToPowerUpImg);

                      // Build dimensions.
                      var x0 = 413;
                      var x1 = 523;
                      var y0 = 1045;
                      var y1 = 1100;
                      // console.log('x0:',x0, 'x1:',x1, 'y0:',y0, 'y1:',y1);

                      // Do the cropping
                      image.batch()
                      .crop(x0, y0, x1, y1)
                      .writeFile(tmpStardustToPowerUpImg, function (err){
                        try {
                          if (err) { return exits.error(err); }

                          OCR.recognize({ path: tmpStardustToPowerUpImg, psm: 8, convertToGrayscale: true }).exec(function (err, stardustToPowerUp) {
                            try {
                              if (err) { return exits.error(err); }

                              // console.log('raw stardustToPowerUp:',stardustToPowerUp);
                              stardustToPowerUp = stardustToPowerUp.replace(/[^0-9]/g,'');
                              stardustToPowerUp = +stardustToPowerUp;


                              //  ███╗   ███╗ █████╗ ██╗  ██╗    ██╗  ██╗██████╗
                              //  ████╗ ████║██╔══██╗╚██╗██╔╝    ██║  ██║██╔══██╗
                              //  ██╔████╔██║███████║ ╚███╔╝     ███████║██████╔╝
                              //  ██║╚██╔╝██║██╔══██║ ██╔██╗     ██╔══██║██╔═══╝
                              //  ██║ ╚═╝ ██║██║  ██║██╔╝ ██╗    ██║  ██║██║
                              //  ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝
                              //
                              LWIP.open(inputs.path, function (err, image){
                                if (err) { return exits.error(err); }
                                // var tmpMaxHPImg = path.resolve(os.tmpDir(), path.basename(inputs.path)+'-stardust-to-power-up.crop.jpg');
                                var tmpMaxHPImg = path.resolve('/Users/mikermcneil/Desktop', path.basename(inputs.path)+'-max-hp.crop.jpg');
                                // console.log('tmpMaxHPImg',tmpMaxHPImg);

                                // Build dimensions.
                                var cropWidth = image.width() * 0.25;
                                var x0 = (image.width() / 2) - (cropWidth / 2);
                                var x1 = (image.width() / 2) + (cropWidth / 2);
                                var y0 = 700;
                                var y1 = 740;
                                // console.log('x0:',x0, 'x1:',x1, 'y0:',y0, 'y1:',y1);

                                // Do the cropping
                                image.batch()
                                .crop(x0, y0, x1, y1)
                                .writeFile(tmpMaxHPImg, function (err){
                                  try {
                                    if (err) { return exits.error(err); }

                                    OCR.recognize({ path: tmpMaxHPImg, psm: 8, convertToGrayscale: true }).exec(function (err, rawMaxHP) {
                                      try {
                                        if (err) { return exits.error(err); }

                                        // console.log('raw maxHP:',rawMaxHP);
                                        var maxHP = _.last(rawMaxHP.split('/'));
                                        maxHP = maxHP.replace(/[^0-9]/g,'');
                                        maxHP = +maxHP;

                                        //  ██████╗  ██████╗ ██╗  ██╗███████╗     █████╗ ██████╗  ██████╗
                                        //  ██╔══██╗██╔═══██╗██║ ██╔╝██╔════╝    ██╔══██╗██╔══██╗██╔════╝
                                        //  ██████╔╝██║   ██║█████╔╝ █████╗      ███████║██████╔╝██║
                                        //  ██╔═══╝ ██║   ██║██╔═██╗ ██╔══╝      ██╔══██║██╔══██╗██║
                                        //  ██║     ╚██████╔╝██║  ██╗███████╗    ██║  ██║██║  ██║╚██████╗
                                        //  ╚═╝      ╚═════╝ ╚═╝  ╚═╝╚══════╝    ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝
                                        //
                                        // Parse poke arc
                                        LWIP.open(inputs.path, function (err, image){
                                          try {
                                            if (err) { return exits.error(err); }


                                            // Device-specific constants:
                                            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                                            // width of image in px
                                            var w = image.width();
                                            // # of padding px on both left + right side of arc
                                            var xPadding = 75;
                                            // The last X value to iterate over.
                                            var maxX = (w - xPadding) - 1;
                                            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

                                            // Diameter
                                            var diameter = w - (xPadding*2);

                                            // Formula
                                            var arcFx = function (x){

                                              var y0 = 175;

                                              // Original parabola approach: (not quite right)
                                              // - - - - - - - - - - - - - - - - - - - - -
                                              // y = (mx + (w/2))^2 + y0;
                                              //
                                              // m: device-specific arc fatness multiplier
                                              // x: x position along arc
                                              // w: device width (px)
                                              // y0: topmost y coordinate of arc
                                              // - - - - - - - - - - - - - - - - - - - - -
                                              // var m = 0.048;
                                              // return (Math.pow(m*(x - w/2.0), 2)) + y0;


                                              // Instead, we use a circle:
                                              // - - - - - - - - - - - - - - - - - - - - -
                                              // (x-a)^2 + (y-b)^2 === radius^2
                                              //
                                              // x: x position along arc
                                              // a: some kind of constant
                                              // b: some kind of constant
                                              // radius: radius of circle
                                              // - - - - - - - - - - - - - - - - - - - - -
                                              var radius = diameter / 2;

                                              // Decrease the radius _JUST A HAIR_ so we'll be able to detect the white blob.
                                              radius -= 2;
                                              // radius -= 2;
                                              // console.log('radius:',radius);

                                              // // Beginning with standard form Pythagoras circle:
                                              // // (x-a)^2 + (y-b)^2 === radius^2
                                              // // <=>
                                              // // √( (y-b)^2) ) === √( radius^2 - (x-a)^2 )
                                              // // <=>
                                              // // y-b === ±√( radius^2 - (x-a)^2 )
                                              // // <=>
                                              // // y === b ± √( radius^2 - (x-a)^2 )

                                              var A = w/2.0; // indicates the x origin of circle
                                              var B = 475; // indicates the y origin of circle

                                              // console.log('radius:',radius);
                                              // console.log('x:',x);
                                              // console.log('x-A:',x-A);
                                              var result = B - Math.sqrt( Math.abs( Math.pow(radius,2) - Math.pow(x-A, 2) ) );

                                              // var result = B - Math.sqrt( Math.pow(radius,2) - Math.pow(x-A, 2) );
                                              // if (_.isNaN(result)) {
                                              //   throw new Error(require('util').format('at x=%d, got NaN trying to compute √ of `%d`',x,(Math.pow(radius,2) - Math.pow(x-A, 2))));
                                              // }

                                              return result;
                                            };


                                            var arcNoduleFoundAtX;
                                            for (var x = xPadding; x <= maxX; x+=0.5) {
                                              var y = Math.floor(arcFx(x));
                                              console.log('(%d,%d)',x,y);
                                              var pixel = image.getPixel(Math.floor(x), y);
                                              console.log('=pixel:',pixel);

                                              var WHITENESS_THRESHOLD = 240;
                                              if (pixel.r >= WHITENESS_THRESHOLD && pixel.g >= WHITENESS_THRESHOLD && pixel.b >= WHITENESS_THRESHOLD) {
                                                arcNoduleFoundAtX = x;
                                                // For now, take the LAST one.
                                                // break;
                                              }
                                            }

                                            if (_.isUndefined(arcNoduleFoundAtX)) {
                                              throw new Error('Could not detect poke arc position in this screenshot.');
                                            }

                                            // console.log('arcNoduleFoundAtX', arcNoduleFoundAtX);

                                            var approximationOfPokeArcPercent = (arcNoduleFoundAtX / maxX) * 100;
                                            console.log('approximationOfPokeArcPercent', approximationOfPokeArcPercent);

                                            // distance between (xPadding, arcFx(xPadding)) and (arcNoduleFoundAtX, arcFx(arcNoduleFoundAtX))
                                            // http://www.mathwarehouse.com/algebra/distance_formula/index.php
                                            // √( (x2-x1)^2 + (y2-y1)^2 )
                                            var distance = Math.sqrt( Math.pow(arcNoduleFoundAtX - xPadding, 2) + Math.pow(arcFx(arcNoduleFoundAtX) - arcFx(xPadding), 2) );
                                            console.log('distance', distance);



                                            // Math.acos((a^2 + b^2 − c^2) / (2ab))
                                            // https://www.mathsisfun.com/algebra/trig-solving-sss-triangles.html
                                            var angle = Math.acos(
                                              ( Math.pow(diameter/2.0,2) + Math.pow(diameter/2.0,2) - Math.pow(distance,2) ) / ( 2*(diameter/2.0)*(diameter/2.0) )
                                            );
                                            console.log('angle', angle);

                                            var circumference = diameter * Math.PI;
                                            console.log('circumference', circumference);
                                            var maxAngle = Math.PI * 2; // (2π radians / 360 degrees)
                                            var angleRatio = angle / maxAngle;
                                            console.log('angleRatio (out of 2π radians)', angleRatio);
                                            var arcLength = circumference * angleRatio;
                                            console.log('arcLength', arcLength);

                                            // // Need to calculate circumference sort of a thing.
                                            var halfTheCircumference = circumference / 2.0;
                                            var arcLengthBeforeNodule = arcLength;
                                            var pokeArcPercent = (arcLengthBeforeNodule / halfTheCircumference) * 100;



                                            // For debugging purposes, draw arc.
                                            // ------------------------------------------------
                                            (function _drawArcForDebug(){
                                              var batch = image.batch();

                                              for (var x = xPadding; x <= maxX; x+=0.5) {
                                                var y = Math.floor(arcFx(x));
                                                batch = batch.setPixel(Math.floor(x), y, 'black');
                                              }

                                              var debugImgPath = path.resolve('/Users/mikermcneil/Desktop', path.basename(inputs.path)+'-debug.jpg');
                                              batch.writeFile(debugImgPath, function (err){
                                                if (err) { console.error('FAILED to write debug img.  Details:',err); }
                                                console.log('Successfully wrote debug img at '+debugImgPath);
                                              });
                                              // _∏_

                                            })();//</self-calling function :: _drawArcForDebug()>
                                            // ------------------------------------------------


                                            // --•
                                            return exits.success({
                                              rawTextFromInitialPass: rawTextFromInitialPass,
                                              cp: cp,
                                              stardustToPowerUp: stardustToPowerUp,
                                              maxHP: maxHP,
                                              pokeArcPercent: pokeArcPercent
                                            });

                                          } catch (e) { return exits.error(e); }
                                        });//</LWIP.open() (for poke arc)>
                                      } catch (e) { return exits.error(e); }
                                    });//</OCR.recognize() :: max HP>
                                  } catch (e) { return exits.error(e); }
                                });//</image.batch() (for max HP)>
                              });//</LWIP.open() (for max HP)>
                            } catch (e) { return exits.error(e); }
                          });//</OCR.recognize() :: stardust to power up>
                        } catch (e) { return exits.error(e); }
                      });//</image.batch() (for stardust to power up)>
                    });//</LWIP.open() (for stardust to power up)>
                  } catch (e) { return exits.error(e); }
                });//</OCR.recognize() :: CP>
              } catch (e) { return exits.error(e); }
            });//</image.batch()>
          } catch (e) { return exits.error(e); }
        });//</OCR.recognize() :: overall>
      } catch (e) { return exits.error(e); }
    });//</LWIP.open()>

  }


}).exec({
  success: function (ivReport){
    console.log('IVs:');
    console.log('\n• CP', ivReport.cp);
    console.log('\n• Max HP', ivReport.maxHP);
    console.log('\n• Dust cost (stardust to power up)', ivReport.stardustToPowerUp);
    console.log('\n• Pokemon Lvl Arc %', Math.round(ivReport.pokeArcPercent));
    // console.log('\n• rawTextFromInitialPass:', ivReport.rawTextFromInitialPass);
  }
});
