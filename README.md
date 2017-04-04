# img-optmzr
> An app for desktop image optimization.

![Screenshot of img-optmzr](http://bromy.co/images/img-optmzr.JPG)

img-optmzr reduces the file size of JPEG images while conserving quality. It has an easy drag and drop design that's great for optimizing large amount of images. img-optmzr uses the excellent [mozjpeg](https://github.com/mozilla/mozjpeg) JPEG encoder under the hood.

## Development
Clone this repo

`git clone https://github.com/bromy/img-optmzr.git`

Install the dependencies

`npm install`

Start the app for local development

`npm run start`

Package the app as an .exe executable program

`npm run package`

## FAQ

**A desktop image optimizer? Why?**

Images can take up a lot of space. Photos taken on high-quality phone cameras are a great example. Smaller file sizes mean faster uploads, downloads, transfers, and backups. A desktop app helps optimize a lot of images - quickly.

**Aren't there websites that let you optimize images online?**

Yes, [Compressor.io]https://compressor.io/ and [TinyPNG](https://tinypng.com/) are two good examples. But they're less convenient when you have to optimize dozens, or even hundreds (maybe thousands?) of images. Plus, with a desktop app you don't have to download the images afterwards - they're already on your computer!

**EXE? Why only for Windows?**

You can still run the app in local development on macOS. But there's a great, free image optimizer available for macOS called [ImageOptim](https://imageoptim.com/mac). Try it!

**No download link?**

Currently don't have Windows Code Signing Certificate, so the Windows installer throws security warnings :( The easiest way to try it is to package the app as an .exe for yourself.
