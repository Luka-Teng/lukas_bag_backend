import express from 'express'
import { createError, createResponse } from '../utils/response'
import { GameService } from '../service/gameService'

const router = express.Router()

const gameService = new GameService()

router.post('/createGame', async (req, res) => {
  const { title } = req.body

  if (!title) {
    throw createError('title is required')
  }

  const data = await gameService.createGame(title as string)

  // 返回json
  res.json(createResponse(data))
})

router.post('/addPlayer', async (req, res) => {
  const { gameId } = req.body
  const userId = req.user?.id
  
  if (!gameId) {
    throw createError('gameId, userId is required')
  }
  
  const data = await gameService.addPlayer(gameId as string, userId as string)

  // 返回json
  res.json(createResponse(data))
})

router.post('/addRecord', async (req, res) => {
  const { gameId, fromId, toId, amount } = req.body
  if (!gameId || !fromId || !toId || !amount) {
    throw createError('gameId, fromId, toId, amount is required')
  }
  const data = await gameService.addRecord(gameId as string, fromId as string, toId as string, amount as number)
  
  // 返回json
  res.json(createResponse(data))
})

router.post('/endGame', async (req, res) => {
  const { gameId } = req.body
  if (!gameId) {
    throw createError('gameId is required')
  }
  const data = await gameService.endGame(gameId as string)

  // 返回json
  res.json(createResponse(data))
})

router.post('/quitGame', async (req, res) => {
  const { playerId } = req.body
  if (!playerId) {
    throw createError('playerId is required')
  }
  const data = await gameService.quitGame(playerId as string)
  // 返回json
  res.json(createResponse(data))
})

router.get('/getGameState', async (req, res) => {
  const { gameId } = req.query
  if (!gameId) {
    throw createError('gameId is required')
  }
  const data = await gameService.getGameState(gameId as string)
  // 返回json
  res.json(createResponse(data))
})

export default router