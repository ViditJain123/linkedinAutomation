import { app, BrowserWindow } from 'electron';
import pie from 'puppeteer-in-electron';
import puppeteer from 'puppeteer-core';
import { time } from 'console';

export async function schedulePost() {
    try {
        const browser = await pie.connect(app, puppeteer);
        const postWindow = new BrowserWindow({show: true, webPreferences: {nodeIntegration: false}});
        const targetUrl = "https://linkedin.com/feed";
        await postWindow.loadURL(targetUrl);
        const page = await pie.getPage(browser, postWindow);
        page.on('framenavigated', async (frame) => {
            const currentUrl = frame.url();
            console.log(`Navigated to: ${currentUrl}`);
            if(currentUrl.includes('/feed' ) || currentUrl.includes('/dest5.html')) {
                await page.waitForSelector('#ember32', {timeout: 10000});
                await page.click('.QDHShzCVsKIgZnpYnFJyaeMrFXUeheXJrxc');

                await page.waitForSelector('.editor-container .ql-editor[contenteditable="true"]', { timeout: 10000 });
                await page.type('.editor-container .ql-editor[contenteditable="true"]', 'Hello, this is a scheduled post test!');
                await delay(1000);
                await page.click('.share-actions__primary-action');
                console.log("Typed the post string");
            }
        })
        console.log("Waiting for user to login");
    } catch (error) {
        console.log(error);
    }
}

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}
