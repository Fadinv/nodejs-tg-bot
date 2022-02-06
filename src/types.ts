import TelegramApi from 'node-telegram-bot-api'
import {Connection, EntityManager, IDatabaseDriver} from '@mikro-orm/core'

export type MyContext = {
    em: EntityManager<IDatabaseDriver<Connection>>
    bot: TelegramApi
}