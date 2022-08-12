const path = require('path');
const fs = require('fs');
const url = require('url');
const { app, BrowserWindow } = require('electron');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
require('dotenv').config()
const electron = require('electron');
const puppeteer = require('puppeteer-core');
const Store = require('electron-store');
const Divar = require('./providers/Divar');
const Collection = require('./providers/Collection');
const Logger = require('./providers/Logger');
const axios = require('axios');
const persianDate = require('persian-date');

const fsPromises = fs.promises;
ipc = electron.ipcMain;
const makeChromePath = () => {
    if (process.env.APP_STAGE == 'dev') {
        return path.join(__dirname, '..', 'extraResources', 'bin', 'chrome.exe')
    } else {
        return path.join(process.resourcesPath, 'extraResources', 'bin', 'chrome.exe')
    }
}

function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 1366,
        height: 900,
        // titleBarStyle: 'hidden',
        // titleBarOverlay: {
        //     color: '#2f3241',
        //     symbolColor: '#74b1be'
        // },
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            nodeIntegrationInWorker: true,
            nodeIntegrationInSubFrames: true,
            webSecurity: false,
            backgroundThrottling: false,
        },
    });

    var store = new Store();
    store.set('worker', { state: false });

    // and load the index.html of the app.
    if (process.env.APP_STAGE == 'dev') {
        win.loadURL('http://localhost:3000');
    } else {
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }

    console.log('stage', process.env.APP_STAGE);
    // Open the DevTools.
    // if (isDev) {
    //     win.webContents.openDevTools({ mode: 'detach' });
    // }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

async function runCommand(command) {
    const { stdout, stderr, error } = await exec(command);
    if (stderr) { console.error('stderr:', stderr); }
    if (error) { console.error('error:', error); }
    return stdout;
}

ipc.on('exit', async (event, payload) => { });

// get groups
electron.ipcMain.on('get:groups', async (event) => {
    try {
        const _store_path = path.join(app.getPath('userData'), 'store').toString();
        console.log(_store_path);
        await fs.promises.mkdir(_store_path, { recursive: true });
        const dirs = await fsPromises.readdir(_store_path);
        console.log(dirs);
        event.sender.send('get:groups', { groups: dirs });
    } catch (err) {
        console.error('Error occured while reading directory!', err);
    }
});

// get phones 
electron.ipcMain.on('get:phones', async (event) => {
    const store = new Store();
    console.log('run get phones');
    event.sender.send('get:phones', store.get('phones'));
});

// store new phone 
electron.ipcMain.on('add:phone', async (event, phone) => {
    console.log('phone added to list', { phone });
    const store = new Store();
    const prev = store.get('phones');
    console.log(prev);
    if (prev !== undefined) {
        store.set('phones', [...prev, phone]);
    } else {
        store.set('phones', [phone]);
    }
});

// delete phone by id
electron.ipcMain.on('delete:phone', async (event, phone) => {
    try {
        const store = new Store();
        const phones = store.get('phones');
        const filter = phones.filter((_phone) => _phone.id != phone.id);
        console.log(filter);
        store.set('phones', filter);
    } catch (error) {
        console.log(error);
    }
});

// reset phone
electron.ipcMain.on('reset:phone', async (event, phone) => {
    try {
        const store = new Store();
        const phones = store.get('phones');
        const updatePhone = phones.map((_phone) => {
            if (_phone.id == phone.id) {
                _phone.req = 0;
            }
            return _phone
        });
        console.log(updatePhone);
        store.set('phones', updatePhone);
        event.sender.send('get:phones', updatePhone);
    } catch (error) {
        console.log(error);
    }
});

