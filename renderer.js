const fs = require('fs')
const path = require('path')

const imagemin = require('imagemin')
const imageminMozjpeg = require('imagemin-mozjpeg')
const imageminPngquant = require('imagemin-pngquant')

const $fileList = document.querySelector('.file-list')
const $queue = document.querySelector('.js-queue')
const $totalImagesOptimized = document.querySelector('.js-total-images-optimized')
const $totalSavings = document.querySelector('.js-total-savings')

let options = {
  dest: '',
  maxActiveOptimizations: 10,
  quality: {
    jpeg: 80
  }
}
let fileQueue = []
let activeOptimizations = 0
let totalImagesOptimized = 0
let totalSavings = 0

document.addEventListener('dragenter', handleDragEnter)
document.addEventListener('dragleave', handleDragLeave)
document.addEventListener('dragover', handleDragOver)
document.addEventListener('drop', handleDrop)

// optimize images in the queue on a set interval
setInterval(function() {

  // if queue is not empty
  // and max concurrent optimizations have not been reached
  // optimize the next image in the queue
  if (fileQueue.length !== 0 && activeOptimizations < options.maxActiveOptimizations) {
    optimizeImage(fileQueue.shift())
  }

  // update footer notes
  $queue.textContent = fileQueue.length
  $totalImagesOptimized.textContent = totalImagesOptimized
  $totalSavings.textContent = displaySize(totalSavings)

}, 300)

function optimizeImage(img, dest) {

  let row = document.getElementById(img.id)
  let originalSize = img.size

  row.querySelector('.js-status').innerHTML = '&#128119; Working'

  activeOptimizations ++

  // if no destination specified, overwrite same file
  if (!dest) {
      dest = path.dirname(img.path) // + path.sep + 'optimized'
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

      let savings = originalSize - stats.size

      row.querySelector('.js-status').innerHTML = '&#10004; Optimized'
      row.querySelector('.js-optimized').innerHTML = displaySize(stats.size)
      row.querySelector('.js-savings').innerHTML = ( savings / originalSize * 100 ).toFixed(1) + '%'

      totalSavings += savings
      totalImagesOptimized ++
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
  return false
}

function handleDrop(e) {
  e.preventDefault()
  e.stopPropagation()

  const droppedFiles = e.dataTransfer.files

  console.log(droppedFiles)

  document.body.classList.remove('is-drag-over');

  for (let i = 0; i < droppedFiles.length; i++) {

    let file = droppedFiles[i]

    // check if file dropped is jpg
    if (path.extname(file.name).toLowerCase() === '.jpg') {

      file.id = generateId()

      insertRow(file.id, file.path, file.name, displaySize(file.size), $fileList)

      fileQueue.push(file)

    }

    else if(file.type === '') {

      console.log('finding images in dir')
      findImagesInDir(file.path)

    }
  }

  return false;
}

function findImagesInDir(dirPath) {

  // find all files in directory
  fs.readdir(dirPath, (err, files) => {
    if (err) throw err

    // for each file
    files.forEach(file => {

      // check if file is really file or directory
      fs.stat(path.join(dirPath, file), (err, stats) => {
        if (err) throw err

        // if it's a jpeg, add it to the file queue to optimize
        if (stats.isFile()) {

          console.log('found a file', file)

          if (path.extname(file).toLowerCase() === '.jpg') {

            // create an img object with all the data needed for optimizing
            let img = {
              id: generateId(),
              path: path.join(dirPath, file),
              size: stats.size
            }

            insertRow(img.id, img.path, file, displaySize(img.size), $fileList)

            fileQueue.push(img)
          }
        }
        // if it's a directory, recursively the files in it
        else if (stats.isDirectory()) {

          console.log('found a dir', file)

          findImagesInDir(path.join(dirPath, file))

        }
      })

    })
  })
}

function insertRow(fileId, filePath, fileName, fileSize, fileList) {

  let row = document.createElement('tr')

  row.id = fileId
  row.className = 'file-item'
  row.innerHTML =
   `<td title="${filePath}">
      ${fileName}
    </td>
    <td class="js-status">&#9203; Pending</td>
    <td>${fileSize}</td>
    <td class="js-optimized"></td>
    <td class="js-savings"></td>`

  $fileList.insertBefore(row, null)
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

function generateId() {
  return 'f-'+ Math.random().toString().substring(2, 9);
}