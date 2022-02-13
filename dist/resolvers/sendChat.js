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
exports.SendChatResolver = void 0;
const type_graphql_1 = require("type-graphql");
const SendChat_1 = require("../entities/SendChat");
let SendChatResolver = class SendChatResolver {
    async updateSendChat({ em }, tgChatId, listen) {
        const sendChat = await em.findOne(SendChat_1.SendChat, { tgChatId });
        if (!sendChat)
            return;
        sendChat.listen = listen;
        await em.persistAndFlush(sendChat);
        return sendChat;
    }
    async getSendChats({ em }) {
        return em.find(SendChat_1.SendChat, {});
    }
    async deleteSendChat({ em }, tgChatId) {
        const sendChat = await em.findOne(SendChat_1.SendChat, { tgChatId });
        if (!sendChat)
            return false;
        await em.removeAndFlush(sendChat);
        return true;
    }
    async createSendChat({ em }, tgChatId) {
        const sendChat = em.create(SendChat_1.SendChat, { tgChatId, listen: true });
        await em.persistAndFlush(sendChat);
        return sendChat;
    }
};
__decorate([
    (0, type_graphql_1.Mutation)(() => SendChat_1.SendChat),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)('tgChatId')),
    __param(2, (0, type_graphql_1.Arg)('listen')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Boolean]),
    __metadata("design:returntype", Promise)
], SendChatResolver.prototype, "updateSendChat", null);
__decorate([
    (0, type_graphql_1.Query)(() => [SendChat_1.SendChat]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SendChatResolver.prototype, "getSendChats", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)('tgChatId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SendChatResolver.prototype, "deleteSendChat", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => SendChat_1.SendChat, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)('tgChatId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SendChatResolver.prototype, "createSendChat", null);
SendChatResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], SendChatResolver);
exports.SendChatResolver = SendChatResolver;
//# sourceMappingURL=sendChat.js.map