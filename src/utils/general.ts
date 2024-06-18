import * as fs from 'fs'
import * as path from 'path'
import axios from 'axios'
import { ensureDirSync } from 'fs-extra'

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

/**
 * 根据常见的contentType，返回对应的文件后缀
 * 支持常见的视频和图片格式
 */
export const getExtByContentType = (contentType: string): string => {
  switch (contentType) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/gif':
      return 'gif'
    case 'image/webp':
      return 'webp'
    case 'video/mp4':
      return 'mp4'
    case 'video/mpeg':
      return 'mpeg'
    case 'video/quicktime':
      return 'mov'
    case 'application/octet-stream':
      return 'mp4'
    default:
      return ''
  }
}

/**
 * 根据常见的contentType，返回是否是图片还是视频
 * 图片返回image，视频返回video
 * 支持常见的视频和图片格式
 */
export const getTypeByContentType = (contentType: string): string => {
  switch (contentType) {
    case 'image/jpeg':
    case 'image/png':
    case 'image/gif':
    case 'image/webp':
      return 'image'
    case 'video/mp4':
    case 'video/mpeg':
    case 'video/quicktime':
    case 'application/octet-stream':
      return 'video'
    default:
      return ''
  }
}

/* 媒体下载 */
export const downloadMedia = async (url: string, dest: string, format?: string): Promise<void> => {
  console.log('\n')
  console.log(`Downloading media: ${url}...`)

  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    })
  
    const contentType = response.headers['content-type']
    const directory = path.join(dest, getTypeByContentType(contentType))
    const fileName = `${Math.random().toString(36).slice(-8)}.${format || getExtByContentType(contentType)}`
    
    console.log(`Media type: ${contentType}`)
    console.log(`Media name: ${fileName}`)

    if (!fs.existsSync(directory)) {
      /* 创建文件夹 */
      ensureDirSync(directory)
    }
  
    const videoPath = path.join(directory, `${fileName}`)
    const writer = fs.createWriteStream(videoPath)
  
    response.data.pipe(writer)
  
    await new Promise<void>((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`Write success: ${fileName}`)
        resolve()
      })
      writer.on('error', (err) => {
        console.log(`Write failed: ${fileName}`)
        reject(err)
      })
    })
  } catch (err) {
    console.log(`Download failed: ${url}`)
    console.log(err)
  }
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