// login phone number and make chrome data folder
electron.ipcMain.on('login:phone', async (event, group, phone) => {
    const store = new Store();
    const _store_path = path.join(app.getPath('userData'), 'store', group, phone.number);
    const browser = await Divar.core.createBrowser(_store_path, makeChromePath);
    const page = await Divar.core.createPage(browser);
    try {
        await Divar.login.goToLoginPage(page);
        // await Divar.login.clickOnLoginButton(page);
        // await Divar.login.waitForModal(page);
        // await Divar.login.enterPhoneNumber(page, phone);
        // await Divar.login.focusOnEnterCode(page);
        // await Divar.login.checkIfUserLoggedIn(page);
        phone.isActive = true;
        const phones = store.get('phones');
        const update = phones.map((_phone) => {
            if (_phone.id == phone.id) {
                _phone.isActive = true;
            }
            return _phone;
        });
        store.set('phones', update);
        event.sender.send('get:phones', update);
    } catch (error) {
        console.log({ error });
        await browser.close();
    }
});

// set config
electron.ipcMain.on('set:config', async (event, config) => {
    const store = new Store();
    console.log('config updated', config);
    store.set('config', config);
});

// get config 
electron.ipcMain.on('get:config', async (event) => {
    const store = new Store();
    if (store.has('config')) {
        const config = store.get('config');
        console.log(config);
        event.sender.send('get:config', config);
    }
});

// get cities 
electron.ipcMain.on('get:cities', async (event) => {
    const store = new Store();
    if (store.has('cities')) {
        const cities = store.get('cities');
        event.sender.send('get:cities', cities);
    }
});

// add city 
electron.ipcMain.on('add:city', async (event, city) => {
    const store = new Store();
    const prev = store.get('cities');
    console.log(prev);
    if (prev !== undefined) {
        store.set('cities', [...prev, city]);
        event.sender.send('get:cities', [...prev, city]);
    } else {
        store.set('cities', [city]);
        event.sender.send('get:cities', [city]);
    }
});

// delete city
electron.ipcMain.on('delete:city', async (event, city) => {
    try {
        const store = new Store();
        const cities = store.get('cities');
        const updatedCities = cities.filter((_city) => _city.id != city.id);
        store.set('cities', updatedCities);
        event.sender.send('get:cities', updatedCities);
    } catch (error) {
        console.log(error);
    }
});

// fetch posts id
electron.ipcMain.on('fetch:posts', async (event, selectedGroup) => {
    try {
        var temp = [];
        const store = new Store();
        const config = store.get('config');
        const cities = store.get('cities');
        const _path = path.join(app.getPath('userData'), 'store', 'default');
        const browser = await Divar.core.createBrowser(_path, makeChromePath);
        const page = await Divar.core.createPage(browser);
        page.setRequestInterception(true);
        Divar.posts.interceptRequest(page);
        for (let i = 0; i <= cities.length - 1; ++i) {
            var counter = 1;
            for (let _page = 1; counter <= cities[i].count - 1; ++_page) {
                await Divar.posts.goToPostsPage(page, _page, cities[i].slug);
                await Divar.posts.extractLinks(page, temp, cities[i].slug, _page);
                counter = counter + 24;
            }
        }
        store.set('posts', temp);
        event.sender.send('get:posts', temp);
        temp = [];
        await browser.close();
    } catch (error) {
        console.log(error);
        await browser.close();
    }
});

// get posts
electron.ipcMain.on('get:posts', async (event) => {
    try {
        const store = new Store();
        const posts = store.get('posts');
        event.sender.send('get:posts', posts);
    } catch (error) {
        console.log(error);
    }
});

electron.ipcMain.on('all:worker', async (event) => {
    console.log(worker);
});

