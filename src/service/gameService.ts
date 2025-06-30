import { PrismaClient } from '@prisma/client'
import { createError } from '../utils/response'

export class GameService {
  private prisma = new PrismaClient()

  // 判断当前user是已经加入游戏
  async isJoined(params: { userId?: string; gameId?: string; playerId?: string }) {
    const where: any = {};
    
    if (params.playerId) {
      where.id = params.playerId;
    } else if (params.userId) {
      where.userId = params.userId;
      if (params.gameId) {
        where.gameId = params.gameId;
      }
    }

    const existing = await this.prisma.gamePlayer.findFirst({ where });
    return !!existing;
  }

  // 获取游戏内所有玩家的balance
  async getGameBalance(gameId: string) {
    // 判断游戏是否已经结束
    const game = await this.prisma.game.findUnique({ where: { id: gameId } })
    if (!game) {
      return null
    }

    const records = await this.prisma.gameRecord.findMany({ where: { gameId } })
    const players = await this.prisma.gamePlayer.findMany({
      where: { gameId },
      include: { user: true }
    })

    // 初始化每个玩家的余额为0
    const playerBalances = players.map(player => ({
      id: player.id,
      user: player.user,
      balance: 0
    }))

    // 计算每个玩家的余额
    records.forEach(record => {
      const fromPlayer = playerBalances.find(p => p.id === record.fromId)
      const toPlayer = playerBalances.find(p => p.id === record.toId)
      if (fromPlayer) fromPlayer.balance -= record.amount
      if (toPlayer) toPlayer.balance += record.amount
    })

    return {
      gameId,
      players: playerBalances
    }
  }

  // 创建游戏
  async createGame(title: string) {
    return this.prisma.game.create({
      data: { title },
      include: { players: true }
    })
  }

  // 加入用户
  async addPlayer(gameId: string, userId: string) {
    if (await this.isJoined({
      userId
    })) {
      throw createError('User already joined the game')
    }

    return this.prisma.gamePlayer.create({
      data: { gameId, userId }
    })
  }

  // 添加记录
  async addRecord(gameId: string, fromId: string, toId: string, amount: number) {
    if (!(await this.isJoined({
      playerId: fromId,
      gameId
    })) || !(await this.isJoined({
      playerId: toId,
      gameId
    }))) {
      throw createError('Play not joined the game')
    }

    return this.prisma.gameRecord.create({
      data: { gameId, fromId, toId, amount }
    })
  }

  // 结束游戏
  async endGame(gameId: string) {
    const balance = await this.getGameBalance(gameId)
    if (!balance) return null
    
    // 计算分摊分摊方式
    // 比如A: 50 B: -25 C: -25
    // fromId: B toId: A amount: 25
    // fromId: C toId: A amount: 25
    const records: { fromId: string; toId: string; amount: number }[] = []
    // 获取所有余额为正数的玩家
    const positiveBalances = balance.players.filter(p => p.balance > 0)
    // 获取所有余额为负数的玩家
    const negativeBalances = balance.players.filter(p => p.balance < 0)

    // 遍历所有余额为正数的玩家
    for (const creditor of positiveBalances) {
      let remainingCredit = creditor.balance
      // 遍历所有余额为负数的玩家
      for (const debtor of negativeBalances) {
        if (remainingCredit <= 0 || debtor.balance >= 0) continue
        
        // 计算当前债务人需要支付的金额
        const amount = Math.min(remainingCredit, -debtor.balance)
        if (amount > 0) {
          records.push({
            fromId: debtor.id,
            toId: creditor.id,
            amount
          })
          // 更新剩余金额
          remainingCredit -= amount
          debtor.balance += amount
        }
      }
    }

    const deleteRecord = this.prisma.gameRecord.deleteMany({ where: { gameId } })
    const deletePlayer = this.prisma.gamePlayer.deleteMany({ where: { gameId } })
    const deleteGame =  this.prisma.game.delete({ where: { id: gameId } })

    await this.prisma.$transaction([deleteRecord, deletePlayer, deleteGame])

    return records
  }

  // 玩家退出游戏
  async quitGame(playerId: string) {
    const player = await this.prisma.gamePlayer.findUnique({
      where: { id: playerId },
      select: { gameId: true }
    })

    if (!player) return null

    // 删除player相关的GamePlayer
    const deletePlayer = this.prisma.gamePlayer.delete({ where: { id: playerId } })

    // 删除player相关的GameRecord
    const deleteRecord = this.prisma.gameRecord.deleteMany({
      where: { OR: [{ fromId: playerId }, { toId: playerId }] }
    })

    await this.prisma.$transaction([deletePlayer, deleteRecord])
  }

  // 获取游戏状态
  async getGameState(gameId: string) {
    const balance = await this.getGameBalance(gameId)
    return balance
  }
}