/* content相关controllers */
import express from 'express'
import { createError, createResponse } from '../utils/error'
import ContentService from '../service/contentService'

const router = express.Router()

const contentService = new ContentService()

router.get('/getNoteContent', async (req, res) => {
  const { text } = req.query

  if (!text) {
    throw createError('text is required')
  }

  // 返回json
  res.json(createResponse({
    content: await contentService.getNoteContent(text as string),
  }))
})

export default router