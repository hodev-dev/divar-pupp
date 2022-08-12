const puppeteer = require('puppeteer-extra')
const Store = require('electron-store');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const Divar = {
    core: {
        createBrowser: async (_store_path, makeChromePath) => {
            const store = new Store();
            const config = store.get('config');
            puppeteer.use(StealthPlugin());
            const browser = await puppeteer.launch({
                headless: (config.showBrowser == '0'),
                defaultViewport: null,
                userDataDir: _store_path,
                executablePath: makeChromePath(),
                defaultViewport: null,
                args: [
                    "--disable-notifications"
                    // '--window-size=1920,1080',
                ],
            });
            return browser;
        },
        createPage: async (browser) => {
            const page = await browser.newPage();
            // await page.setViewport({
            //     width: 1920,
            //     height: 1080,
            // });
            return page;
        }
    },
    login: {
        goToLoginPage: async (page) => {
            await page.goto('https://divar.ir/my-divar', { waitUntil: ['load', 'domcontentloaded'] });
        },
        clickOnLoginButton: async (page) => {
            await page.waitForXPath('/html/body/div/div[1]/div/div/div/button');
            const b = (await page.$x('/html/body/div/div[1]/div/div/div/button'));
            b[0].focus();
            b[0].press('Enter');
        },
        waitForModal: async (page) => {
            await page.waitForXPath('/html/body/div/div[1]/div/div/div/button');
        },
        enterPhoneNumber: async (page, phone) => {
            console.log('typing', { phone });
            await page.waitForXPath('//*[@name="mobile"]');
            const input = (await page.$x('//*[@name="mobile"]'));
            await input[0].focus();
            await input[0].click();
            await input[0].type(phone.number.toString());
        },
        focusOnEnterCode: async (page) => {
            await page.waitForXPath('//*[@name="code"]');
            const inputCode = await page.$x('//*[@name="code"]');
            await inputCode[0].focus();
            await inputCode[0].click();
            await inputCode[0].type('123');
        },
        checkIfUserLoggedIn: async (page) => {
            await page.waitForXPath('//*[@id="app"]/div[1]/div/div/div/div/div/div[2]', { timeout: 60000000000000 });
        }
    },
    posts: {
        goToPostsPage: async (page, counter, city) => {
            await page.goto(`https://divar.ir/s/${city}/jobs?page=${counter}`, { waitUntil: ['load', 'domcontentloaded'] });
            // remove overlay
            await page.evaluate((sel) => {
                var elements = document.querySelectorAll(sel);
                for (var i = 0; i < elements.length; i++) {
                    elements[i].parentNode.removeChild(elements[i]);
                }
            }, '.kt-dimmer');
            await new Promise(r => setTimeout(r, 2000));
        },
        extractLinks: async (page, temp, city, pageNumber) => {
            await page.waitForXPath('/html/body/div/div[1]/main/div/div/div/div[1]', { timeout: 20000 });
            const posts = await page.$x('/html/body/div/div[1]/main/div/div/div/div[*]/div/a');
            for (let i = 0; i <= posts.length - 1; i++) {
                const href = await page.evaluate(el => el.href, posts[i]);
                temp.push({ index: i, page: pageNumber, url: href, id: href.split('/')[5], isDone: false, city: city, retry: 0 });
            }
        },
        interceptRequest: function (page) {
            page.setRequestInterception(true);
            page.on('request', async request => {
                if (request.resourceType() === 'fetch' || request.resourceType() === 'image' || request.resourceType() === 'media' || request.resourceType() === 'font' || request.url().includes('google')) {
                    request.abort();
                } else {
                    request.continue()
                }
            });
        },
        listenToResponse: function (page, contact) {
            page.on('response', async response => {
                if (response.url().includes('https://api.divar.ir/v5/posts') && response.request().method() == 'GET') {
                    const data = await response.json();
                    contact.phone = data?.widgets?.contact?.phone;
                }
            });
        },
        removeToastAndDimmer: async (page) => {
            await page.evaluate((sel) => {
                var elements = document.querySelectorAll(sel);
                for (var i = 0; i < elements.length; i++) {
                    elements[i].parentNode.removeChild(elements[i]);
                }
            }, '.Toastify');
            await page.evaluate((sel) => {
                var elements = document.querySelectorAll(sel);
                for (var i = 0; i < elements.length; i++) {
                    elements[i].parentNode.removeChild(elements[i]);
                }
            }, '.kt-dimmer');
        },
        setLocalstorageConfig: async (page) => {
            await page.evaluate(() => {
                localStorage.setItem('accept-contact-terms', true);
                localStorage.setItem('get-contact-suspicion-alerts', JSON.stringify([{ "id": 1, "lastTimeStampInSeconds": new Date().getTime() / 1000 }]));
            });
        },
        clickOnContactButton: async (page, config) => {
            await page.waitForXPath(config.contactButtonXPath, { timeout: config.contactButtonWait });
            const input = await page.$x(config.contactButtonXPath);
            await input[0].click();
        },
        confirmContactButtonClick: async (page, config) => {
            await page.waitForSelector(config.contactButtonConfirmCssSelector, { timeout: config.contactButtonWait });
        }
    },
}

module.exports = Divar;