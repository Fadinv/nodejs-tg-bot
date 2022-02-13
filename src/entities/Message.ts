import 'reflect-metadata'
import {Entity, PrimaryKey, Property} from '@mikro-orm/core'
import {Field, ObjectType} from 'type-graphql'

@ObjectType()
@Entity()
export class Message {
    @Field()
    @PrimaryKey()
    id!: number

    @Field(() => Number, {nullable: true})
    @Property({type: 'number', nullable: true})
    tgMessageId!: number

    @Field(() => String, {nullable: true})
    @Property({type: 'string', nullable: true})
    photoId?: string

    @Field(() => String)
    @Property({type: 'date'})
    createdAt = new Date()

    @Field(() => String)
    @Property({type: 'date', onUpdate: () => new Date()})
    updatedAt = new Date()

    @Field(() => String, {nullable: true})
    @Property({type: 'text'})
    ruText?: string

    @Field(() => String, {nullable: true})
    @Property({type: 'text'})
    engText!: string

    @Field(() => Boolean, {nullable: true})
    @Property({type: 'boolean', nullable: true})
    canBeSend?: boolean

    @Field(() => Boolean, {nullable: true})
    @Property({type: 'boolean', nullable: true})
    isSent?: boolean
}