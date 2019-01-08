var images = {}; // Cache Images
const messages = {
    zh_CN: {
        name: "中",
        basic: {
            o: "奥",
            r: "利",
            and: "与"
        },
        input: {
            meta: "我想要：",
            generate: "生成",
            btn: {
                o: "+奥",
                r: "+利",
                and: "+与"
            },
        },
        output: {
            meta: "這是你的",
            save: "保存图片",
            back: "返回"
        }
    },
    en: {
        name: "En",
        basic: {
            o: "O | o",
            r: "Re | re",
            and: "-"
        },
        input: {
            meta: "I'd like:",
            generate: "Generate",
            btn: {
                o: "O",
                r: "R",
                and: "and"
            },
        },
        output: {
            meta: "Here's your",
            save: "Save Image",
            back: "Back"
        }
    },
    ja: {
        name: "日",
        basic: {
            o: "オ",
            r: "レ",
            and: "と"
        },
        input: {
            meta: "私は...したい",
            generate: "実行",
            btn: {
                o: "+オ",
                r: "+レ",
                and: "+と"
            },
        },
        output: {
            meta: "結果",
            save: "画像を保存する",
            back: "元に戻す"
        }
    }
}

// Set Language
var lang;
if (window.localStorage.getItem('lang')) {
    lang = window.localStorage.getItem('lang');
} else {
    localStorage.lang = "zh_CN";
    lang = "zh_CN";
}

const i18n = new VueI18n({
    locale: lang, // set locale
    messages, // set locale messages
})

var app = new Vue({
    el: '#app',
    i18n,
    data: {
        lang: messages,
        output: false,
        loading: true,
        oreoArr: [],
        imgUrl: ""
    },
    computed: {
        oreoStr: function () {
            var str = "";
            for (let index = 0; index < this.oreoArr.length; index++) {
                const item = this.oreoArr[index];
                console.log(index,item)
                switch (item) {
                    case "O":
                    case "Ob":
                        str += this.$i18n.tc("basic.o", index + 1);
                        break;
                    case "R":
                        str += this.$i18n.tc("basic.r", index + 1);
                        break;
                    case "-":
                        str += this.$i18n.t("basic.and", index);
                        break;
                    default:
                        break;
                }
            }
            return str;
        }
    },
    created: function () {
        var that = this;
        var sources = {
            O: "assets/image/O.png",
            R: "assets/image/R.png",
            Ob: "assets/image/Ob.png"
        };
        this.loadImages(sources, function () {
            setTimeout(() => {
                that.loading = false;
            }, 1000)
        });
    },
    methods: {
        changeLang: function (lang) {
            localStorage.lang = lang;
            this.$i18n.locale = lang;
        },
        loadImages: function (sources, callback) {
            var cacheImages = {};
            var index = 0;
            var attCount = Object.getOwnPropertyNames(sources).length;
            for (imgItem in sources) {
                cacheImages[imgItem] = new Image();
                cacheImages[imgItem].onload = function () {
                    index++;
                    if (index == attCount) {
                        images = cacheImages;
                        callback();
                    }
                }
                cacheImages[imgItem].src = sources[imgItem];
            }
        },
        strAdd: function (str) {
            console.log(str);
            switch (str) {
                case 'o':
                    // this.oreoStr += this.$i18n.t("basic.o");
                    if (this.oreoArr.length == 0) {
                        this.oreoArr.push("O");
                    } else {
                        this.oreoArr.push("Ob");
                    }
                    break;
                case 'r':
                    this.oreoArr.push("R");
                    break;
                case '-':
                    if (this.oreoArr.length > 0 && this.oreoArr[this.oreoArr.length - 1] != '-') {
                        this.oreoArr.push("-");
                    }
                    break;
                case '-1':
                    if (this.oreoArr.length > 0) {
                        this.oreoArr.pop();
                    }
                    break;
                default:
                    break;
            }
        },
        generateImage: function () {
            var that = this;
            this.loading = true;
            this.output = true;
            var oreoArr = this.oreoArr;
            var drawArr = [];

            // Delete '-' at the end
            if (oreoArr[oreoArr.length - 1] == "-") {
                oreoArr.pop();
                this.oreoStr = this.oreoStr.substr(0, this.oreoStr.length - 1);
            }
            console.log(oreoArr);

            // Canvas height calculation
            var height = 0;
            for (let index = 0; index < oreoArr.length; index++) {
                const thisLayer = oreoArr[index];
                if (thisLayer != "-") {
                    var drawItem = {
                        image: images[thisLayer],
                        x: thisLayer == "R" ? 5 : 0,
                        y: height,
                        width: thisLayer == "R" ? 230 : 240,
                        height: 160
                    };
                    drawArr.splice(0, 0, drawItem);
                    console.log(drawItem);
                    height += 24;
                } else {
                    height += 72;
                }
            }
            height += 160 - 24; // Add the last image's height.

            var canvas = this.$refs.oreo_canvas;
            canvas.height = height;
            var ctx = canvas.getContext("2d");

            drawArr.forEach(item => {
                ctx.drawImage(item.image, item.x, item.y, item.width, item.height);
            });

            this.imgUrl = canvas.toDataURL("image/png");
            setTimeout(() => {
                that.loading = false;
            }, 1000)
        },
        downloadImage: function () {
            var a = document.createElement("a");
            a.href = this.imgUrl;
            a.download = this.oreoStr + ".png";
            a.click();
        },
        backToInput: function () {
            this.output = false;
            this.oreoStr = "";
            this.oreoArr = [];
            this.imgUrl = "";
        }
    }
})