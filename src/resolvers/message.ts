import {Arg, Ctx, Mutation, Query, Resolver} from 'type-graphql'
import {MyContext} from '../types'
import {Message} from '../entities/Message'

@Resolver()
export class MessageResolver {
	private readonly TG_CHAT_ID = process.env.SEND_CHAT_ID ? +process.env.SEND_CHAT_ID : 0

	@Mutation(() => Message)
	async updateMessage(
		@Ctx() {em, bot}: MyContext,
		@Arg('id') id: number,
		@Arg('ruText') ruText: string,
		@Arg('engText') engText: string,
	) {
		const message = await em.findOne(Message, {id})
		if (!message) return

		message.ruText = ruText
		message.engText = engText
		if (message.isSent) {
			if (message.photoId) {
				await bot.editMessageCaption(ruText, {
					chat_id: this.TG_CHAT_ID,
					message_id: message.tgMessageId,
				});
			} else {
				await bot.editMessageText(ruText, {
					chat_id: this.TG_CHAT_ID,
					message_id: message.tgMessageId,
				});
			}
		}
		await em.persistAndFlush(message)
		return message
	}

	@Query(() => [Message])
	async getMessages(
		@Ctx() {em}: MyContext,
	) {
		return em.find(Message, {})
	}

	@Mutation(() => Message)
	async sendMessage(
		@Ctx() {em}: MyContext,
		@Arg('id') id: number,
		@Arg('canBeSend') canBeSend: boolean,
	) {
		const message = await em.findOne(Message, {id})
		if (!message) return

		message.canBeSend = canBeSend
		await em.persistAndFlush(message)
		return message
	}

	@Mutation(() => Boolean)
	async deleteMessage(
		@Ctx() {em, bot}: MyContext,
		@Arg('id') id: number,
	) {
		const message = await em.findOne(Message, {id})

		if (!message) return false
		if (message.isSent) {
			try {
				await bot.deleteMessage(this.TG_CHAT_ID, String(message.tgMessageId));
			} catch (e) {
				console.error(e)
			}
		}
		await em.removeAndFlush(message)
		return true
	}

	@Mutation(() => Message, {nullable: true})
	async createMessage(
		@Ctx() {em}: MyContext,
		@Arg('ruText') ruText: string,
		@Arg('engText') engText: string,
	) {
		const message = em.create(Message, {ruText, engText, isSent: false})
		await em.persistAndFlush(message)
		return message
	}
}