var worker = [];
// get posts
electron.ipcMain.on('get:post', async (event, selectedGroup) => {
    try {
        var store = new Store();
        store.set('worker', { state: true });
        var async_maker;
        let config = store.get('config');
        event.sender.send('worker:status', { state: true, msg: 'شروع عملیات', page: '0', index: '0', id: '0' });
        const job = setInterval(async () => {
            Logger.logToFile('run worker');
            store.set('worker', { state: true, state: true, msg: 'شروع دریافت اطلاعات', page: '0', index: '0', id: '0' });
            event.sender.send('worker:timer', Date.now());
            var contact = Object.create({ phone: '' });
            var posts = store.get('posts');
            var phones = store.get('phones');
            var config = store.get('config');
            const phone = Collection.findPhone(phones, config, selectedGroup);
            const post = Collection.findPost(posts, config);
            store.set('worker', { state: true, state: true, msg: 'دریافت شماره و اگهی', ...post });
            event.sender.send('worker:status', { state: true, msg: 'دریافت شماره و اگهی', ...post });
            if (phone !== undefined && post !== undefined) {
                const _path = path.join(app.getPath('userData'), 'store', selectedGroup, phone.number);
                const browser = await Divar.core.createBrowser(_path, makeChromePath);
                const page = await Divar.core.createPage(browser);
                Divar.posts.interceptRequest(page);
                Divar.posts.listenToResponse(page, contact);
                try {
                    await page.goto(post.url);
                    await Divar.posts.removeToastAndDimmer(page);
                    await Divar.posts.setLocalstorageConfig(page);
                    event.sender.send('worker:status', { state: true, msg: 'در انتظار دکمه تماس', ...post });
                    await Divar.posts.clickOnContactButton(page, config);
                    event.sender.send('worker:status', { state: true, msg: 'در انتظار پاسخ', ...post });
                    await Divar.posts.confirmContactButtonClick(page, config);
                    Collection.increasePhoneReqCount(store, phones, phone);
                    Collection.makePostDone(store, posts, post);
                    await axios.post(config.server + '/api/phone', {
                        system: config.name,
                        title: '',
                        did: post.id,
                        phone: contact.phone,
                        page: post.page,
                        index: post.index,
                        city: post.city,
                        district: '',
                        category: 'استخدام و کاریابی',
                        data: new persianDate().toLocale('en').format().toString(),
                        stamps: new persianDate().unix().toString(),
                        jwt: phone.number,
                        from: phone.number,
                        req: phone.req,
                        last: ''
                    });
                    Logger.logToFile(post.page + ',' + post.index + ',' + post.id + ',' + contact.phone + ',' + post.city, + ',' + 'Done');
                    event.sender.send('get:phones', phones);
                    event.sender.send('worker:status', { state: true, msg: contact.phone + '-' + 'انتظار اگهی بعدی', ...post });
                    await browser.close();
                } catch (error) {
                    Collection.increaseRetry(store, posts, post);
                    if (post.retry >= config.retry) {
                        Collection.makePostDone(store, posts, post);
                    }
                    event.sender.send('worker:status', { state: true, msg: 'خطا', ...post });
                    Logger.logToFile(post.page + ',' + post.index + ',' + post.id + ',' + contact.phone + ',' + post.city + ',' + error.toString());
                    await browser.close();
                }
            } else {
                event.sender.send('worker:status', { state: true, msg: 'ظرفیت تکمیل است', page: '0', index: '0', id: '0' });
                Logger.logToFile('ظرفیت تکمیل است');
                async_maker = setTimeout(() => {
                    worker.forEach((job) => {
                        clearImmediate(job);
                    });
                    var store = new Store();
                    store.set('worker', { state: false });
                    event.sender.send('worker:status', { state: false });
                }, 1000);
            }
        }, config.delay ? config.delay : 20000);
        worker.push(job);
        clearImmediate(async_maker);
    } catch (error) {
        console.log(error);
    }
});

// get posts
electron.ipcMain.on('cancel:post', async (event) => {
    worker.forEach((job) => {
        clearImmediate(job);
    });
    var store = new Store();
    store.set('worker', { state: false });
    event.sender.send('worker:status', { state: false });
});

// get worker
electron.ipcMain.on('worker:status', async (event) => {
    var store = new Store();
    const worker = store.get('worker');
    console.log({ worker });
    event.sender.send('worker:status', worker);
});

electron.ipcMain.on('open:store', async (event) => {
    const _path = path.join(app.getPath('userData'), 'store');
    electron.shell.openPath(_path);
});

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});