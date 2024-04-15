"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var cheerio_1 = require("cheerio");
var naver_home_url = 'https://series.naver.com';
var naver_webnovel_top100_url = 'https://series.naver.com/novel/top100List.series?rankingTypeCode=DAILY&categoryCode=ALL';
var getLinks = function (url_1, n_1) {
    var args_1 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args_1[_i - 2] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([url_1, n_1], args_1, true), void 0, function (url, n, currentNum) {
        var webContents, i, crawledNum, finished, data, $, items, _a, items_1, el, href, err_1;
        if (currentNum === void 0) { currentNum = 0; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    webContents = [];
                    i = 1;
                    crawledNum = 0;
                    finished = false;
                    _b.label = 1;
                case 1:
                    if (!(webContents.length < n && !finished)) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, axios_1.default)("".concat(url, "&page=").concat(i++))];
                case 2:
                    data = (_b.sent()).data;
                    $ = (0, cheerio_1.load)(data);
                    items = $('div#container > div#content > div > ul > li').toArray();
                    console.log(items);
                    for (_a = 0, items_1 = items; _a < items_1.length; _a++) {
                        el = items_1[_a];
                        if (crawledNum >= n) {
                            finished = true; // 조건을 만족하면 완료 플래그를 true로 설정하고 루프 탈출
                            break;
                        }
                        href = $(el).find('a').attr('href');
                        console.log(href);
                        if (href) {
                            webContents.push({ url: naver_home_url + href }); // 절대 경로/상대 경로 확인 필요
                            crawledNum += 1;
                            console.log(href, crawledNum);
                        }
                    }
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/, webContents];
                case 4:
                    err_1 = _b.sent();
                    throw err_1;
                case 5: return [2 /*return*/];
            }
        });
    });
};
getLinks(naver_webnovel_top100_url, 30)
    .then(function (webContents) {
    console.log(webContents);
})
    .catch(function (err) {
    console.error(err);
});
