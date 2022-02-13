import {Arg, Ctx, Mutation, Query, Resolver} from 'type-graphql';
import {UserSettings} from '../entities/UserSettings';
import {MyContext} from '../types';

@Resolver()
export class UserSettingsResolver {
	@Mutation(() => UserSettings)
	async updateSendImmediately(
		@Ctx() {em}: MyContext,
		@Arg('sendImmediately') sendImmediately: boolean,
	) {
		const userSettings = await em.findOne(UserSettings, {id: 1});
		if (!userSettings) return;

		userSettings.sendImmediately = sendImmediately;
		await em.persistAndFlush(userSettings);
		return userSettings;
	}

	@Query(() => UserSettings)
	async userSettings(
		@Ctx() {em}: MyContext,
	) {
		const userSettings = await em.findOne(UserSettings, {id: 1});
		return userSettings;
	}
}