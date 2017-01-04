// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const path = require('path')
const imagemin = require('imagemin')
const imageminMozjpeg = require('imagemin-mozjpeg')
const imageminPngquant = require('imagemin-pngquant')

//const $$dropTarget = document.querySelector('.drop-target')
const $$fileList = document.querySelector('.file-list')

let options = {
  dest: '',
  quality: {
    jpeg: 95
  }
}

document.addEventListener('dragenter', handleDragEnter)
document.addEventListener('dragleave', handleDragLeave)
document.addEventListener('dragover', handleDragOver)
document.addEventListener('drop', handleDrop)

console.log('v0.0.6')

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

function optimizeImage(src, dest, row) {

  console.log('optimizing an image: ', src, dest, 'ROW',row)

  // if no destination specified, save to /optimized folder
  if (!dest) {
      dest = path.dirname(src) + path.sep + 'optmized'
  }

  console.log('quality',options.quality.jpeg)

  imagemin([src], dest, {
    plugins: [
      imageminMozjpeg({
        quality: options.quality.jpeg
      })
      // ,
      // imageminPngquant({
      //   quality: '65-80'
      // })
    ]
  }).then(files => {
    console.log('Files compressed!', files);

    let optimizedFile = files[0]

    row.querySelector('.js-optimized').innerHTML = "HI"

    //=> [{data: <Buffer 89 50 4e …>, path: 'build/images/foo.jpg'}, …]
  });

}

function handleDragEnter(e) {
  e.preventDefault()
  e.stopPropagation()
  console.log('drag enter - add class')
  document.body.classList.add('is-drag-over')
  return false;
}

function handleDragLeave(e) {
  e.preventDefault()
  e.stopPropagation()
  document.body.classList.remove('is-drag-over')
  console.log('drag leave - remove class')
  return false;
}

function handleDragOver(e) {
  e.preventDefault()
  e.stopPropagation()
  console.log('drag over - add class')
  document.body.classList.add('is-drag-over')
  return false;
}

function handleDrop(e) {
  e.preventDefault()
  e.stopPropagation()

  console.log('drop', e.dataTransfer.files)

  const droppedFiles = e.dataTransfer.files

  document.body.classList.remove('is-drag-over');
  console.log('drag drop - add class')

  e.dataTransfer.dropEffect = 'copy';

  console.log('Number of files: ', droppedFiles.length)

  for (let i = 0; i < droppedFiles.length; i++) {

    console.log(droppedFiles[i])

    let file = droppedFiles[i]

    console.log($$fileList)

    let row = document.createElement('tr')

    row.innerHTML =
      `<tr>
        <td title="${file.path}">${file.name}</td>
        <td class="">Working</td>
        <td>${displaySize(file.size)}</td>
        <td class="js-optimized">{Otimized}</td>
        <td class="js-savings">{Savings}</td>
      </tr>`

    $$fileList.insertBefore(row, null)

    // $$fileList.prepend(`<tr>
    //   <td>${opts.file}</td>
    //   <td class="">${opts.status}</td>
    //   <td>${opts.original}</td>
    //   <td>${opts.original}</td>
    //   <td>${savings}</td>
    // </tr>`)

    optimizeImage(droppedFiles[i].path, options.dest, row)

  }

  return false;
}

function displaySize(bytes) {

  var kilobytes = bytes / 1024
  var megabytes = kilobytes / 1024
  var displaySize = ''

  if (megabytes > 1) {
    displaySize = megabytes.toFixed(2) + ' MB'
  } else {
    displaySize = kilobytes.toFixed(2) + ' KB'
  }

  return displaySize

}