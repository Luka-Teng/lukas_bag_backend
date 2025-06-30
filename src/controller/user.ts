import express from 'express'
import { createError, createResponse } from '../utils/response'
import { UserService } from '../service/userService'

const router = express.Router()

const gameService = new UserService()

router.post('/updateUserInfo', async (req, res) => {
    const { avatar, name, userId } = req.body

    if (!userId) {
        throw createError('userId is required')
    }

    const user = await gameService.updateUserInfo({ avatar, name, userId })

    res.json(createResponse(user))
})