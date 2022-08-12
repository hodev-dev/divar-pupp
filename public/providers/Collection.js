const { config } = require("dotenv");

const Collection = {
    p2e: (s) => s.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)),
    findPost: (posts, config) => {
        return posts.find((_post) => _post.isDone === false && _post.retry <= config.retry);
    },
    findPhone: (phones, config, selectedGroup) => {
        return phones.find((_phone) => {
            return _phone.req <= config.req - 1 && _phone.group == selectedGroup;
        });
    },
    increasePhoneReqCount: (store, phones, phone) => {
        const updatedPhones = phones.map((_phone) => {
            if (_phone.number == phone.number && phone.number !== undefined) {
                _phone.req = _phone.req + 1;
            }
            return _phone;
        });
        store.set('phones', updatedPhones);
    },
    increaseRetry: (store, posts, post) => {
        const updatedPosts = posts.map((_post) => {
            if (_post.id == post.id && post.id !== undefined) {
                _post.retry = _post.retry + 1;
            }
            return _post;
        });
        store.set('posts', updatedPosts);
    },
    makePostDone: (store, posts, post) => {
        const updatedPosts = posts.map((_post) => {
            if (_post.id == post.id && post.id !== undefined) {
                _post.isDone = true;
            }
            return _post;
        });
        store.set('posts', updatedPosts);
    },
}

module.exports = Collection;
