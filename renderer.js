const fs = require('fs')
const path = require('path')
const imagemin = require('imagemin')
const imageminMozjpeg = require('imagemin-mozjpeg')
const imageminPngquant = require('imagemin-pngquant')


// dom elements

const $fileList = document.querySelector('.file-list')
const $queue = document.querySelector('.js-queue')
const $totalImagesOptimized = document.querySelector('.js-total-images-optimized')
const $totalSavings = document.querySelector('.js-total-savings')
const $openSettingsButton = document.querySelector('.open-settings-button')
const $settings = document.querySelector('.settings')
const $settingsCloseButton = document.querySelector('.settings-close-button')
const $settingsInputDestination = document.querySelector('.settings-input-destination')
const $settingsInputQuality = document.querySelector('.settings-input-quality')
const $settingsLabelQuality = document.querySelector('.settings-label-quality')
const $settingsInputConcurrentOptimizations = document.querySelector('.settings-input-concurrent-optimizations')
const $settingsLabelConcurrentOptimizations = document.querySelector('.settings-label-concurrent-optimizations')


let options = {
  dest: '',
  maxConcurrentOptimizations: 20,
  quality: 75
}
let fileQueue = []
let activeOptimizations = 0
let totalImagesOptimized = 0
let totalSavings = 0

// add handlers to dom elements

document.addEventListener('dragenter', handleDragEnter)
document.addEventListener('dragleave', handleDragLeave)
document.addEventListener('dragover', handleDragOver)
document.addEventListener('drop', handleDrop)
document.addEventListener('drop', showFileList)
$settingsCloseButton.addEventListener('click', closeSettings)
$openSettingsButton.addEventListener('click', openSettings)
$settingsCloseButton.addEventListener('click', closeSettings)
$openSettingsButton.addEventListener('click', openSettings)
$settingsInputDestination.addEventListener('change', handleDestinationChange)
$settingsInputQuality.addEventListener('change', handleQualityChange)
$settingsInputConcurrentOptimizations.addEventListener('change', handleConcurrentOptimizationsChange)


// optimize images in the queue on a set interval
setInterval(function() {

  // if queue is not empty
  // and max concurrent optimizations have not been reached
  // optimize the next image in the queue
  if (fileQueue.length !== 0 && activeOptimizations < options.maxConcurrentOptimizations) {
    optimizeImage(fileQueue.shift(), options.dest)

    // update footer notes
    $queue.textContent = fileQueue.length
    $totalImagesOptimized.textContent = totalImagesOptimized
    $totalSavings.textContent = displaySize(totalSavings)
  }

}, 300)



function optimizeImage(img, dest) {

  let row = document.getElementById(img.id)
  let originalSize = img.size

  row.querySelector('.js-status').innerHTML = '&#128119; Working'

  activeOptimizations ++

  // if no destination specified, overwrite same file
  if (!dest) {
      dest = path.dirname(img.path)
  }

  imagemin([img.path], dest, {
    plugins: [
      imageminMozjpeg({
        quality: img.size > 150000 ? options.quality : 95
      })
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

  })

}


// handlers for drag and drop events

function handleDragEnter(e) {
  e.preventDefault()
  e.stopPropagation()
  document.body.classList.add('is-drag-over')
  return false
}

function handleDragLeave(e) {
  e.preventDefault()
  e.stopPropagation()
  document.body.classList.remove('is-drag-over')
  return false
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

  document.body.classList.remove('is-drag-over')

  for (let i = 0; i < droppedFiles.length; i++) {

    let file = droppedFiles[i]

    // check if file dropped is jpg
    if (path.extname(file.name).toLowerCase() === '.jpg') {

      file.id = generateId()

      insertRow(file.id, file.path, file.name, displaySize(file.size), $fileList)

      fileQueue.push(file)

    }

    else if(file.type === '') {

      findImagesInDir(file.path)

    }
  }

  return false
}

function showFileList() {
  $fileList.classList.remove('is-transparent')
  document.removeEventListener('drop', showFileList)
}

function findImagesInDir(dirPath) {

  // find all files in directory
  fs.readdir(dirPath, (err, files) => {
    if (err) throw err

    // for each file
    files.forEach(file => {

      // check if file is file or another directory
      fs.stat(path.join(dirPath, file), (err, stats) => {
        if (err) throw err

        // if it's a jpeg file, add it to the file queue to optimize
        if (stats.isFile()) {

          if (path.extname(file).toLowerCase() === '.jpg') {

            // create an img object with all the data needed for optimizing
            let img = {
              id: generateId(),
              path: path.join(dirPath, file),
              size: stats.size
            }

            // insert a row in the file list
            insertRow(img.id, img.path, file, displaySize(img.size), $fileList)

            // add the image to the queue for optimizing
            fileQueue.push(img)
          }
        }
        // if it's a directory, recursively find files in it
        else if (stats.isDirectory()) {

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

// handlers for settings menu actions

function openSettings() {
  $settings.showModal()
  $settings.classList.add('is-open')
}

function closeSettings() {
  $settings.close()
  $settings.classList.remove('is-open')
}

function handleDestinationChange(e) {
  if (e.target.files[0]) {
    options.dest = e.target.files[0].path
  }
  else {
    options.dest = ''
  }
}

function handleQualityChange(e) {
  let value = e.target.value
  $settingsLabelQuality.textContent = value
  options.quality = value
}

function handleConcurrentOptimizationsChange(e) {
  let value = e.target.value
  $settingsLabelConcurrentOptimizations.textContent = e.target.value
  options.maxConcurrentOptimizations = value
}


// utils

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
  return 'f-'+ Math.random().toString().substring(2, 9)
}