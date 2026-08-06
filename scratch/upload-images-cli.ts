import { getCliClient } from 'sanity/cli'
import fs from 'fs'
import https from 'https'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const client = getCliClient()

async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, filename)
    const file = fs.createWriteStream(filePath)
    https.get(url, (response) => {
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve(filePath)
      })
    }).on('error', (err) => {
      fs.unlink(filePath, () => {})
      reject(err)
    })
  })
}

async function uploadAndPatch() {
  try {
    console.log('Downloading images...')
    const headerImgPath = await downloadImage('https://i.ibb.co/F4sYK2wW/vb.jpg', 'header.jpg')
    const midImgPath = await downloadImage('https://i.ibb.co/0y5txKy5/cameroon.jpg', 'mid.jpg')

    console.log('Uploading images to Sanity...')
    const headerAsset = await client.assets.upload('image', fs.createReadStream(headerImgPath), { filename: 'vb.jpg' })
    const midAsset = await client.assets.upload('image', fs.createReadStream(midImgPath), { filename: 'cameroon.jpg' })

    console.log('Header Asset ID:', headerAsset._id)
    console.log('Mid Asset ID:', midAsset._id)

    // The draft ID from earlier
    const docId = 'drafts.70ab289f-5f2c-4206-8519-453f4dc70192'

    console.log('Patching document...')
    
    // Create an image block to insert into the body
    const midImageBlock = {
      _type: 'image',
      _key: 'image_mid_article',
      asset: {
        _type: 'reference',
        _ref: midAsset._id
      }
    }

    // We will append the midImageBlock after the stakes section
    const res = await client
      .patch(docId)
      .set({
        mainImage: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: headerAsset._id
          }
        }
      })
      .insert('after', 'body[_key=="stakes2"]', [midImageBlock])
      .commit()

    console.log('Success!', res._id)
    
    // Clean up
    fs.unlinkSync(headerImgPath)
    fs.unlinkSync(midImgPath)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

uploadAndPatch()
