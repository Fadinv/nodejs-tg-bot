import {Arg, Ctx, Mutation, Query, Resolver} from 'type-graphql'
import {SendChat} from '../entities/SendChat';
import {MyContext} from '../types'

@Resolver()
export class SendChatResolver {
	@Mutation(() => SendChat)
	async updateSendChat(
		@Ctx() {em}: MyContext,
		@Arg('tgChatId') tgChatId: string,
		@Arg('listen') listen: boolean,
	) {
		const sendChat = await em.findOne(SendChat, {tgChatId})
		if (!sendChat) return

		sendChat.listen = listen
		await em.persistAndFlush(sendChat)
		return sendChat
	}

	@Query(() => [SendChat])
	async getSendChats(
		@Ctx() {em}: MyContext,
	) {
		return em.find(SendChat, {})
	}

	@Mutation(() => Boolean)
	async deleteSendChat(
		@Ctx() {em}: MyContext,
		@Arg('tgChatId') tgChatId: string,
	) {
		const sendChat = await em.findOne(SendChat, {tgChatId})
		if (!sendChat) return false
		await em.removeAndFlush(sendChat)
		return true
	}

	@Mutation(() => SendChat, {nullable: true})
	async createSendChat(
		@Ctx() {em}: MyContext,
		@Arg('tgChatId') tgChatId: string,
	) {
		const sendChat = em.create(SendChat, {tgChatId, listen: true})
		await em.persistAndFlush(sendChat)
		return sendChat
	}
}