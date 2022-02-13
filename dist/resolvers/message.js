"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Message_1 = require("../entities/Message");
let MessageResolver = class MessageResolver {
    constructor() {
        this.TG_CHAT_ID = process.env.SEND_CHAT_ID ? +process.env.SEND_CHAT_ID : 0;
    }
    async updateMessage({ em, bot }, id, ruText, engText) {
        const message = await em.findOne(Message_1.Message, { id });
        if (!message)
            return;
        message.ruText = ruText;
        message.engText = engText;
        if (message.isSent) {
            if (message.photoId) {
                await bot.editMessageCaption(engText, {
                    chat_id: this.TG_CHAT_ID,
                    message_id: message.tgMessageId,
                });
            }
            else {
                await bot.editMessageText(engText, {
                    chat_id: this.TG_CHAT_ID,
                    message_id: message.tgMessageId,
                });
            }
        }
        await em.persistAndFlush(message);
        return message;
    }
    async getMessages({ em }) {
        return em.find(Message_1.Message, {});
    }
    async sendMessage({ em }, id, canBeSend) {
        const message = await em.findOne(Message_1.Message, { id });
        if (!message)
            return;
        message.canBeSend = canBeSend;
        await em.persistAndFlush(message);
        return message;
    }
    async deleteMessage({ em, bot }, id) {
        const message = await em.findOne(Message_1.Message, { id });
        if (!message)
            return false;
        if (message.isSent) {
            try {
                await bot.deleteMessage(this.TG_CHAT_ID, String(message.tgMessageId));
            }
            catch (e) {
                console.error(e);
            }
        }
        await em.removeAndFlush(message);
        return true;
    }
    async createMessage({ em }, ruText, engText) {
        const message = em.create(Message_1.Message, { ruText, engText, isSent: false });
        await em.persistAndFlush(message);
        return message;
    }
};
__decorate([
    (0, type_graphql_1.Mutation)(() => Message_1.Message),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)('id')),
    __param(2, (0, type_graphql_1.Arg)('ruText')),
    __param(3, (0, type_graphql_1.Arg)('engText')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String, String]),
    __metadata("design:returntype", Promise)
], MessageResolver.prototype, "updateMessage", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Message_1.Message]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MessageResolver.prototype, "getMessages", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Message_1.Message),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)('id')),
    __param(2, (0, type_graphql_1.Arg)('canBeSend')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Boolean]),
    __metadata("design:returntype", Promise)
], MessageResolver.prototype, "sendMessage", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], MessageResolver.prototype, "deleteMessage", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Message_1.Message, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)('ruText')),
    __param(2, (0, type_graphql_1.Arg)('engText')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MessageResolver.prototype, "createMessage", null);
MessageResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], MessageResolver);
exports.MessageResolver = MessageResolver;
//# sourceMappingURL=message.js.map