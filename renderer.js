// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const path = require('path')
const imagemin = require('imagemin')
const imageminMozjpeg = require('imagemin-mozjpeg')
const imageminPngquant = require('imagemin-pngquant')

const $$dropTarget = document.querySelector('.drop-target')

let options = {
  quality: {
    jpeg: 95
  }
}

$$dropTarget.addEventListener('dragenter', handleDragEnter)
$$dropTarget.addEventListener('dragleave', handleDragEnter)
$$dropTarget.addEventListener('dragover', handleDragOver)
$$dropTarget.addEventListener('drop', handleDrop)

console.log('v0.0.5')

x = document.querySelector('.file-selector')

console.log(__dirname, path)

x.addEventListener('change', (e) => {

  let xPath = x.files[0].path;

  console.log(e, x.files[0].path, path.dirname(xPath), path.dirname(xPath) + '\\..\\imgs-optimzed')

  imagemin([xPath], path.dirname(xPath) + '\\..\\imgs-optimzed', {
    plugins: [
      imageminMozjpeg({
        //quality: options.quality.jpeg
      }),
      imageminPngquant({
        quality: '65-80'
      })
    ]
  }).then(files => {
    console.log('Files compressed!', files);
    //=> [{data: <Buffer 89 50 4e …>, path: 'build/images/foo.jpg'}, …]
  });

})

function optimizeImage(src, dest) {

  console.log('optimizing an image: ', src, dest)

  imagemin([src], path.dirname(src) + path.sep + 'optimized', {
    plugins: [
      imageminMozjpeg({
        quality: options.quality.jpeg
      }),
      imageminPngquant({
        quality: '65-80'
      })
    ]
  }).then(files => {
    console.log('Files compressed!', files);
    //=> [{data: <Buffer 89 50 4e …>, path: 'build/images/foo.jpg'}, …]
  });

}

function handleDragEnter(e) {
  e.preventDefault()
  e.stopPropagation()
  console.log('drag enter')
    // this.classList.add('is-drag-entered');
  return false;
}

function handleDragLeave(e) {
  e.preventDefault()
  e.stopPropagation()
  console.log('drag leave')
    // this.classList.remove('is-drag-entered');
  return false;
}

function handleDragOver(e) {
  e.preventDefault()
  e.stopPropagation()
  console.log('drag over')
  return false;
}

function handleDrop(e) {
  e.preventDefault()
  e.stopPropagation()

  console.log('drop', e.dataTransfer.files)

  const droppedFiles = e.dataTransfer.files

  this.classList.remove('is-drag-entered');
  e.dataTransfer.dropEffect = 'copy';

  console.log('Number of files: ', droppedFiles.length)

  for (let i = 0; i < droppedFiles.length; i++) {
    console.log(droppedFiles[i])


    optimizeImage(droppedFiles[i].path, 'nothing')

  }

  return false;
}
