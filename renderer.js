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
    jpeg: 80
  }
}
let isFirstDrop = true
let fileQueue = []
let activeOptimizations = 0
let fileId = 0

setInterval(function() {

  console.log(
    'Queue: '+fileQueue.length,
    'Active: '+activeOptimizations
  )

  if (fileQueue.length !== 0 && activeOptimizations < 10) {
    optimizeImage(fileQueue.shift())
  }

}, 300)

// const { requireTaskPool } = require('electron-remote');
// const work = requireTaskPool(require.resolve('./work'));

document.addEventListener('dragenter', handleDragEnter)
document.addEventListener('dragleave', handleDragLeave)
document.addEventListener('dragover', handleDragOver)
document.addEventListener('drop', handleDrop)

function optimizeImage(img, dest) {

  let row = document.getElementById(img.id)

  row.querySelector('.js-status').innerHTML = 'Working'

  activeOptimizations ++

  // if no destination specified, overwrite same file
  if (!dest) {
      dest = path.dirname(img.path)// + path.sep + 'optimized'
  }

  imagemin([img.path], dest, {
    plugins: [
      imageminMozjpeg({
        quality: img.size > 150000 ? options.quality.jpeg : 95
      })
      // ,
      // imageminPngquant({
      //   quality: '65-80'
      // })
    ]
  }).then(files => {
    let optimizedFile = files[0]

    fs.stat(optimizedFile.path, function updateFileListItem(err, stats) {
      if (err) throw err
      row.querySelector('.js-status').innerHTML = '&#10004; Complete'
      row.querySelector('.js-optimized').innerHTML = displaySize(stats.size)
      row.querySelector('.js-savings').innerHTML = ( (img.size - stats.size) / img.size * 100 ).toFixed(1) + '%'

      activeOptimizations --
    })

  });

}

function handleDragEnter(e) {
  e.preventDefault()
  e.stopPropagation()
  document.body.classList.add('is-drag-over')
  return false;
}

function handleDragLeave(e) {
  e.preventDefault()
  e.stopPropagation()
  document.body.classList.remove('is-drag-over')
  return false;
}

function handleDragOver(e) {
  e.preventDefault()
  e.stopPropagation()
  document.body.classList.add('is-drag-over')
  return false;
}

function handleDrop(e) {
  e.preventDefault()
  e.stopPropagation()

  const droppedFiles = e.dataTransfer.files

  document.body.classList.remove('is-drag-over');

  for (let i = 0; i < droppedFiles.length; i++) {
    let file = droppedFiles[i]
    let row = document.createElement('tr')

    console.log(file)

    fileId ++
    file.id = 'f-' + fileId

    row.id = file.id
    row.className = 'file-item'
    row.innerHTML =
     `<td title="${file.path}">
        <img class="file-preview" src="${file.path}">
      </td>
      <td class="js-status">&#9203; Pending</td>
      <td>${displaySize(file.size)}</td>
      <td class="js-optimized"></td>
      <td class="js-savings"></td>`


    $$fileList.insertBefore(row, null)

    // maybe return optimized file size here in a callback?
    // maybe this should be in a service worker?

    fileQueue.push(file)

    //optimizeImage(file, options.dest, row)

    // console.log('start work');
    // // `work` will get executed concurrently in separate processes
    // work(file, options).then(result => {
    //   console.log('work done');
    //   console.log(result);
    // });

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