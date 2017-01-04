// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const fs = require('fs')
const path = require('path')
const imagemin = require('imagemin')
const imageminMozjpeg = require('imagemin-mozjpeg')
const imageminPngquant = require('imagemin-pngquant')

const $$fileList = document.querySelector('.file-list')

let options = {
  dest: '',
  quality: {
    jpeg: 95
  }
}

let isFirstDrop = true;

document.addEventListener('dragenter', handleDragEnter)
document.addEventListener('dragleave', handleDragLeave)
document.addEventListener('dragover', handleDragOver)
document.addEventListener('drop', handleDrop)

console.log('v0.0.8')

console.log(__dirname, path)


function optimizeImage(src, dest, row) {

  console.log('optimizing an image: ', src, dest, 'ROW',row)

  // if no destination specified, save to /optimized folder
  if (!dest) {
      dest = path.dirname(src) + path.sep + 'optimized'
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

    fs.stat(optimizedFile.path, function updateFileListItem(err, stats) {
      if (err) throw err
      row.querySelector('.js-status').innerHTML = '&#10004; Complete'
      row.querySelector('.js-optimized').innerHTML = displaySize(stats.size)
    })

    //row.querySelector('.js-optimized').innerHTML = "HI"

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

  const droppedFiles = e.dataTransfer.files

  console.log('drop', droppedFiles)

  document.body.classList.remove('is-drag-over');

  for (let i = 0; i < droppedFiles.length; i++) {
    let file = droppedFiles[i]
    let row = document.createElement('tr')

    console.log(file)

    row.innerHTML =
      `<tr class="file-item">
        <td title="${file.path}">
          <img class="file-preview" src="${file.path}">
          <!--${file.name}-->
        </td>
        <td class="js-status">&#9203; Working</td>
        <td>${displaySize(file.size)}</td>
        <td class="js-optimized">{Otimized}</td>
        <td class="js-savings">{Savings}</td>
      </tr>`

    $$fileList.insertBefore(row, null)

    // maybe return optimized file size here in a callback?
    // maybe this should be in a service worker?
    optimizeImage(droppedFiles[i].path, options.dest, row)

    // meh, this could be better
    if (isFirstDrop) {
      isFirstDrop = false;

      document.querySelector('header').classList.add('is-collapsed')
    }

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