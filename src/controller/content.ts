/* content相关controllers */
import express from 'express'
import { createError, createResponse } from '../utils'
import ContentService from '../service/contentService'

const router = express.Router()

const contentService = new ContentService()

router.get('/getNoteContent', (req, res) => {
  /* 获取参数noteId */
  const { noteId } = req.query

  /* 不存在noteId则报错 */
  if (!noteId) {
    throw createError('noteId is required', 400)
  }

  // 返回json
  res.json(createResponse({
    content: contentService.getNoteContent(noteId as string),
  }))
})

export default router