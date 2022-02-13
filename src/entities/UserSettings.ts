import 'reflect-metadata'
import {Entity, PrimaryKey, Property} from '@mikro-orm/core'
import {Field, ObjectType} from 'type-graphql'

@ObjectType()
@Entity()
export class UserSettings {
	@Field()
	@PrimaryKey()
	id!: number

	@Field(() => Boolean)
	@Property({type: 'boolean'})
	sendImmediately!: boolean
}