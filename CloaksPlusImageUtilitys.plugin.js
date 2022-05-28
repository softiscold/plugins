/**
 * @name CloaksPlusImageUtilitys
 * @author Softiscold
 * @authorId 437098129373003776
 * @version 1.9.7
 * @description adds a few more Utilities to help enhance the cape verification process.
 * @donate https://www.paypal.me/GamingReflexYT
 * @website https://softiscold.xyz
 * @source https://github.com/softiscold/plugins/
 * @updateUrl https://raw.githubusercontent.com/softiscold/plugins/master/CloaksPlusImageUtilitys.plugin.js
 */

module.exports = (_ => {
    const config = {
        "info": {
            "name": "Cloaks+ Image Utilities",
            "author": "Softiscold",
            "version": "1.9.7",
            "description": "Adds a few more Utilities to help enhance the cape verification process."
        },
        "changeLog": {
            "added": {
                "Avatar reverse search": ["we have added a reverse search feature to players avatars."],
            },
            "fixed": {
                "File size": "we have fixed the issue with the file size.",
                "Version": "This plugin is currently in beta. Some features may not work as intended if you have found a bug please report it to the plugin's GitHub page."
            },
        },
    };

    return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
        getName () {return config.info.name;}
        getAuthor () {return config.info.author;}
        getVersion () {return config.info.version;}
        getDescription () {return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`;}

        downloadLibrary () {
            require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
                if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
                else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
            });
        }

        load () {
            if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
            if (!window.BDFDB_Global.downloadModal) {
                window.BDFDB_Global.downloadModal = true;
                BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
                    confirmText: "Download Now",
                    cancelText: "Cancel",
                    onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
                    onConfirm: _ => {
                        delete window.BDFDB_Global.downloadModal;
                        this.downloadLibrary();
                    }
                });
            }
            if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
        }
        start () {this.load();}
        stop () {}
        getSettingsPanel () {
            let template = document.createElement("template");
            template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
            template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
            return template.content.firstElementChild;
        }
    } : (([Plugin, BDFDB]) => {
        var _this;

        var cachedImages;

        const fileTypes = {
            "3gp":		{copyable: false,	searchable: false,	video: true},
            "3g2":		{copyable: false,	searchable: false,	video: true},
            "amv":		{copyable: false,	searchable: false,	video: true},
            "apng":		{copyable: false,	searchable: true,	video: false},
            "avi":		{copyable: false,	searchable: false,	video: true},
            "flv":		{copyable: false,	searchable: false,	video: true},
            "jpeg":		{copyable: true,	searchable: true,	video: false},
            "jpg":		{copyable: true,	searchable: true,	video: false},
            "gif":		{copyable: false,	searchable: true,	video: false},
            "m4v":		{copyable: false,	searchable: false,	video: true},
            "mkv":		{copyable: false,	searchable: false,	video: true},
            "mov":		{copyable: false,	searchable: false,	video: true},
            "mp4":		{copyable: false,	searchable: false,	video: true},
            "mpeg-1":	{copyable: false,	searchable: false,	video: true},
            "mpeg-2":	{copyable: false,	searchable: false,	video: true},
            "ogg":		{copyable: false,	searchable: false,	video: true},
            "ogv":		{copyable: false,	searchable: false,	video: true},
            "png":		{copyable: true,	searchable: true,	video: false},
            "svg":		{copyable: false,	searchable: false,	video: false},
            "webm":		{copyable: false,	searchable: false,	video: true},
            "webp":		{copyable: false,	searchable: true,	video: false},
            "wmv":		{copyable: false,	searchable: false,	video: true}
        };


        return class cloaksplus extends Plugin {
            onLoad () {
                _this = this;
                cachedImages = null;

                this.defaults = {
                };

                this.patchedModules = {
                    before: {
                        LazyImage: "render"
                    },
                    after: {
                        ImageModal: ["render", "componentDidMount", "componentWillUnmount"],
                        LazyImage: "componentDidMount",
                        LazyImageZoomable: "render",
                        UserBanner: "default"
                    }
                };

            }

            onStart () {
                BDFDB.ListenerUtils.add(this, document.body, "click", BDFDB.dotCNS.message + BDFDB.dotCNS.imagewrapper + BDFDB.dotCNC.imageoriginallink + BDFDB.dotCNS.message + BDFDB.dotCNS.imagewrapper + "img", e => this.cacheClickedImage(e.target));

                BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.MediaComponentUtils, "renderImageComponent", {
                    after: e => {
                        if (this.settings.detailsSettings.footnote && e.methodArguments[0].original && e.methodArguments[0].src.indexOf("https://media.discordapp.net/attachments") == 0 && (e.methodArguments[0].className || "").indexOf(BDFDB.disCN.embedmedia) == -1 && (e.methodArguments[0].className || "").indexOf(BDFDB.disCN.embedthumbnail) == -1 && BDFDB.ReactUtils.findChild(e.returnValue, {name: ["LazyImageZoomable", "LazyImage"]})) {
                            const altText = e.returnValue.props.children[1] && e.returnValue.props.children[1].props.children;
                            const details = BDFDB.ReactUtils.createElement(ImageDetailsComponent, {
                                original: e.methodArguments[0].original,
                                attachment: {
                                    height: 0,
                                    width: 0,
                                    filename: "unknown.png"
                                }
                            });
                            e.returnValue.props.children[1] = BDFDB.ReactUtils.createElement("span", {
                                className: BDFDB.disCN.imagealttext,
                                children: [
                                    altText && altText.length >= 50 && BDFDB.ReactUtils.createElement("div", {
                                        children: details
                                    }),
                                    altText && BDFDB.ReactUtils.createElement("span", {
                                        children: altText
                                    }),
                                    (!altText || altText.length < 50) && details
                                ]
                            });
                        }
                    }
                });

                this.forceUpdateAll();
            }

            onStop () {
                this.forceUpdateAll();
            }



            onSettingsClosed () {
                if (this.SettingsUpdated) {
                    delete this.SettingsUpdated;
                    this.forceUpdateAll();
                }
            }

            forceUpdateAll () {
                BDFDB.PatchUtils.forceAllUpdates(this);
                BDFDB.MessageUtils.rerenderAll();
            }

            onMessageContextMenu (e) {
                if (e.instance.props.message && e.instance.props.channel && e.instance.props.target) {
                    if (e.instance.props.attachment) this.injectItem(e, [e.instance.props.attachment.url]);
                    else {
                        const target = e.instance.props.target.tagName == "A" && BDFDB.DOMUtils.containsClass(e.instance.props.target, BDFDB.disCN.imageoriginallink) && e.instance.props.target.parentElement.querySelector("img, video") || e.instance.props.target;
                        if (target.tagName == "A" && e.instance.props.message.embeds && e.instance.props.message.embeds[0] && (e.instance.props.message.embeds[0].type == "image" || e.instance.props.message.embeds[0].type == "video" || e.instance.props.message.embeds[0].type == "gifv")) this.injectItem(e, [target.href]);
                        else if (target.tagName == "IMG" && target.complete && target.naturalHeight) {
                            if (BDFDB.DOMUtils.getParent(BDFDB.dotCN.imagewrapper, target) || BDFDB.DOMUtils.containsClass(target, BDFDB.disCN.imagesticker)) this.injectItem(e, [{file: target.src, original: this.getTargetLink(e.instance.props.target) || this.getTargetLink(target)}]);
                            else if (BDFDB.DOMUtils.containsClass(target, BDFDB.disCN.embedauthoricon) && this.settings.places.userAvatars) this.injectItem(e, [target.src]);
                            else if (BDFDB.DOMUtils.containsClass(target, BDFDB.disCN.emojiold, "emote", false) && this.settings.places.emojis) this.injectItem(e, [{file: target.src, alternativeName: target.getAttribute("data-name")}]);
                        }
                        else if (target.tagName == "VIDEO") {
                            if (BDFDB.DOMUtils.containsClass(target, BDFDB.disCN.embedvideo) || BDFDB.DOMUtils.getParent(BDFDB.dotCN.attachmentvideo, target)) this.injectItem(e, [{file: target.src, original: this.getTargetLink(e.instance.props.target) || this.getTargetLink(target)}]);
                        }
                        else {
                            const reaction = BDFDB.DOMUtils.getParent(BDFDB.dotCN.messagereaction, target);
                            if (reaction && this.settings.places.emojis) {
                                const emoji = reaction.querySelector(BDFDB.dotCN.emojiold);
                                if (emoji) this.injectItem(e, [{file: emoji.src, alternativeName: emoji.getAttribute("data-name")}]);
                            }
                        }
                    }
                }
            }


            injectItem (e, urls, prefix) {
                let validUrls = this.filterUrls(...urls);
                if (!validUrls.length) return;
                let [removeParent, removeIndex] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "copy-native-link", group: true});
                if (removeIndex > -1) {
                    removeParent.splice(removeIndex, 1);
                    removeIndex -= 1;
                }
                let [removeParent2, removeIndex2] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "copy-image", group: true});
                if (removeIndex2 > -1) removeParent2.splice(removeIndex2, 1);

                let type = this.isValid(validUrls[0].file, "video") ? BDFDB.LanguageUtils.LanguageStrings.VIDEO : BDFDB.LanguageUtils.LanguageStrings.IMAGE;
                let isNative = validUrls.length == 1 && removeIndex > -1;
                let subMenu = this.createSubMenus({
                    instance: e.instance,
                    urls: validUrls,
                    prefix: prefix,
                    target: e.instance.props.target
                });

                let [children, index] = isNative ? [removeParent, removeIndex] : BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id", group: true});
                children.splice(index > -1 ? index : children.length, 0, isNative ? subMenu : BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
                    children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
                        label: type + " " + BDFDB.LanguageUtils.LanguageStrings.ACTIONS,
                        id: BDFDB.ContextMenuUtils.createItemId(this.name, "main-subitem"),
                        children: subMenu
                    })
                }));
            }

            filterUrls (...urls) {
                let addedUrls = [];
                return urls.filter(n => this.isValid(n && n.file || n)).map(n => {
                    let srcUrl = (n.file || n).replace(/^url\(|\)$|"|'/g, "").replace(/\?size\=\d+$/, "?size=4096").replace(/\?size\=\d+&/, "?size=4096&").replace(/[\?\&](height|width)=\d+/g, "").split("%3A")[0];
                    if (srcUrl.startsWith("https://cdn.discordapp.com/") && !srcUrl.endsWith("?size=4096") && srcUrl.indexOf("?size=4096&") == -1) srcUrl += "?size=4096";
                    let originalUrl = (n.original || n.file || n).replace(/^url\(|\)$|"|'/g, "").replace(/\?size\=\d+$/, "?size=4096").replace(/\?size\=\d+&/, "?size=4096&").replace(/[\?\&](height|width)=\d+/g, "").split("%3A")[0];
                    if (originalUrl.startsWith("https://cdn.discordapp.com/") && !originalUrl.endsWith("?size=4096") && originalUrl.indexOf("?size=4096&") == -1) originalUrl += "?size=4096";
                    let fileUrl = srcUrl;
                    if (fileUrl.indexOf("https://images-ext-1.discordapp.net/external/") > -1 || fileUrl.indexOf("https://images-ext-2.discordapp.net/external/") > -1) {
                        if (fileUrl.split("/https/").length > 1) fileUrl = "https://" + fileUrl.split("/https/").pop();
                        else if (url.split("/http/").length > 1) fileUrl = "http://" + fileUrl.split("/http/").pop();
                    }
                    const file = fileUrl && (BDFDB.LibraryModules.URLParser.parse(fileUrl).pathname || "").toLowerCase();
                    const fileType = file && (file.split(".").pop() || "");
                    return fileUrl && fileType && !addedUrls.includes(srcUrl) && addedUrls.push(srcUrl) && {file: fileUrl, src: srcUrl, original: originalUrl, isGuildSpecific: /^https:\/\/cdn\.discordapp\.com\/guilds\/\d+\/users\/\d+/.test(srcUrl), fileType, alternativeName: escape((n.alternativeName || "").replace(/:/g, ""))};
                }).filter(n => n);
            }

            isValid (url, type) {
                if (!url) return false;
                const file = url && (BDFDB.LibraryModules.URLParser.parse(url).pathname || "").split("%3A")[0].toLowerCase();
                return file && (!type && (url.indexOf("discord.com/streams/guild:") > -1 || url.indexOf("discordapp.com/streams/guild:") > -1 || url.indexOf("discordapp.net/streams/guild:") > -1 || url.startsWith("https://images-ext-1.discordapp.net/") || url.startsWith("https://images-ext-2.discordapp.net/") || Object.keys(fileTypes).some(t => file.endsWith(`/${t}`) || file.endsWith(`.${t}`))) || type && Object.keys(fileTypes).filter(t => fileTypes[t][type]).some(t => file.endsWith(`/${t}`) || file.endsWith(`.${t}`)));
            }

            createSubMenus (data) {
                return data.urls.length == 1 ? this.createUrlMenu(data.instance, data.urls[0], data.target) : data.urls.map((urlData, i) => BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
                    label: [urlData.isGuildSpecific && BDFDB.LanguageUtils.LanguageStrings.CHANGE_IDENTITY_SERVER_PROFILE, data.prefix, urlData.fileType.toUpperCase()].filter(n => n).join(" "),
                    id: BDFDB.ContextMenuUtils.createItemId(this.name, "subitem", i),
                    children: this.createUrlMenu(data.instance, urlData, data.target)
                }));
            }
            createUrlMenu (instance, urlData, target) {
                return BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
                    children: [
                        !this.isValid(urlData.original, "searchable") || BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
                            label: "Reverse Image Search (Google)",
                            id: BDFDB.ContextMenuUtils.createItemId(this.name, "google-attachment"),
                            action: event => {
                                BDFDB.DiscordUtils.openLink("https://images.google.com/searchbyimage?image_url=" + encodeURIComponent(urlData.original) ), {}
                            }
                        }),
                        !this.isValid(urlData.original, "searchable") || BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
                            label: "Reverse Image Search (TinEye)",
                            id: BDFDB.ContextMenuUtils.createItemId(this.name, "tineye-attachment"),
                            action: event => {
                                BDFDB.DiscordUtils.openLink("https://tineye.com/search?url=" + encodeURIComponent(urlData.original) ), {}
                            }
                        }),
                    ]
                });
            }

            onUserContextMenu (e) {
                if (e.instance.props.user && e.subType == "useBlockUserItem") {
                    if (e.returnvalue.length) e.returnvalue.push(BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuSeparator, {}));
                    e.returnvalue.push(BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
                        label: "Reverse Image Search (Google)",
                        id: BDFDB.ContextMenuUtils.createItemId(this.name, "main-subitem"),
                        persisting: true,
                        action: event => {
                            BDFDB.DiscordUtils.openLink("https://images.google.com/searchbyimage?image_url=" + e.instance.props.user.getAvatarURL()), {
                            };
                        }
                    }));
                    e.returnvalue.push(BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
                        label: "Reverse Image Search (TinEye)",
                        id: BDFDB.ContextMenuUtils.createItemId(this.name, "main-subitem"),
                        persisting: true,
                        action: event => {
                            BDFDB.DiscordUtils.openLink("https://tineye.com/search?url=" + e.instance.props.user.getAvatarURL()), {
                            };
                        }
                    }));
                }
            }

        };
    })(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
