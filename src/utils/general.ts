import * as fs from 'fs'
import * as path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import axios from 'axios'
import { ensureDirSync } from 'fs-extra'
import tmp from 'tmp'

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

export const getPromise = <T = any>() => {
  let res: any
  let rej: any
  const promise = new Promise<T>((resolve, reject) => {
    res = resolve
    rej = reject
  })
  return { promise, res, rej }
}

/* 解析curl中的headers */
export const parseCurlHeaders = (curlCommand: string): { [key: string]: string } => {
  const headers: { [key: string]: string } = {}
  const headerPattern = /-H\s'([^:]+):\s*([^']+)'/g
  let match

  while ((match = headerPattern.exec(curlCommand)) !== null) {
    const key = match[1].trim()
    const value = match[2].trim()
    headers[key] = value
  }
  return headers
}

/* 获取远程视频大小 */
export const getRemoteVideoSize = (url: string)=> {
  return fetch(url, {
    "body": null,
    "method": "HEAD"
  }).then(async response => {
    return parseInt(response.headers.get('content-length') || '0', 10)
  })
}

/* 下载视频 */
export const downloadVideo = async (options: {
  /* 视频远程地址 */
  url: string,
  /* 视频存放目录 */
  dest: string,
  /* 视频格式 */
  format: string,
  /* 压缩参数 */
  compressOptions?: {
    resolution?: 1080 | 720 | 480,
  }
}) => {
  const resolutionMap = {
    1080: '1920:1080',
    720: '1280:720',
    480: '720:480',
  }
  const { url, dest, format, compressOptions } = options

  console.log('\n')
  console.log(`Downloading media: ${url}...`)

  const { promise, res, rej } = getPromise()

  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    })
  
    const fileName = `${Math.random().toString(36).slice(-8)}.${format}`
    
    console.log(`Media type: ${format}`)
    console.log(`Media name: ${fileName}`)

    ensureDirSync(dest)
  
    /* 视频存放地址 */
    const videoPath = path.join(dest, `${fileName}`)

    /* 视频下载时先存放在临时文件 */
    const tempFile = tmp.fileSync()
    const tempFilePath = tempFile.name
    const writer = fs.createWriteStream(tempFilePath)

    response.data.pipe(writer)
  
    writer.on('finish', () => {
      console.log(`Write success: ${fileName}`)
      
      if (compressOptions) {
        const { resolution = 720 } = compressOptions

        /* 需要压缩 */
        ffmpeg(tempFilePath)
          .outputOptions([
            `-vf scale=${resolutionMap[resolution] || '1280:720'}`,
            // '-crf 28',
            // '-preset slow'
          ])
          .on('end', () => {
            tempFile.removeCallback()
            console.log(`Compress success: ${fileName}`)
            res(fileName)
          })
          .on('error', (err) => {
            tempFile.removeCallback()
            console.error(`Compress fail: ${err.message}`)
            rej(err)
          })
          .save(videoPath)
      } else {
        /* 不要压缩 */
        /* 将tmp文件移动到videoPath下 */
        fs.renameSync(tempFilePath, videoPath)
      }
    })
    writer.on('error', (err) => {
      console.log(`Write failed: ${fileName}`)
      rej(err)
    })
  } catch (err) {
    console.log(`Download failed: ${url}`)
    rej(err)
  }

  return promise
}

/* 提取url中的参数 */
export const getQueryParams = (url: string): Record<string, string> => {
  const search = url.split('?')[1]
  if (!search) return {}
  const searchParams = new URLSearchParams(search)
  const params: Record<string, string> = {}
  for (const [key, value] of searchParams) {
    params[key] = value
  }
  return params
}

/* 从小红书分享文案中 */
export const extractShortLink = (text: string) => {
  // 正则表达式匹配 http://xhslink.com/... 的 URL
  const regex = /https?:\/\/xhslink\.com\/[\w\d]+/
  const match = text.match(regex)

  return match ? match[0] : null
}