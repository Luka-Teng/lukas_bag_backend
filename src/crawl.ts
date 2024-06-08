import axios from 'axios'
import { rmdirSync, existsSync } from 'fs-extra'
import config from './config'
import { downloadMedia, getQueryParams } from './tools'



// 请求短链获取重定向后的长链接
const getLongUrl = async (shortUrl: string): Promise<string> => {
  let url = ''
  try {
    const res = await axios.head(shortUrl, { maxRedirects: 10 })
    url = res.request.res.responseUrl
  } catch (error: any) {
    url = error.request.res.responseUrl
  }

  /**
   * 部分情况下小红书需要验证, 需要如下几步判断
   * 1. 判断url时候存在redirectPath参数
   * 2. 提取redirectPath参数值
   * 3. 解析的时候注意redirectPath不一定是唯一参数
   */
  const params = getQueryParams(url)
  if (params.redirectPath) {
    url = decodeURIComponent(params.redirectPath)
  }

  return url
}

// 请求长链接并获取HTML内容
const getHtmlContent = async (longUrl: string): Promise<string | null> => {
  try {
    const response = await axios.get(longUrl, {
      headers: {
        ...config.commonHeaders
      }
    })
    return response.data
  } catch (error) {
    console.error('Error getting HTML content:', error)
    return null
  }
}

// 解析HTML内容获取window.__INITIAL_STATE__
const getInitialState = (htmlContent: string): Record<string, any> | null => {
  const match = htmlContent.match(/window\.__INITIAL_STATE__\s*=\s*(.*?)\<\/script\>/)  
  if (match) {
    const stateString = match[1].replace(/undefined/g, '""')
    return JSON.parse(stateString)
  }
  return null
}

// 下载图片
const downloadImages = async (imageList: string[], path?: string): Promise<void> => {
  for (let i = 0; i < imageList.length; i++) {
    await downloadMedia(imageList[i], path)
  }
}

// 下载视频
const downloadVideo = async (videoUrl: string, path?: string): Promise<void> => {
  await downloadMedia(videoUrl, path)
}

// 主函数
const main = async () => {
  const shortUrl = 'http://xhslink.com/UOXTFL' // 修改为你想要的短链接
  const longUrl = await getLongUrl(shortUrl)
  console.log(`Long URL: ${longUrl}`)

  if (longUrl) {
    // 获取笔记id, 格式为/explore/{noteId}或/discovery/item/{noteId}, 使用正则进行匹配
    const noteId = longUrl.match(/\/(explore|discovery\/item)\/([\d\w]+)/)?.[2]

    const htmlContent = await getHtmlContent(longUrl)
    if (htmlContent && noteId) {
      const initialState = getInitialState(htmlContent)
      if (initialState && initialState.note.noteDetailMap[noteId]) {
        const imageList = initialState.note.noteDetailMap[noteId].note.imageList.map((image: any) => image.infoList.filter((item: any) => item.imageScene === 'WB_DFT').map((item: any) => item.url)).flat()
        const video = initialState.note.noteDetailMap[noteId].note?.video?.media?.stream.h264[0].masterUrl
        const path = `media/${noteId}`
        if (existsSync(path)) {
          rmdirSync(path, { recursive: true })
        }
        if (video) {
          await downloadVideo(video, path)
        } else {
          await downloadImages(imageList, path)
        }
        console.log('All images downloaded successfully.')
      } else {
        console.log('Failed to retrieve image list.')
      }
    } else {
      console.log('Invalid HTML content.')
    }
  } else {
    console.log('Failed to get the long URL.')
  }
}

main()