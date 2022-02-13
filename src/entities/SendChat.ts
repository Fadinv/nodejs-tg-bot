import 'reflect-metadata'
import {Entity, PrimaryKey, Property} from '@mikro-orm/core'
import {Field, ObjectType} from 'type-graphql'

@ObjectType()
@Entity()
export class SendChat {
	@Field()
	@PrimaryKey()
	id!: number

	@Field()
	@Property({type: 'string'})
	tgChatId: string

	@Field(() => Boolean)
	@Property({type: 'boolean'})
	listen!: boolean
}