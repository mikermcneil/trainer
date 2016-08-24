# trainer

Get your Pokemons' IVs from Pokemon Go based on screenshots from your phone or tablet.

> This is a work in progress, and is currently mainly just a showcase of what's possible with machinepacks and machine-as-script.
> We'll see where it goes!


### Installation

```bash
npm install -g trainer
```

You'll also need to have [Tesseract](https://github.com/tesseract-ocr/tesseract) installed for this to work.

##### Installing Tesseract

For Homebrew users, installing Tesseract is quick and easy:

```sh
brew install tesseract --with-all-languages
```

You can find installation instructions for various platforms on [the Tesseract project site](https://github.com/tesseract-ocr/tesseract).

> ###### Tesseract Version
> This [probably](https://nodei.co/npm/node-tesseract/) works with any version of Tesseract v3.01 or higher, but I have only tested extensively with:
>
>```
>machinepack-ocr: ∑ tesseract -v
>tesseract 3.04.01
> leptonica-1.73
>  libjpeg 8d : libpng 1.6.24 : libtiff 4.0.6 : zlib 1.2.5
>```



### Usage

```bash
∑ trainer ivs ./squirtle.png
```


#### Current output

> This is a work in progress!

```
∑ trainer ivs krabby.png

IVs:

• CP 266

• Max HP 33

• Stardust to power up 1600


• Raw text:

Dungeness

HP 33 / 33
Water 9.01 kg 0.45 m
Type Weight Height
B419 45
STARDUST KRABBY CANDY
ﬂ 2
```


### License

MIT
