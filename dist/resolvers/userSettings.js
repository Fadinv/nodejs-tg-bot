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
exports.UserSettingsResolver = void 0;
const type_graphql_1 = require("type-graphql");
const UserSettings_1 = require("../entities/UserSettings");
let UserSettingsResolver = class UserSettingsResolver {
    async updateSendImmediately({ em }, sendImmediately) {
        const userSettings = await em.findOne(UserSettings_1.UserSettings, { id: 1 });
        if (!userSettings)
            return;
        userSettings.sendImmediately = sendImmediately;
        await em.persistAndFlush(userSettings);
        return userSettings;
    }
    async userSettings({ em }) {
        const userSettings = await em.findOne(UserSettings_1.UserSettings, { id: 1 });
        return userSettings;
    }
};
__decorate([
    (0, type_graphql_1.Mutation)(() => UserSettings_1.UserSettings),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)('sendImmediately')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Boolean]),
    __metadata("design:returntype", Promise)
], UserSettingsResolver.prototype, "updateSendImmediately", null);
__decorate([
    (0, type_graphql_1.Query)(() => UserSettings_1.UserSettings),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserSettingsResolver.prototype, "userSettings", null);
UserSettingsResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], UserSettingsResolver);
exports.UserSettingsResolver = UserSettingsResolver;
//# sourceMappingURL=userSettings.js.map